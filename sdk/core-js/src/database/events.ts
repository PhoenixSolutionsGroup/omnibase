/**
 * Real-time database events client for WebSocket subscriptions
 *
 * This module provides a universal WebSocket client for subscribing to real-time
 * database changes with Row-Level Security (RLS) authentication. Works in both
 * browser and Node.js environments.
 *
 * @module Database Events
 */

// Detect environment and use appropriate WebSocket
const WS =
  typeof globalThis !== "undefined" && globalThis.WebSocket
    ? globalThis.WebSocket
    : null;

/**
 * Subscription options for database events
 */
export interface SubscriptionOptions {
  /** Specific row ID to subscribe to (optional) */
  rowId?: string;
  /** Specific columns to filter updates (optional) */
  columns?: string[];
  /** Callback function triggered on data updates */
  onChange?: (data: any, message: UpdateMessage) => void;
}

/**
 * Subscription request sent to the server
 */
export interface Subscription {
  table: string;
  row_id?: string;
  columns?: string[];
  jwt: string;
}

/**
 * Message sent from client to server
 */
export interface SubscriptionMessage {
  action: "subscribe" | "unsubscribe";
  subscription: Subscription;
}

/**
 * Update message received from server
 */
export interface UpdateMessage {
  type: "update";
  table: string;
  row_id: number;
  data: any;
}

/**
 * Status message received from server
 */
export interface StatusMessage {
  status: "subscribed" | "unsubscribed" | "error";
  table?: string;
  row_id?: number;
  error?: string;
}

/**
 * Universal WebSocket client for real-time database events
 *
 * Connects to the database events WebSocket endpoint and manages subscriptions
 * to table changes with automatic RLS authentication and reconnection.
 *
 * @example
 * Basic usage:
 * ```typescript
 * const client = new EventsClient(
 *   'ws://localhost:8080/api/v1/events/ws',
 *   'your-jwt-token'
 * );
 *
 * client.subscribe('tasks', {
 *   onChange: (data) => {
 *     console.log('Task updated:', data);
 *   }
 * });
 * ```
 *
 * @example
 * Subscribe to specific row:
 * ```typescript
 * client.subscribe('users', {
 *   rowId: 123,
 *   onChange: (user) => {
 *     console.log('User 123 updated:', user);
 *   }
 * });
 * ```
 *
 * @example
 * Subscribe to specific columns:
 * ```typescript
 * client.subscribe('posts', {
 *   rowId: 456,
 *   columns: ['title', 'content', 'status'],
 *   onChange: (post) => {
 *     console.log('Post columns updated:', post);
 *   }
 * });
 * ```
 */
export class EventsClient {
  private url: string;
  private jwt: string;
  private subscriptions: SubscriptionMessage[] = [];
  private ws: any = null;
  private reconnectDelay: number = 1000;
  private listeners: Map<string, (data: any, msg: UpdateMessage) => void> =
    new Map();
  private shouldReconnect: boolean = true;

  /**
   * Creates a new EventsClient instance
   *
   * @param url - WebSocket endpoint URL (e.g., 'ws://localhost:8080/api/v1/events/ws')
   * @param jwt - JWT authentication token for RLS checks
   */
  constructor(url: string, jwt: string) {
    if (!WS) {
      throw new Error(
        'WebSocket is not available in this environment. Install "ws" package for Node.js.'
      );
    }

    this.url = url;
    this.jwt = jwt;
    this.connect();
  }

  /**
   * Establishes WebSocket connection with automatic reconnection
   * @private
   */
  private connect(): void {
    if (!WS) return;
    this.ws = new WS(this.url);

    this.ws.onopen = () => {
      this.reconnectDelay = 1000;
      // Re-subscribe to all subscriptions after reconnection
      this.subscriptions.forEach((sub) => this.send(sub));
    };

    this.ws.onmessage = (event: any) => {
      const data =
        typeof event.data === "string" ? event.data : event.data.toString();
      const msg = JSON.parse(data);
      this.handleMessage(msg);
    };

    this.ws.onerror = (error: any) => {
      console.error("WebSocket error:", error);
    };

    this.ws.onclose = () => {
      if (this.shouldReconnect) {
        setTimeout(() => this.connect(), this.reconnectDelay);
        this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
      }
    };
  }

  /**
   * Subscribe to database changes for a table
   *
   * @param table - Table name to subscribe to
   * @param options - Subscription options (rowId, columns, onChange callback)
   *
   * @example
   * Subscribe to entire table:
   * ```typescript
   * client.subscribe('tasks', {
   *   onChange: (task) => console.log('Task changed:', task)
   * });
   * ```
   *
   * @example
   * Subscribe to specific row:
   * ```typescript
   * client.subscribe('users', {
   *   rowId: 123,
   *   onChange: (user) => console.log('User 123 changed:', user)
   * });
   * ```
   */
  subscribe(table: string, options: SubscriptionOptions = {}): void {
    const { rowId, columns, onChange } = options;

    const sub: SubscriptionMessage = {
      action: "subscribe",
      subscription: {
        table,
        ...(rowId !== undefined && { row_id: rowId }),
        ...(columns && { columns }),
        jwt: this.jwt,
      },
    };

    this.subscriptions.push(sub);

    // Store callback for this subscription
    if (onChange) {
      const key = `${table}:${rowId ?? "*"}`;
      this.listeners.set(key, onChange);
    }

    this.send(sub);
  }

  /**
   * Unsubscribe from database changes
   *
   * @param table - Table name to unsubscribe from
   * @param rowId - Optional row ID (if subscribing to specific row)
   *
   * @example
   * ```typescript
   * client.unsubscribe('tasks');
   * client.unsubscribe('users', 123);
   * ```
   */
  unsubscribe(table: string, rowId?: string): void {
    const sub: SubscriptionMessage = {
      action: "unsubscribe",
      subscription: {
        table,
        ...(rowId !== undefined && { row_id: rowId }),
        jwt: this.jwt,
      },
    };

    // Remove from subscriptions
    this.subscriptions = this.subscriptions.filter(
      (s) =>
        !(s.subscription.table === table && s.subscription.row_id === rowId)
    );

    // Remove listener
    const key = `${table}:${rowId ?? "*"}`;
    this.listeners.delete(key);

    this.send(sub);
  }

  /**
   * Send message to WebSocket server
   * @private
   */
  private send(data: SubscriptionMessage): void {
    if (!WS) return;
    if (this.ws?.readyState === WS.OPEN || this.ws?.readyState === 1) {
      this.ws.send(JSON.stringify(data));
    }
  }

  /**
   * Handle incoming WebSocket messages
   * @private
   */
  private handleMessage(msg: UpdateMessage | StatusMessage): void {
    if ("type" in msg && msg.type === "update") {
      // Call specific listener
      const key = `${msg.table}:${msg.row_id}`;
      const wildcardKey = `${msg.table}:*`;

      const listener =
        this.listeners.get(key) || this.listeners.get(wildcardKey);
      if (listener) {
        listener(msg.data, msg);
      }
    }
  }

  /**
   * Update JWT token for authentication
   *
   * @param jwt - New JWT token
   *
   * @example
   * ```typescript
   * client.updateJWT(newToken);
   * ```
   */
  updateJWT(jwt: string): void {
    this.jwt = jwt;
    // Update JWT in all subscriptions
    this.subscriptions = this.subscriptions.map((sub) => ({
      ...sub,
      subscription: { ...sub.subscription, jwt },
    }));
  }

  /**
   * Close WebSocket connection and prevent reconnection
   *
   * @example
   * ```typescript
   * client.close();
   * ```
   */
  close(): void {
    this.shouldReconnect = false;
    this.ws?.close();
  }

  /**
   * Check if WebSocket is currently connected
   *
   * @returns true if connected, false otherwise
   */
  isConnected(): boolean {
    if (!WS) return false;
    return this.ws?.readyState === WS.OPEN || this.ws?.readyState === 1;
  }
}
