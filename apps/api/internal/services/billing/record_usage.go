package billing

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/stripe/stripe-go/v82"

	"api/internal/services/stripe_config"
)

var RecordUsageError = errors.New("Failed to record usage event")

const (
	defaultUsageCustomerPayloadKey = "stripe_customer_id"
	defaultUsageValuePayloadKey    = "value"
)

type RecordUsageArgs struct {
	MeterEventName   string
	StripeCustomerID string
	Value            string
	IdempotencyKey   string
}

func (s *Service) RecordUsage(ctx context.Context, args RecordUsageArgs) error {
	customerKey, valueKey, err := s.usagePayloadKeys(ctx, args.MeterEventName)
	if err != nil {
		return fmt.Errorf("%w: %w", RecordUsageError, err)
	}

	params := &stripe.BillingMeterEventCreateParams{
		EventName: stripe.String(args.MeterEventName),
		Payload: map[string]string{
			customerKey: args.StripeCustomerID,
			valueKey:    args.Value,
		},
		Timestamp: stripe.Int64(time.Now().Unix()),
	}
	if args.IdempotencyKey != "" {
		params.Identifier = stripe.String(args.IdempotencyKey)
	}
	s.stripe.ApplyAccount(params)

	if _, err := s.stripe.Stripe.V1BillingMeterEvents.Create(ctx, params); err != nil {
		return fmt.Errorf("%w: %w", RecordUsageError, err)
	}
	return nil
}

func (s *Service) usagePayloadKeys(ctx context.Context, eventName string) (string, string, error) {
	customerKey := defaultUsageCustomerPayloadKey
	valueKey := defaultUsageValuePayloadKey

	row, err := s.repo.GetLatestStripeConfig(ctx)
	if errors.Is(err, sql.ErrNoRows) {
		return customerKey, valueKey, nil
	}
	if err != nil {
		return "", "", fmt.Errorf("failed to load active stripe config: %w", err)
	}
	if len(row.Config) == 0 {
		return customerKey, valueKey, nil
	}

	var config stripe_config.StripeConfiguration
	if err := json.Unmarshal(row.Config, &config); err != nil {
		return "", "", fmt.Errorf("failed to decode active stripe config: %w", err)
	}

	for _, meter := range config.Meters {
		if meter.EventName != eventName {
			continue
		}
		if meter.CustomerMapping != nil && meter.CustomerMapping.EventPayloadKey != "" {
			customerKey = meter.CustomerMapping.EventPayloadKey
		}
		if meter.ValueSettings != nil && meter.ValueSettings.EventPayloadKey != "" {
			valueKey = meter.ValueSettings.EventPayloadKey
		}
		break
	}

	return customerKey, valueKey, nil
}
