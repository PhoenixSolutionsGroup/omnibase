package billing

import (
	"context"
	"errors"
	"fmt"

	"github.com/stripe/stripe-go/v82"

	"api/internal/logger"
)

var ListTenantSubscriptionsError = errors.New("Failed to list tenant subscriptions")

type TenantSubscription struct {
	SubscriptionID     string
	ConfigPriceID      string
	Status             string
	IsLegacyPrice      bool
	CurrentPeriodStart int64
	CurrentPeriodEnd   int64
	CancelAtPeriodEnd  bool
	CanceledAt         *int64
	TrialStart         *int64
	TrialEnd           *int64
}

func (s *Service) ListTenantSubscriptions(ctx context.Context, stripeCustomerID string) ([]TenantSubscription, error) {
	params := &stripe.SubscriptionListParams{Customer: stripe.String(stripeCustomerID)}
	s.stripe.ApplyAccount(params)

	var out []TenantSubscription
	iter := s.stripe.Stripe.V1Subscriptions.List(ctx, params)
	for sub, err := range iter {
		if err != nil {
			return nil, fmt.Errorf("%w: %w", ListTenantSubscriptionsError, err)
		}
		if sub.Status != "active" && sub.Status != "trialing" && sub.Status != "past_due" {
			continue
		}
		for _, item := range sub.Items.Data {
			mapping, mErr := s.GetMappingByStripeID(ctx, item.Price.ID)
			if mErr != nil {
				logger.Logger.Warn("unmapped subscription item price",
					"subscription_id", sub.ID,
					"stripe_price_id", item.Price.ID,
					"error", mErr)
				continue
			}
			out = append(out, TenantSubscription{
				SubscriptionID:     sub.ID,
				ConfigPriceID:      mapping.ConfigItemID,
				Status:             string(sub.Status),
				IsLegacyPrice:      mapping.IsLegacy,
				CurrentPeriodStart: item.CurrentPeriodStart,
				CurrentPeriodEnd:   item.CurrentPeriodEnd,
				CancelAtPeriodEnd:  sub.CancelAtPeriodEnd,
				CanceledAt:         nilIfZero(sub.CanceledAt),
				TrialStart:         nilIfZero(sub.TrialStart),
				TrialEnd:           nilIfZero(sub.TrialEnd),
			})
		}
	}
	return out, nil
}

func nilIfZero(v int64) *int64 {
	if v == 0 {
		return nil
	}
	return &v
}
