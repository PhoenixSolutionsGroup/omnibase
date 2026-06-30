package stripe

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/danielgtaylor/huma/v2"

	"api/internal/handlers"
	"api/internal/services/stripe_config"
)

var UpdateConfigError = errors.New("Failed to update stripe configuration")

type UpdateConfigInput struct {
	handlers.AuthCtx
	Body stripe_config.ConfigData
}

type UpdateConfigOutput struct {
	Body *stripe_config.ConfigResponse
}

func (h *Handler) UpdateConfig(ctx context.Context, in *UpdateConfigInput) (*UpdateConfigOutput, error) {
	if len(in.Body) == 0 {
		return nil, huma.Error400BadRequest("Configuration data is required")
	}

	response, err := h.stripeConfig.Sync(ctx, stripe_config.SyncArgs{Config: in.Body})
	if err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", UpdateConfigError, err).Error())
	}
	if len(response.Errors) > 0 {
		return nil, huma.Error400BadRequest(strings.Join(response.Errors, "\n\n"))
	}
	return &UpdateConfigOutput{Body: response}, nil
}
