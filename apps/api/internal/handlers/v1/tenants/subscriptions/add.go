package subscriptions

import (
	"errors"
	"fmt"

	"github.com/gin-gonic/gin"

	"api/internal/handlers"
	"api/internal/logger"
	"api/internal/services/billing"
)

var AddSubscriptionError = errors.New("Failed to add tenant subscription")

type AddRequest struct {
	PlanID           string `json:"plan_id" binding:"required,min=1" example:"price_test_basic"`
	StripeCustomerID string `json:"stripe_customer_id,omitempty" binding:"omitempty,min=1" example:"cus_test_123"`
	Quantity         int64  `json:"quantity,omitempty" example:"5"`
}

type AddResponse struct {
	SubscriptionID string `json:"subscription_id"`
	Status         string `json:"status"`
	Message        string `json:"message"`
}

func (h *Handler) Add(ctx *gin.Context) {
	tenantID := ctx.GetString("tenant_id")
	if tenantID == "" {
		handlers.NewUnauthorizedResponse(ctx, "User not authenticated")
		return
	}

	var req AddRequest
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

	result, err := h.billing.AddTenantSubscription(ctx.Request.Context(), billing.AddTenantSubscriptionArgs{
		StripeCustomerID: customerID,
		ConfigPriceID:    req.PlanID,
		Quantity:         req.Quantity,
	})
	if err != nil {
		switch {
		case errors.Is(err, billing.AddTenantSubscriptionPlanNotFound):
			handlers.NewNotFoundResponse(ctx, fmt.Sprintf("Plan not found: %s", req.PlanID))
		case errors.Is(err, billing.AddTenantSubscriptionDuplicate):
			handlers.NewBadRequestResponse(ctx, fmt.Sprintf("Subscription already exists for plan: %s", req.PlanID))
		default:
			logger.Logger.Error("add subscription failed", "tenant_id", tenantID, "error", err)
			handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", AddSubscriptionError, err))
		}
		return
	}

	handlers.NewSuccessResponse(ctx, &AddResponse{
		SubscriptionID: result.SubscriptionID,
		Status:         result.Status,
		Message:        "Subscription added successfully",
	})
}
