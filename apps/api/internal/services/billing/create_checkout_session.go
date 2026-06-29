package billing

import (
	"context"
	"errors"
	"fmt"

	"github.com/stripe/stripe-go/v82"
)

var (
	CreateCheckoutSessionError       = errors.New("Failed to create checkout session")
	CreateCheckoutSessionPriceFetch  = errors.New("Failed to fetch price for checkout")
)

type CreateCheckoutSessionArgs struct {
	StripePriceID       string
	SuccessURL          string
	CancelURL           string
	StripeCustomerID    string
	TrialPeriodDays     *int64
	PromotionCode       *string
	AllowPromotionCodes *bool
}

func (s *Service) CreateCheckoutSession(ctx context.Context, args CreateCheckoutSessionArgs) (*stripe.CheckoutSession, error) {
	priceParams := &stripe.PriceRetrieveParams{}
	s.stripe.ApplyAccount(priceParams)
	priceObj, err := s.stripe.Stripe.V1Prices.Retrieve(ctx, args.StripePriceID, priceParams)
	if err != nil {
		return nil, fmt.Errorf("%w: %w", CreateCheckoutSessionPriceFetch, err)
	}

	mode := stripe.CheckoutSessionModePayment
	if priceObj.Recurring != nil {
		mode = stripe.CheckoutSessionModeSubscription
	}

	params := &stripe.CheckoutSessionCreateParams{
		LineItems: []*stripe.CheckoutSessionCreateLineItemParams{
			{Price: stripe.String(args.StripePriceID), Quantity: stripe.Int64(1)},
		},
		Mode:       stripe.String(string(mode)),
		SuccessURL: stripe.String(args.SuccessURL),
		CancelURL:  stripe.String(args.CancelURL),
	}

	if args.StripeCustomerID != "" {
		params.Customer = stripe.String(args.StripeCustomerID)
	} else {
		params.CustomerCreation = stripe.String("always")
	}

	if mode == stripe.CheckoutSessionModeSubscription && args.TrialPeriodDays != nil && *args.TrialPeriodDays > 0 {
		params.SubscriptionData = &stripe.CheckoutSessionCreateSubscriptionDataParams{
			TrialPeriodDays: args.TrialPeriodDays,
		}
	}

	if args.PromotionCode != nil && *args.PromotionCode != "" {
		params.Discounts = []*stripe.CheckoutSessionCreateDiscountParams{
			{PromotionCode: args.PromotionCode},
		}
	}

	if args.AllowPromotionCodes != nil && *args.AllowPromotionCodes {
		params.AllowPromotionCodes = args.AllowPromotionCodes
	}

	s.stripe.ApplyAccount(params)
	s.applyPlatformFeeToCheckout(params, priceObj, mode)

	sess, err := s.stripe.Stripe.V1CheckoutSessions.Create(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("%w: %w", CreateCheckoutSessionError, err)
	}
	return sess, nil
}
