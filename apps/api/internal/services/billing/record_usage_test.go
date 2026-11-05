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

func TestRecordUsageSendsIdempotencyKeyAndConnectAccount(t *testing.T) {
	var form url.Values
	var accountHeader string

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		require.Equal(t, http.MethodPost, r.Method)
		require.Equal(t, "/v1/billing/meter_events", r.URL.Path)
		require.NoError(t, r.ParseForm())
		form = r.PostForm
		accountHeader = r.Header.Get("Stripe-Account")
		writeJSON(t, w, map[string]any{
			"id":     "bme_123",
			"object": "billing.meter_event",
		})
	}))
	t.Cleanup(server.Close)

	service := New(Deps{Stripe: stripe_client.New(config.StripeConfig{
		SecretKey:       "sk_test",
		StripeAccountID: "acct_test",
		APIBaseURL:      server.URL,
	})})

	err := service.RecordUsage(context.Background(), RecordUsageArgs{
		MeterEventName:   "test_meter",
		StripeCustomerID: "cus_123",
		Value:            "5",
		IdempotencyKey:   "usage-key-123",
	})

	require.NoError(t, err)
	require.Equal(t, "acct_test", accountHeader)
	require.Equal(t, "usage-key-123", form.Get("identifier"))
	require.Equal(t, "test_meter", form.Get("event_name"))
	require.Equal(t, "cus_123", form.Get("payload[stripe_customer_id]"))
	require.Equal(t, "5", form.Get("payload[value]"))
	require.NotEmpty(t, form.Get("timestamp"))
}

func TestRecordUsageOmitsIdentifierWithoutIdempotencyKey(t *testing.T) {
	var form url.Values

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		require.NoError(t, r.ParseForm())
		form = r.PostForm
		writeJSON(t, w, map[string]any{
			"id":     "bme_123",
			"object": "billing.meter_event",
		})
	}))
	t.Cleanup(server.Close)

	service := New(Deps{Stripe: stripe_client.New(config.StripeConfig{
		SecretKey:  "sk_test",
		APIBaseURL: server.URL,
	})})

	err := service.RecordUsage(context.Background(), RecordUsageArgs{
		MeterEventName:   "test_meter",
		StripeCustomerID: "cus_123",
		Value:            "5",
	})

	require.NoError(t, err)
	require.Empty(t, form.Get("identifier"))
}
