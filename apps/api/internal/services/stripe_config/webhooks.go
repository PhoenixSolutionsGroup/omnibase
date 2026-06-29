package stripe_config

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/stripe/stripe-go/v82"

	"api/internal/database/repository"
	"api/internal/logger"
	"api/internal/models"
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
	ID      string
	URL     string
	Events  []string
	Connect bool
	Status  string
}

func (s *Service) processWebhooks(ctx context.Context, configID uuid.UUID, webhooks []models.WebhookEndpointConfig) ([]WebhookResult, error) {
	if s.managed != nil {
		return s.processWebhooksManaged(ctx, configID, webhooks)
	}

	stripeWebhooks, err := s.listStripeWebhooks(ctx)
	if err != nil {
		return nil, fmt.Errorf("%w: %w", ProcessWebhooksError, err)
	}

	desiredByURL := make(map[string]models.WebhookEndpointConfig)
	for _, w := range webhooks {
		desiredByURL[w.URL] = w
	}
	stripeByURL := make(map[string][]StripeWebhookInfo)
	for _, sw := range stripeWebhooks {
		stripeByURL[sw.URL] = append(stripeByURL[sw.URL], sw)
	}

	for url, swList := range stripeByURL {
		desired, isDesired := desiredByURL[url]
		if !isDesired {
			for _, sw := range swList {
				if err := s.deleteWebhookByStripeID(ctx, sw.ID); err != nil {
					logger.Logger.Warn("Failed to delete orphaned Stripe webhook", "error", err, "stripeID", sw.ID)
				}
				_ = s.repo.DeleteStripeWebhookByStripeID(ctx, sw.ID)
			}
			continue
		}
		matchingIdx := -1
		for i, sw := range swList {
			if eventsEqual(sw.Events, desired.Events) && sw.Connect == desired.Connect {
				if matchingIdx == -1 {
					matchingIdx = i
					continue
				}
			}
			if err := s.deleteWebhookByStripeID(ctx, sw.ID); err != nil {
				logger.Logger.Warn("Failed to delete mismatched Stripe webhook", "error", err, "stripeID", sw.ID)
			}
			_ = s.repo.DeleteStripeWebhookByStripeID(ctx, sw.ID)
		}
		if matchingIdx >= 0 {
			stripeByURL[url] = []StripeWebhookInfo{swList[matchingIdx]}
		} else {
			delete(stripeByURL, url)
		}
	}

	var results []WebhookResult
	for _, w := range webhooks {
		existing := stripeByURL[w.URL]
		if len(existing) > 0 {
			sw := existing[0]
			cfgID := configID
			db, err := s.repo.GetStripeWebhookByStripeID(ctx, sw.ID)
			var dbID string
			if err == nil {
				dbID = db.ID.String()
			} else {
				row, createErr := s.repo.CreateStripeWebhook(ctx, repository.CreateStripeWebhookParams{
					StripeID: sw.ID,
					Url:      sw.URL,
					Secret:   "",
					Events:   sw.Events,
					Connect:  sw.Connect,
					ConfigID: &cfgID,
				})
				if createErr != nil {
					logger.Logger.Warn("Failed to import existing webhook to database", "error", createErr)
				} else {
					dbID = row.ID.String()
				}
			}
			results = append(results, WebhookResult{
				ID:       dbID,
				StripeID: sw.ID,
				URL:      sw.URL,
				Events:   sw.Events,
				Connect:  sw.Connect,
				Action:   "unchanged",
			})
			continue
		}
		result, err := s.createWebhook(ctx, configID, w.URL, w.Events, w.Connect)
		if err != nil {
			return nil, fmt.Errorf("failed to create webhook %s: %w", w.URL, err)
		}
		results = append(results, *result)
	}
	return results, nil
}

func (s *Service) processWebhooksManaged(ctx context.Context, configID uuid.UUID, webhooks []models.WebhookEndpointConfig) ([]WebhookResult, error) {
	var results []WebhookResult
	for _, w := range webhooks {
		req := RegisterWebhookRequest{
			ConfigID:  configID.String(),
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
		cfgID := configID
		row, err := s.repo.CreateStripeWebhook(ctx, repository.CreateStripeWebhookParams{
			StripeID: resp.ID,
			Url:      w.URL,
			Secret:   secret,
			Events:   w.Events,
			Connect:  w.Connect,
			ConfigID: &cfgID,
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

func (s *Service) createWebhook(ctx context.Context, configID uuid.UUID, url string, events []string, connect bool) (*WebhookResult, error) {
	enabledEvents := make([]*string, len(events))
	for i, ev := range events {
		enabledEvents[i] = stripe.String(ev)
	}
	params := &stripe.WebhookEndpointCreateParams{
		URL:           stripe.String(url),
		EnabledEvents: enabledEvents,
	}
	if connect {
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
			deleteParams := &stripe.WebhookEndpointDeleteParams{}
			s.stripe.ApplyAccount(deleteParams)
			_, _ = s.stripe.Stripe.V1WebhookEndpoints.Delete(ctx, result.ID, deleteParams)
			return nil, fmt.Errorf("failed to encrypt webhook secret: %w", encErr)
		}
		encryptedSecret = enc
	}
	cfgID := configID
	row, err := s.repo.CreateStripeWebhook(ctx, repository.CreateStripeWebhookParams{
		StripeID: result.ID,
		Url:      url,
		Secret:   encryptedSecret,
		Events:   events,
		Connect:  connect,
		ConfigID: &cfgID,
	})
	if err != nil {
		deleteParams := &stripe.WebhookEndpointDeleteParams{}
		s.stripe.ApplyAccount(deleteParams)
		_, _ = s.stripe.Stripe.V1WebhookEndpoints.Delete(ctx, result.ID, deleteParams)
		return nil, fmt.Errorf("failed to save webhook to database: %w", err)
	}
	return &WebhookResult{
		ID:       row.ID.String(),
		StripeID: result.ID,
		URL:      url,
		Events:   events,
		Connect:  connect,
		Secret:   result.Secret,
		Action:   "created",
	}, nil
}

func (s *Service) listStripeWebhooks(ctx context.Context) ([]StripeWebhookInfo, error) {
	params := &stripe.WebhookEndpointListParams{}
	s.stripe.ApplyAccount(params)

	var out []StripeWebhookInfo
	for endpoint, err := range s.stripe.Stripe.V1WebhookEndpoints.List(ctx, params) {
		if err != nil {
			return nil, fmt.Errorf("failed to list webhook endpoints: %w", err)
		}
		events := make([]string, len(endpoint.EnabledEvents))
		copy(events, endpoint.EnabledEvents)
		out = append(out, StripeWebhookInfo{
			ID:      endpoint.ID,
			URL:     endpoint.URL,
			Events:  events,
			Connect: endpoint.Application != "",
			Status:  string(endpoint.Status),
		})
	}
	return out, nil
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
