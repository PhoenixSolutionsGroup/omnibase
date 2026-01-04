package handlers

import (
	"context"
	"fmt"

	"api/internal/logger"
	"api/internal/models"
	"api/internal/services"

	"github.com/google/uuid"
	"github.com/stripe/stripe-go/v82"
	"github.com/stripe/stripe-go/v82/webhookendpoint"
	"gorm.io/gorm"
)

// StripeWebhookInfo represents a webhook endpoint from Stripe API
type StripeWebhookInfo struct {
	ID      string
	URL     string
	Events  []string
	Connect bool
	Status  string
}

type WebhookHandler struct {
	client            *stripe.Client
	db                *gorm.DB
	accountID         string
	encryptionService *services.EncryptionService
}

func NewWebhookHandler(client *stripe.Client, db *gorm.DB, accountID string, encryptionService *services.EncryptionService) *WebhookHandler {
	return &WebhookHandler{
		client:            client,
		db:                db,
		accountID:         accountID,
		encryptionService: encryptionService,
	}
}

// ListStripeWebhooks fetches all webhook endpoints from Stripe API
func (h *WebhookHandler) ListStripeWebhooks(ctx context.Context) ([]StripeWebhookInfo, error) {
	logger.Logger.Debug("Fetching webhook endpoints from Stripe API")

	params := &stripe.WebhookEndpointListParams{}
	ApplyConnectAccount(h.accountID, params)

	var webhooks []StripeWebhookInfo
	iter := webhookendpoint.List(params)
	for iter.Next() {
		endpoint := iter.WebhookEndpoint()

		// Convert enabled events to string slice
		events := make([]string, len(endpoint.EnabledEvents))
		for i, event := range endpoint.EnabledEvents {
			events[i] = event
		}

		// Connect webhooks are identified by having an Application ID
		isConnect := endpoint.Application != ""

		webhooks = append(webhooks, StripeWebhookInfo{
			ID:      endpoint.ID,
			URL:     endpoint.URL,
			Events:  events,
			Connect: isConnect,
			Status:  string(endpoint.Status),
		})
	}

	if err := iter.Err(); err != nil {
		logger.Logger.Error("Failed to list webhook endpoints from Stripe", "error", err)
		return nil, fmt.Errorf("failed to list webhook endpoints: %w", err)
	}

	logger.Logger.Debug("Fetched webhook endpoints from Stripe", "count", len(webhooks))
	return webhooks, nil
}

// WebhookResult contains the result of a webhook operation
type WebhookResult struct {
	ID       string
	StripeID string
	URL      string
	Events   []string
	Connect  bool
	Secret   string
	Action   string // "created", "updated", "unchanged"
}

// createWebhook creates a new webhook endpoint in Stripe
func (h *WebhookHandler) createWebhook(ctx context.Context, configID uuid.UUID, url string, events []string, connect bool) (*WebhookResult, error) {
	logger.Logger.Info("Creating new Stripe webhook endpoint", "url", url, "connect", connect)

	// Convert events to Stripe string pointers
	enabledEvents := make([]*string, len(events))
	for i, event := range events {
		enabledEvents[i] = stripe.String(event)
	}

	params := &stripe.WebhookEndpointParams{
		URL:           stripe.String(url),
		EnabledEvents: enabledEvents,
	}

	// If connect is true, this webhook listens to connected account events
	if connect {
		params.Connect = stripe.Bool(true)
	}

	ApplyConnectAccount(h.accountID, params)

	result, err := webhookendpoint.New(params)
	if err != nil {
		logger.Logger.Error("Failed to create Stripe webhook endpoint", "error", err, "url", url)
		return nil, fmt.Errorf("failed to create webhook endpoint: %w", err)
	}

	logger.Logger.Info("Stripe webhook endpoint created successfully",
		"stripeID", result.ID,
		"url", url,
		"connect", connect)

	// Encrypt the webhook secret before storing
	encryptedSecret := result.Secret
	if h.encryptionService != nil {
		encrypted, err := h.encryptionService.Encrypt(result.Secret)
		if err != nil {
			logger.Logger.Error("Failed to encrypt webhook secret", "error", err)
			// Clean up the Stripe webhook
			_, _ = webhookendpoint.Del(result.ID, nil)
			return nil, fmt.Errorf("failed to encrypt webhook secret: %w", err)
		}
		encryptedSecret = encrypted
	}

	// Save to database
	webhook := models.StripeWebhook{
		StripeID: result.ID,
		URL:      url,
		Secret:   encryptedSecret,
		Events:   events,
		Connect:  connect,
		ConfigID: &configID,
	}

	if err := h.db.Create(&webhook).Error; err != nil {
		logger.Logger.Error("Failed to save webhook to database", "error", err)
		// Try to clean up the Stripe webhook
		_, _ = webhookendpoint.Del(result.ID, nil)
		return nil, fmt.Errorf("failed to save webhook to database: %w", err)
	}

	return &WebhookResult{
		ID:       webhook.ID.String(),
		StripeID: result.ID,
		URL:      url,
		Events:   events,
		Connect:  connect,
		Secret:   result.Secret, // Return unencrypted secret to caller
		Action:   "created",
	}, nil
}

// updateWebhook updates an existing webhook endpoint in Stripe
func (h *WebhookHandler) updateWebhook(ctx context.Context, existing *models.StripeWebhook, url string, events []string, connect bool) (*WebhookResult, error) {
	logger.Logger.Info("Updating existing Stripe webhook endpoint",
		"stripeID", existing.StripeID,
		"url", url,
		"connect", connect)

	// Decrypt the existing secret for response
	decryptedSecret := existing.Secret
	if h.encryptionService != nil && existing.Secret != "" {
		decrypted, err := h.encryptionService.Decrypt(existing.Secret)
		if err != nil {
			logger.Logger.Warn("Failed to decrypt existing webhook secret, using raw value", "error", err)
		} else {
			decryptedSecret = decrypted
		}
	}

	// Check if anything actually changed
	if existing.URL == url && existing.Connect == connect && eventsEqual(existing.Events, events) {
		logger.Logger.Info("Webhook configuration unchanged, skipping update",
			"stripeID", existing.StripeID)
		return &WebhookResult{
			ID:       existing.ID.String(),
			StripeID: existing.StripeID,
			URL:      existing.URL,
			Events:   existing.Events,
			Connect:  existing.Connect,
			Secret:   decryptedSecret,
			Action:   "unchanged",
		}, nil
	}

	// Convert events to Stripe string pointers
	enabledEvents := make([]*string, len(events))
	for i, event := range events {
		enabledEvents[i] = stripe.String(event)
	}

	params := &stripe.WebhookEndpointParams{
		URL:           stripe.String(url),
		EnabledEvents: enabledEvents,
	}

	// Note: Connect param cannot be changed after creation in Stripe
	// If connect value changed, we need to recreate the webhook
	if existing.Connect != connect {
		logger.Logger.Info("Connect value changed, recreating webhook",
			"oldConnect", existing.Connect,
			"newConnect", connect)

		// Delete the old webhook
		delParams := &stripe.WebhookEndpointParams{}
		ApplyConnectAccount(h.accountID, delParams)
		_, _ = webhookendpoint.Del(existing.StripeID, delParams)

		// Delete from database
		if err := h.db.Delete(existing).Error; err != nil {
			logger.Logger.Error("Failed to delete old webhook from database", "error", err)
		}

		// Create new webhook with updated connect value
		return h.createWebhook(ctx, *existing.ConfigID, url, events, connect)
	}

	ApplyConnectAccount(h.accountID, params)

	result, err := webhookendpoint.Update(existing.StripeID, params)
	if err != nil {
		logger.Logger.Error("Failed to update Stripe webhook endpoint", "error", err, "stripeID", existing.StripeID)
		return nil, fmt.Errorf("failed to update webhook endpoint: %w", err)
	}

	logger.Logger.Info("Stripe webhook endpoint updated successfully",
		"stripeID", result.ID)

	// Update database record
	existing.URL = url
	existing.Events = events
	if err := h.db.Save(existing).Error; err != nil {
		logger.Logger.Error("Failed to update webhook in database", "error", err)
		return nil, fmt.Errorf("failed to update webhook in database: %w", err)
	}

	return &WebhookResult{
		ID:       existing.ID.String(),
		StripeID: existing.StripeID,
		URL:      url,
		Events:   events,
		Connect:  existing.Connect,
		Secret:   decryptedSecret,
		Action:   "updated",
	}, nil
}

// GetWebhookSecret retrieves the webhook secret from the database
func (h *WebhookHandler) GetWebhookSecret(ctx context.Context, configID uuid.UUID) (string, error) {
	logger.Logger.Debug("Retrieving webhook secret", "configID", configID)

	var webhook models.StripeWebhook
	err := h.db.Where("config_id = ?", configID).First(&webhook).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return "", fmt.Errorf("no webhook found for config %s", configID)
		}
		return "", fmt.Errorf("failed to retrieve webhook: %w", err)
	}

	// Decrypt the secret if encryption service is available
	if h.encryptionService != nil && webhook.Secret != "" {
		decrypted, err := h.encryptionService.Decrypt(webhook.Secret)
		if err != nil {
			logger.Logger.Warn("Failed to decrypt webhook secret", "error", err)
			return webhook.Secret, nil
		}
		return decrypted, nil
	}

	return webhook.Secret, nil
}

// GetLatestWebhookSecret retrieves the most recent webhook secret
func (h *WebhookHandler) GetLatestWebhookSecret(ctx context.Context) (*models.StripeWebhook, error) {
	logger.Logger.Debug("Retrieving latest webhook secret")

	var webhook models.StripeWebhook
	err := h.db.Order("created_at DESC").First(&webhook).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("no webhook found")
		}
		return nil, fmt.Errorf("failed to retrieve webhook: %w", err)
	}

	// Decrypt the secret if encryption service is available
	if h.encryptionService != nil && webhook.Secret != "" {
		decrypted, err := h.encryptionService.Decrypt(webhook.Secret)
		if err != nil {
			logger.Logger.Warn("Failed to decrypt webhook secret", "error", err)
		} else {
			webhook.Secret = decrypted
		}
	}

	return &webhook, nil
}

// DeleteWebhook deletes a webhook endpoint from Stripe and the database
func (h *WebhookHandler) DeleteWebhook(ctx context.Context, stripeID string) error {
	logger.Logger.Info("Deleting Stripe webhook endpoint", "stripeID", stripeID)

	if err := h.deleteWebhookByStripeID(ctx, stripeID); err != nil {
		return err
	}

	// Delete from database
	if err := h.db.Where("stripe_id = ?", stripeID).Delete(&models.StripeWebhook{}).Error; err != nil {
		logger.Logger.Error("Failed to delete webhook from database", "error", err, "stripeID", stripeID)
		return fmt.Errorf("failed to delete webhook from database: %w", err)
	}

	logger.Logger.Info("Webhook endpoint deleted successfully", "stripeID", stripeID)
	return nil
}

// deleteWebhookByStripeID deletes a webhook endpoint from Stripe only (not from database)
// Used for cleaning up orphan webhooks that exist in Stripe but not in our database
func (h *WebhookHandler) deleteWebhookByStripeID(ctx context.Context, stripeID string) error {
	params := &stripe.WebhookEndpointParams{}
	ApplyConnectAccount(h.accountID, params)

	_, err := webhookendpoint.Del(stripeID, params)
	if err != nil {
		// Check if webhook is already deleted
		if stripeErr, ok := err.(*stripe.Error); ok && stripeErr.Code == stripe.ErrorCodeResourceMissing {
			logger.Logger.Info("Webhook already deleted in Stripe", "stripeID", stripeID)
			return nil
		}
		logger.Logger.Error("Failed to delete Stripe webhook endpoint", "error", err, "stripeID", stripeID)
		return fmt.Errorf("failed to delete webhook endpoint: %w", err)
	}

	return nil
}

// ProcessWebhooks processes an array of webhook configurations
// It creates, updates, or deletes webhooks as needed to match the desired state
// This includes cleaning up webhooks from Stripe that aren't defined in the config
func (h *WebhookHandler) ProcessWebhooks(ctx context.Context, configID uuid.UUID, webhooks []models.WebhookEndpointConfig) ([]WebhookResult, error) {
	logger.Logger.Info("Processing webhooks configuration",
		"configID", configID,
		"webhookCount", len(webhooks))

	// Get existing webhooks from database for this config
	var existingWebhooks []models.StripeWebhook
	if err := h.db.Where("config_id = ?", configID).Find(&existingWebhooks).Error; err != nil {
		logger.Logger.Error("Failed to retrieve existing webhooks", "error", err)
		return nil, fmt.Errorf("failed to retrieve existing webhooks: %w", err)
	}

	// Create a map of existing webhooks by URL for quick lookup
	existingByURL := make(map[string]*models.StripeWebhook)
	for i := range existingWebhooks {
		existingByURL[existingWebhooks[i].URL] = &existingWebhooks[i]
	}

	// Build set of desired webhook URLs from config
	desiredURLs := make(map[string]bool)
	for _, webhookConfig := range webhooks {
		desiredURLs[webhookConfig.URL] = true
	}

	var results []WebhookResult

	// Process each webhook configuration
	for _, webhookConfig := range webhooks {
		if existing, found := existingByURL[webhookConfig.URL]; found {
			// Update existing webhook
			result, err := h.updateWebhook(ctx, existing, webhookConfig.URL, webhookConfig.Events, webhookConfig.Connect)
			if err != nil {
				return nil, fmt.Errorf("failed to update webhook %s: %w", webhookConfig.URL, err)
			}
			results = append(results, *result)
		} else {
			// Create new webhook
			result, err := h.createWebhook(ctx, configID, webhookConfig.URL, webhookConfig.Events, webhookConfig.Connect)
			if err != nil {
				return nil, fmt.Errorf("failed to create webhook %s: %w", webhookConfig.URL, err)
			}
			results = append(results, *result)
		}
	}

	// Delete webhooks from database that are no longer in the configuration
	for _, existing := range existingWebhooks {
		if !desiredURLs[existing.URL] {
			logger.Logger.Info("Deleting removed webhook from database", "stripeID", existing.StripeID, "url", existing.URL)
			if err := h.DeleteWebhook(ctx, existing.StripeID); err != nil {
				logger.Logger.Warn("Failed to delete removed webhook", "error", err, "stripeID", existing.StripeID)
			}
		}
	}

	// Also clean up any webhooks in Stripe that aren't in our config
	// This handles webhooks created outside our system or orphaned webhooks
	stripeWebhooks, err := h.ListStripeWebhooks(ctx)
	if err != nil {
		logger.Logger.Warn("Failed to list Stripe webhooks for cleanup", "error", err)
	} else {
		for _, stripeWebhook := range stripeWebhooks {
			if !desiredURLs[stripeWebhook.URL] {
				logger.Logger.Info("Deleting orphaned webhook from Stripe", "stripeID", stripeWebhook.ID, "url", stripeWebhook.URL)
				if err := h.deleteWebhookByStripeID(ctx, stripeWebhook.ID); err != nil {
					logger.Logger.Warn("Failed to delete orphaned Stripe webhook", "error", err, "stripeID", stripeWebhook.ID)
				}
			}
		}
	}

	logger.Logger.Info("Webhooks processing completed",
		"configID", configID,
		"resultCount", len(results))

	return results, nil
}

// GetWebhooksForConfig retrieves all webhooks for a given config
func (h *WebhookHandler) GetWebhooksForConfig(ctx context.Context, configID uuid.UUID) ([]models.StripeWebhook, error) {
	logger.Logger.Debug("Retrieving webhooks for config", "configID", configID)

	var webhooks []models.StripeWebhook
	if err := h.db.Where("config_id = ?", configID).Find(&webhooks).Error; err != nil {
		return nil, fmt.Errorf("failed to retrieve webhooks: %w", err)
	}

	// Decrypt secrets
	for i := range webhooks {
		if h.encryptionService != nil && webhooks[i].Secret != "" {
			decrypted, err := h.encryptionService.Decrypt(webhooks[i].Secret)
			if err != nil {
				logger.Logger.Warn("Failed to decrypt webhook secret", "error", err)
			} else {
				webhooks[i].Secret = decrypted
			}
		}
	}

	return webhooks, nil
}

// eventsEqual compares two event slices for equality
func eventsEqual(a, b []string) bool {
	if len(a) != len(b) {
		return false
	}

	aMap := make(map[string]bool)
	for _, v := range a {
		aMap[v] = true
	}

	for _, v := range b {
		if !aMap[v] {
			return false
		}
	}

	return true
}
