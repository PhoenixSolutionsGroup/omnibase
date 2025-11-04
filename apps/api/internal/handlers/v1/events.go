package v1

import (
	"api/internal/config"
	"api/internal/logger"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/lib/pq"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		// TODO: In production, implement proper CORS checking
		return true
	},
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

// Subscription represents a client's subscription to database changes
type Subscription struct {
	Table   string   `json:"table"`
	RowID   *string  `json:"row_id,omitempty"`  // Optional: subscribe to specific row (string to support UUID and integers)
	Columns []string `json:"columns,omitempty"` // Optional: filter by specific columns
	JWT     string   `json:"jwt"`
}

// SubscriptionMessage represents the message format from client
type SubscriptionMessage struct {
	Action string       `json:"action"` // "subscribe" or "unsubscribe"
	Sub    Subscription `json:"subscription"`
}

// Client represents a WebSocket client connection
type Client struct {
	conn         *websocket.Conn
	subs         []Subscription
	send         chan interface{}
	mu           sync.RWMutex
	postgrestURL string
	jwtSecret    string
}

// EventsHandler manages WebSocket connections and PostgreSQL notifications
type EventsHandler struct {
	cfg            *config.Config
	clients        map[*Client]bool
	clientsMu      sync.RWMutex
	listener       *pq.Listener
	listenerActive bool
	listenerMu     sync.Mutex
	db             *sql.DB
	stopChan       chan struct{}
	postgrestURL   string
	connStr        string
}

// NewEventsHandler creates a new events handler
func NewEventsHandler(cfg *config.Config) *EventsHandler {
	// Build PostgreSQL connection string
	connStr := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		cfg.Database.Host,
		cfg.Database.Port,
		cfg.Database.User,
		cfg.Database.Password,
		cfg.Database.Name,
		cfg.Database.SSLMode,
	)

	handler := &EventsHandler{
		cfg:            cfg,
		clients:        make(map[*Client]bool),
		listener:       nil,
		listenerActive: false,
		db:             nil,
		stopChan:       make(chan struct{}),
		postgrestURL:   cfg.PostgRESTURL,
		connStr:        connStr,
	}

	logger.Logger.Info("EventsHandler initialized (listener deferred until first connection)")
	return handler
}

// HandleWebSocket handles WebSocket upgrade and client management
func (h *EventsHandler) HandleWebSocket(c *gin.Context) {
	logger.Logger.Info("WebSocket upgrade request received",
		"remote_addr", c.Request.RemoteAddr,
		"origin", c.Request.Header.Get("Origin"),
		"user_agent", c.Request.Header.Get("User-Agent"))

	// Upgrade HTTP connection to WebSocket
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		logger.Logger.Error("WebSocket upgrade failed",
			"error", err,
			"remote_addr", c.Request.RemoteAddr)
		return
	}

	logger.Logger.Info("WebSocket connection upgraded successfully", "remote_addr", c.Request.RemoteAddr)

	// Create new client
	client := &Client{
		conn:         conn,
		subs:         []Subscription{},
		send:         make(chan interface{}, 256),
		postgrestURL: h.postgrestURL,
		jwtSecret:    h.cfg.JWTSecret,
	}

	// Register client
	h.clientsMu.Lock()
	isFirstClient := len(h.clients) == 0
	h.clients[client] = true
	clientCount := len(h.clients)
	h.clientsMu.Unlock()

	// Start listener on first client connection
	if isFirstClient {
		if err := h.startListener(); err != nil {
			logger.Logger.Error("Failed to start PostgreSQL listener",
				"error", err)
			h.unregisterClient(client)
			conn.Close()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to initialize listener"})
			return
		}
	}

	logger.Logger.Info("Client connected and registered",
		"total_clients", clientCount,
		"remote_addr", conn.RemoteAddr().String())

	// Start client goroutines
	go client.writePump()
	go client.readPump(h)
}

// readPump handles incoming messages from the WebSocket client
func (c *Client) readPump(h *EventsHandler) {
	defer func() {
		logger.Logger.Debug("Client readPump terminating", "remote_addr", c.conn.RemoteAddr().String())
		h.unregisterClient(c)
		c.conn.Close()
	}()

	// Set pong handler to reset read deadline when pong is received
	c.conn.SetPongHandler(func(string) error {
		logger.Logger.Debug("Pong received from client", "remote_addr", c.conn.RemoteAddr().String())
		c.conn.SetReadDeadline(time.Now().Add(90 * time.Second))
		return nil
	})

	// Set initial read deadline
	c.conn.SetReadDeadline(time.Now().Add(90 * time.Second))
	logger.Logger.Debug("Client readPump started", "remote_addr", c.conn.RemoteAddr().String())

	for {
		var msg SubscriptionMessage
		if err := c.conn.ReadJSON(&msg); err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				logger.Logger.Warn("Unexpected WebSocket close",
					"error", err,
					"remote_addr", c.conn.RemoteAddr().String())
			} else {
				logger.Logger.Debug("WebSocket connection closed normally",
					"error", err,
					"remote_addr", c.conn.RemoteAddr().String())
			}
			break
		}

		logger.Logger.Debug("Received message from client",
			"action", msg.Action,
			"table", msg.Sub.Table,
			"row_id", msg.Sub.RowID,
			"remote_addr", c.conn.RemoteAddr().String())

		// Reset read deadline on any message received
		c.conn.SetReadDeadline(time.Now().Add(90 * time.Second))

		switch msg.Action {
		case "subscribe":
			c.handleSubscribe(msg.Sub)
		case "unsubscribe":
			c.handleUnsubscribe(msg.Sub)
		default:
			logger.Logger.Warn("Unknown action received from client",
				"action", msg.Action,
				"remote_addr", c.conn.RemoteAddr().String())
			c.send <- map[string]string{
				"status": "error",
				"error":  "unknown action",
			}
		}
	}
}

// writePump handles outgoing messages to the WebSocket client
func (c *Client) writePump() {
	ticker := time.NewTicker(54 * time.Second)
	defer func() {
		ticker.Stop()
		logger.Logger.Debug("Client writePump terminating", "remote_addr", c.conn.RemoteAddr().String())
		c.conn.Close()
	}()

	logger.Logger.Debug("Client writePump started", "remote_addr", c.conn.RemoteAddr().String())

	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {
				logger.Logger.Debug("Send channel closed, closing WebSocket", "remote_addr", c.conn.RemoteAddr().String())
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			if err := c.conn.WriteJSON(message); err != nil {
				logger.Logger.Error("Failed to write message to client",
					"error", err,
					"remote_addr", c.conn.RemoteAddr().String())
				return
			}
			logger.Logger.Debug("Message sent to client",
				"message_type", fmt.Sprintf("%T", message),
				"remote_addr", c.conn.RemoteAddr().String())

		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			logger.Logger.Debug("Sending ping to client", "remote_addr", c.conn.RemoteAddr().String())
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				logger.Logger.Warn("Failed to send ping to client",
					"error", err,
					"remote_addr", c.conn.RemoteAddr().String())
				return
			}
		}
	}
}

// handleSubscribe processes a subscription request
func (c *Client) handleSubscribe(sub Subscription) {
	logger.Logger.Info("Processing subscription request",
		"table", sub.Table,
		"row_id", sub.RowID,
		"columns", sub.Columns,
		"remote_addr", c.conn.RemoteAddr().String())

	// Validate subscription with RLS check
	if !c.canAccess(sub) {
		logger.Logger.Warn("Subscription access denied by RLS",
			"table", sub.Table,
			"row_id", sub.RowID,
			"remote_addr", c.conn.RemoteAddr().String())
		c.send <- map[string]string{
			"status": "error",
			"error":  "access denied",
			"table":  sub.Table,
		}
		return
	}

	// Add subscription
	c.mu.Lock()
	c.subs = append(c.subs, sub)
	subCount := len(c.subs)
	c.mu.Unlock()

	c.send <- map[string]interface{}{
		"status": "subscribed",
		"table":  sub.Table,
		"row_id": sub.RowID,
	}

	logger.Logger.Info("Subscription successful",
		"table", sub.Table,
		"row_id", sub.RowID,
		"total_subscriptions", subCount,
		"remote_addr", c.conn.RemoteAddr().String())
}

// handleUnsubscribe processes an unsubscription request
func (c *Client) handleUnsubscribe(sub Subscription) {
	c.mu.Lock()
	defer c.mu.Unlock()

	// Remove matching subscription
	newSubs := []Subscription{}
	for _, s := range c.subs {
		if s.Table != sub.Table || (sub.RowID != nil && s.RowID != nil && *s.RowID != *sub.RowID) {
			newSubs = append(newSubs, s)
		}
	}
	c.subs = newSubs

	c.send <- map[string]interface{}{
		"status": "unsubscribed",
		"table":  sub.Table,
		"row_id": sub.RowID,
	}
}

// canAccess checks if the client can access the specified row using RLS via PostgREST
func (c *Client) canAccess(sub Subscription) bool {
	url := fmt.Sprintf("%s/%s", c.postgrestURL, sub.Table)

	// Add row filter if specified
	if sub.RowID != nil {
		url += fmt.Sprintf("?id=eq.%s", *sub.RowID)
	}

	logger.Logger.Debug("Checking RLS access via PostgREST",
		"url", url,
		"table", sub.Table,
		"row_id", sub.RowID)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		logger.Logger.Error("Failed to create RLS check request",
			"error", err,
			"url", url)
		return false
	}

	req.Header.Set("Authorization", "Bearer "+sub.JWT)
	req.Header.Set("Accept", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		logger.Logger.Error("RLS check HTTP request failed",
			"error", err,
			"url", url)
		return false
	}
	defer resp.Body.Close()

	logger.Logger.Debug("RLS check completed",
		"status_code", resp.StatusCode,
		"table", sub.Table,
		"row_id", sub.RowID,
		"access_granted", resp.StatusCode == http.StatusOK)

	return resp.StatusCode == http.StatusOK
}

// fetchRow retrieves the full row data with RLS check
func (c *Client) fetchRow(sub Subscription, rowID string) map[string]interface{} {
	url := fmt.Sprintf("%s/%s?id=eq.%s", c.postgrestURL, sub.Table, rowID)

	logger.Logger.Debug("Fetching row data via PostgREST",
		"url", url,
		"table", sub.Table,
		"row_id", rowID)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		logger.Logger.Error("Failed to create fetch request",
			"error", err,
			"url", url)
		return nil
	}

	req.Header.Set("Authorization", "Bearer "+sub.JWT)
	req.Header.Set("Accept", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		logger.Logger.Error("Fetch row HTTP request failed",
			"error", err,
			"url", url)
		return nil
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		logger.Logger.Warn("Fetch row returned non-OK status",
			"status_code", resp.StatusCode,
			"table", sub.Table,
			"row_id", rowID)
		return nil
	}

	var rows []map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&rows); err != nil {
		logger.Logger.Error("Failed to decode fetch response",
			"error", err,
			"table", sub.Table,
			"row_id", rowID)
		return nil
	}

	if len(rows) == 0 {
		logger.Logger.Debug("No rows returned from fetch",
			"table", sub.Table,
			"row_id", rowID)
		return nil
	}

	logger.Logger.Debug("Row data fetched successfully",
		"table", sub.Table,
		"row_id", rowID)
	return rows[0]
}

// startListener initializes and starts the PostgreSQL listener
func (h *EventsHandler) startListener() error {
	h.listenerMu.Lock()
	defer h.listenerMu.Unlock()

	if h.listenerActive {
		return nil // Already started
	}

	logger.Logger.Info("Starting PostgreSQL listener for first client")

	// Create PostgreSQL listener
	h.listener = pq.NewListener(
		h.connStr,
		10*time.Second,
		time.Minute,
		func(ev pq.ListenerEventType, err error) {
			if err != nil {
				logger.Logger.Error("PostgreSQL listener event error", "error", err, "event_type", ev)
			} else {
				logger.Logger.Debug("PostgreSQL listener event", "event_type", ev)
			}
		},
	)

	// Open standard SQL connection for queries
	db, err := sql.Open("postgres", h.connStr)
	if err != nil {
		logger.Logger.Error("Failed to open database connection", "error", err)
		return fmt.Errorf("failed to open database connection: %w", err)
	}
	h.db = db

	// Start listening to PostgreSQL notifications
	if err := h.listener.Listen("state_changes"); err != nil {
		logger.Logger.Error("Failed to listen on state_changes channel", "error", err)
		h.listener.Close()
		h.db.Close()
		h.listener = nil
		h.db = nil
		return fmt.Errorf("failed to listen on state_changes: %w", err)
	}

	h.stopChan = make(chan struct{})
	h.listenerActive = true

	// Start the notification handler goroutine
	go h.handleNotifications()

	logger.Logger.Info("PostgreSQL listener started successfully")
	return nil
}

// stopListener shuts down the PostgreSQL listener
func (h *EventsHandler) stopListener() {
	h.listenerMu.Lock()
	defer h.listenerMu.Unlock()

	if !h.listenerActive {
		return // Already stopped
	}

	logger.Logger.Info("Stopping PostgreSQL listener (no active clients)")

	close(h.stopChan)
	h.listenerActive = false

	if h.listener != nil {
		h.listener.Close()
		h.listener = nil
	}

	if h.db != nil {
		h.db.Close()
		h.db = nil
	}

	logger.Logger.Info("PostgreSQL listener stopped successfully")
}

// handleNotifications listens for PostgreSQL NOTIFY events and broadcasts to clients
func (h *EventsHandler) handleNotifications() {
	logger.Logger.Info("Starting PostgreSQL notification handler")

	for {
		select {
		case <-h.stopChan:
			logger.Logger.Info("Stopping notification handler")
			return

		case notification := <-h.listener.Notify:
			if notification == nil {
				logger.Logger.Debug("Received nil notification, skipping")
				continue
			}

			logger.Logger.Debug("Received PostgreSQL notification",
				"channel", notification.Channel,
				"payload_length", len(notification.Extra))

			var change map[string]interface{}
			if err := json.Unmarshal([]byte(notification.Extra), &change); err != nil {
				logger.Logger.Error("Failed to parse notification payload",
					"error", err,
					"payload", notification.Extra)
				continue
			}

			logger.Logger.Info("Broadcasting database change",
				"table", change["table"],
				"id", change["id"])
			h.broadcastChange(change)

		case <-time.After(90 * time.Second):
			h.clientsMu.RLock()
			clientCount := len(h.clients)
			h.clientsMu.RUnlock()

			if clientCount > 0 {
				logger.Logger.Debug("Sending periodic ping to PostgreSQL listener",
					"active_clients", clientCount)
				go h.listener.Ping()
			} else {
				logger.Logger.Debug("Skipping PostgreSQL ping, no active clients")
			}
		}
	}
}

// broadcastChange sends the change notification to subscribed clients
func (h *EventsHandler) broadcastChange(change map[string]interface{}) {
	table, ok := change["table"].(string)
	if !ok {
		logger.Logger.Warn("Notification missing table field")
		return
	}

	// Get ID as string (works for both UUID and integer primary keys)
	var rowID string
	if idVal, ok := change["id"]; ok {
		rowID = fmt.Sprintf("%v", idVal)
	}

	if rowID == "" {
		logger.Logger.Warn("Notification missing row ID", "table", table)
		return
	}

	rowData, _ := change["row"].(map[string]interface{})

	h.clientsMu.RLock()
	clientCount := len(h.clients)
	h.clientsMu.RUnlock()

	logger.Logger.Debug("Broadcasting change to clients",
		"table", table,
		"row_id", rowID,
		"total_clients", clientCount)

	h.clientsMu.RLock()
	defer h.clientsMu.RUnlock()

	matchCount := 0
	for client := range h.clients {
		client.mu.RLock()
		for _, sub := range client.subs {
			if h.matchesSubscription(sub, table, rowID, rowData) {
				matchCount++
				logger.Logger.Debug("Subscription match found",
					"table", table,
					"row_id", rowID,
					"remote_addr", client.conn.RemoteAddr().String())

				// Re-fetch with RLS check
				if fullRow := client.fetchRow(sub, rowID); fullRow != nil {
					// Filter columns if specified
					data := fullRow
					if len(sub.Columns) > 0 {
						data = h.filterColumns(fullRow, sub.Columns)
					}

					client.send <- map[string]interface{}{
						"type":   "update",
						"table":  table,
						"row_id": rowID,
						"data":   data,
					}
					logger.Logger.Info("Update sent to client",
						"table", table,
						"row_id", rowID,
						"remote_addr", client.conn.RemoteAddr().String())
				}
			}
		}
		client.mu.RUnlock()
	}

	logger.Logger.Debug("Broadcast completed",
		"table", table,
		"row_id", rowID,
		"matched_subscriptions", matchCount)
}

// matchesSubscription checks if a change matches a client's subscription
func (h *EventsHandler) matchesSubscription(sub Subscription, table string, rowID string, rowData map[string]interface{}) bool {
	// Check table match
	if sub.Table != table {
		return false
	}

	// Check row ID match (if specified)
	if sub.RowID != nil && *sub.RowID != rowID {
		return false
	}

	// Check if any subscribed columns changed
	if len(sub.Columns) > 0 && rowData != nil {
		for _, col := range sub.Columns {
			if _, exists := rowData[col]; exists {
				return true
			}
		}
		return false
	}

	return true
}

// filterColumns filters row data to only include specified columns
func (h *EventsHandler) filterColumns(data map[string]interface{}, columns []string) map[string]interface{} {
	filtered := make(map[string]interface{})
	for _, col := range columns {
		if val, ok := data[col]; ok {
			filtered[col] = val
		}
	}
	return filtered
}

// unregisterClient removes a client from the handler
func (h *EventsHandler) unregisterClient(client *Client) {
	h.clientsMu.Lock()
	if _, ok := h.clients[client]; ok {
		delete(h.clients, client)
		close(client.send)
	}
	clientCount := len(h.clients)
	isLastClient := clientCount == 0
	h.clientsMu.Unlock()

	logger.Logger.Info("Client disconnected and unregistered",
		"total_clients", clientCount,
		"remote_addr", client.conn.RemoteAddr().String())

	// Stop listener when last client disconnects
	if isLastClient {
		h.stopListener()
	}
}

// Stop gracefully shuts down the events handler
func (h *EventsHandler) Stop() {
	logger.Logger.Info("Stopping EventsHandler")

	h.clientsMu.Lock()
	clientCount := len(h.clients)
	for client := range h.clients {
		client.conn.Close()
	}
	h.clientsMu.Unlock()

	// Stop listener if it's running
	h.stopListener()

	logger.Logger.Info("EventsHandler stopped", "clients_closed", clientCount)
}
