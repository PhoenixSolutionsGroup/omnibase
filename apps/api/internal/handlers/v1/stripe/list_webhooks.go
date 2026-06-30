package stripe

import (
	"errors"
	"fmt"

	"github.com/gin-gonic/gin"

	"api/internal/database/repository"
	"api/internal/handlers"
)

var ListWebhooksError = errors.New("Failed to list stripe webhooks")

type ListWebhooksResponse struct {
	Webhooks []repository.ListStripeWebhooksRow `json:"webhooks"`
	Count    int                                `json:"count"`
}

func (h *Handler) ListWebhooks(ctx *gin.Context) {
	webhooks, err := h.stripeConfig.ListWebhooks(ctx.Request.Context())
	if err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", ListWebhooksError, err))
		return
	}
	handlers.NewSuccessResponse(ctx, ListWebhooksResponse{
		Webhooks: webhooks,
		Count:    len(webhooks),
	})
}
