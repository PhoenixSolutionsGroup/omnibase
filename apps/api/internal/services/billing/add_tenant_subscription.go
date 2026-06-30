package billing

import (
	"context"
	"errors"
	"fmt"

	"github.com/stripe/stripe-go/v82"
)

var (
	AddTenantSubscriptionError        = errors.New("Failed to add tenant subscription")
	AddTenantSubscriptionPlanNotFound = errors.New("Plan not found")
	AddTenantSubscriptionDuplicate    = errors.New("Subscription already exists for plan")
)

type AddTenantSubscriptionArgs struct {
	StripeCustomerID string
	ConfigPriceID    string
	Quantity         int64
}

type AddTenantSubscriptionResult struct {
	SubscriptionID string
	Status         string
}

func (s *Service) AddTenantSubscription(ctx context.Context, args AddTenantSubscriptionArgs) (*AddTenantSubscriptionResult, error) {
	mapping, err := s.GetMappingByConfigID(ctx, args.ConfigPriceID, "price")
	if err != nil {
		return nil, fmt.Errorf("%w: %w", AddTenantSubscriptionPlanNotFound, err)
	}

	existing, err := s.GetTenantSubscription(ctx, args.StripeCustomerID, args.ConfigPriceID)
	if err != nil {
		return nil, fmt.Errorf("%w: %w", AddTenantSubscriptionError, err)
	}
	if existing != nil {
		return nil, fmt.Errorf("%w: %s", AddTenantSubscriptionDuplicate, args.ConfigPriceID)
	}

	item := &stripe.SubscriptionCreateItemParams{Price: stripe.String(mapping.StripeID)}
	if args.Quantity > 0 {
		item.Quantity = stripe.Int64(args.Quantity)
	}
	params := &stripe.SubscriptionCreateParams{
		Customer: stripe.String(args.StripeCustomerID),
		Items:    []*stripe.SubscriptionCreateItemParams{item},
	}
	s.stripe.ApplyAccount(params)
	s.applyPlatformFeeToSubscription(params)

	sub, err := s.stripe.Stripe.V1Subscriptions.Create(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("%w: %w", AddTenantSubscriptionError, err)
	}

	return &AddTenantSubscriptionResult{
		SubscriptionID: sub.ID,
		Status:         string(sub.Status),
	}, nil
}
