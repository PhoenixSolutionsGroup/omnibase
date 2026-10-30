package stripe_config

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

func TestReconcileCreatesMissingResources(t *testing.T) {
	cfg := &StripeConfiguration{
		Version: "1.0.0",
		Products: []Product{{
			ID:          "prod_a",
			Name:        "Product A",
			Description: "description",
			Type:        "good",
			Prices: []Price{{
				ID:       "price_a",
				Amount:   1000,
				Currency: "usd",
				Interval: "month",
			}},
		}},
		Coupons: []Coupon{{
			ID:         "coupon_a",
			PercentOff: float64Pointer(10),
			Duration:   "once",
			AppliesTo:  []string{"prod_a"},
		}},
		PromotionCodes: []PromotionCode{{
			ID:     "promo_a",
			Code:   "SAVE10",
			Coupon: "coupon_a",
		}},
	}

	productHash := productConfigHash(cfg.Products[0])
	priceHash := priceConfigHash(cfg.Products[0].Prices[0])
	couponHash := couponConfigHash(cfg.Coupons[0])
	promoHash := promoConfigHash(cfg.PromotionCodes[0])

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.Method == http.MethodGet && isListPath(r.URL.Path):
			writeJSON(t, w, map[string]any{"object": "list", "data": []any{}, "has_more": false})
		case r.Method == http.MethodPost && r.URL.Path == "/v1/products":
			if err := r.ParseForm(); err != nil {
				t.Errorf("failed to parse product form: %v", err)
			}
			if got := r.Form.Get("type"); got != "good" {
				t.Errorf("expected product type good, got %q", got)
			}
			writeJSON(t, w, map[string]any{
				"id":       "prod_123",
				"object":   "product",
				"active":   true,
				"name":     "Product A",
				"type":     "good",
				"metadata": map[string]string{MetadataKeyConfigID: "prod_a", MetadataKeyManaged: MetadataManagedValue, MetadataKeyHash: productHash},
			})
		case r.Method == http.MethodPost && r.URL.Path == "/v1/coupons":
			if err := r.ParseForm(); err != nil {
				t.Errorf("failed to parse coupon form: %v", err)
			}
			appliesToProduct := false
			for key, values := range r.Form {
				if !strings.Contains(key, "applies_to") {
					continue
				}
				for _, value := range values {
					if value == "prod_123" {
						appliesToProduct = true
					}
				}
			}
			if !appliesToProduct {
				t.Errorf("expected coupon applies_to to reference prod_123")
			}
			writeJSON(t, w, map[string]any{
				"id":          "coupon_123",
				"object":      "coupon",
				"valid":       true,
				"duration":    "once",
				"percent_off": 10,
				"applies_to":  map[string]any{"products": []string{"prod_123"}},
				"metadata":    map[string]string{MetadataKeyConfigID: "coupon_a", MetadataKeyManaged: MetadataManagedValue, MetadataKeyHash: couponHash},
			})
		case r.Method == http.MethodPost && r.URL.Path == "/v1/promotion_codes":
			if err := r.ParseForm(); err != nil {
				t.Errorf("failed to parse promotion code form: %v", err)
			}
			if got := r.Form.Get("coupon"); got != "coupon_123" {
				t.Errorf("expected promotion code coupon coupon_123, got %q", got)
			}
			writeJSON(t, w, map[string]any{
				"id":       "promo_123",
				"object":   "promotion_code",
				"active":   true,
				"code":     "SAVE10",
				"coupon":   map[string]any{"id": "coupon_123", "object": "coupon", "duration": "once"},
				"metadata": map[string]string{MetadataKeyConfigID: "promo_a", MetadataKeyManaged: MetadataManagedValue, MetadataKeyHash: promoHash},
			})
		case r.Method == http.MethodPost && r.URL.Path == "/v1/prices":
			writeJSON(t, w, map[string]any{
				"id":             "price_123",
				"object":         "price",
				"active":         true,
				"currency":       "usd",
				"unit_amount":    1000,
				"billing_scheme": "per_unit",
				"type":           "recurring",
				"recurring":      map[string]any{"interval": "month", "interval_count": 1},
				"product":        "prod_123",
				"lookup_key":     "price_a",
				"metadata":       map[string]string{MetadataKeyConfigID: "price_a", MetadataKeyManaged: MetadataManagedValue, MetadataKeyHash: priceHash},
			})
		default:
			t.Errorf("unexpected request: %s %s", r.Method, r.URL.Path)
			writeJSON(t, w, map[string]any{"error": map[string]string{"message": "unexpected"}})
		}
	}))
	t.Cleanup(server.Close)

	service := &Service{
		stripe:    stripe_client.New(config.StripeConfig{SecretKey: "sk_test", APIBaseURL: server.URL}),
		validator: NewValidator(),
	}
	state := newReconcileState()

	changes, err := service.reconcile(context.Background(), cfg, state)
	require.NoError(t, err)
	require.Len(t, changes.Products.Created, 1)
	require.Len(t, changes.Prices.Created, 1)
	require.Len(t, changes.Coupons.Created, 1)
	require.Len(t, changes.PromotionCodes.Created, 1)
	require.Equal(t, "prod_123", state.productStripeIDs["prod_a"])
	require.Equal(t, "price_123", state.priceStripeIDs["price_a"])
}

func TestReconcileLeavesMatchingResourcesUntouched(t *testing.T) {
	cfg := &StripeConfiguration{
		Version: "1.0.0",
		Products: []Product{{
			ID:          "prod_a",
			Name:        "Product A",
			Description: "description",
			Type:        "service",
			Prices: []Price{{
				ID:       "price_a",
				Amount:   1000,
				Currency: "usd",
				Interval: "month",
			}},
		}},
	}

	productHash := productConfigHash(cfg.Products[0])
	priceHash := priceConfigHash(cfg.Products[0].Prices[0])

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			t.Errorf("unexpected write: %s %s", r.Method, r.URL.Path)
		}
		switch r.URL.Path {
		case "/v1/products":
			writeJSON(t, w, map[string]any{
				"object":   "list",
				"has_more": false,
				"data": []any{map[string]any{
					"id":       "prod_123",
					"object":   "product",
					"active":   true,
					"name":     "Product A",
					"type":     "service",
					"metadata": map[string]string{MetadataKeyConfigID: "prod_a", MetadataKeyManaged: MetadataManagedValue, MetadataKeyHash: productHash},
				}},
			})
		case "/v1/prices":
			writeJSON(t, w, map[string]any{
				"object":   "list",
				"has_more": false,
				"data": []any{map[string]any{
					"id":             "price_123",
					"object":         "price",
					"active":         true,
					"currency":       "usd",
					"unit_amount":    1000,
					"billing_scheme": "per_unit",
					"type":           "recurring",
					"recurring":      map[string]any{"interval": "month", "interval_count": 1},
					"product":        "prod_123",
					"lookup_key":     "price_a",
					"metadata":       map[string]string{MetadataKeyConfigID: "price_a", MetadataKeyManaged: MetadataManagedValue, MetadataKeyHash: priceHash},
				}},
			})
		default:
			writeJSON(t, w, map[string]any{"object": "list", "data": []any{}, "has_more": false})
		}
	}))
	t.Cleanup(server.Close)

	service := &Service{
		stripe:    stripe_client.New(config.StripeConfig{SecretKey: "sk_test", APIBaseURL: server.URL}),
		validator: NewValidator(),
	}
	state := newReconcileState()

	changes, err := service.reconcile(context.Background(), cfg, state)
	require.NoError(t, err)
	require.Empty(t, changes.Products.Created)
	require.Empty(t, changes.Products.Updated)
	require.Empty(t, changes.Products.Archived)
	require.Empty(t, changes.Prices.Created)
	require.Empty(t, changes.Prices.Updated)
	require.Empty(t, changes.Prices.Archived)
	require.Equal(t, "prod_123", state.productStripeIDs["prod_a"])
	require.Equal(t, "price_123", state.priceStripeIDs["price_a"])
}

func isListPath(path string) bool {
	return strings.HasSuffix(path, "/products") ||
		strings.HasSuffix(path, "/prices") ||
		strings.HasSuffix(path, "/coupons") ||
		strings.HasSuffix(path, "/promotion_codes") ||
		strings.HasSuffix(path, "/billing/meters") ||
		strings.HasSuffix(path, "/webhook_endpoints")
}

func writeJSON(t *testing.T, w http.ResponseWriter, payload any) {
	t.Helper()
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(payload); err != nil {
		t.Errorf("failed to write JSON response: %v", err)
	}
}
