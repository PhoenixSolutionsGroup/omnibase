package payments

import (
	"errors"
	"fmt"

	"github.com/gin-gonic/gin"

	"api/internal/handlers"
	"api/internal/services/billing"
)

var CreatePortalError = errors.New("Failed to create customer portal session")

type CreatePortalRequest struct {
	ReturnURL string `json:"return_url" binding:"required,min=1"`
}

type CreatePortalResponse struct {
	URL string `json:"url" binding:"required"`
}

func (h *Handler) CreateCustomerPortal(ctx *gin.Context) {
	var req CreatePortalRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		handlers.NewBadRequestResponse(ctx, "Request payload incorrect")
		return
	}
	customerID, exists := ctx.Get("stripe_customer_id")
	if !exists || customerID == nil {
		handlers.NewBadRequestResponse(ctx, "stripe_customer_id not found in context")
		return
	}
	session, err := h.billing.CreatePortalSession(ctx.Request.Context(), billing.CreatePortalSessionArgs{
		StripeCustomerID: customerID.(string),
		ReturnURL:        req.ReturnURL,
	})
	if err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", CreatePortalError, err))
		return
	}
	handlers.NewSuccessResponse(ctx, &CreatePortalResponse{URL: session.URL})
}
