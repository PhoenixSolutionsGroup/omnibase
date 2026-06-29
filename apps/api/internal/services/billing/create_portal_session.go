package billing

import (
	"context"
	"errors"
	"fmt"

	"github.com/stripe/stripe-go/v82"
)

var CreatePortalSessionError = errors.New("Failed to create billing portal session")

type CreatePortalSessionArgs struct {
	StripeCustomerID string
	ReturnURL        string
}

func (s *Service) CreatePortalSession(ctx context.Context, args CreatePortalSessionArgs) (*stripe.BillingPortalSession, error) {
	params := &stripe.BillingPortalSessionCreateParams{
		Customer:  stripe.String(args.StripeCustomerID),
		ReturnURL: stripe.String(args.ReturnURL),
	}
	s.stripe.ApplyAccount(params)

	sess, err := s.stripe.Stripe.V1BillingPortalSessions.Create(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("%w: %w", CreatePortalSessionError, err)
	}
	return sess, nil
}
