package billing

import (
	"context"
	"errors"
	"fmt"

	"github.com/stripe/stripe-go/v82"
)

var CreateCustomerError = errors.New("Failed to create stripe customer")

type CreateCustomerArgs struct {
	Email string
	Name  string
}

func (s *Service) CreateCustomer(ctx context.Context, args CreateCustomerArgs) (string, error) {
	params := &stripe.CustomerCreateParams{
		Email: stripe.String(args.Email),
		Name:  stripe.String(args.Name),
	}
	s.stripe.ApplyAccount(params)

	cust, err := s.stripe.Stripe.V1Customers.Create(ctx, params)
	if err != nil {
		return "", fmt.Errorf("%w: %w", CreateCustomerError, err)
	}
	return cust.ID, nil
}
