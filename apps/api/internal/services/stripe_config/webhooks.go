package stripe_config

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/stripe/stripe-go/v82"

	"api/internal/database/repository"
	"api/internal/logger"
)

var (
	ProcessWebhooksError = errors.New("Failed to process stripe webhooks")
	ListWebhooksError    = errors.New("Failed to list stripe webhooks")
	DeleteWebhookError   = errors.New("Failed to delete stripe webhook")
)

type WebhookResult struct {
	ID       string
	StripeID string
	URL      string
	Events   []string
	Connect  bool
	Secret   string
	Action   string
}

type StripeWebhookInfo struct {
	ID       string
	URL      string
	Events   []string
	Connect  bool
	Status   string
	Metadata map[string]string
}

func (s *Service) processWebhooksManaged(ctx context.Context, webhooks []WebhookEndpointConfig) ([]WebhookResult, error) {
	var results []WebhookResult
	for _, w := range webhooks {
		req := RegisterWebhookRequest{
			WebhookID: w.ID,
			URL:       w.URL,
			Events:    w.Events,
			Connect:   w.Connect,
		}
		resp, err := s.managed.RegisterWebhook(ctx, req)
		if err != nil {
			return nil, fmt.Errorf("%w: %w", ProcessWebhooksError, err)
		}
		secret := resp.Secret
		if s.encryption != nil {
			enc, encErr := s.encryption.Encrypt(resp.Secret)
			if encErr != nil {
				return nil, fmt.Errorf("%w: failed to encrypt webhook secret: %w", ProcessWebhooksError, encErr)
			}
			secret = enc
		}
		row, err := s.repo.CreateStripeWebhook(ctx, repository.CreateStripeWebhookParams{
			StripeID: resp.ID,
			Url:      w.URL,
			Secret:   secret,
			Events:   w.Events,
			Connect:  w.Connect,
		})
		if err != nil {
			return nil, fmt.Errorf("%w: failed to persist webhook: %w", ProcessWebhooksError, err)
		}
		results = append(results, WebhookResult{
			ID:       row.ID.String(),
			StripeID: resp.ID,
			URL:      w.URL,
			Events:   w.Events,
			Connect:  w.Connect,
			Secret:   resp.Secret,
			Action:   resp.Action,
		})
	}
	return results, nil
}

func (s *Service) createWebhook(ctx context.Context, webhookConfig WebhookEndpointConfig) (*WebhookResult, error) {
	enabledEvents := make([]*string, len(webhookConfig.Events))
	for i, ev := range webhookConfig.Events {
		enabledEvents[i] = stripe.String(ev)
	}
	params := &stripe.WebhookEndpointCreateParams{
		URL:           stripe.String(webhookConfig.URL),
		EnabledEvents: enabledEvents,
		Metadata:      managedMetadata("webhook_endpoint", webhookConfig.ID, webhookConfigHash(webhookConfig), nil),
	}
	if webhookConfig.Connect {
		params.Connect = stripe.Bool(true)
	}
	s.stripe.ApplyAccount(params)

	result, err := s.stripe.Stripe.V1WebhookEndpoints.Create(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("failed to create webhook endpoint: %w", err)
	}

	encryptedSecret := result.Secret
	if s.encryption != nil {
		enc, encErr := s.encryption.Encrypt(result.Secret)
		if encErr != nil {
			s.removeWebhookEndpoint(ctx, result.ID)
			return nil, fmt.Errorf("failed to encrypt webhook secret: %w", encErr)
		}
		encryptedSecret = enc
	}
	row, err := s.repo.CreateStripeWebhook(ctx, repository.CreateStripeWebhookParams{
		StripeID: result.ID,
		Url:      webhookConfig.URL,
		Secret:   encryptedSecret,
		Events:   webhookConfig.Events,
		Connect:  webhookConfig.Connect,
	})
	if err != nil {
		s.removeWebhookEndpoint(ctx, result.ID)
		return nil, fmt.Errorf("failed to save webhook to database: %w", err)
	}
	return &WebhookResult{
		ID:       row.ID.String(),
		StripeID: result.ID,
		URL:      webhookConfig.URL,
		Events:   webhookConfig.Events,
		Connect:  webhookConfig.Connect,
		Secret:   result.Secret,
		Action:   "created",
	}, nil
}

func (s *Service) updateWebhook(ctx context.Context, webhookConfig WebhookEndpointConfig, stripeID string) (*WebhookResult, error) {
	enabledEvents := make([]*string, len(webhookConfig.Events))
	for i, ev := range webhookConfig.Events {
		enabledEvents[i] = stripe.String(ev)
	}
	params := &stripe.WebhookEndpointUpdateParams{
		URL:           stripe.String(webhookConfig.URL),
		EnabledEvents: enabledEvents,
		Metadata:      managedMetadata("webhook_endpoint", webhookConfig.ID, webhookConfigHash(webhookConfig), nil),
	}
	s.stripe.ApplyAccount(params)
	if _, err := s.stripe.Stripe.V1WebhookEndpoints.Update(ctx, stripeID, params); err != nil {
		return nil, fmt.Errorf("failed to update webhook endpoint: %w", err)
	}
	return &WebhookResult{
		ID:       s.ensureWebhookRow(ctx, stripeID, webhookConfig.URL, webhookConfig.Events, webhookConfig.Connect),
		StripeID: stripeID,
		URL:      webhookConfig.URL,
		Events:   webhookConfig.Events,
		Connect:  webhookConfig.Connect,
		Action:   "updated",
	}, nil
}

func (s *Service) ensureWebhookRow(ctx context.Context, stripeID, url string, events []string, connect bool) string {
	row, err := s.repo.GetStripeWebhookByStripeID(ctx, stripeID)
	if err == nil {
		return row.ID.String()
	}
	created, createErr := s.repo.CreateStripeWebhook(ctx, repository.CreateStripeWebhookParams{
		StripeID: stripeID,
		Url:      url,
		Secret:   "",
		Events:   events,
		Connect:  connect,
	})
	if createErr != nil {
		logger.Logger.Warn("Failed to persist webhook row", "error", createErr, "stripeID", stripeID)
		return ""
	}
	return created.ID.String()
}

func (s *Service) listStripeWebhooks(ctx context.Context) ([]StripeWebhookInfo, error) {
	params := &stripe.WebhookEndpointListParams{}
	params.Limit = stripe.Int64(100)
	s.stripe.ApplyAccount(params)

	var out []StripeWebhookInfo
	for endpoint, err := range s.stripe.Stripe.V1WebhookEndpoints.List(ctx, params) {
		if err != nil {
			return nil, fmt.Errorf("failed to list webhook endpoints: %w", err)
		}
		events := make([]string, len(endpoint.EnabledEvents))
		copy(events, endpoint.EnabledEvents)
		out = append(out, StripeWebhookInfo{
			ID:       endpoint.ID,
			URL:      endpoint.URL,
			Events:   events,
			Connect:  endpoint.Application != "",
			Status:   string(endpoint.Status),
			Metadata: endpoint.Metadata,
		})
	}
	return out, nil
}

func (s *Service) removeWebhookEndpoint(ctx context.Context, stripeID string) {
	params := &stripe.WebhookEndpointDeleteParams{}
	s.stripe.ApplyAccount(params)
	_, _ = s.stripe.Stripe.V1WebhookEndpoints.Delete(ctx, stripeID, params)
}

func (s *Service) deleteWebhookByStripeID(ctx context.Context, stripeID string) error {
	params := &stripe.WebhookEndpointDeleteParams{}
	s.stripe.ApplyAccount(params)
	if _, err := s.stripe.Stripe.V1WebhookEndpoints.Delete(ctx, stripeID, params); err != nil {
		if stripeErr, ok := err.(*stripe.Error); ok && stripeErr.Code == stripe.ErrorCodeResourceMissing {
			return nil
		}
		return fmt.Errorf("%w: %w", DeleteWebhookError, err)
	}
	return nil
}

func (s *Service) DeleteWebhook(ctx context.Context, stripeID string) error {
	if err := s.deleteWebhookByStripeID(ctx, stripeID); err != nil {
		return err
	}
	if err := s.repo.DeleteStripeWebhookByStripeID(ctx, stripeID); err != nil {
		return fmt.Errorf("%w: %w", DeleteWebhookError, err)
	}
	return nil
}

func (s *Service) ListWebhooks(ctx context.Context) ([]repository.ListStripeWebhooksRow, error) {
	rows, err := s.repo.ListStripeWebhooks(ctx)
	if err != nil {
		return nil, fmt.Errorf("%w: %w", ListWebhooksError, err)
	}
	for i := range rows {
		s.decryptSecret(&rows[i].Secret)
	}
	return rows, nil
}

func (s *Service) GetWebhooksForConfig(ctx context.Context, configID uuid.UUID) ([]repository.ListStripeWebhooksByConfigIDRow, error) {
	rows, err := s.repo.ListStripeWebhooksByConfigID(ctx, &configID)
	if err != nil {
		return nil, fmt.Errorf("%w: %w", ListWebhooksError, err)
	}
	for i := range rows {
		s.decryptSecret(&rows[i].Secret)
	}
	return rows, nil
}

func (s *Service) decryptSecret(secret *string) {
	if s.encryption == nil || *secret == "" {
		return
	}
	if dec, err := s.encryption.Decrypt(*secret); err == nil {
		*secret = dec
	}
}
