package stripe_config

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/stretchr/testify/require"

	"api/internal/config"
	"api/internal/services/stripe_client"
)

func TestCreatePriceReactivatesArchivedPriceOnConflict(t *testing.T) {
	createAttempted := false
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.Method == http.MethodPost && r.URL.Path == "/v1/prices":
			createAttempted = true
			w.WriteHeader(http.StatusBadRequest)
			writeJSON(t, w, map[string]any{
				"error": map[string]any{
					"type":    "invalid_request_error",
					"code":    "resource_missing",
					"message": "lookup key conflict",
				},
			})
		case r.Method == http.MethodGet && r.URL.Path == "/v1/prices":
			require.True(t, strings.Contains(r.URL.RawQuery, "price_a"))
			writeJSON(t, w, map[string]any{
				"object":   "list",
				"has_more": false,
				"data": []any{map[string]any{
					"id":         "price_archived",
					"object":     "price",
					"active":     false,
					"currency":   "usd",
					"lookup_key": "price_a",
					"product":    "prod_123",
					"metadata": map[string]string{
						MetadataKeyConfigID: "price_a",
						MetadataKeyManaged:  MetadataManagedValue,
					},
				}},
			})
		case r.Method == http.MethodPost && r.URL.Path == "/v1/prices/price_archived":
			writeJSON(t, w, map[string]any{
				"id":         "price_archived",
				"object":     "price",
				"active":     true,
				"currency":   "usd",
				"lookup_key": "price_a",
				"metadata": map[string]string{
					MetadataKeyConfigID: "price_a",
					MetadataKeyManaged:  MetadataManagedValue,
				},
			})
		default:
			t.Errorf("unexpected request: %s %s", r.Method, r.URL.Path)
			writeJSON(t, w, map[string]any{"error": map[string]string{"message": "unexpected"}})
		}
	}))
	t.Cleanup(server.Close)

	service := &Service{
		stripe: stripe_client.New(config.StripeConfig{SecretKey: "sk_test", APIBaseURL: server.URL}),
	}
	price := Price{ID: "price_a", Amount: 1000, Currency: "usd", Interval: "month"}

	stripeID, detail, err := service.createPrice(context.Background(), price, "prod_123", "", false)
	require.NoError(t, err)
	require.True(t, createAttempted)
	require.Equal(t, "price_archived", stripeID)
	require.Contains(t, detail, "Reactivated archived price")
}

func TestCreatePriceTransfersLookupKeyFromArchivedPriceOnAnotherProduct(t *testing.T) {
	createAttempts := 0
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.Method == http.MethodPost && r.URL.Path == "/v1/prices":
			createAttempts++
			if createAttempts == 1 {
				w.WriteHeader(http.StatusBadRequest)
				writeJSON(t, w, map[string]any{
					"error": map[string]any{
						"type":    "invalid_request_error",
						"code":    "resource_missing",
						"message": "lookup key conflict",
					},
				})
				return
			}
			if err := r.ParseForm(); err != nil {
				t.Errorf("failed to parse price form: %v", err)
			}
			if r.Form.Get("transfer_lookup_key") != "true" {
				t.Errorf("expected transfer_lookup_key=true, got %q", r.Form.Get("transfer_lookup_key"))
			}
			if r.Form.Get("product") != "prod_new" {
				t.Errorf("expected product=prod_new, got %q", r.Form.Get("product"))
			}
			writeJSON(t, w, map[string]any{
				"id":         "price_new",
				"object":     "price",
				"active":     true,
				"currency":   "usd",
				"lookup_key": "price_a",
				"product":    "prod_new",
			})
		case r.Method == http.MethodGet && r.URL.Path == "/v1/prices":
			writeJSON(t, w, map[string]any{
				"object":   "list",
				"has_more": false,
				"data": []any{map[string]any{
					"id":         "price_old",
					"object":     "price",
					"active":     false,
					"currency":   "usd",
					"lookup_key": "price_a",
					"product":    "prod_old",
					"metadata": map[string]string{
						MetadataKeyConfigID: "price_a",
						MetadataKeyManaged:  MetadataManagedValue,
					},
				}},
			})
		default:
			t.Errorf("unexpected request: %s %s", r.Method, r.URL.Path)
			writeJSON(t, w, map[string]any{"error": map[string]string{"message": "unexpected"}})
		}
	}))
	t.Cleanup(server.Close)

	service := &Service{
		stripe: stripe_client.New(config.StripeConfig{SecretKey: "sk_test", APIBaseURL: server.URL}),
	}
	price := Price{ID: "price_a", Amount: 1000, Currency: "usd", Interval: "month"}

	stripeID, detail, err := service.createPrice(context.Background(), price, "prod_new", "", false)
	require.NoError(t, err)
	require.Equal(t, 2, createAttempts)
	require.Equal(t, "price_new", stripeID)
	require.Contains(t, detail, "transferred lookup key")
}

func TestArchivePriceClearsProductDefaultAndRetries(t *testing.T) {
	archiveAttempts := 0
	clearedDefault := false
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.Method == http.MethodPost && r.URL.Path == "/v1/prices/price_default":
			archiveAttempts++
			if archiveAttempts == 1 {
				w.WriteHeader(http.StatusBadRequest)
				writeJSON(t, w, map[string]any{"error": map[string]any{
					"type": "invalid_request_error", "code": "invalid_request_error",
					"message": "This price cannot be archived because it is the default price of its product.",
				}})
				return
			}
			writeJSON(t, w, map[string]any{"id": "price_default", "object": "price", "active": false})
		case r.Method == http.MethodGet && r.URL.Path == "/v1/prices/price_default":
			writeJSON(t, w, map[string]any{"id": "price_default", "object": "price", "product": "prod_default"})
		case r.Method == http.MethodPost && r.URL.Path == "/v1/products/prod_default":
			clearedDefault = true
			writeJSON(t, w, map[string]any{"id": "prod_default", "object": "product"})
		default:
			t.Errorf("unexpected request: %s %s", r.Method, r.URL.Path)
			writeJSON(t, w, map[string]any{"error": map[string]string{"message": "unexpected"}})
		}
	}))
	t.Cleanup(server.Close)

	service := &Service{
		stripe: stripe_client.New(config.StripeConfig{SecretKey: "sk_test", APIBaseURL: server.URL}),
	}
	err := service.archivePriceByStripeID(context.Background(), "price_default")
	require.NoError(t, err)
	require.Equal(t, 2, archiveAttempts)
	require.True(t, clearedDefault)
}
