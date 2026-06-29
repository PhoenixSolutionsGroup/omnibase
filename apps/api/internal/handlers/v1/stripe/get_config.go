package stripe

import (
	"encoding/json"
	"errors"
	"fmt"

	"github.com/gin-gonic/gin"

	"api/internal/handlers"
	"api/internal/models"
)

var GetConfigError = errors.New("Failed to get stripe configuration")

func (h *Handler) GetConfig(ctx *gin.Context) {
	row, err := h.repo.GetLatestStripeConfig(ctx.Request.Context())
	if err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", GetConfigError, err))
		return
	}
	var raw models.StripeConfigData
	if err := json.Unmarshal(row.Config, &raw); err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", GetConfigError, err))
		return
	}
	parsed, err := h.stripeConfig.ParseAndValidate(raw)
	if err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", GetConfigError, err))
		return
	}
	publicConfig := filterPublicPrices(*parsed)
	configWithIDs := h.addStripeIDsToConfig(ctx.Request.Context(), publicConfig, row.ID)

	handlers.NewSuccessResponse(ctx, StripeConfigResponse{
		ID:        row.ID,
		Config:    configWithIDs,
		Version:   row.Version,
		CreatedAt: row.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt: row.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	})
}
