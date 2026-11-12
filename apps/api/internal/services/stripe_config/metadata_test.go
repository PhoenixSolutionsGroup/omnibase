package stripe_config

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/stretchr/testify/require"
	"github.com/stripe/stripe-go/v82"

	"api/internal/config"
	"api/internal/services/stripe_client"
)

func TestValidatorAcceptsProductAndPriceMetadata(t *testing.T) {
	tests := []struct {
		name            string
		productMetadata map[string]any
		priceMetadata   map[string]any
	}{
		{name: "neither"},
		{name: "product only", productMetadata: map[string]any{"tier": "scale"}},
		{name: "price only", priceMetadata: map[string]any{"billing": "monthly"}},
		{name: "both", productMetadata: map[string]any{"tier": "scale", "branches": "3"}, priceMetadata: map[string]any{"billing": "monthly"}},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			product := map[string]any{
				"id":   "tier_scale",
				"name": "Scale",
				"prices": []any{
					map[string]any{"id": "scale_monthly", "currency": "usd", "amount": 2900.0},
				},
			}
			price := product["prices"].([]any)[0].(map[string]any)
			if tc.productMetadata != nil {
				product["metadata"] = tc.productMetadata
			}
			if tc.priceMetadata != nil {
				price["metadata"] = tc.priceMetadata
			}

			_, err := NewValidator().ParseAndValidateConfig(ConfigData{
				"version":  "1.0.0",
				"products": []any{product},
			})
			require.NoError(t, err)
		})
	}
}

func TestValidatorRejectsInvalidProductAndPriceMetadata(t *testing.T) {
	baseProduct := func(productMetadata map[string]any, priceMetadata map[string]any) ConfigData {
		return ConfigData{
			"version": "1.0.0",
			"products": []any{
				map[string]any{
					"id":       "tier_scale",
					"name":     "Scale",
					"metadata": productMetadata,
					"prices": []any{
						map[string]any{
							"id":       "scale_monthly",
							"currency": "usd",
							"amount":   2900.0,
							"metadata": priceMetadata,
						},
					},
				},
			},
		}
	}

	manyKeys := make(map[string]any, 48)
	for i := 0; i < 48; i++ {
		manyKeys[fmt.Sprintf("key_%d", i)] = "value"
	}

	tests := []struct {
		name    string
		cfg     ConfigData
		wantErr string
	}{
		{
			name:    "product reserved key",
			cfg:     baseProduct(map[string]any{MetadataKeyConfigID: "spoofed"}, nil),
			wantErr: "metadata uses reserved key",
		},
		{
			name:    "price reserved key",
			cfg:     baseProduct(nil, map[string]any{MetadataKeyManaged: "false"}),
			wantErr: "metadata uses reserved key",
		},
		{
			name:    "product too many keys",
			cfg:     baseProduct(manyKeys, nil),
			wantErr: "at most 50 including 3 managed keys",
		},
		{
			name:    "product key too long",
			cfg:     baseProduct(map[string]any{strings.Repeat("k", MaxMetadataKeyLength+1): "value"}, nil),
			wantErr: "exceeds the Stripe metadata key limit",
		},
		{
			name:    "price value too long",
			cfg:     baseProduct(nil, map[string]any{"size": strings.Repeat("v", MaxMetadataValueLength+1)}),
			wantErr: "exceeds the Stripe metadata value limit",
		},
		{
			name:    "non-string product metadata value",
			cfg:     baseProduct(map[string]any{"branches": 3}, nil),
			wantErr: "invalid JSON structure",
		},
		{
			name:    "non-string price metadata value",
			cfg:     baseProduct(nil, map[string]any{"always_on": true}),
			wantErr: "invalid JSON structure",
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			_, err := NewValidator().ParseAndValidateConfig(tc.cfg)
			require.Error(t, err)
			require.Contains(t, err.Error(), tc.wantErr)
		})
	}
}

func TestProductHashTracksMetadata(t *testing.T) {
	product := Product{ID: "tier_scale", Name: "Scale", Metadata: map[string]string{"branches": "3"}}
	changed := product
	changed.Metadata = map[string]string{"branches": "5"}

	require.NotEqual(t, productConfigHash(product), productConfigHash(changed))

	probe := changed
	probe.Metadata = product.Metadata
	require.Equal(t, productConfigHash(product), productConfigHash(probe))

	managed := product
	managed.Metadata = map[string]string{"branches": "3", MetadataKeyManaged: "true"}
	require.Equal(t, productConfigHash(product), productConfigHash(managed))
}

func TestPriceHashTracksMetadata(t *testing.T) {
	price := Price{ID: "scale_monthly", Amount: 2900, Currency: "usd", Interval: "month", Metadata: map[string]string{"billing": "monthly"}}
	changed := price
	changed.Metadata = map[string]string{"billing": "yearly"}

	require.NotEqual(t, priceConfigHash(price), priceConfigHash(changed))

	probe := changed
	probe.Metadata = price.Metadata
	require.Equal(t, priceConfigHash(price), priceConfigHash(probe))
}

func TestCreatePriceSendsUserMetadata(t *testing.T) {
	var metadata map[string]string
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		require.Equal(t, http.MethodPost, r.Method)
		require.Equal(t, "/v1/prices", r.URL.Path)
		require.NoError(t, r.ParseForm())
		metadata = formMetadata(r.Form)
		writeJSON(t, w, map[string]any{
			"id": "price_a", "object": "price", "active": true,
			"currency": "usd", "lookup_key": "price_a", "product": "prod_1",
		})
	}))
	t.Cleanup(server.Close)

	service := &Service{stripe: stripe_client.New(config.StripeConfig{SecretKey: "sk_test", APIBaseURL: server.URL})}
	price := Price{ID: "price_a", Amount: 1000, Currency: "usd", Interval: "month", Metadata: map[string]string{"billing": "monthly"}}

	_, _, err := service.createPrice(context.Background(), price, "prod_1", "", false)
	require.NoError(t, err)
	require.Equal(t, "monthly", metadata["billing"])
	require.Equal(t, "price_a", metadata[MetadataKeyConfigID])
	require.Equal(t, MetadataManagedValue, metadata[MetadataKeyManaged])
	require.NotEmpty(t, metadata[MetadataKeyHash])
}

func TestUpdatePriceMetadataRemovesStaleUserKeys(t *testing.T) {
	var metadata map[string]string
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		require.Equal(t, http.MethodPost, r.Method)
		require.Equal(t, "/v1/prices/price_a", r.URL.Path)
		require.NoError(t, r.ParseForm())
		metadata = formMetadata(r.Form)
		writeJSON(t, w, map[string]any{"id": "price_a", "object": "price", "active": true, "currency": "usd"})
	}))
	t.Cleanup(server.Close)

	service := &Service{stripe: stripe_client.New(config.StripeConfig{SecretKey: "sk_test", APIBaseURL: server.URL})}
	live := &stripe.Price{ID: "price_a", Metadata: map[string]string{
		"old":               "value",
		MetadataKeyConfigID: "price_a",
		MetadataKeyManaged:  MetadataManagedValue,
	}}
	desired := Price{ID: "price_a", Amount: 1000, Currency: "usd", Interval: "month", Metadata: map[string]string{"billing": "monthly"}}

	require.NoError(t, service.updatePriceMetadata(context.Background(), live, desired))
	require.Equal(t, "monthly", metadata["billing"])
	require.Equal(t, "", metadata["old"])
	require.Equal(t, "price_a", metadata[MetadataKeyConfigID])
	require.Equal(t, MetadataManagedValue, metadata[MetadataKeyManaged])
}

func TestReconcilePricesUpdatesMetadataInPlace(t *testing.T) {
	archived := false
	updated := false
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		require.Equal(t, http.MethodPost, r.Method)
		require.Equal(t, "/v1/prices/price_a", r.URL.Path)
		require.NoError(t, r.ParseForm())
		if r.Form.Get("active") == "false" {
			archived = true
		} else {
			updated = true
		}
		writeJSON(t, w, map[string]any{"id": "price_a", "object": "price", "active": true, "currency": "usd"})
	}))
	t.Cleanup(server.Close)

	service := &Service{stripe: stripe_client.New(config.StripeConfig{SecretKey: "sk_test", APIBaseURL: server.URL})}
	oldPrice := Price{ID: "price_a", Amount: 1000, Currency: "usd", Interval: "month", Metadata: map[string]string{"billing": "old"}}
	live := &stripe.Price{
		ID:            "price_a",
		Currency:      "usd",
		UnitAmount:    1000,
		LookupKey:     "price_a",
		Product:       &stripe.Product{ID: "prod_1"},
		BillingScheme: "per_unit",
		Recurring:     &stripe.PriceRecurring{Interval: "month", IntervalCount: 1, UsageType: "licensed"},
		Metadata: map[string]string{
			"billing":           "old",
			MetadataKeyConfigID: "price_a",
			MetadataKeyManaged:  MetadataManagedValue,
			MetadataKeyHash:     priceConfigHash(oldPrice),
		},
	}
	desired := Price{ID: "price_a", Amount: 1000, Currency: "usd", Interval: "month", Metadata: map[string]string{"billing": "monthly"}}
	state := newReconcileState()
	state.productStripeIDs["tier_scale"] = "prod_1"
	changes := newConfigChanges()

	err := service.reconcilePrices(context.Background(), &StripeConfiguration{Products: []Product{{
		ID: "tier_scale", Name: "Scale", Prices: []Price{desired},
	}}}, map[string]*stripe.Price{"price_a": live}, state, changes)

	require.NoError(t, err)
	require.True(t, updated)
	require.False(t, archived)
	require.Len(t, changes.Prices.Updated, 1)
	require.Equal(t, "updated", changes.Prices.Updated[0].Action)
	require.Equal(t, "price_a", changes.Prices.Updated[0].StripeID)
}

func TestBuildProductCreateParamsIncludesUserMetadata(t *testing.T) {
	params := buildProductCreateParams(Product{ID: "tier_scale", Name: "Scale", Metadata: map[string]string{"tier": "scale"}}, true)

	require.Equal(t, "scale", params.Metadata["tier"])
	require.Equal(t, "tier_scale", params.Metadata[MetadataKeyConfigID])
	require.Equal(t, MetadataManagedValue, params.Metadata[MetadataKeyManaged])
	require.NotEmpty(t, params.Metadata[MetadataKeyHash])
}

func TestUpdateProductRemovesStaleUserMetadata(t *testing.T) {
	var metadata map[string]string
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		require.Equal(t, http.MethodPost, r.Method)
		require.Equal(t, "/v1/products/prod_a", r.URL.Path)
		require.NoError(t, r.ParseForm())
		metadata = formMetadata(r.Form)
		writeJSON(t, w, map[string]any{"id": "prod_a", "object": "product", "active": true, "name": "Scale", "type": "service"})
	}))
	t.Cleanup(server.Close)

	service := &Service{stripe: stripe_client.New(config.StripeConfig{SecretKey: "sk_test", APIBaseURL: server.URL})}
	live := &stripe.Product{ID: "prod_a", Name: "Scale", Description: "d", Type: "service", Metadata: map[string]string{
		"old":               "value",
		MetadataKeyConfigID: "tier_scale",
		MetadataKeyManaged:  MetadataManagedValue,
	}}
	desired := Product{ID: "tier_scale", Name: "Scale", Description: "d", Type: "service", Metadata: map[string]string{"tier": "scale"}}

	change, err := service.updateProductFromConfig(context.Background(), desired, live)
	require.NoError(t, err)
	require.Equal(t, "prod_a", change.StripeID)
	require.Equal(t, "scale", metadata["tier"])
	require.Equal(t, "", metadata["old"])
	require.Equal(t, "tier_scale", metadata[MetadataKeyConfigID])
	require.Equal(t, MetadataManagedValue, metadata[MetadataKeyManaged])
}

func TestPullConversionsStripManagedMetadata(t *testing.T) {
	product := convertStripeProductToConfig(&stripe.Product{
		ID:       "prod_a",
		Name:     "Scale",
		Metadata: map[string]string{"tier": "scale", MetadataKeyConfigID: "tier_scale", MetadataKeyManaged: MetadataManagedValue, MetadataKeyHash: "hash"},
	}, "tier_scale")
	require.Equal(t, map[string]string{"tier": "scale"}, product.Metadata)

	price := convertStripePriceToConfig(&stripe.Price{
		Currency:   "usd",
		UnitAmount: 2900,
		Metadata:   map[string]string{"billing": "monthly", MetadataKeyConfigID: "scale_monthly", MetadataKeyManaged: MetadataManagedValue, MetadataKeyHash: "hash"},
	}, nil)
	require.Equal(t, map[string]string{"billing": "monthly"}, price.Metadata)

	require.Nil(t, convertStripePriceToConfig(&stripe.Price{Currency: "usd"}, nil).Metadata)
}

func formMetadata(form map[string][]string) map[string]string {
	out := make(map[string]string, len(form))
	for key, values := range form {
		if !strings.HasPrefix(key, "metadata[") || len(values) == 0 {
			continue
		}
		out[strings.TrimSuffix(strings.TrimPrefix(key, "metadata["), "]")] = values[0]
	}
	return out
}
