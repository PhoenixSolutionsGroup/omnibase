package billing

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/require"

	"api/internal/config"
	"api/internal/services/stripe_client"
)

func TestAddTenantSubscriptionSendsIdempotencyKey(t *testing.T) {
	var idempotencyKey string
	created := false

	server := addSubscriptionServer(t, nil, func(r *http.Request) {
		created = true
		idempotencyKey = r.Header.Get("Idempotency-Key")
	})
	service := addSubscriptionService(server)

	result, err := service.AddTenantSubscription(context.Background(), AddTenantSubscriptionArgs{
		StripeCustomerID: "cus_123",
		ConfigPriceID:    "price_a",
		IdempotencyKey:   "request-123",
	})

	require.NoError(t, err)
	require.True(t, created)
	require.Equal(t, "request-123", idempotencyKey)
	require.Equal(t, "sub_new", result.SubscriptionID)
	require.Equal(t, "active", result.Status)
}

func TestAddTenantSubscriptionTreatsOpenStatusesAsDuplicates(t *testing.T) {
	for _, status := range []string{"active", "trialing", "past_due", "incomplete", "unpaid"} {
		t.Run(status, func(t *testing.T) {
			created := false
			server := addSubscriptionServer(t, []map[string]any{
				tenantSubscriptionPayload("sub_existing", status, "price_a"),
			}, func(r *http.Request) {
				created = true
			})
			service := addSubscriptionService(server)

			_, err := service.AddTenantSubscription(context.Background(), AddTenantSubscriptionArgs{
				StripeCustomerID: "cus_123",
				ConfigPriceID:    "price_a",
			})

			require.ErrorIs(t, err, AddTenantSubscriptionDuplicate)
			require.False(t, created)
		})
	}
}

func TestAddTenantSubscriptionAllowsCreateAfterTerminalStatus(t *testing.T) {
	for _, status := range []string{"canceled", "incomplete_expired"} {
		t.Run(status, func(t *testing.T) {
			created := false
			server := addSubscriptionServer(t, []map[string]any{
				tenantSubscriptionPayload("sub_old", status, "price_a"),
			}, func(r *http.Request) {
				created = true
			})
			service := addSubscriptionService(server)

			result, err := service.AddTenantSubscription(context.Background(), AddTenantSubscriptionArgs{
				StripeCustomerID: "cus_123",
				ConfigPriceID:    "price_a",
			})

			require.NoError(t, err)
			require.True(t, created)
			require.Equal(t, "sub_new", result.SubscriptionID)
		})
	}
}

func addSubscriptionServer(t *testing.T, subscriptions []map[string]any, onCreate func(*http.Request)) *httptest.Server {
	t.Helper()

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		require.Equal(t, "acct_test", r.Header.Get("Stripe-Account"))
		w.Header().Set("Content-Type", "application/json")
		switch {
		case r.Method == http.MethodGet && r.URL.Path == "/v1/prices":
			writeJSON(t, w, map[string]any{
				"object":   "list",
				"has_more": false,
				"data": []any{map[string]any{
					"id":         "price_123",
					"object":     "price",
					"active":     true,
					"lookup_key": "price_a",
				}},
			})
		case r.Method == http.MethodGet && r.URL.Path == "/v1/subscriptions":
			data := make([]any, 0, len(subscriptions))
			for _, subscription := range subscriptions {
				data = append(data, subscription)
			}
			writeJSON(t, w, map[string]any{
				"object":   "list",
				"has_more": false,
				"data":     data,
			})
		case r.Method == http.MethodPost && r.URL.Path == "/v1/subscriptions":
			onCreate(r)
			writeJSON(t, w, tenantSubscriptionPayload("sub_new", "active", "price_a"))
		default:
			t.Errorf("unexpected request: %s %s", r.Method, r.URL.Path)
			w.WriteHeader(http.StatusNotFound)
		}
	}))
	t.Cleanup(server.Close)
	return server
}

func tenantSubscriptionPayload(id, status, configPriceID string) map[string]any {
	return map[string]any{
		"id":     id,
		"object": "subscription",
		"status": status,
		"items": map[string]any{
			"object":   "list",
			"has_more": false,
			"data": []any{map[string]any{
				"id":     "si_1",
				"object": "subscription_item",
				"price": map[string]any{
					"id":         "price_123",
					"object":     "price",
					"lookup_key": configPriceID,
				},
			}},
		},
	}
}

func addSubscriptionService(server *httptest.Server) *Service {
	return New(Deps{Stripe: stripe_client.New(config.StripeConfig{
		SecretKey:       "sk_test",
		StripeAccountID: "acct_test",
		APIBaseURL:      server.URL,
	})})
}
