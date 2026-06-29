package billing

import (
	"context"
	"errors"
	"fmt"

	"github.com/stripe/stripe-go/v82"
)

var CheckBillingStatusError = errors.New("Failed to check billing status")

func (s *Service) CheckBillingStatus(ctx context.Context, stripeCustomerID string) (bool, error) {
	params := &stripe.PaymentMethodListParams{
		Customer: stripe.String(stripeCustomerID),
		Type:     stripe.String("card"),
	}
	s.stripe.ApplyAccount(params)

	iter := s.stripe.Stripe.V1PaymentMethods.List(ctx, params)
	for _, err := range iter {
		if err != nil {
			return false, fmt.Errorf("%w: %w", CheckBillingStatusError, err)
		}
		return true, nil
	}
	return false, nil
}
