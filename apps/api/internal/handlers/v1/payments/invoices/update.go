package invoices

import (
	"errors"
	"fmt"

	"github.com/gin-gonic/gin"

	"api/internal/handlers"
	"api/internal/services/billing"
)

var UpdateInvoiceError = errors.New("Failed to update invoice")

type UpdateInvoiceRequest struct {
	Description *string           `json:"description,omitempty"`
	Metadata    map[string]string `json:"metadata,omitempty"`
}

func (h *Handler) Update(ctx *gin.Context) {
	invoiceID := ctx.Param("invoice_id")
	if invoiceID == "" {
		handlers.NewBadRequestResponse(ctx, "invoice_id is required")
		return
	}
	if !isValidInvoiceID(invoiceID) {
		handlers.NewBadRequestResponse(ctx, "Invalid invoice ID format: must start with 'in_'")
		return
	}
	var req UpdateInvoiceRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		handlers.NewBadRequestResponse(ctx, "Request payload incorrect")
		return
	}
	inv, err := h.billing.UpdateInvoice(ctx.Request.Context(), billing.UpdateInvoiceArgs{
		InvoiceID:   invoiceID,
		Description: req.Description,
		Metadata:    req.Metadata,
	})
	if err != nil {
		if handlers.HandleStripeError(ctx, err) {
			return
		}
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", UpdateInvoiceError, err))
		return
	}
	handlers.NewSuccessResponse(ctx, &InvoiceResponse{
		ID:               inv.ID,
		Status:           string(inv.Status),
		AmountDue:        inv.AmountDue,
		Currency:         string(inv.Currency),
		CustomerID:       inv.Customer.ID,
		InvoicePDF:       inv.InvoicePDF,
		HostedInvoiceURL: inv.HostedInvoiceURL,
	})
}
