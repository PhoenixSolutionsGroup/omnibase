package billing

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stripe/stripe-go/v82"

	"api/internal/services/stripe_client"
)

func TestApplyPlatformFeeToSubscription_SetsPercentWhenAccountAndFeeSet(t *testing.T) {
	s := &Service{
		stripe: &stripe_client.Client{AccountID: "acct_test_123"},
		feePct: 2.7,
	}
	params := &stripe.SubscriptionCreateParams{}
	s.applyPlatformFeeToSubscription(params)
	if assert.NotNil(t, params.ApplicationFeePercent) {
		assert.InDelta(t, 2.7, *params.ApplicationFeePercent, 0.0001)
	}
}

func TestApplyPlatformFeeToSubscription_SkipsWhenNoAccount(t *testing.T) {
	s := &Service{
		stripe: &stripe_client.Client{AccountID: ""},
		feePct: 2.7,
	}
	params := &stripe.SubscriptionCreateParams{}
	s.applyPlatformFeeToSubscription(params)
	assert.Nil(t, params.ApplicationFeePercent, "no account => no fee")
}

func TestApplyPlatformFeeToSubscription_SkipsWhenZeroFee(t *testing.T) {
	s := &Service{
		stripe: &stripe_client.Client{AccountID: "acct_test_123"},
		feePct: 0,
	}
	params := &stripe.SubscriptionCreateParams{}
	s.applyPlatformFeeToSubscription(params)
	assert.Nil(t, params.ApplicationFeePercent, "zero fee => no application fee param")
}

func TestApplyPlatformFeeToSubscription_NoOpWhenNilClient(t *testing.T) {
	s := &Service{stripe: nil, feePct: 2.7}
	params := &stripe.SubscriptionCreateParams{}
	s.applyPlatformFeeToSubscription(params)
	assert.Nil(t, params.ApplicationFeePercent)
}

func TestApplyPlatformFeeToCheckout_SubscriptionMode_SetsPercentOnSubscriptionData(t *testing.T) {
	s := &Service{
		stripe: &stripe_client.Client{AccountID: "acct_test"},
		feePct: 2.7,
	}
	params := &stripe.CheckoutSessionCreateParams{}
	s.applyPlatformFeeToCheckout(params, &stripe.Price{UnitAmount: 5000}, stripe.CheckoutSessionModeSubscription)
	if assert.NotNil(t, params.SubscriptionData) && assert.NotNil(t, params.SubscriptionData.ApplicationFeePercent) {
		assert.InDelta(t, 2.7, *params.SubscriptionData.ApplicationFeePercent, 0.0001)
	}
	assert.Nil(t, params.PaymentIntentData, "subscription mode must not use PaymentIntentData fee")
}

func TestApplyPlatformFeeToCheckout_PaymentMode_SetsAmountOnPaymentIntentData(t *testing.T) {
	s := &Service{
		stripe: &stripe_client.Client{AccountID: "acct_test"},
		feePct: 10,
	}
	params := &stripe.CheckoutSessionCreateParams{}
	s.applyPlatformFeeToCheckout(params, &stripe.Price{UnitAmount: 1000}, stripe.CheckoutSessionModePayment)
	if assert.NotNil(t, params.PaymentIntentData) && assert.NotNil(t, params.PaymentIntentData.ApplicationFeeAmount) {
		assert.Equal(t, int64(100), *params.PaymentIntentData.ApplicationFeeAmount, "10% of 1000 cents = 100")
	}
}

func TestApplyPlatformFeeToCheckout_SkipsWhenFeeInactive(t *testing.T) {
	s := &Service{stripe: &stripe_client.Client{AccountID: ""}, feePct: 2.7}
	params := &stripe.CheckoutSessionCreateParams{}
	s.applyPlatformFeeToCheckout(params, &stripe.Price{UnitAmount: 1000}, stripe.CheckoutSessionModeSubscription)
	assert.Nil(t, params.SubscriptionData)
	assert.Nil(t, params.PaymentIntentData)
}

func TestApplyPlatformFeeToInvoice_SetsAmountFromSubtotal(t *testing.T) {
	s := &Service{
		stripe: &stripe_client.Client{AccountID: "acct_test"},
		feePct: 5,
	}
	params := &stripe.InvoiceCreateParams{}
	s.applyPlatformFeeToInvoice(params, 2000)
	if assert.NotNil(t, params.ApplicationFeeAmount) {
		assert.Equal(t, int64(100), *params.ApplicationFeeAmount, "5% of 2000 = 100")
	}
}

func TestApplyPlatformFeeToInvoice_SkipsWhenSubtotalZero(t *testing.T) {
	s := &Service{
		stripe: &stripe_client.Client{AccountID: "acct_test"},
		feePct: 5,
	}
	params := &stripe.InvoiceCreateParams{}
	s.applyPlatformFeeToInvoice(params, 0)
	assert.Nil(t, params.ApplicationFeeAmount)
}
