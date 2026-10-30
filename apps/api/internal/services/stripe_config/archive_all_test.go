package stripe_config

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"

	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"

	"api/internal/config"
	"api/internal/database/repository"
	repomock "api/internal/mocks/repository"
	"api/internal/services/stripe_client"
)

type archiveWrites struct {
	mu    sync.Mutex
	paths []string
}

func (w *archiveWrites) add(path string) {
	w.mu.Lock()
	defer w.mu.Unlock()
	w.paths = append(w.paths, path)
}

func (w *archiveWrites) snapshot() []string {
	w.mu.Lock()
	defer w.mu.Unlock()
	return append([]string{}, w.paths...)
}

func (w *archiveWrites) reset() {
	w.mu.Lock()
	defer w.mu.Unlock()
	w.paths = nil
}

func TestArchiveAllOnlyTouchesManagedObjects(t *testing.T) {
	writes := &archiveWrites{}
	server := archiveAllServer(t, writes)
	t.Cleanup(server.Close)

	repo := repomock.NewMockQuerier(t)
	repo.EXPECT().GetLatestStripeConfig(mock.Anything).Return(archiveConfigRow(t), nil).Twice()
	repo.EXPECT().CreateStripeConfig(mock.Anything, mock.Anything).Return(repository.StripeStripeConfig{}, nil).Twice()

	service := &Service{
		repo:      repo,
		stripe:    stripe_client.New(config.StripeConfig{SecretKey: "sk_test", APIBaseURL: server.URL}),
		validator: NewValidator(),
	}

	result, err := service.ArchiveAll(context.Background(), ArchiveAllOptions{})
	require.NoError(t, err)
	require.Empty(t, result.Errors)

	recorded := writes.snapshot()
	require.Contains(t, recorded, "/v1/promotion_codes/promo_managed")
	require.Contains(t, recorded, "/v1/coupons/coupon_managed")
	require.Contains(t, recorded, "/v1/billing/meters/mtr_managed/deactivate")
	require.Contains(t, recorded, "/v1/prices/price_managed")
	require.Contains(t, recorded, "/v1/products/prod_managed")
	require.NotContains(t, recorded, "/v1/promotion_codes/promo_unmanaged")
	require.NotContains(t, recorded, "/v1/coupons/coupon_unmanaged")
	require.NotContains(t, recorded, "/v1/billing/meters/mtr_unmanaged/deactivate")
	require.NotContains(t, recorded, "/v1/prices/price_unmanaged")
	require.NotContains(t, recorded, "/v1/products/prod_unmanaged")

	writes.reset()
	forceResult, err := service.ArchiveAll(context.Background(), ArchiveAllOptions{Force: true})
	require.NoError(t, err)
	require.Empty(t, forceResult.Errors)
	require.True(t, forceResult.Force)

	recorded = writes.snapshot()
	require.Contains(t, recorded, "/v1/promotion_codes/promo_unmanaged")
	require.Contains(t, recorded, "/v1/coupons/coupon_unmanaged")
	require.Contains(t, recorded, "/v1/billing/meters/mtr_unmanaged/deactivate")
	require.Contains(t, recorded, "/v1/prices/price_unmanaged")
	require.Contains(t, recorded, "/v1/products/prod_unmanaged")
}

func archiveConfigRow(t *testing.T) repository.StripeStripeConfig {
	t.Helper()
	raw, err := json.Marshal(ConfigData{
		"version":  "1.0.0",
		"products": []any{},
		"meters": []any{map[string]any{
			"id":           "m1",
			"display_name": "Managed Meter",
			"event_name":   "managed_events",
			"default_aggregation": map[string]any{
				"formula": "sum",
			},
		}},
		"coupons":         []any{},
		"promotion_codes": []any{},
	})
	require.NoError(t, err)
	return repository.StripeStripeConfig{Config: raw, Version: "1.0.0"}
}

func archiveAllServer(t *testing.T, writes *archiveWrites) *httptest.Server {
	t.Helper()
	managed := map[string]string{MetadataKeyManaged: MetadataManagedValue, MetadataKeyConfigID: "managed"}
	return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.Path
		switch {
		case r.Method == http.MethodGet && path == "/v1/promotion_codes":
			writeJSON(t, w, listResponse(
				map[string]any{"id": "promo_managed", "object": "promotion_code", "code": "MANAGED", "active": true, "metadata": managed},
				map[string]any{"id": "promo_unmanaged", "object": "promotion_code", "code": "OTHER", "active": true, "metadata": map[string]string{}},
			))
		case r.Method == http.MethodGet && path == "/v1/coupons":
			writeJSON(t, w, listResponse(
				map[string]any{"id": "coupon_managed", "object": "coupon", "name": "Managed", "duration": "once", "metadata": managed},
				map[string]any{"id": "coupon_unmanaged", "object": "coupon", "name": "Other", "duration": "once", "metadata": map[string]string{}},
			))
		case r.Method == http.MethodGet && path == "/v1/billing/meters":
			writeJSON(t, w, listResponse(
				map[string]any{"id": "mtr_managed", "object": "billing.meter", "display_name": "Managed", "event_name": "managed_events", "status": "active", "default_aggregation": map[string]any{"formula": "sum"}},
				map[string]any{"id": "mtr_unmanaged", "object": "billing.meter", "display_name": "Other", "event_name": "other_events", "status": "active", "default_aggregation": map[string]any{"formula": "sum"}},
			))
		case r.Method == http.MethodGet && path == "/v1/prices":
			writeJSON(t, w, listResponse(
				map[string]any{"id": "price_managed", "object": "price", "active": true, "metadata": managed},
				map[string]any{"id": "price_unmanaged", "object": "price", "active": true, "metadata": map[string]string{}},
			))
		case r.Method == http.MethodGet && path == "/v1/products":
			writeJSON(t, w, listResponse(
				map[string]any{"id": "prod_managed", "object": "product", "name": "Managed", "active": true, "metadata": managed},
				map[string]any{"id": "prod_unmanaged", "object": "product", "name": "Other", "active": true, "metadata": map[string]string{}},
			))
		case r.Method == http.MethodPost || r.Method == http.MethodDelete:
			writes.add(path)
			writeJSON(t, w, mutationResponse(path))
		default:
			writeJSON(t, w, listResponse())
		}
	}))
}

func listResponse(items ...any) map[string]any {
	return map[string]any{"object": "list", "has_more": false, "data": items}
}

func mutationResponse(path string) map[string]any {
	parts := strings.Split(strings.Trim(path, "/"), "/")
	id := parts[len(parts)-1]
	if id == "deactivate" && len(parts) >= 2 {
		return map[string]any{"id": parts[len(parts)-2], "object": "billing.meter", "status": "inactive"}
	}
	switch {
	case strings.HasPrefix(path, "/v1/promotion_codes/"):
		return map[string]any{"id": id, "object": "promotion_code", "active": false}
	case strings.HasPrefix(path, "/v1/coupons/"):
		return map[string]any{"id": id, "object": "coupon", "deleted": true}
	case strings.HasPrefix(path, "/v1/prices/"):
		return map[string]any{"id": id, "object": "price", "active": false}
	case strings.HasPrefix(path, "/v1/products/"):
		return map[string]any{"id": id, "object": "product", "active": false}
	}
	return map[string]any{"id": id}
}

func TestArchiveAllClearsDefaultPriceAndDeletesWebhooks(t *testing.T) {
	defaultPriceAttempts := 0
	productUpdates := 0
	deletedWebhooks := []string{}

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.Path
		switch {
		case r.Method == http.MethodGet && path == "/v1/promotion_codes",
			r.Method == http.MethodGet && path == "/v1/coupons",
			r.Method == http.MethodGet && path == "/v1/billing/meters":
			writeJSON(t, w, listResponse())
		case r.Method == http.MethodGet && path == "/v1/webhook_endpoints":
			writeJSON(t, w, listResponse(
				map[string]any{"id": "we_managed", "object": "webhook_endpoint", "url": "https://example.com/hook", "status": "enabled", "enabled_events": []string{"invoice.paid"}, "metadata": map[string]string{MetadataKeyManaged: MetadataManagedValue}},
				map[string]any{"id": "we_unmanaged", "object": "webhook_endpoint", "url": "https://other.example.com/hook", "status": "enabled", "enabled_events": []string{"invoice.paid"}, "metadata": map[string]string{}},
			))
		case r.Method == http.MethodDelete && strings.HasPrefix(path, "/v1/webhook_endpoints/"):
			deletedWebhooks = append(deletedWebhooks, path)
			writeJSON(t, w, map[string]any{"id": path[strings.LastIndex(path, "/")+1:], "object": "webhook_endpoint", "deleted": true})
		case r.Method == http.MethodGet && path == "/v1/prices":
			writeJSON(t, w, listResponse(map[string]any{
				"id": "price_default", "object": "price", "active": true, "currency": "usd", "unit_amount": 1000, "product": "prod_a",
			}))
		case r.Method == http.MethodPost && path == "/v1/prices/price_default":
			defaultPriceAttempts++
			if defaultPriceAttempts == 1 {
				w.WriteHeader(http.StatusBadRequest)
				writeJSON(t, w, map[string]any{"error": map[string]any{
					"type": "invalid_request_error", "code": "invalid_request_error",
					"message": "This price cannot be archived because it is the default price of its product.",
				}})
				return
			}
			writeJSON(t, w, map[string]any{"id": "price_default", "object": "price", "active": false, "currency": "usd", "unit_amount": 1000, "product": "prod_a"})
		case r.Method == http.MethodPost && path == "/v1/products/prod_a":
			productUpdates++
			if productUpdates == 1 {
				if err := r.ParseForm(); err != nil {
					t.Errorf("failed to parse product update form: %v", err)
				}
				if _, ok := r.Form["default_price"]; !ok {
					t.Errorf("expected default_price to be sent when clearing default")
				}
			}
			writeJSON(t, w, map[string]any{"id": "prod_a", "object": "product", "active": false, "name": "Product A"})
		case r.Method == http.MethodGet && path == "/v1/products":
			writeJSON(t, w, listResponse(map[string]any{"id": "prod_a", "object": "product", "active": true, "name": "Product A"}))
		default:
			t.Errorf("unexpected request: %s %s", r.Method, path)
			writeJSON(t, w, map[string]any{"error": map[string]string{"message": "unexpected"}})
		}
	}))
	t.Cleanup(server.Close)

	repo := repomock.NewMockQuerier(t)
	repo.EXPECT().GetLatestStripeConfig(mock.Anything).Return(archiveConfigRow(t), nil).Once()
	repo.EXPECT().CreateStripeConfig(mock.Anything, mock.Anything).Return(repository.StripeStripeConfig{}, nil).Once()
	repo.EXPECT().DeleteStripeWebhookByStripeID(mock.Anything, mock.Anything).Return(nil).Twice()

	service := &Service{
		repo:      repo,
		stripe:    stripe_client.New(config.StripeConfig{SecretKey: "sk_test", APIBaseURL: server.URL}),
		validator: NewValidator(),
	}

	result, err := service.ArchiveAll(context.Background(), ArchiveAllOptions{Force: true})
	require.NoError(t, err)
	require.Empty(t, result.Errors)
	require.Equal(t, 2, defaultPriceAttempts)
	require.GreaterOrEqual(t, productUpdates, 2)
	require.Len(t, deletedWebhooks, 2)
	require.Contains(t, deletedWebhooks, "/v1/webhook_endpoints/we_managed")
	require.Contains(t, deletedWebhooks, "/v1/webhook_endpoints/we_unmanaged")
}
