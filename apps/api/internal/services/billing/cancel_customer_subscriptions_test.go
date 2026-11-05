package billing

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"

	"github.com/stretchr/testify/require"

	"api/internal/config"
	"api/internal/services/stripe_client"
)

func TestCancelCustomerSubscriptionsCancelsNonCanceledSubscriptions(t *testing.T) {
	var mu sync.Mutex
	var cancelledIDs []string
	var cancelForm map[string][]string

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		switch {
		case r.Method == http.MethodGet && r.URL.Path == "/v1/subscriptions":
			require.Equal(t, "cus_123", r.URL.Query().Get("customer"))
			writeJSON(t, w, map[string]any{
				"object":   "list",
				"has_more": false,
				"data": []any{
					subscriptionPayload("sub_active", "active"),
					subscriptionPayload("sub_trialing", "trialing"),
					subscriptionPayload("sub_canceled", "canceled"),
					subscriptionPayload("sub_expired", "incomplete_expired"),
				},
			})
		case r.Method == http.MethodDelete && strings.HasPrefix(r.URL.Path, "/v1/subscriptions/"):
			mu.Lock()
			cancelledIDs = append(cancelledIDs, strings.TrimPrefix(r.URL.Path, "/v1/subscriptions/"))
			cancelForm = r.URL.Query()
			mu.Unlock()
			writeJSON(t, w, subscriptionPayload(strings.TrimPrefix(r.URL.Path, "/v1/subscriptions/"), "canceled"))
		default:
			t.Errorf("unexpected request: %s %s", r.Method, r.URL.Path)
			w.WriteHeader(http.StatusNotFound)
		}
	}))
	t.Cleanup(server.Close)

	service := New(Deps{Stripe: stripe_client.New(config.StripeConfig{SecretKey: "sk_test", APIBaseURL: server.URL})})

	cancelled, err := service.CancelCustomerSubscriptions(context.Background(), "cus_123")

	require.NoError(t, err)
	require.Equal(t, 2, cancelled)
	require.ElementsMatch(t, []string{"sub_active", "sub_trialing"}, cancelledIDs)
	require.Equal(t, []string{"true"}, cancelForm["invoice_now"])
	require.Equal(t, []string{"false"}, cancelForm["prorate"])
}

func TestCancelCustomerSubscriptionsReturnsStripeError(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		if r.Method == http.MethodGet {
			writeJSON(t, w, map[string]any{
				"object":   "list",
				"has_more": false,
				"data":     []any{subscriptionPayload("sub_active", "active")},
			})
			return
		}
		w.WriteHeader(http.StatusInternalServerError)
		writeJSON(t, w, map[string]any{"error": map[string]string{"message": "cancel failed"}})
	}))
	t.Cleanup(server.Close)

	service := New(Deps{Stripe: stripe_client.New(config.StripeConfig{SecretKey: "sk_test", APIBaseURL: server.URL})})

	cancelled, err := service.CancelCustomerSubscriptions(context.Background(), "cus_123")

	require.ErrorIs(t, err, CancelCustomerSubscriptionsError)
	require.Equal(t, 0, cancelled)
}

func TestCancelCustomerSubscriptionsSkipsEmptyCustomer(t *testing.T) {
	service := New(Deps{})

	cancelled, err := service.CancelCustomerSubscriptions(context.Background(), "")

	require.NoError(t, err)
	require.Equal(t, 0, cancelled)
}

func subscriptionPayload(id, status string) map[string]any {
	return map[string]any{
		"id":     id,
		"object": "subscription",
		"status": status,
	}
}

func writeJSON(t *testing.T, w http.ResponseWriter, value any) {
	t.Helper()
	require.NoError(t, json.NewEncoder(w).Encode(value))
}
