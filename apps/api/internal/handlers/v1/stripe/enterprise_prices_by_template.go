package stripe

import (
	"context"
	"errors"
	"fmt"

	"github.com/gin-gonic/gin"

	"api/internal/handlers"
	"api/internal/models"
)

var GetPricesByTemplateError = errors.New("Failed to list enterprise prices by template")

type EnterprisePricesResponse struct {
	Prices []models.PriceWithStripeID `json:"prices"`
	Count  int                        `json:"count"`
}

func (h *Handler) GetPricesByTemplate(ctx *gin.Context) {
	parsed, err := h.latestParsedConfig(ctx.Request.Context())
	if err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", GetPricesByTemplateError, err))
		return
	}
	template := ctx.Param("template")
	prices := h.collectEnterprisePrices(ctx.Request.Context(), parsed, func(p models.Price) bool {
		return p.EnterpriseTemplate == template
	})
	handlers.NewSuccessResponse(ctx, EnterprisePricesResponse{Prices: prices, Count: len(prices)})
}

func (h *Handler) collectEnterprisePrices(ctx context.Context, parsed *models.StripeConfiguration, match func(p models.Price) bool) []models.PriceWithStripeID {
	out := []models.PriceWithStripeID{}
	for _, product := range parsed.Products {
		for _, price := range product.Prices {
			if !match(price) {
				continue
			}
			pwid := models.PriceWithStripeID{Price: price}
			if id, err := h.stripeConfig.GetStripeIDByConfigItemID(ctx, price.ID, "price"); err == nil && id != "" {
				pwid.StripeID = &id
			}
			out = append(out, pwid)
		}
	}
	return out
}
