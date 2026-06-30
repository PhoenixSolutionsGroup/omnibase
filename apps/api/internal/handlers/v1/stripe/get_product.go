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

var GetProductError = errors.New("Failed to get product by id")

type GetProductResponse struct {
	Product stripe_config.ProductWithStripeIDs `json:"product" required:"true"`
}

type GetProductInput struct {
	handlers.AuthCtx
	ProductID string `path:"product_id"`
}

type GetProductOutput struct {
	Body GetProductResponse
}

func (h *Handler) GetProductByID(ctx context.Context, in *GetProductInput) (*GetProductOutput, error) {
	if in.ProductID == "" {
		return nil, huma.Error400BadRequest("product_id is required")
	}
	row, err := h.repo.GetLatestStripeConfig(ctx)
	if err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", GetProductError, err).Error())
	}
	var raw stripe_config.ConfigData
	if err := json.Unmarshal(row.Config, &raw); err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", GetProductError, err).Error())
	}
	parsed, err := h.stripeConfig.ParseAndValidate(raw)
	if err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", GetProductError, err).Error())
	}
	configWithIDs := h.addStripeIDsToConfig(ctx, *parsed, row.ID)
	for _, p := range configWithIDs.Products {
		if p.ID == in.ProductID {
			return &GetProductOutput{Body: GetProductResponse{Product: p}}, nil
		}
	}
	return nil, huma.Error404NotFound(fmt.Sprintf("Product not found: %s", in.ProductID))
}
