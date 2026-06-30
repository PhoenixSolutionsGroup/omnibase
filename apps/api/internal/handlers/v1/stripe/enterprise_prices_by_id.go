package stripe

import (
	"context"
	"errors"
	"fmt"

	"github.com/danielgtaylor/huma/v2"

	"api/internal/handlers"
	"api/internal/services/stripe_config"
)

var GetPricesByEnterpriseIDError = errors.New("Failed to list enterprise prices by id")

type GetPricesByEnterpriseIDInput struct {
	handlers.AuthCtx
	EnterpriseID string `path:"enterprise_id"`
}

type GetPricesByEnterpriseIDOutput struct {
	Body EnterprisePricesResponse
}

func (h *Handler) GetPricesByEnterpriseID(ctx context.Context, in *GetPricesByEnterpriseIDInput) (*GetPricesByEnterpriseIDOutput, error) {
	parsed, err := h.latestParsedConfig(ctx)
	if err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", GetPricesByEnterpriseIDError, err).Error())
	}
	prices := h.collectEnterprisePrices(ctx, parsed, func(p stripe_config.Price) bool {
		return p.EnterpriseID == in.EnterpriseID
	})
	return &GetPricesByEnterpriseIDOutput{Body: EnterprisePricesResponse{Prices: prices, Count: len(prices)}}, nil
}
