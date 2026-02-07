package stripe_config

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"api/internal/config"
	"api/internal/logger"
)

// ManagedHostingClient handles communication with the managed hosting API
type ManagedHostingClient struct {
	baseURL      string
	serviceToken string
	tenantID     string
	httpClient   *http.Client
}

// NewManagedHostingClient creates a new client for the managed hosting API
func NewManagedHostingClient(cfg *config.ManagedHostingConfig) *ManagedHostingClient {
	return &ManagedHostingClient{
		baseURL:      cfg.ManagedHostingAPIURL,
		serviceToken: cfg.InternalServiceToken,
		tenantID:     cfg.TenantID,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// RegisterWebhookRequest represents the request to register a webhook
type RegisterWebhookRequest struct {
	ConfigID  string   `json:"config_id"`
	WebhookID string   `json:"webhook_id"`
	URL       string   `json:"url"`
	Events    []string `json:"events"`
	Connect   bool     `json:"connect"`
}

// RegisterWebhookResponse represents the response from registering a webhook
type RegisterWebhookResponse struct {
	ID        string `json:"id"`         // Registration UUID from managed hosting
	WebhookID string `json:"webhook_id"` // Config webhook ID
	Secret    string `json:"secret"`     // Generated secret
	Action    string `json:"action"`     // "created", "updated", or "unchanged"
}

// RegisterWebhook forwards a webhook registration to the managed hosting API
func (c *ManagedHostingClient) RegisterWebhook(ctx context.Context, req RegisterWebhookRequest) (*RegisterWebhookResponse, error) {
	logger.Logger.Debug("Forwarding webhook registration to managed hosting",
		"url", req.URL,
		"eventCount", len(req.Events),
		"connect", req.Connect)

	body, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	httpReq, err := http.NewRequestWithContext(ctx, "POST",
		c.baseURL+"/api/v1/stripe/webhooks/register", bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("X-API-Key", c.serviceToken)
	httpReq.Header.Set("X-Tenant-ID", c.tenantID)

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		logger.Logger.Error("Failed to call managed hosting API", "error", err)
		return nil, fmt.Errorf("failed to call managed hosting API: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		logger.Logger.Error("Managed hosting API returned error", "status", resp.StatusCode)
		return nil, fmt.Errorf("managed hosting API returned status %d", resp.StatusCode)
	}

	var result RegisterWebhookResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	logger.Logger.Debug("Webhook registration forwarded successfully",
		"id", result.ID,
		"webhookID", result.WebhookID,
		"action", result.Action)

	return &result, nil
}

// DeleteWebhook forwards a webhook deletion to the managed hosting API
func (c *ManagedHostingClient) DeleteWebhook(ctx context.Context, webhookID string) error {
	logger.Logger.Debug("Forwarding webhook deletion to managed hosting", "webhookID", webhookID)

	httpReq, err := http.NewRequestWithContext(ctx, "DELETE",
		c.baseURL+"/api/v1/stripe/webhooks/"+webhookID, nil)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	httpReq.Header.Set("X-API-Key", c.serviceToken)
	httpReq.Header.Set("X-Tenant-ID", c.tenantID)

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		logger.Logger.Error("Failed to call managed hosting API for deletion", "error", err)
		return fmt.Errorf("failed to call managed hosting API: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusNoContent {
		logger.Logger.Error("Managed hosting API returned error on deletion", "status", resp.StatusCode)
		return fmt.Errorf("managed hosting API returned status %d", resp.StatusCode)
	}

	logger.Logger.Debug("Webhook deletion forwarded successfully", "webhookID", webhookID)
	return nil
}
