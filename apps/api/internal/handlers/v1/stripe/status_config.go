package stripe

import (
	"context"
	"errors"
	"fmt"

	"github.com/danielgtaylor/huma/v2"

	"api/internal/services/stripe_config"
)

var GetConfigStatusError = errors.New("Failed to get stripe config status")

type GetConfigStatusInput struct {
	Body stripe_config.ConfigData
}

type GetConfigStatusOutput struct {
	Body *stripe_config.ConfigStatus
}

func (h *Handler) GetConfigStatus(ctx context.Context, in *GetConfigStatusInput) (*GetConfigStatusOutput, error) {
	parsed, err := h.stripeConfig.ParseAndValidate(in.Body)
	if err != nil {
		return nil, huma.Error400BadRequest(err.Error())
	}

	status, err := h.stripeConfig.Status(ctx, parsed)
	if err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", GetConfigStatusError, err).Error())
	}
	return &GetConfigStatusOutput{Body: status}, nil
}
