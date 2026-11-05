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

func TestFinalizeInvoiceReturnsDraftFetchError(t *testing.T) {
	finalized := false
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.Method == http.MethodGet && r.URL.Path == "/v1/invoices/in_123":
			w.WriteHeader(http.StatusInternalServerError)
		case r.Method == http.MethodPost && r.URL.Path == "/v1/invoices/in_123/finalize":
			finalized = true
			writeJSON(t, w, map[string]any{"id": "in_123", "object": "invoice", "status": "open"})
		default:
			t.Errorf("unexpected request: %s %s", r.Method, r.URL.Path)
			w.WriteHeader(http.StatusNotFound)
		}
	}))
	t.Cleanup(server.Close)

	service := invoiceFeeService(server, 5)

	_, err := service.FinalizeInvoice(context.Background(), "in_123", false)

	require.ErrorIs(t, err, FinalizeInvoiceError)
	require.False(t, finalized)
}

func TestFinalizeInvoiceSetsFeeFromSubtotal(t *testing.T) {
	var updateForm url.Values
	finalized := false

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		require.Equal(t, "acct_test", r.Header.Get("Stripe-Account"))
		w.Header().Set("Content-Type", "application/json")
		switch {
		case r.Method == http.MethodGet && r.URL.Path == "/v1/invoices/in_123":
			writeJSON(t, w, map[string]any{"id": "in_123", "object": "invoice", "subtotal": 2000})
		case r.Method == http.MethodPost && r.URL.Path == "/v1/invoices/in_123":
			require.NoError(t, r.ParseForm())
			updateForm = r.PostForm
			writeJSON(t, w, map[string]any{"id": "in_123", "object": "invoice", "subtotal": 2000})
		case r.Method == http.MethodPost && r.URL.Path == "/v1/invoices/in_123/finalize":
			finalized = true
			writeJSON(t, w, map[string]any{"id": "in_123", "object": "invoice", "status": "open"})
		default:
			t.Errorf("unexpected request: %s %s", r.Method, r.URL.Path)
			w.WriteHeader(http.StatusNotFound)
		}
	}))
	t.Cleanup(server.Close)

	service := invoiceFeeService(server, 5)

	invoice, err := service.FinalizeInvoice(context.Background(), "in_123", false)

	require.NoError(t, err)
	require.Equal(t, "in_123", invoice.ID)
	require.True(t, finalized)
	require.Equal(t, "100", updateForm.Get("application_fee_amount"))
}

func invoiceFeeService(server *httptest.Server, feePct float64) *Service {
	return New(Deps{
		Stripe: stripe_client.New(config.StripeConfig{
			SecretKey:       "sk_test",
			StripeAccountID: "acct_test",
			APIBaseURL:      server.URL,
		}),
		FeePct: feePct,
	})
}
