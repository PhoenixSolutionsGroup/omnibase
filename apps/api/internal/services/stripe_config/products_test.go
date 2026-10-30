package stripe_config

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/require"
	"github.com/stripe/stripe-go/v82"

	"api/internal/config"
	"api/internal/services/stripe_client"
)

func TestCreateProductRecreatesWhenArchivedTwinHasDifferentType(t *testing.T) {
	createAttempts := 0
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.Method == http.MethodPost && r.URL.Path == "/v1/products":
			if err := r.ParseForm(); err != nil {
				t.Errorf("failed to parse product form: %v", err)
			}
			createAttempts++
			if createAttempts == 1 {
				if r.Form.Get("id") != "prod_a" {
					t.Errorf("expected first create to use custom ID prod_a, got %q", r.Form.Get("id"))
				}
				w.WriteHeader(http.StatusBadRequest)
				writeJSON(t, w, map[string]any{"error": map[string]any{
					"type": "invalid_request_error", "code": "resource_already_exists",
					"message": "Product already exists.",
				}})
				return
			}
			if r.Form.Get("id") != "" {
				t.Errorf("expected recreate without custom ID, got %q", r.Form.Get("id"))
			}
			if r.Form.Get("type") != "good" {
				t.Errorf("expected recreate type good, got %q", r.Form.Get("type"))
			}
			writeJSON(t, w, map[string]any{"id": "prod_new", "object": "product", "active": true, "type": "good", "name": "A"})
		case r.Method == http.MethodGet && r.URL.Path == "/v1/products/prod_a":
			writeJSON(t, w, map[string]any{"id": "prod_a", "object": "product", "active": false, "type": "service", "name": "A"})
		case r.Method == http.MethodPost && r.URL.Path == "/v1/products/prod_a":
			writeJSON(t, w, map[string]any{"id": "prod_a", "object": "product", "active": false, "type": "service", "name": "A"})
		default:
			t.Errorf("unexpected request: %s %s", r.Method, r.URL.Path)
			writeJSON(t, w, map[string]any{"error": map[string]string{"message": "unexpected"}})
		}
	}))
	t.Cleanup(server.Close)

	service := &Service{
		stripe: stripe_client.New(config.StripeConfig{SecretKey: "sk_test", APIBaseURL: server.URL}),
	}

	change, err := service.createProduct(context.Background(), Product{ID: "prod_a", Name: "A", Type: "good"})
	require.NoError(t, err)
	require.Equal(t, 2, createAttempts)
	require.Equal(t, "prod_new", change.StripeID)
	require.Equal(t, "recreated", change.Action)
	require.Equal(t, "good", productType(Product{Type: "good"}))
	require.Equal(t, "service", productTypeOf(&stripe.Product{Type: "service"}))
}
