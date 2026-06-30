package tenants

import (
	"errors"

	"api/internal/handlers"
	"api/internal/logger"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
)

func (h *Handler) GetTenantByStripeCustomerID(ctx *gin.Context) {
	stripeCustomerID := ctx.Param("stripe_customer_id")
	if stripeCustomerID == "" {
		handlers.NewBadRequestResponse(ctx, "stripe_customer_id is required")
		return
	}

	row, err := h.repo.GetTenantByStripeCustomerID(ctx.Request.Context(), &stripeCustomerID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			handlers.NewNotFoundResponse(ctx, "Tenant not found")
			return
		}
		logger.Logger.Error("Failed to fetch tenant by Stripe customer ID", "error", err, "stripe_customer_id", stripeCustomerID)
		handlers.NewInternalServerErrorResponse(ctx, err)
		return
	}

	handlers.NewSuccessResponse(ctx, row)
}
