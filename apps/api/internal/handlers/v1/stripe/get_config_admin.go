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

var GetConfigAdminError = errors.New("Failed to get stripe configuration (admin)")

type GetConfigAdminInput struct {
	handlers.AuthCtx
}

type GetConfigAdminOutput struct {
	Body StripeConfigResponse
}

func (h *Handler) GetConfigAdmin(ctx context.Context, _ *GetConfigAdminInput) (*GetConfigAdminOutput, error) {
	row, err := h.repo.GetLatestStripeConfig(ctx)
	if err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", GetConfigAdminError, err).Error())
	}
	var raw stripe_config.ConfigData
	if err := json.Unmarshal(row.Config, &raw); err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", GetConfigAdminError, err).Error())
	}
	parsed, err := h.stripeConfig.ParseAndValidate(raw)
	if err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", GetConfigAdminError, err).Error())
	}
	configWithIDs := h.addStripeIDsToConfig(ctx, *parsed, row.ID)

	return &GetConfigAdminOutput{Body: StripeConfigResponse{
		ID:        row.ID,
		Config:    configWithIDs,
		Version:   row.Version,
		CreatedAt: row.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt: row.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}}, nil
}
