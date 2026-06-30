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

var BillingStatusError = errors.New("Failed to check billing status")

type BillingStatusResponse struct {
	IsActive bool `json:"is_active"`
}

type BillingStatusInput struct {
	handlers.AuthCtx
}

type BillingStatusOutput struct {
	Body BillingStatusResponse
}

func (h *Handler) BillingStatus(ctx context.Context, in *BillingStatusInput) (*BillingStatusOutput, error) {
	if in.TenantID == uuid.Nil {
		return nil, huma.Error401Unauthorized("User not authenticated")
	}

	row, err := h.repo.GetTenantByID(ctx, in.TenantID.String())
	if err != nil {
		return nil, huma.Error404NotFound("Tenant not found")
	}
	if row.StripeCustomerID == nil || *row.StripeCustomerID == "" {
		return &BillingStatusOutput{Body: BillingStatusResponse{IsActive: false}}, nil
	}

	active, err := h.billing.CheckBillingStatus(ctx, *row.StripeCustomerID)
	if err != nil {
		logger.Logger.Error("check billing status failed", "tenant_id", in.TenantID, "error", err)
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", BillingStatusError, err).Error())
	}
	return &BillingStatusOutput{Body: BillingStatusResponse{IsActive: active}}, nil
}
