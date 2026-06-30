package stripe

import (
	"encoding/json"
	"errors"
	"fmt"

	"github.com/gin-gonic/gin"

	"api/internal/handlers"
	"api/internal/services/stripe_config"
)

var GetProductError = errors.New("Failed to get product by id")

type GetProductResponse struct {
	Product stripe_config.ProductWithStripeIDs `json:"product" binding:"required"`
}

func (h *Handler) GetProductByID(ctx *gin.Context) {
	productID := ctx.Param("product_id")
	if productID == "" {
		handlers.NewBadRequestResponse(ctx, "product_id is required")
		return
	}
	row, err := h.repo.GetLatestStripeConfig(ctx.Request.Context())
	if err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", GetProductError, err))
		return
	}
	var raw stripe_config.ConfigData
	if err := json.Unmarshal(row.Config, &raw); err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", GetProductError, err))
		return
	}
	parsed, err := h.stripeConfig.ParseAndValidate(raw)
	if err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", GetProductError, err))
		return
	}
	configWithIDs := h.addStripeIDsToConfig(ctx.Request.Context(), *parsed, row.ID)
	for _, p := range configWithIDs.Products {
		if p.ID == productID {
			handlers.NewSuccessResponse(ctx, GetProductResponse{Product: p})
			return
		}
	}
	handlers.NewNotFoundResponse(ctx, fmt.Sprintf("Product not found: %s", productID))
}
