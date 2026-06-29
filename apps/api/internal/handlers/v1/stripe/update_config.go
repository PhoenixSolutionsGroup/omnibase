package stripe

import (
	"errors"
	"fmt"
	"strings"

	"github.com/gin-gonic/gin"

	"api/internal/handlers"
	"api/internal/models"
	"api/internal/services/stripe_config"
)

var UpdateConfigError = errors.New("Failed to update stripe configuration")

func (h *Handler) UpdateConfig(ctx *gin.Context) {
	var configData models.StripeConfigData
	if err := ctx.ShouldBindJSON(&configData); err != nil {
		handlers.NewBadRequestResponse(ctx, "Invalid JSON format")
		return
	}
	if len(configData) == 0 {
		handlers.NewBadRequestResponse(ctx, "Configuration data is required")
		return
	}

	response, err := h.stripeConfig.Sync(ctx.Request.Context(), stripe_config.SyncArgs{Config: configData})
	if err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", UpdateConfigError, err))
		return
	}
	if len(response.Errors) > 0 {
		handlers.NewBadRequestResponse(ctx, strings.Join(response.Errors, "\n\n"))
		return
	}
	handlers.NewSuccessResponse(ctx, response)
}
