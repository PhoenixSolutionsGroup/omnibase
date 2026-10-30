package stripe_config

import (
	"testing"

	"github.com/stretchr/testify/require"
	"github.com/stripe/stripe-go/v82"
)

func TestManagedIdentityExtraction(t *testing.T) {
	require.Equal(t, "", managedConfigID(nil))
	require.Equal(t, "", managedConfigID(map[string]string{MetadataKeyManaged: MetadataManagedValue}))
	require.Equal(t, "prod_a", managedConfigID(map[string]string{
		MetadataKeyManaged:  MetadataManagedValue,
		MetadataKeyConfigID: "prod_a",
	}))
	require.Equal(t, "", managedConfigID(map[string]string{MetadataKeyConfigID: "prod_a"}))

	require.Equal(t, "", managedPriceConfigID(&stripe.Price{LookupKey: "price_a"}))
	require.Equal(t, "price_a", managedPriceConfigID(&stripe.Price{
		LookupKey: "price_a",
		Metadata:  map[string]string{MetadataKeyManaged: MetadataManagedValue},
	}))
	require.Equal(t, "price_meta", managedPriceConfigID(&stripe.Price{
		LookupKey: "price_lookup",
		Metadata: map[string]string{
			MetadataKeyManaged:  MetadataManagedValue,
			MetadataKeyConfigID: "price_meta",
		},
	}))
}

func TestWebhookKeys(t *testing.T) {
	require.Equal(t, "https://example.com/hook", managedWebhookKey(StripeWebhookInfo{URL: "https://example.com/hook"}))
	require.Equal(t, "https://example.com/hook", desiredWebhookKey(WebhookEndpointConfig{ID: "webhook_a", URL: "https://example.com/hook"}))
	require.Equal(t, "https://example.com/hook", desiredWebhookKey(WebhookEndpointConfig{URL: "https://example.com/hook"}))
}

func TestProductNeedsRecreate(t *testing.T) {
	require.False(t, productNeedsRecreate(Product{Type: "service"}, &stripe.Product{Type: "service"}))
	require.False(t, productNeedsRecreate(Product{}, &stripe.Product{Type: "service"}))
	require.True(t, productNeedsRecreate(Product{Type: "good"}, &stripe.Product{Type: "service"}))
}

func TestMeterNeedsRecreate(t *testing.T) {
	live := &stripe.BillingMeter{
		EventName:          "api_calls",
		DefaultAggregation: &stripe.BillingMeterDefaultAggregation{Formula: "sum"},
		CustomerMapping:    &stripe.BillingMeterCustomerMapping{EventPayloadKey: "stripe_customer_id", Type: "by_id"},
		ValueSettings:      &stripe.BillingMeterValueSettings{EventPayloadKey: "value"},
	}
	desired := Meter{
		EventName:          "api_calls",
		DefaultAggregation: MeterDefaultAggregation{Formula: "sum"},
	}

	require.False(t, meterNeedsRecreate(desired, live))

	changedFormula := desired
	changedFormula.DefaultAggregation.Formula = "count"
	require.True(t, meterNeedsRecreate(changedFormula, live))

	changedValueKey := desired
	changedValueKey.ValueSettings = &MeterValueSettings{EventPayloadKey: "units"}
	require.True(t, meterNeedsRecreate(changedValueKey, live))

	changedCustomerKey := desired
	changedCustomerKey.CustomerMapping = &MeterCustomerMapping{EventPayloadKey: "user_id", Type: "by_id"}
	require.True(t, meterNeedsRecreate(changedCustomerKey, live))
}

func TestCouponImmutableChanged(t *testing.T) {
	percentOff := 10.0
	desired := Coupon{PercentOff: &percentOff, Duration: "once"}
	live := &stripe.Coupon{PercentOff: 10, Duration: "once"}

	require.False(t, couponImmutableChanged(desired, live, nil))

	renamed := desired
	renamed.Name = "Renamed"
	require.False(t, couponImmutableChanged(renamed, live, nil))

	changedDuration := desired
	changedDuration.Duration = "forever"
	require.True(t, couponImmutableChanged(changedDuration, live, nil))

	removedPercent := desired
	removedPercent.PercentOff = nil
	require.True(t, couponImmutableChanged(removedPercent, live, nil))

	appliesToLive := &stripe.Coupon{
		PercentOff: 10,
		Duration:   "once",
		AppliesTo:  &stripe.CouponAppliesTo{Products: []string{"prod_123"}},
	}
	withProduct := desired
	withProduct.AppliesTo = []string{"prod_a"}
	require.False(t, couponImmutableChanged(withProduct, appliesToLive, map[string]string{"prod_123": "prod_a"}))
	require.True(t, couponImmutableChanged(withProduct, appliesToLive, map[string]string{"prod_123": "prod_other"}))
}

func TestPromoImmutableChanged(t *testing.T) {
	couponStripeID := "coupon_123"
	desired := PromotionCode{Code: "SAVE10", Coupon: "coupon_a"}
	live := &stripe.PromotionCode{
		Code:         "SAVE10",
		Coupon:       &stripe.Coupon{ID: couponStripeID},
		Restrictions: &stripe.PromotionCodeRestrictions{},
	}

	require.False(t, promoImmutableChanged(desired, live, couponStripeID))

	changedCoupon := desired
	changedCoupon.Coupon = "coupon_b"
	require.True(t, promoImmutableChanged(changedCoupon, live, "coupon_456"))

	changedCode := desired
	changedCode.Code = "SAVE20"
	require.True(t, promoImmutableChanged(changedCode, live, couponStripeID))

	newExpiry := int64(1700000000)
	addedExpiry := desired
	addedExpiry.ExpiresAt = &newExpiry
	require.True(t, promoImmutableChanged(addedExpiry, live, couponStripeID))

	changedActive := desired
	active := false
	changedActive.Active = &active
	require.False(t, promoImmutableChanged(changedActive, live, couponStripeID))
}

func TestReconcileStateRecordsMappings(t *testing.T) {
	state := newReconcileState()
	state.addMapping("prod_a", "prod_123", "product")
	state.addMapping("", "prod_456", "product")
	state.addMapping("price_a", "", "price")

	require.Len(t, state.mappings, 1)
	require.Equal(t, mappingIntent{configItemID: "prod_a", stripeID: "prod_123", itemType: "product"}, state.mappings[0])
}

func TestStringSetsEqual(t *testing.T) {
	require.True(t, stringSetsEqual([]string{"a", "b"}, []string{"b", "a"}))
	require.False(t, stringSetsEqual([]string{"a"}, []string{"a", "b"}))
	require.False(t, stringSetsEqual([]string{"a"}, []string{"b"}))
	require.True(t, stringSetsEqual(nil, nil))
}
