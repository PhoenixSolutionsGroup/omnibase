package stripe_config

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
	"github.com/stripe/stripe-go/v82"

	"api/internal/config"
	"api/internal/database/repository"
	repomocks "api/internal/mocks/repository"
	"api/internal/services/stripe_client"
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
	require.Equal(t, "webhook_a", managedWebhookKey(StripeWebhookInfo{
		URL:      "https://example.com/old",
		Metadata: map[string]string{MetadataKeyManaged: MetadataManagedValue, MetadataKeyConfigID: "webhook_a"},
	}))
	require.Equal(t, "webhook_a", desiredWebhookKey(WebhookEndpointConfig{ID: "webhook_a", URL: "https://example.com/hook"}))
	require.Equal(t, "webhook_a", desiredWebhookKey(WebhookEndpointConfig{ID: "webhook_a", URL: "https://example.com/new"}))
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

func TestStringSetsEqual(t *testing.T) {
	require.True(t, stringSetsEqual([]string{"a", "b"}, []string{"b", "a"}))
	require.False(t, stringSetsEqual([]string{"a"}, []string{"a", "b"}))
	require.False(t, stringSetsEqual([]string{"a"}, []string{"b"}))
	require.True(t, stringSetsEqual(nil, nil))
}

func TestReconcileWebhooksUpdatesURLByConfigID(t *testing.T) {
	var gotURL string
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		require.Equal(t, http.MethodPost, r.Method)
		require.Equal(t, "/v1/webhook_endpoints/we_1", r.URL.Path)
		require.NoError(t, r.ParseForm())
		gotURL = r.Form.Get("url")
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"id":"we_1","object":"webhook_endpoint","url":"https://new.example.com/hook","enabled_events":["invoice.paid"]}`))
	}))
	defer server.Close()

	repo := repomocks.NewMockQuerier(t)
	repo.EXPECT().GetStripeWebhookByStripeID(mock.Anything, "we_1").Return(repository.GetStripeWebhookByStripeIDRow{
		ID:       uuid.New(),
		StripeID: "we_1",
	}, nil)

	service := &Service{
		repo:   repo,
		stripe: stripe_client.New(config.StripeConfig{SecretKey: "sk_test", APIBaseURL: server.URL}),
	}
	desired := &StripeConfiguration{Webhooks: []WebhookEndpointConfig{{
		ID:     "webhook_a",
		URL:    "https://new.example.com/hook",
		Events: []string{"invoice.paid"},
	}}}
	actual := map[string]StripeWebhookInfo{
		desiredWebhookKey(desired.Webhooks[0]): {
			ID:     "we_1",
			URL:    "https://old.example.com/hook",
			Events: []string{"invoice.paid"},
			Metadata: map[string]string{
				MetadataKeyManaged:  MetadataManagedValue,
				MetadataKeyConfigID: "webhook_a",
				MetadataKeyHash:     "old-hash",
			},
		},
	}
	changes := &ConfigChanges{Webhooks: &WebhookChanges{}}

	require.NoError(t, service.reconcileWebhooks(context.Background(), desired, actual, changes))
	require.Equal(t, "https://new.example.com/hook", gotURL)
	require.Len(t, changes.Webhooks.Updated, 1)
	require.Equal(t, "https://new.example.com/hook", changes.Webhooks.Updated[0].URL)
}
