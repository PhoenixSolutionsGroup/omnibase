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

var GetPriceError = errors.New("Failed to get price by id")

type GetPriceResponse struct {
	Price   stripe_config.PriceWithStripeID    `json:"price" required:"true"`
	Product stripe_config.ProductWithStripeIDs `json:"product" required:"true"`
}

type GetPriceInput struct {
	handlers.AuthCtx
	PriceID string `path:"price_id"`
}

type GetPriceOutput struct {
	Body GetPriceResponse
}

func (h *Handler) GetPriceByID(ctx context.Context, in *GetPriceInput) (*GetPriceOutput, error) {
	if in.PriceID == "" {
		return nil, huma.Error400BadRequest("price_id is required")
	}
	row, err := h.repo.GetLatestStripeConfig(ctx)
	if err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", GetPriceError, err).Error())
	}
	var raw stripe_config.ConfigData
	if err := json.Unmarshal(row.Config, &raw); err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", GetPriceError, err).Error())
	}
	parsed, err := h.stripeConfig.ParseAndValidate(raw)
	if err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", GetPriceError, err).Error())
	}
	configWithIDs := h.addStripeIDsToConfig(ctx, *parsed, row.ID)
	for _, p := range configWithIDs.Products {
		for _, price := range p.Prices {
			if price.ID == in.PriceID {
				return &GetPriceOutput{Body: GetPriceResponse{Price: price, Product: p}}, nil
			}
		}
	}
	return nil, huma.Error404NotFound(fmt.Sprintf("Price not found: %s", in.PriceID))
}
