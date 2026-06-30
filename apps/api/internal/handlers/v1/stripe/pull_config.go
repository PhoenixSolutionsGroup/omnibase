package stripe

import (
	"context"
	"errors"
	"fmt"

	"github.com/danielgtaylor/huma/v2"

	"api/internal/handlers"
	"api/internal/services/stripe_config"
)

var PullConfigError = errors.New("Failed to pull stripe configuration")

type PullConfigInput struct {
	handlers.AuthCtx
}

type PullConfigOutput struct {
	Body *stripe_config.Configuration
}

func (h *Handler) PullConfig(ctx context.Context, _ *PullConfigInput) (*PullConfigOutput, error) {
	config, err := h.stripeConfig.Pull(ctx)
	if err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", PullConfigError, err).Error())
	}
	return &PullConfigOutput{Body: config}, nil
}
