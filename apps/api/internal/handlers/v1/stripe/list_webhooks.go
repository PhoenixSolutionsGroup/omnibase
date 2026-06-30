package stripe

import (
	"context"
	"errors"
	"fmt"

	"github.com/danielgtaylor/huma/v2"

	"api/internal/database/repository"
	"api/internal/handlers"
)

var ListWebhooksError = errors.New("Failed to list stripe webhooks")

type ListWebhooksResponse struct {
	Webhooks []repository.ListStripeWebhooksRow `json:"webhooks"`
	Count    int                                `json:"count"`
}

type ListWebhooksInput struct {
	handlers.AuthCtx
}

type ListWebhooksOutput struct {
	Body ListWebhooksResponse
}

func (h *Handler) ListWebhooks(ctx context.Context, _ *ListWebhooksInput) (*ListWebhooksOutput, error) {
	webhooks, err := h.stripeConfig.ListWebhooks(ctx)
	if err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", ListWebhooksError, err).Error())
	}
	return &ListWebhooksOutput{Body: ListWebhooksResponse{
		Webhooks: webhooks,
		Count:    len(webhooks),
	}}, nil
}
