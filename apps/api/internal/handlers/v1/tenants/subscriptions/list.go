package subscriptions

import (
	"errors"
	"fmt"

	"github.com/gin-gonic/gin"

	"api/internal/handlers"
	"api/internal/logger"
)

var ListSubscriptionsError = errors.New("Failed to list tenant subscriptions")

type SubscriptionResponse struct {
	SubscriptionID     string `json:"subscription_id"`
	ConfigPriceID      string `json:"config_price_id"`
	Status             string `json:"status"`
	IsLegacyPrice      bool   `json:"is_legacy_price"`
	CurrentPeriodStart int64  `json:"current_period_start"`
	CurrentPeriodEnd   int64  `json:"current_period_end"`
	CancelAtPeriodEnd  bool   `json:"cancel_at_period_end"`
	CanceledAt         *int64 `json:"canceled_at,omitempty"`
	TrialStart         *int64 `json:"trial_start,omitempty"`
	TrialEnd           *int64 `json:"trial_end,omitempty"`
}

func (h *Handler) List(ctx *gin.Context) {
	tenantID := ctx.GetString("tenant_id")
	if tenantID == "" {
		handlers.NewUnauthorizedResponse(ctx, "User not authenticated")
		return
	}

	row, err := h.repo.GetTenantByID(ctx.Request.Context(), tenantID)
	if err != nil {
		logger.Logger.Error("tenant lookup failed", "tenant_id", tenantID, "error", err)
		handlers.NewNotFoundResponse(ctx, "Tenant not found")
		return
	}
	if row.StripeCustomerID == nil || *row.StripeCustomerID == "" {
		handlers.NewSuccessResponse(ctx, []SubscriptionResponse{})
		return
	}

	subs, err := h.billing.ListTenantSubscriptions(ctx.Request.Context(), *row.StripeCustomerID)
	if err != nil {
		logger.Logger.Error("list subscriptions failed", "tenant_id", tenantID, "error", err)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", ListSubscriptionsError, err))
		return
	}

	out := make([]SubscriptionResponse, 0, len(subs))
	for _, s := range subs {
		out = append(out, SubscriptionResponse(s))
	}
	handlers.NewSuccessResponse(ctx, out)
}
