package stripe

import (
	"encoding/json"
	"errors"
	"fmt"

	"github.com/gin-gonic/gin"

	"api/internal/handlers"
	"api/internal/services/stripe_config"
)

var GetConfigAdminError = errors.New("Failed to get stripe configuration (admin)")

func (h *Handler) GetConfigAdmin(ctx *gin.Context) {
	row, err := h.repo.GetLatestStripeConfig(ctx.Request.Context())
	if err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", GetConfigAdminError, err))
		return
	}
	var raw stripe_config.ConfigData
	if err := json.Unmarshal(row.Config, &raw); err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", GetConfigAdminError, err))
		return
	}
	parsed, err := h.stripeConfig.ParseAndValidate(raw)
	if err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", GetConfigAdminError, err))
		return
	}
	configWithIDs := h.addStripeIDsToConfig(ctx.Request.Context(), *parsed, row.ID)

	handlers.NewSuccessResponse(ctx, StripeConfigResponse{
		ID:        row.ID,
		Config:    configWithIDs,
		Version:   row.Version,
		CreatedAt: row.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt: row.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	})
}
