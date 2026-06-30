package subscriptions

import (
	"context"
	"errors"
	"fmt"

	"github.com/danielgtaylor/huma/v2"
	"github.com/google/uuid"

	"api/internal/handlers"
	"api/internal/logger"
)

var GetSubscriptionError = errors.New("Failed to get tenant subscription")

type GetInput struct {
	handlers.AuthCtx
	ConfigPriceID string `path:"config_price_id"`
}

type GetOutput struct {
	Body SubscriptionResponse
}

func (h *Handler) Get(ctx context.Context, in *GetInput) (*GetOutput, error) {
	if in.TenantID == uuid.Nil {
		return nil, huma.Error401Unauthorized("User not authenticated")
	}

	if in.ConfigPriceID == "" {
		return nil, huma.Error400BadRequest("config_price_id is required")
	}

	row, err := h.repo.GetTenantByID(ctx, in.TenantID.String())
	if err != nil {
		return nil, huma.Error404NotFound("Tenant not found")
	}
	if row.StripeCustomerID == nil || *row.StripeCustomerID == "" {
		return nil, huma.Error404NotFound(fmt.Sprintf("No subscription found for plan: %s", in.ConfigPriceID))
	}

	sub, err := h.billing.GetTenantSubscription(ctx, *row.StripeCustomerID, in.ConfigPriceID)
	if err != nil {
		logger.Logger.Error("get subscription failed", "tenant_id", in.TenantID, "error", err)
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", GetSubscriptionError, err).Error())
	}
	if sub == nil {
		return nil, huma.Error404NotFound(fmt.Sprintf("No subscription found for plan: %s", in.ConfigPriceID))
	}
	return &GetOutput{Body: SubscriptionResponse(*sub)}, nil
}
