package stripe

import (
	"encoding/json"
	"errors"
	"fmt"

	"github.com/gin-gonic/gin"

	"api/internal/handlers"
	"api/internal/models"
)

var GetPriceError = errors.New("Failed to get price by id")

type GetPriceResponse struct {
	Price   models.PriceWithStripeID    `json:"price" binding:"required"`
	Product models.ProductWithStripeIDs `json:"product" binding:"required"`
}

func (h *Handler) GetPriceByID(ctx *gin.Context) {
	priceID := ctx.Param("price_id")
	if priceID == "" {
		handlers.NewBadRequestResponse(ctx, "price_id is required")
		return
	}
	row, err := h.repo.GetLatestStripeConfig(ctx.Request.Context())
	if err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", GetPriceError, err))
		return
	}
	var raw models.StripeConfigData
	if err := json.Unmarshal(row.Config, &raw); err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", GetPriceError, err))
		return
	}
	parsed, err := h.stripeConfig.ParseAndValidate(raw)
	if err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", GetPriceError, err))
		return
	}
	configWithIDs := h.addStripeIDsToConfig(ctx.Request.Context(), *parsed, row.ID)
	for _, p := range configWithIDs.Products {
		for _, price := range p.Prices {
			if price.ID == priceID {
				handlers.NewSuccessResponse(ctx, GetPriceResponse{Price: price, Product: p})
				return
			}
		}
	}
	handlers.NewNotFoundResponse(ctx, fmt.Sprintf("Price not found: %s", priceID))
}
