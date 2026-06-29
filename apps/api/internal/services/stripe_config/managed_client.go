package stripe_config

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"api/internal/config"
)

type ManagedHostingClient struct {
	baseURL      string
	serviceToken string
	tenantID     string
	httpClient   *http.Client
}

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

type RegisterWebhookRequest struct {
	ConfigID  string   `json:"config_id"`
	WebhookID string   `json:"webhook_id"`
	URL       string   `json:"url"`
	Events    []string `json:"events"`
	Connect   bool     `json:"connect"`
}

type RegisterWebhookResponse struct {
	ID        string `json:"id"`
	WebhookID string `json:"webhook_id"`
	Secret    string `json:"secret"`
	Action    string `json:"action"`
}

func (c *ManagedHostingClient) RegisterWebhook(ctx context.Context, req RegisterWebhookRequest) (*RegisterWebhookResponse, error) {
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
		return nil, fmt.Errorf("failed to call managed hosting API: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("managed hosting API returned status %d", resp.StatusCode)
	}
	var result RegisterWebhookResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}
	return &result, nil
}

func (c *ManagedHostingClient) DeleteWebhook(ctx context.Context, webhookID string) error {
	httpReq, err := http.NewRequestWithContext(ctx, "DELETE",
		c.baseURL+"/api/v1/stripe/webhooks/"+webhookID, nil)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}
	httpReq.Header.Set("X-API-Key", c.serviceToken)
	httpReq.Header.Set("X-Tenant-ID", c.tenantID)

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return fmt.Errorf("failed to call managed hosting API: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusNoContent {
		return fmt.Errorf("managed hosting API returned status %d", resp.StatusCode)
	}
	return nil
}
