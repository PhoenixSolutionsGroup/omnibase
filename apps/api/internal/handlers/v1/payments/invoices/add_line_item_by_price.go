package invoices

import (
	"errors"
	"fmt"

	"github.com/gin-gonic/gin"

	"api/internal/handlers"
	"api/internal/services/billing"
)

var AddLineItemByPriceError = errors.New("Failed to add invoice line item by price")

type AddLineItemByPriceRequest struct {
	PriceID       string            `json:"price_id,omitempty"`
	StripePriceID string            `json:"stripe_price_id,omitempty"`
	Quantity      int64             `json:"quantity" binding:"required"`
	Description   string            `json:"description" binding:"required,min=1"`
	Currency      string            `json:"currency" binding:"required,len=3"`
	Metadata      map[string]string `json:"metadata,omitempty"`
}

func (h *Handler) AddLineItemByPrice(ctx *gin.Context) {
	invoiceID := ctx.Param("invoice_id")
	if invoiceID == "" {
		handlers.NewBadRequestResponse(ctx, "invoice_id is required")
		return
	}
	if !isValidInvoiceID(invoiceID) {
		handlers.NewBadRequestResponse(ctx, "Invalid invoice ID format: must start with 'in_'")
		return
	}
	var req AddLineItemByPriceRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		handlers.NewBadRequestResponse(ctx, "Request payload incorrect")
		return
	}
	if req.PriceID == "" && req.StripePriceID == "" {
		handlers.NewBadRequestResponse(ctx, "Either price_id or stripe_price_id is required")
		return
	}
	if req.PriceID != "" && req.StripePriceID != "" {
		handlers.NewBadRequestResponse(ctx, "Provide only one of price_id or stripe_price_id, not both")
		return
	}
	customerID, exists := ctx.Get("stripe_customer_id")
	if !exists || customerID == nil {
		handlers.NewBadRequestResponse(ctx, "stripe_customer_id not found in context")
		return
	}

	stripePriceID := req.StripePriceID
	if stripePriceID == "" {
		mapping, err := h.billing.GetMappingByConfigID(ctx.Request.Context(), req.PriceID, "price")
		if err != nil {
			handlers.NewNotFoundResponse(ctx, fmt.Sprintf("No Stripe price mapping found for config_id: %s", req.PriceID))
			return
		}
		stripePriceID = mapping.StripeID
	}

	item, err := h.billing.AddInvoiceLineItemByPrice(ctx.Request.Context(), billing.AddInvoiceLineItemByPriceArgs{
		InvoiceID:        invoiceID,
		StripeCustomerID: customerID.(string),
		StripePriceID:    stripePriceID,
		Quantity:         req.Quantity,
		Currency:         req.Currency,
		Description:      req.Description,
		Metadata:         req.Metadata,
	})
	if err != nil {
		if handlers.HandleStripeError(ctx, err) {
			return
		}
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", AddLineItemByPriceError, err))
		return
	}
	handlers.NewSuccessResponse(ctx, &InvoiceLineItemResponse{
		ID:          item.ID,
		Amount:      item.Amount,
		Description: item.Description,
	})
}
