package stripe_config

import (
	"encoding/json"
	"fmt"
	"strings"
	"testing"

	"github.com/stretchr/testify/require"
	"github.com/stripe/stripe-go/v82"
)

func TestManagedMetadata(t *testing.T) {
	t.Run("preserves user metadata", func(t *testing.T) {
		metadata := managedMetadata("coupon", "coupon_a", "abc", map[string]string{"campaign": "launch"})

		require.Equal(t, "launch", metadata["campaign"])
		require.Equal(t, "coupon_a", metadata[MetadataKeyConfigID])
		require.Equal(t, MetadataManagedValue, metadata[MetadataKeyManaged])
		require.Equal(t, "abc", metadata[MetadataKeyHash])
	})

	t.Run("reserved keys always carry managed values", func(t *testing.T) {
		metadata := managedMetadata("coupon", "coupon_a", "abc", map[string]string{
			MetadataKeyConfigID: "spoofed",
			MetadataKeyManaged:  "false",
			MetadataKeyHash:     "spoofed",
		})

		require.Equal(t, "coupon_a", metadata[MetadataKeyConfigID])
		require.Equal(t, MetadataManagedValue, metadata[MetadataKeyManaged])
		require.Equal(t, "abc", metadata[MetadataKeyHash])
	})

	t.Run("omits config id when the resource has none", func(t *testing.T) {
		metadata := managedMetadata("webhook_endpoint", "", "abc", nil)

		_, hasConfigID := metadata[MetadataKeyConfigID]
		require.False(t, hasConfigID)
		require.Equal(t, MetadataManagedValue, metadata[MetadataKeyManaged])
	})
}

func TestProductConfigHashIgnoresPresentationFields(t *testing.T) {
	original := Product{
		ID:          "prod_a",
		Name:        "Product A",
		Description: "original",
		Prices: []Price{
			{ID: "price_a1", Amount: 1000, Currency: "usd", Interval: "month"},
		},
		UI: &ProductUI{DisplayName: "A"},
	}
	changed := original
	changed.StripeID = "prod_linked"
	changed.UI = &ProductUI{DisplayName: "B", Tagline: "new", Highlighted: true}
	changed.Prices = append(changed.Prices, Price{ID: "price_a2", Amount: 2000, Currency: "usd"})

	require.Equal(t, productConfigHash(original), productConfigHash(changed))
}

func TestProductConfigHashTracksStripeFields(t *testing.T) {
	original := Product{ID: "prod_a", Name: "Product A", Description: "original"}

	nameChanged := original
	nameChanged.Name = "Product A renamed"
	require.NotEqual(t, productConfigHash(original), productConfigHash(nameChanged))

	descriptionChanged := original
	descriptionChanged.Description = "new"
	require.NotEqual(t, productConfigHash(original), productConfigHash(descriptionChanged))

	typeChanged := original
	typeChanged.Type = "good"
	require.NotEqual(t, productConfigHash(original), productConfigHash(typeChanged))
}

func TestPriceConfigHashIgnoresPresentationFields(t *testing.T) {
	public := true
	original := Price{
		ID:                 "price_a1",
		Amount:             1000,
		Currency:           "usd",
		Interval:           "month",
		TaxIncludedInPrice: boolPtr(false),
	}
	changed := original
	changed.StripeID = "price_linked"
	changed.Public = &public
	changed.Default = true
	changed.EnterpriseTemplate = "enterprise"
	changed.EnterpriseID = "ent_1"
	changed.UI = &PriceUI{DisplayName: "A"}

	require.Equal(t, priceConfigHash(original), priceConfigHash(changed))
}

func TestPriceConfigHashTracksStripeFields(t *testing.T) {
	original := Price{ID: "price_a1", Amount: 1000, Currency: "usd", Interval: "month"}

	amountChanged := original
	amountChanged.Amount = 2000
	require.NotEqual(t, priceConfigHash(original), priceConfigHash(amountChanged))

	currencyChanged := original
	currencyChanged.Currency = "eur"
	require.NotEqual(t, priceConfigHash(original), priceConfigHash(currencyChanged))

	intervalChanged := original
	intervalChanged.Interval = "year"
	require.NotEqual(t, priceConfigHash(original), priceConfigHash(intervalChanged))
}

func TestCouponConfigHashIgnoresManagedMetadata(t *testing.T) {
	original := Coupon{ID: "coupon_a", Duration: "once", Metadata: map[string]string{"campaign": "launch"}}
	tagged := original
	tagged.Metadata = map[string]string{
		"campaign":          "launch",
		MetadataKeyConfigID: "coupon_a",
		MetadataKeyManaged:  MetadataManagedValue,
		MetadataKeyHash:     "abc",
	}

	require.Equal(t, couponConfigHash(original), couponConfigHash(tagged))

	userMetadataChanged := original
	userMetadataChanged.Metadata = map[string]string{"campaign": "other"}
	require.NotEqual(t, couponConfigHash(original), couponConfigHash(userMetadataChanged))
}

func TestWebhookConfigHashTracksStripeFields(t *testing.T) {
	original := WebhookEndpointConfig{ID: "webhook_a", URL: "https://example.com/hook", Events: []string{"invoice.paid"}}

	eventsChanged := original
	eventsChanged.Events = []string{"invoice.paid", "customer.created"}
	require.NotEqual(t, webhookConfigHash(original), webhookConfigHash(eventsChanged))

	connectChanged := original
	connectChanged.Connect = true
	require.NotEqual(t, webhookConfigHash(original), webhookConfigHash(connectChanged))
}

func TestValidatorManagedTagging(t *testing.T) {
	tests := []struct {
		name        string
		mutate      func(*StripeConfiguration)
		errContains string
	}{
		{
			name:   "accepts config within limits",
			mutate: func(*StripeConfiguration) {},
		},
		{
			name: "rejects price ID over lookup_key limit",
			mutate: func(config *StripeConfiguration) {
				config.Products[0].Prices[0].ID = strings.Repeat("p", MaxLookupKeyLength+1)
			},
			errContains: "lookup_key",
		},
		{
			name: "rejects config ID over metadata value limit",
			mutate: func(config *StripeConfiguration) {
				config.Coupons = []Coupon{{
					ID:         strings.Repeat("c", MaxMetadataValueLength+1),
					Duration:   "once",
					PercentOff: float64Ptr(10),
				}}
			},
			errContains: "metadata value limit",
		},
		{
			name: "rejects reserved metadata keys",
			mutate: func(config *StripeConfiguration) {
				config.Coupons = []Coupon{{
					ID:         "coupon_a",
					Duration:   "once",
					PercentOff: float64Ptr(10),
					Metadata:   map[string]string{MetadataKeyManaged: "false"},
				}}
			},
			errContains: "reserved key",
		},
		{
			name: "rejects metadata keys over the key limit",
			mutate: func(config *StripeConfiguration) {
				config.Coupons = []Coupon{{
					ID:         "coupon_a",
					Duration:   "once",
					PercentOff: float64Ptr(10),
					Metadata:   map[string]string{strings.Repeat("k", MaxMetadataKeyLength+1): "v"},
				}}
			},
			errContains: "metadata key limit",
		},
		{
			name: "rejects metadata values over the value limit",
			mutate: func(config *StripeConfiguration) {
				config.Coupons = []Coupon{{
					ID:         "coupon_a",
					Duration:   "once",
					PercentOff: float64Ptr(10),
					Metadata:   map[string]string{"campaign": strings.Repeat("v", MaxMetadataValueLength+1)},
				}}
			},
			errContains: "metadata value limit",
		},
		{
			name: "rejects metadata key counts that leave no room for managed keys",
			mutate: func(config *StripeConfiguration) {
				metadata := make(map[string]string, MaxMetadataKeys-2)
				for i := 0; i < MaxMetadataKeys-2; i++ {
					metadata[fmt.Sprintf("key_%d", i)] = "v"
				}
				config.Coupons = []Coupon{{
					ID:         "coupon_a",
					Duration:   "once",
					PercentOff: float64Ptr(10),
					Metadata:   metadata,
				}}
			},
			errContains: "metadata keys",
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			config := base()
			config.Version = "1.0.0"
			tc.mutate(&config)

			_, err := NewValidator().ParseAndValidateConfig(configDataFrom(t, config))
			if tc.errContains == "" {
				require.NoError(t, err)
				return
			}
			require.ErrorContains(t, err, tc.errContains)
		})
	}
}

func TestValidatorAcceptsMaximumMetadataKeyCount(t *testing.T) {
	config := base()
	config.Version = "1.0.0"
	metadata := make(map[string]string, MaxMetadataKeys-3)
	for i := 0; i < MaxMetadataKeys-3; i++ {
		metadata[fmt.Sprintf("key_%d", i)] = "v"
	}
	config.Coupons = []Coupon{{
		ID:         "coupon_a",
		Duration:   "once",
		PercentOff: float64Ptr(10),
		Metadata:   metadata,
	}}

	_, err := NewValidator().ParseAndValidateConfig(configDataFrom(t, config))
	require.NoError(t, err)
}

func TestPullStripsManagedMetadata(t *testing.T) {
	t.Run("coupon keeps only user metadata", func(t *testing.T) {
		coupon := convertStripeCouponToConfig(&stripe.Coupon{
			Duration: "once",
			Metadata: map[string]string{
				"campaign":          "launch",
				MetadataKeyConfigID: "coupon_a",
				MetadataKeyManaged:  MetadataManagedValue,
				MetadataKeyHash:     "abc",
			},
		})

		require.Equal(t, map[string]string{"campaign": "launch"}, coupon.Metadata)
	})

	t.Run("promotion code keeps only user metadata", func(t *testing.T) {
		promo := convertStripePromoCodeToConfig(&stripe.PromotionCode{
			Code: "SAVE10",
			Metadata: map[string]string{
				"campaign":          "launch",
				MetadataKeyConfigID: "promo_a",
				MetadataKeyManaged:  MetadataManagedValue,
				MetadataKeyHash:     "abc",
			},
		}, nil)

		require.Equal(t, map[string]string{"campaign": "launch"}, promo.Metadata)
	})

	t.Run("managed-only metadata is dropped", func(t *testing.T) {
		coupon := convertStripeCouponToConfig(&stripe.Coupon{
			Duration: "once",
			Metadata: map[string]string{
				MetadataKeyConfigID: "coupon_a",
				MetadataKeyManaged:  MetadataManagedValue,
				MetadataKeyHash:     "abc",
			},
		})

		require.Nil(t, coupon.Metadata)
	})
}

func TestPullRoundTripPassesValidation(t *testing.T) {
	config := base()
	config.Version = "1.0.0"
	config.Coupons = []Coupon{convertStripeCouponToConfig(&stripe.Coupon{
		Duration: "once",
		Metadata: map[string]string{
			"campaign":          "launch",
			MetadataKeyConfigID: "coupon_a",
			MetadataKeyManaged:  MetadataManagedValue,
			MetadataKeyHash:     "abc",
		},
	})}
	config.Coupons[0].ID = "coupon_a"
	config.Coupons[0].PercentOff = float64Ptr(10)

	_, err := NewValidator().ParseAndValidateConfig(configDataFrom(t, config))
	require.NoError(t, err)
}

func configDataFrom(t *testing.T, config StripeConfiguration) ConfigData {
	t.Helper()
	raw, err := json.Marshal(config)
	require.NoError(t, err)
	var data ConfigData
	require.NoError(t, json.Unmarshal(raw, &data))
	return data
}

func boolPtr(value bool) *bool {
	return &value
}

func float64Ptr(value float64) *float64 {
	return &value
}

func base() StripeConfiguration {
	return StripeConfiguration{
		Version: "1.0.0",
		Products: []Product{{
			ID:          "prod_a",
			Name:        "Product A",
			Description: "original",
			Prices: []Price{{
				ID:       "price_a1",
				Amount:   1000,
				Currency: "usd",
				Interval: "month",
			}},
		}},
	}
}

func TestConfigHashesCanonicalizeStripeDefaults(t *testing.T) {
	t.Run("product type defaults to service", func(t *testing.T) {
		require.Equal(t, productConfigHash(Product{ID: "prod_a", Name: "A"}), productConfigHash(Product{ID: "prod_a", Name: "A", Type: "service"}))
	})

	t.Run("price defaults match explicit stripe defaults", func(t *testing.T) {
		implicit := Price{ID: "price_a", Amount: 1000, Currency: "usd", Interval: "month"}
		explicit := Price{
			ID:            "price_a",
			Amount:        1000,
			Currency:      "usd",
			Interval:      "month",
			IntervalCount: 1,
			UsageType:     "licensed",
			BillingScheme: "per_unit",
		}

		require.Equal(t, priceConfigHash(implicit), priceConfigHash(explicit))

		exclusive := implicit
		exclusive.TaxIncludedInPrice = boolPointer(false)
		require.NotEqual(t, priceConfigHash(implicit), priceConfigHash(exclusive))
	})

	t.Run("coupon empty pointers match zero values", func(t *testing.T) {
		percentOff := 10.0
		implicit := Coupon{ID: "coupon_a", PercentOff: &percentOff, Duration: "once"}
		explicit := Coupon{
			ID:               "coupon_a",
			PercentOff:       &percentOff,
			AmountOff:        int64Pointer(0),
			Duration:         "once",
			DurationInMonths: int64Pointer(0),
			MaxRedemptions:   int64Pointer(0),
			RedeemBy:         int64Pointer(0),
		}

		require.Equal(t, couponConfigHash(implicit), couponConfigHash(explicit))
	})

	t.Run("promotion code defaults match explicit values", func(t *testing.T) {
		implicit := PromotionCode{ID: "promo_a", Code: "SAVE", Coupon: "coupon_a"}
		explicit := PromotionCode{
			ID:                   "promo_a",
			Code:                 "SAVE",
			Coupon:               "coupon_a",
			Active:               boolPointer(true),
			FirstTimeTransaction: boolPointer(false),
			MaxRedemptions:       int64Pointer(0),
			MinimumAmount:        int64Pointer(0),
			ExpiresAt:            int64Pointer(0),
		}

		require.Equal(t, promoConfigHash(implicit), promoConfigHash(explicit))
	})

	t.Run("webhook event order does not matter", func(t *testing.T) {
		a := WebhookEndpointConfig{ID: "hook", URL: "https://example.com", Events: []string{"a", "b"}}
		b := WebhookEndpointConfig{ID: "hook", URL: "https://example.com", Events: []string{"b", "a"}}

		require.Equal(t, webhookConfigHash(a), webhookConfigHash(b))
	})
}
