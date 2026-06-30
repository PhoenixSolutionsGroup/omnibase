package billing

import (
	"context"
	"errors"
	"fmt"

	"github.com/stripe/stripe-go/v82"
)

var ListUsageError = errors.New("Failed to list meter usage")

type ListUsageArgs struct {
	MeterID             string
	StripeCustomerID    string
	StartTime           int64
	EndTime             int64
	ValueGroupingWindow string
}

type UsageSummary struct {
	AggregatedValue float64
	StartTime       int64
	EndTime         int64
}

func (s *Service) ListUsage(ctx context.Context, args ListUsageArgs) ([]UsageSummary, error) {
	params := &stripe.BillingMeterEventSummaryListParams{
		ID:        stripe.String(args.MeterID),
		Customer:  stripe.String(args.StripeCustomerID),
		StartTime: stripe.Int64(args.StartTime),
		EndTime:   stripe.Int64(args.EndTime),
	}
	if args.ValueGroupingWindow != "" {
		params.ValueGroupingWindow = stripe.String(args.ValueGroupingWindow)
	}
	s.stripe.ApplyAccount(params)

	var out []UsageSummary
	iter := s.stripe.Stripe.V1BillingMeterEventSummaries.List(ctx, params)
	for sum, err := range iter {
		if err != nil {
			return nil, fmt.Errorf("%w: %w", ListUsageError, err)
		}
		out = append(out, UsageSummary{
			AggregatedValue: sum.AggregatedValue,
			StartTime:       sum.StartTime,
			EndTime:         sum.EndTime,
		})
	}
	return out, nil
}
