package billing

import (
	"context"
	"net/http"
	"net/http/httptest"
	"net/url"
	"testing"

	"github.com/stretchr/testify/require"

	"api/internal/config"
	"api/internal/services/stripe_client"
)

func TestCheckBillingStatusIncludesNonCardPaymentMethods(t *testing.T) {
	var query url.Values

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		require.Equal(t, http.MethodGet, r.Method)
		require.Equal(t, "/v1/payment_methods", r.URL.Path)
		query = r.URL.Query()
		writeJSON(t, w, map[string]any{
			"object":   "list",
			"has_more": false,
			"data": []any{map[string]any{
				"id":     "pm_bank",
				"object": "payment_method",
				"type":   "us_bank_account",
			}},
		})
	}))
	t.Cleanup(server.Close)

	service := billingStatusService(server)

	active, err := service.CheckBillingStatus(context.Background(), "cus_123")

	require.NoError(t, err)
	require.True(t, active)
	require.Equal(t, "cus_123", query.Get("customer"))
	require.Empty(t, query.Get("type"))
}

func TestCheckBillingStatusReturnsFalseWithoutPaymentMethods(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		writeJSON(t, w, map[string]any{
			"object":   "list",
			"has_more": false,
			"data":     []any{},
		})
	}))
	t.Cleanup(server.Close)

	active, err := billingStatusService(server).CheckBillingStatus(context.Background(), "cus_123")

	require.NoError(t, err)
	require.False(t, active)
}

func TestCheckBillingStatusReturnsListError(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
	}))
	t.Cleanup(server.Close)

	_, err := billingStatusService(server).CheckBillingStatus(context.Background(), "cus_123")

	require.ErrorIs(t, err, CheckBillingStatusError)
}

func billingStatusService(server *httptest.Server) *Service {
	return New(Deps{Stripe: stripe_client.New(config.StripeConfig{
		SecretKey:  "sk_test",
		APIBaseURL: server.URL,
	})})
}
