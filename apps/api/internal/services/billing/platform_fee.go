package billing

import (
	"math"

	"github.com/stripe/stripe-go/v82"
)

func (s *Service) feeActive() bool {
	return s.stripe != nil && s.stripe.AccountID != "" && s.feePct > 0
}

func (s *Service) applyPlatformFeeToSubscription(params *stripe.SubscriptionCreateParams) {
	if !s.feeActive() {
		return
	}
	params.ApplicationFeePercent = stripe.Float64(s.feePct)
}

func (s *Service) applyPlatformFeeToCheckout(params *stripe.CheckoutSessionCreateParams, mode stripe.CheckoutSessionMode, paymentAmount int64) {
	if !s.feeActive() {
		return
	}
	switch mode {
	case stripe.CheckoutSessionModeSubscription:
		if params.SubscriptionData == nil {
			params.SubscriptionData = &stripe.CheckoutSessionCreateSubscriptionDataParams{}
		}
		params.SubscriptionData.ApplicationFeePercent = stripe.Float64(s.feePct)
	case stripe.CheckoutSessionModePayment:
		feeAmount := percentageAmount(paymentAmount, s.feePct)
		if feeAmount > 0 {
			params.PaymentIntentData = &stripe.CheckoutSessionCreatePaymentIntentDataParams{
				ApplicationFeeAmount: stripe.Int64(feeAmount),
			}
		}
	}
}

func percentageAmount(amount int64, percent float64) int64 {
	if amount <= 0 || percent <= 0 {
		return 0
	}
	return int64(math.Round(float64(amount) * percent / 100))
}
