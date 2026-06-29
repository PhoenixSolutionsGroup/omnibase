package billing

import (
	"context"
	"errors"
	"fmt"
)

var GetTenantSubscriptionError = errors.New("Failed to get tenant subscription")

func (s *Service) GetTenantSubscription(ctx context.Context, stripeCustomerID, configPriceID string) (*TenantSubscription, error) {
	subs, err := s.ListTenantSubscriptions(ctx, stripeCustomerID)
	if err != nil {
		return nil, fmt.Errorf("%w: %w", GetTenantSubscriptionError, err)
	}
	for i, sub := range subs {
		if sub.ConfigPriceID == configPriceID {
			return &subs[i], nil
		}
	}
	return nil, nil
}
