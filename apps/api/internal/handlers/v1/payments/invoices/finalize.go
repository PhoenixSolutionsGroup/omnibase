package invoices

import (
	"errors"
	"fmt"

	"github.com/gin-gonic/gin"

	"api/internal/handlers"
)

var FinalizeInvoiceError = errors.New("Failed to finalize invoice")

type FinalizeRequest struct {
	AutoAdvance bool `json:"auto_advance"`
}

func (h *Handler) Finalize(ctx *gin.Context) {
	invoiceID := ctx.Param("invoice_id")
	if invoiceID == "" {
		handlers.NewBadRequestResponse(ctx, "invoice_id is required")
		return
	}
	if !isValidInvoiceID(invoiceID) {
		handlers.NewBadRequestResponse(ctx, "Invalid invoice ID format: must start with 'in_'")
		return
	}
	var req FinalizeRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		handlers.NewBadRequestResponse(ctx, "Request payload incorrect")
		return
	}
	inv, err := h.billing.FinalizeInvoice(ctx.Request.Context(), invoiceID, req.AutoAdvance)
	if err != nil {
		if handlers.HandleStripeError(ctx, err) {
			return
		}
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", FinalizeInvoiceError, err))
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
