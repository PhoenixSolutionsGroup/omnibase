package subscriptions

import (
	"errors"
	"fmt"

	"github.com/gin-gonic/gin"

	"api/internal/handlers"
	"api/internal/logger"
)

var BillingStatusError = errors.New("Failed to check billing status")

type BillingStatusResponse struct {
	IsActive bool `json:"is_active"`
}

func (h *Handler) BillingStatus(ctx *gin.Context) {
	tenantID := ctx.GetString("tenant_id")
	if tenantID == "" {
		handlers.NewUnauthorizedResponse(ctx, "User not authenticated")
		return
	}

	row, err := h.repo.GetTenantByID(ctx.Request.Context(), tenantID)
	if err != nil {
		handlers.NewNotFoundResponse(ctx, "Tenant not found")
		return
	}
	if row.StripeCustomerID == nil || *row.StripeCustomerID == "" {
		handlers.NewSuccessResponse(ctx, BillingStatusResponse{IsActive: false})
		return
	}

	active, err := h.billing.CheckBillingStatus(ctx.Request.Context(), *row.StripeCustomerID)
	if err != nil {
		logger.Logger.Error("check billing status failed", "tenant_id", tenantID, "error", err)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", BillingStatusError, err))
		return
	}
	handlers.NewSuccessResponse(ctx, BillingStatusResponse{IsActive: active})
}
