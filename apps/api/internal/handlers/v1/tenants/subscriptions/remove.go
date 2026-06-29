package subscriptions

import (
	"errors"
	"fmt"

	"github.com/gin-gonic/gin"

	"api/internal/handlers"
	"api/internal/logger"
	"api/internal/services/billing"
)

var RemoveSubscriptionError = errors.New("Failed to remove tenant subscription")

type RemoveRequest struct {
	PlanID           string `json:"plan_id" binding:"required,min=1" example:"price_test_basic"`
	StripeCustomerID string `json:"stripe_customer_id,omitempty" binding:"omitempty,min=1" example:"cus_test_123"`
}

type RemoveResponse struct {
	SubscriptionID string `json:"subscription_id"`
	Status         string `json:"status"`
	Message        string `json:"message"`
}

func (h *Handler) Remove(ctx *gin.Context) {
	tenantID := ctx.GetString("tenant_id")
	if tenantID == "" {
		handlers.NewUnauthorizedResponse(ctx, "User not authenticated")
		return
	}

	var req RemoveRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		handlers.NewBadRequestResponse(ctx, "Invalid JSON format")
		return
	}

	customerID := req.StripeCustomerID
	if customerID == "" {
		row, err := h.repo.GetTenantByID(ctx.Request.Context(), tenantID)
		if err != nil {
			handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Tenant not found: %w", err))
			return
		}
		if row.StripeCustomerID == nil || *row.StripeCustomerID == "" {
			handlers.NewBadRequestResponse(ctx, "Tenant does not have a Stripe customer ID")
			return
		}
		customerID = *row.StripeCustomerID
	}

	err := h.billing.RemoveTenantSubscription(ctx.Request.Context(), billing.RemoveTenantSubscriptionArgs{
		StripeCustomerID: customerID,
		ConfigPriceID:    req.PlanID,
	})
	if err != nil {
		if errors.Is(err, billing.RemoveTenantSubscriptionNotFound) {
			handlers.NewNotFoundResponse(ctx, fmt.Sprintf("No active subscription found for plan: %s", req.PlanID))
			return
		}
		logger.Logger.Error("remove subscription failed", "tenant_id", tenantID, "error", err)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", RemoveSubscriptionError, err))
		return
	}

	handlers.NewSuccessResponse(ctx, &RemoveResponse{
		Status:  "canceled",
		Message: "Subscription canceled successfully",
	})
}
