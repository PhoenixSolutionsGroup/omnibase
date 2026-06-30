package payments

import (
	"context"
	"errors"
	"fmt"

	"github.com/danielgtaylor/huma/v2"

	"api/internal/handlers"
	"api/internal/services/billing"
)

var RecordUsageError = errors.New("Failed to record usage")

type RecordUsageRequest struct {
	MeterEventName string `json:"meter_event_name" required:"true" minLength:"1"`
	Value          string `json:"value" required:"true" minLength:"1"`
}

type RecordUsageInput struct {
	PaymentsCtx
	Body RecordUsageRequest
}

type RecordUsageOutput struct {
	Body any
}

func (h *Handler) RecordUsage(ctx context.Context, in *RecordUsageInput) (*RecordUsageOutput, error) {
	if in.StripeCustomerID == "" {
		return nil, huma.Error400BadRequest("stripe_customer_id not found in context")
	}

	if err := h.billing.RecordUsage(ctx, billing.RecordUsageArgs{
		MeterEventName:   in.Body.MeterEventName,
		StripeCustomerID: in.StripeCustomerID,
		Value:            in.Body.Value,
	}); err != nil {
		if mapped := handlers.StripeError(err); mapped != nil {
			return nil, mapped
		}
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", RecordUsageError, err).Error())
	}
	return &RecordUsageOutput{}, nil
}
