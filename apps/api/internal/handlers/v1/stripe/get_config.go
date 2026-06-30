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

var GetConfigError = errors.New("Failed to get stripe configuration")

type GetConfigInput struct {
	handlers.AuthCtx
}

type GetConfigOutput struct {
	Body StripeConfigResponse
}

func (h *Handler) GetConfig(ctx context.Context, _ *GetConfigInput) (*GetConfigOutput, error) {
	row, err := h.repo.GetLatestStripeConfig(ctx)
	if err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", GetConfigError, err).Error())
	}
	var raw stripe_config.ConfigData
	if err := json.Unmarshal(row.Config, &raw); err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", GetConfigError, err).Error())
	}
	parsed, err := h.stripeConfig.ParseAndValidate(raw)
	if err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", GetConfigError, err).Error())
	}
	publicConfig := filterPublicPrices(*parsed)
	configWithIDs := h.addStripeIDsToConfig(ctx, publicConfig, row.ID)

	return &GetConfigOutput{Body: StripeConfigResponse{
		ID:        row.ID,
		Config:    configWithIDs,
		Version:   row.Version,
		CreatedAt: row.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt: row.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}}, nil
}
