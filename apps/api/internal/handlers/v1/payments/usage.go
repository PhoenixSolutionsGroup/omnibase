package payments

import (
	"errors"
	"fmt"

	"github.com/gin-gonic/gin"

	"api/internal/handlers"
	"api/internal/services/billing"
)

var RecordUsageError = errors.New("Failed to record usage")

type RecordUsageRequest struct {
	MeterEventName string `json:"meter_event_name" binding:"required,min=1"`
	Value          string `json:"value" binding:"required,min=1"`
}

func (h *Handler) RecordUsage(ctx *gin.Context) {
	var req RecordUsageRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		handlers.NewBadRequestResponse(ctx, "Request payload incorrect")
		return
	}
	customerID, exists := ctx.Get("stripe_customer_id")
	if !exists || customerID == nil {
		handlers.NewBadRequestResponse(ctx, "stripe_customer_id not found in context")
		return
	}
	if err := h.billing.RecordUsage(ctx.Request.Context(), billing.RecordUsageArgs{
		MeterEventName:   req.MeterEventName,
		StripeCustomerID: customerID.(string),
		Value:            req.Value,
	}); err != nil {
		if !handlers.HandleStripeError(ctx, err) {
			handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", RecordUsageError, err))
		}
		return
	}
	handlers.NewSuccessResponse(ctx, nil)
}
