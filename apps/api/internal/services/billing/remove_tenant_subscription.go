package billing

import (
	"context"
	"errors"
	"fmt"

	"github.com/stripe/stripe-go/v82"

	"api/internal/services/stripe_config"
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

	retrieveParams := &stripe.SubscriptionRetrieveParams{}
	s.stripe.ApplyAccount(retrieveParams)
	subscription, err := s.stripe.Stripe.V1Subscriptions.Retrieve(ctx, sub.SubscriptionID, retrieveParams)
	if err != nil {
		return nil, fmt.Errorf("%w: %w", RemoveTenantSubscriptionError, err)
	}

	if len(subscription.Items.Data) > 1 {
		itemID := matchingSubscriptionItemID(subscription, args.ConfigPriceID)
		if itemID == "" {
			return nil, fmt.Errorf("%w: %s", RemoveTenantSubscriptionNotFound, args.ConfigPriceID)
		}

		deleteParams := &stripe.SubscriptionItemDeleteParams{
			ProrationBehavior: stripe.String("none"),
		}
		s.stripe.ApplyAccount(deleteParams)
		if _, err := s.stripe.Stripe.V1SubscriptionItems.Delete(ctx, itemID, deleteParams); err != nil {
			return nil, fmt.Errorf("%w: %w", RemoveTenantSubscriptionError, err)
		}
		return &RemoveTenantSubscriptionResult{
			SubscriptionID: subscription.ID,
			Status:         string(subscription.Status),
		}, nil
	}

	cancelParams := &stripe.SubscriptionCancelParams{}
	s.stripe.ApplyAccount(cancelParams)
	canceled, err := s.stripe.Stripe.V1Subscriptions.Cancel(ctx, subscription.ID, cancelParams)
	if err != nil {
		return nil, fmt.Errorf("%w: %w", RemoveTenantSubscriptionError, err)
	}
	return &RemoveTenantSubscriptionResult{
		SubscriptionID: canceled.ID,
		Status:         string(canceled.Status),
	}, nil
}

func matchingSubscriptionItemID(subscription *stripe.Subscription, configPriceID string) string {
	for _, item := range subscription.Items.Data {
		if stripe_config.PriceConfigID(item.Price) == configPriceID {
			return item.ID
		}
	}
	return ""
}
