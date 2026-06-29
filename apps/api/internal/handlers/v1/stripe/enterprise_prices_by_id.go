package stripe

import (
	"errors"
	"fmt"

	"github.com/gin-gonic/gin"

	"api/internal/handlers"
	"api/internal/models"
)

var GetPricesByEnterpriseIDError = errors.New("Failed to list enterprise prices by id")

func (h *Handler) GetPricesByEnterpriseID(ctx *gin.Context) {
	parsed, err := h.latestParsedConfig(ctx.Request.Context())
	if err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", GetPricesByEnterpriseIDError, err))
		return
	}
	enterpriseID := ctx.Param("enterprise_id")
	prices := h.collectEnterprisePrices(ctx.Request.Context(), parsed, func(p models.Price) bool {
		return p.EnterpriseID == enterpriseID
	})
	handlers.NewSuccessResponse(ctx, EnterprisePricesResponse{Prices: prices, Count: len(prices)})
}
