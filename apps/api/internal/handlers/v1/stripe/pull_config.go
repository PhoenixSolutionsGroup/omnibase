package stripe

import (
	"errors"
	"fmt"

	"github.com/gin-gonic/gin"

	"api/internal/handlers"
)

var PullConfigError = errors.New("Failed to pull stripe configuration")

func (h *Handler) PullConfig(ctx *gin.Context) {
	config, err := h.stripeConfig.Pull(ctx.Request.Context())
	if err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", PullConfigError, err))
		return
	}
	handlers.NewSuccessResponse(ctx, config)
}
