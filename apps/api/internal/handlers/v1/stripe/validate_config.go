package stripe

import (
	"context"

	"github.com/danielgtaylor/huma/v2"

	"api/internal/handlers"
	"api/internal/services/stripe_config"
)

type ValidateConfigInput struct {
	handlers.AuthCtx
	Body stripe_config.ConfigData
}

type ValidateConfigOutput struct {
	Body string
}

func (h *Handler) ValidateConfig(_ context.Context, in *ValidateConfigInput) (*ValidateConfigOutput, error) {
	if _, err := h.stripeConfig.ParseAndValidate(in.Body); err != nil {
		return nil, huma.Error400BadRequest(err.Error())
	}
	return &ValidateConfigOutput{Body: ""}, nil
}
