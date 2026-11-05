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

func TestCreateCheckoutSessionOmitsCustomerCreationInSubscriptionMode(t *testing.T) {
	form := checkoutSessionForm(t, true, "")

	require.Equal(t, "subscription", form.Get("mode"))
	require.Empty(t, form.Get("customer"))
	require.Empty(t, form.Get("customer_creation"))
}

func TestCreateCheckoutSessionSetsCustomerCreationInPaymentModeWithoutCustomer(t *testing.T) {
	form := checkoutSessionForm(t, false, "")

	require.Equal(t, "payment", form.Get("mode"))
	require.Empty(t, form.Get("customer"))
	require.Equal(t, "always", form.Get("customer_creation"))
}

func TestCreateCheckoutSessionOmitsCustomerCreationWhenCustomerIsProvided(t *testing.T) {
	form := checkoutSessionForm(t, false, "cus_123")

	require.Equal(t, "payment", form.Get("mode"))
	require.Equal(t, "cus_123", form.Get("customer"))
	require.Empty(t, form.Get("customer_creation"))
}

func checkoutSessionForm(t *testing.T, recurring bool, customerID string) url.Values {
	t.Helper()

	var form url.Values
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		require.Equal(t, "acct_test", r.Header.Get("Stripe-Account"))
		w.Header().Set("Content-Type", "application/json")
		switch {
		case r.Method == http.MethodGet && r.URL.Path == "/v1/prices/price_test":
			price := map[string]any{
				"id":     "price_test",
				"object": "price",
			}
			if recurring {
				price["recurring"] = map[string]any{"interval": "month"}
			} else {
				price["recurring"] = nil
			}
			writeJSON(t, w, price)
		case r.Method == http.MethodPost && r.URL.Path == "/v1/checkout/sessions":
			require.NoError(t, r.ParseForm())
			form = r.PostForm
			writeJSON(t, w, map[string]any{
				"id":     "cs_test",
				"object": "checkout.session",
				"url":    "https://checkout.stripe.test/cs_test",
			})
		default:
			t.Errorf("unexpected request: %s %s", r.Method, r.URL.Path)
			w.WriteHeader(http.StatusNotFound)
		}
	}))
	t.Cleanup(server.Close)

	service := New(Deps{Stripe: stripe_client.New(config.StripeConfig{
		SecretKey:       "sk_test",
		StripeAccountID: "acct_test",
		APIBaseURL:      server.URL,
	})})

	_, err := service.CreateCheckoutSession(context.Background(), CreateCheckoutSessionArgs{
		StripePriceID:    "price_test",
		SuccessURL:       "https://example.com/success",
		CancelURL:        "https://example.com/cancel",
		StripeCustomerID: customerID,
	})
	require.NoError(t, err)
	require.NotNil(t, form)
	return form
}
