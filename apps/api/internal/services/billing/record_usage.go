package billing

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/stripe/stripe-go/v82"
)

var RecordUsageError = errors.New("Failed to record usage event")

type RecordUsageArgs struct {
	MeterEventName   string
	StripeCustomerID string
	Value            string
}

func (s *Service) RecordUsage(ctx context.Context, args RecordUsageArgs) error {
	params := &stripe.BillingMeterEventCreateParams{
		EventName: stripe.String(args.MeterEventName),
		Payload: map[string]string{
			"stripe_customer_id": args.StripeCustomerID,
			"value":              args.Value,
		},
		Timestamp: stripe.Int64(time.Now().Unix()),
	}
	s.stripe.ApplyAccount(params)

	if _, err := s.stripe.Stripe.V1BillingMeterEvents.Create(ctx, params); err != nil {
		return fmt.Errorf("%w: %w", RecordUsageError, err)
	}
	return nil
}
