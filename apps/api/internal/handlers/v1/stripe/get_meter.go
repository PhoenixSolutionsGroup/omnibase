package stripe

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/danielgtaylor/huma/v2"

	"api/internal/handlers"
	"api/internal/services/stripe_config"
)

var GetMeterError = errors.New("Failed to get meter by id")

type GetMeterResponse struct {
	Meter stripe_config.MeterWithStripeID `json:"meter" required:"true"`
}

type GetMeterInput struct {
	handlers.AuthCtx
	MeterID string `path:"meter_id"`
}

type GetMeterOutput struct {
	Body GetMeterResponse
}

func (h *Handler) GetMeterByID(ctx context.Context, in *GetMeterInput) (*GetMeterOutput, error) {
	if in.MeterID == "" {
		return nil, huma.Error400BadRequest("meter_id is required")
	}
	row, err := h.repo.GetLatestStripeConfig(ctx)
	if err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", GetMeterError, err).Error())
	}
	var raw stripe_config.ConfigData
	if err := json.Unmarshal(row.Config, &raw); err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", GetMeterError, err).Error())
	}
	parsed, err := h.stripeConfig.ParseAndValidate(raw)
	if err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", GetMeterError, err).Error())
	}
	configWithIDs := h.addStripeIDsToConfig(ctx, *parsed, row.ID)
	for _, m := range configWithIDs.Meters {
		if m.ID == in.MeterID {
			return &GetMeterOutput{Body: GetMeterResponse{Meter: m}}, nil
		}
	}
	return nil, huma.Error404NotFound(fmt.Sprintf("Meter not found: %s", in.MeterID))
}
