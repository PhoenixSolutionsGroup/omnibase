package billing

import "github.com/stripe/stripe-go/v82"

func (s *Service) feeActive() bool {
	return s.stripe != nil && s.stripe.AccountID != "" && s.feePct > 0
}

func (s *Service) applyPlatformFeeToSubscription(params *stripe.SubscriptionCreateParams) {
	if !s.feeActive() {
		return
	}
	params.ApplicationFeePercent = stripe.Float64(s.feePct)
}

func (s *Service) applyPlatformFeeToCheckout(params *stripe.CheckoutSessionCreateParams, priceObj *stripe.Price, mode stripe.CheckoutSessionMode) {
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
		feeAmount := int64(float64(priceObj.UnitAmount) * (s.feePct / 100))
		params.PaymentIntentData = &stripe.CheckoutSessionCreatePaymentIntentDataParams{
			ApplicationFeeAmount: stripe.Int64(feeAmount),
		}
	}
}

func (s *Service) applyPlatformFeeToInvoice(params *stripe.InvoiceCreateParams, subtotal int64) {
	if !s.feeActive() {
		return
	}
	feeAmount := int64(float64(subtotal) * (s.feePct / 100))
	if feeAmount > 0 {
		params.ApplicationFeeAmount = stripe.Int64(feeAmount)
	}
}
