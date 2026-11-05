package billing

import (
	"context"
	"errors"
	"fmt"

	"github.com/stripe/stripe-go/v82"
)

var CancelCustomerSubscriptionsError = errors.New("Failed to cancel customer subscriptions")

func (s *Service) CancelCustomerSubscriptions(ctx context.Context, customerID string) (int, error) {
	if customerID == "" {
		return 0, nil
	}

	params := &stripe.SubscriptionListParams{Customer: stripe.String(customerID)}
	s.stripe.ApplyAccount(params)

	cancelled := 0
	iter := s.stripe.Stripe.V1Subscriptions.List(ctx, params)
	for sub, err := range iter {
		if err != nil {
			return cancelled, fmt.Errorf("%w: %w", CancelCustomerSubscriptionsError, err)
		}
		if sub.Status == stripe.SubscriptionStatusCanceled || sub.Status == stripe.SubscriptionStatusIncompleteExpired {
			continue
		}

		cancelParams := &stripe.SubscriptionCancelParams{
			InvoiceNow: stripe.Bool(true),
			Prorate:    stripe.Bool(false),
		}
		s.stripe.ApplyAccount(cancelParams)
		if _, err := s.stripe.Stripe.V1Subscriptions.Cancel(ctx, sub.ID, cancelParams); err != nil {
			return cancelled, fmt.Errorf("%w: %s: %w", CancelCustomerSubscriptionsError, sub.ID, err)
		}
		cancelled++
	}
	return cancelled, nil
}
