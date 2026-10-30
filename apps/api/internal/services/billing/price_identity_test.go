package billing

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/stretchr/testify/require"

	"api/internal/config"
	"api/internal/services/stripe_client"
)

func TestGetStripePriceIDResolvesByLookupKey(t *testing.T) {
	var rawQuery string
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		rawQuery = r.URL.RawQuery
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]any{
			"object":   "list",
			"has_more": false,
			"data": []any{map[string]any{
				"id":         "price_123",
				"object":     "price",
				"active":     true,
				"lookup_key": "price_a",
			}},
		})
	}))
	t.Cleanup(server.Close)

	service := New(Deps{Stripe: stripe_client.New(config.StripeConfig{SecretKey: "sk_test", APIBaseURL: server.URL})})

	stripeID, err := service.GetStripePriceID(context.Background(), "price_a")
	require.NoError(t, err)
	require.Equal(t, "price_123", stripeID)
	require.True(t, strings.Contains(rawQuery, "price_a"))
}

func TestGetStripePriceIDReturnsNotFound(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]any{"object": "list", "has_more": false, "data": []any{}})
	}))
	t.Cleanup(server.Close)

	service := New(Deps{Stripe: stripe_client.New(config.StripeConfig{SecretKey: "sk_test", APIBaseURL: server.URL})})

	_, err := service.GetStripePriceID(context.Background(), "missing")
	require.ErrorIs(t, err, StripePriceNotFoundError)
}
