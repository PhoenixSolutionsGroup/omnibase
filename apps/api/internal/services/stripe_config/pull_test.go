package stripe_config

import (
	"testing"

	"github.com/stretchr/testify/require"
	"github.com/stripe/stripe-go/v82"
)

func TestPullUsesTaggedIdentities(t *testing.T) {
	t.Run("product metadata id wins over display name", func(t *testing.T) {
		products := []*stripe.Product{{
			ID:       "prod_123",
			Name:     "Completely Different Name",
			Metadata: map[string]string{MetadataKeyConfigID: "pro_plan"},
		}}

		ids := assignProductConfigIDs(products)

		require.Equal(t, "pro_plan", ids["prod_123"])
	})

	t.Run("price lookup key wins over nickname", func(t *testing.T) {
		prices := []*stripe.Price{{
			ID:        "price_123",
			Product:   &stripe.Product{ID: "prod_123"},
			Nickname:  "Something Else",
			LookupKey: "pro_monthly",
		}}
		productIDs := map[string]string{"prod_123": "pro_plan"}

		ids := assignPriceConfigIDs(prices, productIDs)

		require.Equal(t, "pro_monthly", ids["price_123"])
	})

	t.Run("coupon and promotion code metadata ids are used", func(t *testing.T) {
		coupons := []*stripe.Coupon{{
			ID:       "coupon_123",
			Name:     "Renamed Coupon",
			Metadata: map[string]string{MetadataKeyConfigID: "launch_discount"},
		}}
		promos := []*stripe.PromotionCode{{
			ID:       "promo_123",
			Code:     "RENAMED",
			Metadata: map[string]string{MetadataKeyConfigID: "launch_code"},
		}}

		couponAllocator := newConfigIDAllocator(taggedConfigIDs(coupons, func(c *stripe.Coupon) string {
			return configIDFromMetadata(c.Metadata)
		}))
		couponID := couponAllocator.resolve(configIDFromMetadata(coupons[0].Metadata), normalizeConfigID(coupons[0].Name), coupons[0].ID)

		promoAllocator := newConfigIDAllocator(taggedConfigIDs(promos, func(p *stripe.PromotionCode) string {
			return configIDFromMetadata(p.Metadata)
		}))
		promoID := promoAllocator.resolve(configIDFromMetadata(promos[0].Metadata), normalizeConfigID(promos[0].Code), promos[0].ID)

		require.Equal(t, "launch_discount", couponID)
		require.Equal(t, "launch_code", promoID)
	})
}

func TestPullFallbackIDsAreCollisionSafe(t *testing.T) {
	t.Run("colliding product names get distinct ids", func(t *testing.T) {
		products := []*stripe.Product{
			{ID: "prod_1", Name: "Pro Plan"},
			{ID: "prod_2", Name: "Pro Plan"},
		}

		ids := assignProductConfigIDs(products)

		require.Equal(t, "pro_plan", ids["prod_1"])
		require.Equal(t, "pro_plan_prod_2", ids["prod_2"])
		require.NotEqual(t, ids["prod_1"], ids["prod_2"])
	})

	t.Run("untagged fallback does not steal a tagged id", func(t *testing.T) {
		products := []*stripe.Product{
			{ID: "prod_untagged", Name: "Pro Plan"},
			{ID: "prod_tagged", Name: "Other", Metadata: map[string]string{MetadataKeyConfigID: "pro_plan"}},
		}

		ids := assignProductConfigIDs(products)

		require.Equal(t, "pro_plan", ids["prod_tagged"])
		require.Equal(t, "pro_plan_prod_untagged", ids["prod_untagged"])
	})

	t.Run("same interval prices without nickname get distinct ids", func(t *testing.T) {
		prices := []*stripe.Price{
			{ID: "price_1", Product: &stripe.Product{ID: "prod_1"}, Recurring: &stripe.PriceRecurring{Interval: "month"}},
			{ID: "price_2", Product: &stripe.Product{ID: "prod_1"}, Recurring: &stripe.PriceRecurring{Interval: "month"}},
		}
		productIDs := map[string]string{"prod_1": "pro_plan"}

		ids := assignPriceConfigIDs(prices, productIDs)

		require.Equal(t, "pro_plan_month", ids["price_1"])
		require.Equal(t, "pro_plan_month_price_2", ids["price_2"])
		require.NotEqual(t, ids["price_1"], ids["price_2"])
	})
}

func TestPullResolvesMetersByEventName(t *testing.T) {
	meters := []*stripe.BillingMeter{
		{ID: "mtr_api", DisplayName: "Renamed Meter", EventName: "api_calls"},
		{ID: "mtr_storage", DisplayName: "Storage", EventName: "storage_gb"},
	}

	meterConfigIDs := assignMeterConfigIDs(meters)

	require.Equal(t, "api_calls", meterConfigIDs["mtr_api"])
	require.Equal(t, "storage_gb", meterConfigIDs["mtr_storage"])

	price := &stripe.Price{
		Currency: "usd",
		Recurring: &stripe.PriceRecurring{
			Interval:  "month",
			UsageType: "metered",
			Meter:     "mtr_api",
		},
	}
	converted := convertStripePriceToConfig(price, meterConfigIDs)

	require.Equal(t, "api_calls", converted.Meter)
}

func TestPullPushRoundTripProducesNoChanges(t *testing.T) {
	first := pulledFixture()
	second := pulledFixture()

	require.Equal(t, first, second)
	require.Equal(t, first.Products[0].Prices[0].ID, second.Products[0].Prices[0].ID)
}

func pulledFixture() *StripeConfiguration {
	products := []*stripe.Product{{
		ID:       "prod_123",
		Name:     "Pro Plan",
		Type:     "service",
		Metadata: map[string]string{MetadataKeyConfigID: "pro_plan"},
	}}
	prices := []*stripe.Price{{
		ID:         "price_123",
		Product:    &stripe.Product{ID: "prod_123"},
		UnitAmount: 1000,
		Currency:   "usd",
		LookupKey:  "pro_monthly",
		Recurring:  &stripe.PriceRecurring{Interval: "month", IntervalCount: 1},
	}}
	meters := []*stripe.BillingMeter{{
		ID:          "mtr_123",
		DisplayName: "API Calls",
		EventName:   "api_calls",
	}}

	productIDs := assignProductConfigIDs(products)
	priceIDs := assignPriceConfigIDs(prices, productIDs)
	meterConfigIDs := assignMeterConfigIDs(meters)

	return &StripeConfiguration{
		Version: "1.0.0",
		Meters: []Meter{{
			ID:          meterConfigIDs["mtr_123"],
			StripeID:    "mtr_123",
			DisplayName: "API Calls",
			EventName:   "api_calls",
			DefaultAggregation: MeterDefaultAggregation{
				Formula: "sum",
			},
		}},
		Products: []Product{{
			ID:       productIDs["prod_123"],
			StripeID: "prod_123",
			Name:     "Pro Plan",
			Type:     "service",
			Prices: []Price{{
				ID:            priceIDs["price_123"],
				StripeID:      "price_123",
				Amount:        1000,
				Currency:      "usd",
				Interval:      "month",
				IntervalCount: 1,
			}},
		}},
	}
}
