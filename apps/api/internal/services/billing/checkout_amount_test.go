package billing

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

func TestCheckoutLineAmountUsesDecimalUnitAmount(t *testing.T) {
	price := &stripe.Price{UnitAmountDecimal: 1000.5}

	require.Equal(t, int64(1001), checkoutLineAmount(price, 1))
	require.Equal(t, int64(2001), checkoutLineAmount(price, 2))
}

func TestCheckoutLineAmountFallsBackToIntegerUnitAmount(t *testing.T) {
	price := &stripe.Price{UnitAmount: 999}

	require.Equal(t, int64(999), checkoutLineAmount(price, 1))
	require.Equal(t, int64(1998), checkoutLineAmount(price, 2))
}

func TestCheckoutLineAmountComputesGraduatedTiers(t *testing.T) {
	price := &stripe.Price{
		BillingScheme: stripe.PriceBillingSchemeTiered,
		TiersMode:     stripe.PriceTiersModeGraduated,
		Tiers: []*stripe.PriceTier{
			{UpTo: 10, UnitAmount: 100},
			{UpTo: 20, UnitAmount: 50},
		},
	}

	require.Equal(t, int64(100), checkoutLineAmount(price, 1))
	require.Equal(t, int64(1250), checkoutLineAmount(price, 15))
}

func TestCheckoutLineAmountComputesVolumeTiers(t *testing.T) {
	price := &stripe.Price{
		BillingScheme: stripe.PriceBillingSchemeTiered,
		TiersMode:     stripe.PriceTiersModeVolume,
		Tiers: []*stripe.PriceTier{
			{UpTo: 10, UnitAmount: 100},
			{UpTo: 20, UnitAmount: 50},
		},
	}

	require.Equal(t, int64(100), checkoutLineAmount(price, 1))
	require.Equal(t, int64(750), checkoutLineAmount(price, 15))
}

func TestCheckoutLineAmountIncludesTierFlatAmount(t *testing.T) {
	price := &stripe.Price{
		BillingScheme: stripe.PriceBillingSchemeTiered,
		TiersMode:     stripe.PriceTiersModeGraduated,
		Tiers: []*stripe.PriceTier{
			{UpTo: 10, FlatAmount: 200, UnitAmount: 100},
		},
	}

	require.Equal(t, int64(500), checkoutLineAmount(price, 3))
}

func TestCheckoutLineAmountReturnsZeroWithoutQuantity(t *testing.T) {
	price := &stripe.Price{UnitAmount: 1000}

	require.Zero(t, checkoutLineAmount(price, 0))
}

func TestPromotionCodeDiscountAmountUsesPercentOff(t *testing.T) {
	service := promotionCodeService(t, `{"id":"promo_123","object":"promotion_code","coupon":{"id":"coupon_1","object":"coupon","percent_off":20}}`)
	price := &stripe.Price{Currency: stripe.CurrencyUSD}

	discount, err := service.promotionCodeDiscountAmount(context.Background(), price, "promo_123", 1000)

	require.NoError(t, err)
	require.Equal(t, int64(200), discount)
}

func TestPromotionCodeDiscountAmountUsesAmountOff(t *testing.T) {
	service := promotionCodeService(t, `{"id":"promo_123","object":"promotion_code","coupon":{"id":"coupon_1","object":"coupon","amount_off":300,"currency":"usd"}}`)
	price := &stripe.Price{Currency: stripe.CurrencyUSD}

	discount, err := service.promotionCodeDiscountAmount(context.Background(), price, "promo_123", 1000)

	require.NoError(t, err)
	require.Equal(t, int64(300), discount)
}

func TestPromotionCodeDiscountAmountCapsAtPaymentAmount(t *testing.T) {
	service := promotionCodeService(t, `{"id":"promo_123","object":"promotion_code","coupon":{"id":"coupon_1","object":"coupon","amount_off":300,"currency":"usd"}}`)
	price := &stripe.Price{Currency: stripe.CurrencyUSD}

	discount, err := service.promotionCodeDiscountAmount(context.Background(), price, "promo_123", 200)

	require.NoError(t, err)
	require.Equal(t, int64(200), discount)
}

func TestPromotionCodeDiscountAmountSkipsCurrencyMismatch(t *testing.T) {
	service := promotionCodeService(t, `{"id":"promo_123","object":"promotion_code","coupon":{"id":"coupon_1","object":"coupon","amount_off":300,"currency":"eur"}}`)
	price := &stripe.Price{Currency: stripe.CurrencyUSD}

	discount, err := service.promotionCodeDiscountAmount(context.Background(), price, "promo_123", 1000)

	require.NoError(t, err)
	require.Zero(t, discount)
}

func TestPromotionCodeDiscountAmountSkipsProductsOutsideAppliesTo(t *testing.T) {
	service := promotionCodeService(t, `{"id":"promo_123","object":"promotion_code","coupon":{"id":"coupon_1","object":"coupon","percent_off":20,"applies_to":{"products":["prod_other"]}}}`)
	price := &stripe.Price{Product: &stripe.Product{ID: "prod_current"}}

	discount, err := service.promotionCodeDiscountAmount(context.Background(), price, "promo_123", 1000)

	require.NoError(t, err)
	require.Zero(t, discount)
}

func TestPromotionCodeDiscountAmountFailsWhenPromotionCodeCannotBeFetched(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
	}))
	t.Cleanup(server.Close)

	service := New(Deps{Stripe: stripe_client.New(config.StripeConfig{SecretKey: "sk_test", APIBaseURL: server.URL})})
	price := &stripe.Price{Currency: stripe.CurrencyUSD}

	_, err := service.promotionCodeDiscountAmount(context.Background(), price, "promo_123", 1000)

	require.ErrorIs(t, err, CreateCheckoutSessionError)
}

func promotionCodeService(t *testing.T, response string) *Service {
	t.Helper()

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		require.Equal(t, "/v1/promotion_codes/promo_123", r.URL.Path)
		require.Equal(t, "acct_test", r.Header.Get("Stripe-Account"))
		w.Header().Set("Content-Type", "application/json")
		_, err := w.Write([]byte(response))
		require.NoError(t, err)
	}))
	t.Cleanup(server.Close)

	return New(Deps{Stripe: stripe_client.New(config.StripeConfig{
		SecretKey:       "sk_test",
		StripeAccountID: "acct_test",
		APIBaseURL:      server.URL,
	})})
}
