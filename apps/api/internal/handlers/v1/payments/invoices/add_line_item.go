package invoices

import (
	"errors"
	"fmt"

	"github.com/gin-gonic/gin"

	"api/internal/handlers"
	"api/internal/services/billing"
)

var AddLineItemError = errors.New("Failed to add invoice line item")

type AddLineItemRequest struct {
	Amount      int64  `json:"amount" binding:"required"`
	Description string `json:"description" binding:"required,min=1"`
	Currency    string `json:"currency" binding:"required,len=3"`
}

func (h *Handler) AddLineItem(ctx *gin.Context) {
	invoiceID := ctx.Param("invoice_id")
	if invoiceID == "" {
		handlers.NewBadRequestResponse(ctx, "invoice_id is required")
		return
	}
	if !isValidInvoiceID(invoiceID) {
		handlers.NewBadRequestResponse(ctx, "Invalid invoice ID format: must start with 'in_'")
		return
	}
	var req AddLineItemRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		handlers.NewBadRequestResponse(ctx, "Request payload incorrect")
		return
	}
	customerID, exists := ctx.Get("stripe_customer_id")
	if !exists || customerID == nil {
		handlers.NewBadRequestResponse(ctx, "stripe_customer_id not found in context")
		return
	}
	item, err := h.billing.AddInvoiceLineItem(ctx.Request.Context(), billing.AddInvoiceLineItemArgs{
		InvoiceID:        invoiceID,
		StripeCustomerID: customerID.(string),
		Amount:           req.Amount,
		Currency:         req.Currency,
		Description:      req.Description,
	})
	if err != nil {
		if handlers.HandleStripeError(ctx, err) {
			return
		}
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", AddLineItemError, err))
		return
	}
	handlers.NewSuccessResponse(ctx, &InvoiceLineItemResponse{
		ID:          item.ID,
		Amount:      item.Amount,
		Description: item.Description,
	})
}
