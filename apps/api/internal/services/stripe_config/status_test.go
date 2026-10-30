package stripe_config

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"

	"api/internal/config"
	"api/internal/database/repository"
	repomock "api/internal/mocks/repository"
	"api/internal/services/stripe_client"
)

func TestStatusReportsPendingDriftAndUntracked(t *testing.T) {
	appliedConfig := &StripeConfiguration{
		Version: "1.0.0",
		Products: []Product{
			{
				ID:   "prod_a",
				Name: "Product A",
				Prices: []Price{{
					ID:       "price_a",
					Amount:   1000,
					Currency: "usd",
					Interval: "month",
				}},
			},
			{ID: "prod_b", Name: "Product B", Prices: []Price{{ID: "price_b", Amount: 200, Currency: "usd", Interval: "month"}}},
			{ID: "prod_old", Name: "Product Old", Prices: []Price{{ID: "price_old", Amount: 300, Currency: "usd", Interval: "month"}}},
		},
		Webhooks: []WebhookEndpointConfig{{
			ID:     "webhook_a",
			URL:    "https://example.com/hook",
			Events: []string{"invoice.paid"},
		}},
	}
	desiredConfig := &StripeConfiguration{
		Version: "1.0.0",
		Products: []Product{
			{
				ID:   "prod_a",
				Name: "Product A",
				Prices: []Price{{
					ID:       "price_a",
					Amount:   1000,
					Currency: "usd",
					Interval: "month",
				}},
			},
			{ID: "prod_b", Name: "Product B", Prices: []Price{{ID: "price_b", Amount: 200, Currency: "usd", Interval: "month"}}},
			{
				ID:   "prod_new",
				Name: "Product New",
				Prices: []Price{{
					ID:       "price_new",
					Amount:   500,
					Currency: "usd",
				}},
			},
		},
		Webhooks: []WebhookEndpointConfig{{
			ID:     "webhook_a",
			URL:    "https://example.com/hook",
			Events: []string{"invoice.paid"},
		}},
	}

	appliedProducts := desiredProductsByID(appliedConfig)
	appliedPrices := desiredPricesByID(appliedConfig)
	raw, err := json.Marshal(appliedConfig)
	require.NoError(t, err)

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case "/v1/products":
			writeJSON(t, w, map[string]any{"object": "list", "data": []any{
				map[string]any{
					"id": "prod_a_stripe", "object": "product", "active": true,
					"name": "Product A", "type": "service",
					"metadata": map[string]string{
						MetadataKeyConfigID: "prod_a",
						MetadataKeyManaged:  MetadataManagedValue,
						MetadataKeyHash:     productConfigHash(appliedProducts["prod_a"]),
					},
				},
				map[string]any{
					"id": "prod_b_stripe", "object": "product", "active": true,
					"name": "Product B Tampered", "type": "service",
					"metadata": map[string]string{
						MetadataKeyConfigID: "prod_b",
						MetadataKeyManaged:  MetadataManagedValue,
						MetadataKeyHash:     productConfigHash(appliedProducts["prod_b"]),
					},
				},
				map[string]any{
					"id": "prod_old_stripe", "object": "product", "active": true,
					"name": "Product Old", "type": "service",
					"metadata": map[string]string{
						MetadataKeyConfigID: "prod_old",
						MetadataKeyManaged:  MetadataManagedValue,
						MetadataKeyHash:     productConfigHash(appliedProducts["prod_old"]),
					},
				},
				map[string]any{
					"id": "prod_extra_stripe", "object": "product", "active": true,
					"name": "Product Extra", "type": "service",
					"metadata": map[string]string{
						MetadataKeyConfigID: "prod_extra",
						MetadataKeyManaged:  MetadataManagedValue,
						MetadataKeyHash:     productConfigHash(Product{ID: "prod_extra", Name: "Product Extra"}),
					},
				},
			}, "has_more": false})
		case "/v1/prices":
			writeJSON(t, w, map[string]any{"object": "list", "data": []any{
				map[string]any{
					"id": "price_b_stripe", "object": "price", "active": true,
					"currency": "usd", "unit_amount": 200, "billing_scheme": "per_unit",
					"lookup_key": "price_b", "product": "prod_b_stripe",
					"recurring": map[string]any{"interval": "month", "interval_count": 1},
					"metadata": map[string]string{
						MetadataKeyConfigID: "price_b",
						MetadataKeyManaged:  MetadataManagedValue,
						MetadataKeyHash:     priceConfigHash(appliedPrices["price_b"]),
					},
				},
				map[string]any{
					"id": "price_old_stripe", "object": "price", "active": true,
					"currency": "usd", "unit_amount": 300, "billing_scheme": "per_unit",
					"lookup_key": "price_old", "product": "prod_old_stripe",
					"recurring": map[string]any{"interval": "month", "interval_count": 1},
					"metadata": map[string]string{
						MetadataKeyConfigID: "price_old",
						MetadataKeyManaged:  MetadataManagedValue,
						MetadataKeyHash:     priceConfigHash(appliedPrices["price_old"]),
					},
				},
			}, "has_more": false})
		case "/v1/billing/meters":
			writeJSON(t, w, map[string]any{"object": "list", "data": []any{}, "has_more": false})
		case "/v1/coupons":
			writeJSON(t, w, map[string]any{"object": "list", "data": []any{}, "has_more": false})
		case "/v1/promotion_codes":
			writeJSON(t, w, map[string]any{"object": "list", "data": []any{}, "has_more": false})
		case "/v1/webhook_endpoints":
			writeJSON(t, w, map[string]any{"object": "list", "data": []any{
				map[string]any{
					"id": "we_a", "object": "webhook_endpoint", "status": "enabled",
					"url":            "https://example.com/hook",
					"enabled_events": []string{"invoice.paid", "invoice.failed"},
					"metadata": map[string]string{
						MetadataKeyConfigID: "webhook_a",
						MetadataKeyManaged:  MetadataManagedValue,
					},
				},
			}, "has_more": false})
		default:
			t.Errorf("unexpected request: %s %s", r.Method, r.URL.Path)
			writeJSON(t, w, map[string]any{"error": map[string]string{"message": "unexpected"}})
		}
	}))
	t.Cleanup(server.Close)

	repo := repomock.NewMockQuerier(t)
	repo.EXPECT().GetLatestStripeConfig(mock.Anything).Return(repository.StripeStripeConfig{Config: raw}, nil).Once()

	service := &Service{
		repo:      repo,
		stripe:    stripe_client.New(config.StripeConfig{SecretKey: "sk_test", APIBaseURL: server.URL}),
		validator: NewValidator(),
	}

	status, err := service.Status(context.Background(), desiredConfig)
	require.NoError(t, err)
	require.Equal(t, 4, status.Summary.Pending)
	require.Equal(t, 3, status.Summary.Drift)
	require.Equal(t, 1, status.Summary.Untracked)

	require.Contains(t, status.Pending, ConfigStatusEntry{Kind: statusKindProduct, ID: "prod_new", Name: "Product New", State: statusStateAdded})
	require.Contains(t, status.Pending, ConfigStatusEntry{Kind: statusKindPrice, ID: "price_new", State: statusStateAdded})
	require.Contains(t, status.Pending, ConfigStatusEntry{Kind: statusKindProduct, ID: "prod_old", Name: "Product Old", State: statusStateRemoved})
	require.Contains(t, status.Pending, ConfigStatusEntry{Kind: statusKindPrice, ID: "price_old", State: statusStateRemoved})

	require.Contains(t, status.Drift, ConfigStatusEntry{Kind: statusKindProduct, ID: "prod_b", Name: "Product B", State: statusStateModified, Reason: statusReasonExternalEdit, StripeID: "prod_b_stripe"})
	require.Contains(t, status.Drift, ConfigStatusEntry{Kind: statusKindPrice, ID: "price_a", State: statusStateMissing})
	require.Contains(t, status.Drift, ConfigStatusEntry{Kind: statusKindWebhook, ID: "https://example.com/hook", Name: "https://example.com/hook", State: statusStateModified, Reason: statusReasonExternalEdit, StripeID: "we_a"})

	require.Contains(t, status.Untracked, ConfigStatusEntry{Kind: statusKindProduct, ID: "prod_extra", Name: "Product Extra", State: statusStateUntracked, StripeID: "prod_extra_stripe"})
	require.NotContains(t, status.Drift, ConfigStatusEntry{Kind: statusKindProduct, ID: "prod_a", Name: "Product A", State: statusStateModified})
}

func TestStatusReportsMeterFieldDrift(t *testing.T) {
	appliedConfig := &StripeConfiguration{
		Version: "1.0.0",
		Meters: []Meter{{
			ID:          "meter_a",
			DisplayName: "Meter A",
			EventName:   "events_a",
			DefaultAggregation: MeterDefaultAggregation{
				Formula: "sum",
			},
		}},
		Products: []Product{{ID: "prod_a", Name: "Product A", Prices: []Price{{ID: "price_a", Amount: 100, Currency: "usd"}}}},
	}
	raw, err := json.Marshal(appliedConfig)
	require.NoError(t, err)

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case "/v1/billing/meters":
			writeJSON(t, w, map[string]any{"object": "list", "data": []any{
				map[string]any{
					"id": "mtr_a", "object": "billing.meter", "status": "active",
					"display_name": "Meter A Tampered", "event_name": "events_a",
					"default_aggregation": map[string]any{"formula": "sum"},
					"customer_mapping":    map[string]any{"event_payload_key": "stripe_customer_id", "type": "by_id"},
					"value_settings":      map[string]any{"event_payload_key": "value"},
				},
			}, "has_more": false})
		case "/v1/products":
			writeJSON(t, w, map[string]any{"object": "list", "data": []any{
				map[string]any{
					"id": "prod_a_stripe", "object": "product", "active": true,
					"name": "Product A", "type": "service",
					"metadata": map[string]string{
						MetadataKeyConfigID: "prod_a",
						MetadataKeyManaged:  MetadataManagedValue,
						MetadataKeyHash:     productConfigHash(appliedConfig.Products[0]),
					},
				},
			}, "has_more": false})
		case "/v1/prices":
			writeJSON(t, w, map[string]any{"object": "list", "data": []any{
				map[string]any{
					"id": "price_a_stripe", "object": "price", "active": true,
					"currency": "usd", "unit_amount": 100, "billing_scheme": "per_unit",
					"lookup_key": "price_a", "product": "prod_a_stripe",
					"metadata": map[string]string{
						MetadataKeyConfigID: "price_a",
						MetadataKeyManaged:  MetadataManagedValue,
						MetadataKeyHash:     priceConfigHash(appliedConfig.Products[0].Prices[0]),
					},
				},
			}, "has_more": false})
		case "/v1/coupons", "/v1/promotion_codes", "/v1/webhook_endpoints":
			writeJSON(t, w, map[string]any{"object": "list", "data": []any{}, "has_more": false})
		default:
			t.Errorf("unexpected request: %s %s", r.Method, r.URL.Path)
			writeJSON(t, w, map[string]any{"error": map[string]string{"message": "unexpected"}})
		}
	}))
	t.Cleanup(server.Close)

	repo := repomock.NewMockQuerier(t)
	repo.EXPECT().GetLatestStripeConfig(mock.Anything).Return(repository.StripeStripeConfig{Config: raw}, nil).Once()

	service := &Service{
		repo:      repo,
		stripe:    stripe_client.New(config.StripeConfig{SecretKey: "sk_test", APIBaseURL: server.URL}),
		validator: NewValidator(),
	}

	status, err := service.Status(context.Background(), appliedConfig)
	require.NoError(t, err)
	require.Equal(t, 0, status.Summary.Pending)
	require.Equal(t, 1, status.Summary.Drift)
	require.Contains(t, status.Drift, ConfigStatusEntry{Kind: statusKindMeter, ID: "meter_a", Name: "Meter A", State: statusStateModified, Reason: statusReasonExternalEdit, StripeID: "mtr_a"})
}
