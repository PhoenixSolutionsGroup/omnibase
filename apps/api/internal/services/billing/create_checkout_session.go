package billing

import (
	"context"
	"errors"
	"fmt"

	"github.com/stripe/stripe-go/v82"
)

var (
	CreateCheckoutSessionError      = errors.New("Failed to create checkout session")
	CreateCheckoutSessionPriceFetch = errors.New("Failed to fetch price for checkout")
	CheckoutLineItemModeError       = errors.New("cannot mix one-time and recurring checkout line items")
)

type CreateCheckoutSessionArgs struct {
	CheckoutLineItems   []CheckoutLineItem
	SuccessURL          string
	CancelURL           string
	StripeCustomerID    string
	TrialPeriodDays     *int64
	PromotionCode       *string
	AllowPromotionCodes *bool
}

type CheckoutLineItem struct {
	StripePriceID string
	Quantity      int64
}

func (s *Service) CreateCheckoutSession(ctx context.Context, args CreateCheckoutSessionArgs) (*stripe.CheckoutSession, error) {
	priceParams := &stripe.PriceRetrieveParams{}
	s.stripe.ApplyAccount(priceParams)

	var mode stripe.CheckoutSessionMode
	var paymentAmount int64
	stripeLineItems := make([]*stripe.CheckoutSessionCreateLineItemParams, len(args.CheckoutLineItems))
	discountLines := make([]checkoutDiscountLine, 0, len(args.CheckoutLineItems))
	for i, item := range args.CheckoutLineItems {
		priceObj, err := s.stripe.Stripe.V1Prices.Retrieve(ctx, item.StripePriceID, priceParams)
		if err != nil {
			return nil, fmt.Errorf("%w: %w", CreateCheckoutSessionPriceFetch, err)
		}

		itemMode := stripe.CheckoutSessionModePayment
		if priceObj.Recurring != nil {
			itemMode = stripe.CheckoutSessionModeSubscription
		}
		if i == 0 {
			mode = itemMode
		} else if itemMode != mode {
			return nil, fmt.Errorf("%w: %s and %s", CheckoutLineItemModeError, mode, itemMode)
		}

		lineAmount := checkoutLineAmount(priceObj, item.Quantity)
		paymentAmount += lineAmount
		discountLines = append(discountLines, checkoutDiscountLine{price: priceObj, amount: lineAmount})
		stripeLineItems[i] = &stripe.CheckoutSessionCreateLineItemParams{
			Price: stripe.String(item.StripePriceID), Quantity: stripe.Int64(item.Quantity),
		}
	}

	if mode == stripe.CheckoutSessionModePayment && s.feeActive() && args.PromotionCode != nil && *args.PromotionCode != "" {
		discount, err := s.promotionCodeDiscountAmount(ctx, discountLines, *args.PromotionCode)
		if err != nil {
			return nil, err
		}
		paymentAmount -= discount
	}

	params := &stripe.CheckoutSessionCreateParams{
		LineItems:  stripeLineItems,
		Mode:       stripe.String(string(mode)),
		SuccessURL: stripe.String(args.SuccessURL),
		CancelURL:  stripe.String(args.CancelURL),
	}

	if args.StripeCustomerID != "" {
		params.Customer = stripe.String(args.StripeCustomerID)
	} else if mode == stripe.CheckoutSessionModePayment {
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
	s.applyPlatformFeeToCheckout(params, mode, paymentAmount)

	sess, err := s.stripe.Stripe.V1CheckoutSessions.Create(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("%w: %w", CreateCheckoutSessionError, err)
	}
	return sess, nil
}
