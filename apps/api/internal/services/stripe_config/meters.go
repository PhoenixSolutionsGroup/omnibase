package stripe_config

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/stripe/stripe-go/v82"

)

var CreateMeterError = errors.New("Failed to create stripe meter")

func (s *Service) createMeter(ctx context.Context, configID uuid.UUID, meterConfig Meter) (string, error) {
	if meterConfig.StripeID != "" {
		existing, err := s.GetMapping(ctx, meterConfig.ID, "meter")
		if err != nil {
			return "", err
		}
		if existing != nil {
			return existing.StripeID, nil
		}
		if configID != uuid.Nil {
			if err := s.SaveMapping(ctx, configID, meterConfig.ID, meterConfig.StripeID, "meter"); err != nil {
				return "", err
			}
		}
		return meterConfig.StripeID, nil
	}

	params := &stripe.BillingMeterCreateParams{
		DisplayName: stripe.String(meterConfig.DisplayName),
		EventName:   stripe.String(meterConfig.EventName),
		DefaultAggregation: &stripe.BillingMeterCreateDefaultAggregationParams{
			Formula: stripe.String(meterConfig.DefaultAggregation.Formula),
		},
	}
	if meterConfig.CustomerMapping != nil {
		params.CustomerMapping = &stripe.BillingMeterCreateCustomerMappingParams{
			EventPayloadKey: stripe.String(meterConfig.CustomerMapping.EventPayloadKey),
			Type:            stripe.String(meterConfig.CustomerMapping.Type),
		}
	} else {
		params.CustomerMapping = &stripe.BillingMeterCreateCustomerMappingParams{
			EventPayloadKey: stripe.String("stripe_customer_id"),
			Type:            stripe.String("by_id"),
		}
	}
	if meterConfig.ValueSettings != nil {
		params.ValueSettings = &stripe.BillingMeterCreateValueSettingsParams{
			EventPayloadKey: stripe.String(meterConfig.ValueSettings.EventPayloadKey),
		}
	} else {
		params.ValueSettings = &stripe.BillingMeterCreateValueSettingsParams{
			EventPayloadKey: stripe.String("value"),
		}
	}
	s.stripe.ApplyAccount(params)

	result, err := s.stripe.Stripe.V1BillingMeters.Create(ctx, params)
	if err != nil {
		if stripeErr, ok := err.(*stripe.Error); ok {
			if stripeErr.Code == stripe.ErrorCodeResourceAlreadyExists ||
				strings.Contains(strings.ToLower(stripeErr.Msg), "active meter already exists") {
				existing, findErr := s.findMeterByEventName(ctx, meterConfig.EventName)
				if findErr != nil {
					return "", fmt.Errorf("meter already exists but failed to find it: %w", findErr)
				}
				if existing != nil {
					if configID != uuid.Nil {
						if err := s.SaveMapping(ctx, configID, meterConfig.ID, existing.ID, "meter"); err != nil {
							return "", err
						}
					}
					return existing.ID, nil
				}
			}
		}
		return "", fmt.Errorf("%w: %w", CreateMeterError, err)
	}

	if configID != uuid.Nil {
		if err := s.SaveMapping(ctx, configID, meterConfig.ID, result.ID, "meter"); err != nil {
			return "", err
		}
	}
	return result.ID, nil
}

func (s *Service) deactivateMeter(ctx context.Context, stripeID string) (*MeterChange, error) {
	getParams := &stripe.BillingMeterRetrieveParams{}
	s.stripe.ApplyAccount(getParams)
	meterDetails, err := s.stripe.Stripe.V1BillingMeters.Retrieve(ctx, stripeID, getParams)
	if err != nil {
		return nil, fmt.Errorf("failed to get meter details before deactivation: %w", err)
	}

	params := &stripe.BillingMeterDeactivateParams{}
	s.stripe.ApplyAccount(params)
	if _, err := s.stripe.Stripe.V1BillingMeters.Deactivate(ctx, stripeID, params); err != nil {
		if stripeErr, ok := err.(*stripe.Error); ok && stripeErr.Msg == "meter_already_deactivated" {
			// idempotent — fall through to return success
		} else {
			return nil, fmt.Errorf("failed to deactivate meter %s: %w", stripeID, err)
		}
	}
	return &MeterChange{
		MeterID:     stripeID,
		DisplayName: meterDetails.DisplayName,
		Action:      "archived",
		StripeID:    stripeID,
	}, nil
}

func (s *Service) findMeterByEventName(ctx context.Context, eventName string) (*stripe.BillingMeter, error) {
	params := &stripe.BillingMeterListParams{
		Status: stripe.String("active"),
	}
	s.stripe.ApplyAccount(params)
	for m, err := range s.stripe.Stripe.V1BillingMeters.List(ctx, params) {
		if err != nil {
			return nil, fmt.Errorf("failed to list meters: %w", err)
		}
		if m.EventName == eventName {
			return m, nil
		}
	}
	return nil, nil
}
