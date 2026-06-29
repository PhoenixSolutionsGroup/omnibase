package billing

import (
	"context"
	"errors"
	"fmt"
)

var (
	RemoveTenantSubscriptionError    = errors.New("Failed to remove tenant subscription")
	RemoveTenantSubscriptionNotFound = errors.New("Subscription not found for plan")
)

type RemoveTenantSubscriptionArgs struct {
	StripeCustomerID string
	ConfigPriceID    string
}

type RemoveTenantSubscriptionResult struct {
	SubscriptionID string
	Status         string
}

func (s *Service) RemoveTenantSubscription(ctx context.Context, args RemoveTenantSubscriptionArgs) (*RemoveTenantSubscriptionResult, error) {
	sub, err := s.GetTenantSubscription(ctx, args.StripeCustomerID, args.ConfigPriceID)
	if err != nil {
		return nil, fmt.Errorf("%w: %w", RemoveTenantSubscriptionError, err)
	}
	if sub == nil {
		return nil, fmt.Errorf("%w: %s", RemoveTenantSubscriptionNotFound, args.ConfigPriceID)
	}

	canceled, err := s.stripe.Stripe.V1Subscriptions.Cancel(ctx, sub.SubscriptionID, nil)
	if err != nil {
		return nil, fmt.Errorf("%w: %w", RemoveTenantSubscriptionError, err)
	}
	return &RemoveTenantSubscriptionResult{
		SubscriptionID: canceled.ID,
		Status:         string(canceled.Status),
	}, nil
}
