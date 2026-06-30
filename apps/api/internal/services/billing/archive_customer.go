package billing

import (
	"context"
	"errors"
	"fmt"

	"github.com/stripe/stripe-go/v82"
)

var ArchiveCustomerError = errors.New("Failed to archive stripe customer")

func (s *Service) ArchiveCustomer(ctx context.Context, customerID string) error {
	if customerID == "" {
		return nil
	}
	params := &stripe.CustomerUpdateParams{}
	params.AddMetadata("archived", "true")
	s.stripe.ApplyAccount(params)

	if _, err := s.stripe.Stripe.V1Customers.Update(ctx, customerID, params); err != nil {
		return fmt.Errorf("%w: %w", ArchiveCustomerError, err)
	}
	return nil
}
