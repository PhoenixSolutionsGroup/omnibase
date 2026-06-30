package subscriptions

import (
	"errors"
	"fmt"

	"github.com/gin-gonic/gin"

	"api/internal/handlers"
	"api/internal/logger"
)

var GetSubscriptionError = errors.New("Failed to get tenant subscription")

func (h *Handler) Get(ctx *gin.Context) {
	tenantID := ctx.GetString("tenant_id")
	if tenantID == "" {
		handlers.NewUnauthorizedResponse(ctx, "User not authenticated")
		return
	}

	configPriceID := ctx.Param("config_price_id")
	if configPriceID == "" {
		handlers.NewBadRequestResponse(ctx, "config_price_id is required")
		return
	}

	row, err := h.repo.GetTenantByID(ctx.Request.Context(), tenantID)
	if err != nil {
		handlers.NewNotFoundResponse(ctx, "Tenant not found")
		return
	}
	if row.StripeCustomerID == nil || *row.StripeCustomerID == "" {
		handlers.NewNotFoundResponse(ctx, fmt.Sprintf("No subscription found for plan: %s", configPriceID))
		return
	}

	sub, err := h.billing.GetTenantSubscription(ctx.Request.Context(), *row.StripeCustomerID, configPriceID)
	if err != nil {
		logger.Logger.Error("get subscription failed", "tenant_id", tenantID, "error", err)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", GetSubscriptionError, err))
		return
	}
	if sub == nil {
		handlers.NewNotFoundResponse(ctx, fmt.Sprintf("No subscription found for plan: %s", configPriceID))
		return
	}
	handlers.NewSuccessResponse(ctx, SubscriptionResponse(*sub))
}
