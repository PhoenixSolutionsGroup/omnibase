package stripe

import (
	"github.com/gin-gonic/gin"

	"api/internal/handlers"
	"api/internal/models"
)

func (h *Handler) ValidateConfig(ctx *gin.Context) {
	var configData models.StripeConfigData
	if err := ctx.ShouldBindJSON(&configData); err != nil {
		handlers.NewBadRequestResponse(ctx, "Invalid JSON format")
		return
	}
	if _, err := h.stripeConfig.ParseAndValidate(configData); err != nil {
		handlers.NewBadRequestResponse(ctx, err.Error())
		return
	}
	handlers.NewSuccessResponse(ctx, "")
}
