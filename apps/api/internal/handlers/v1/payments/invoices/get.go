package invoices

import (
	"errors"
	"fmt"

	"github.com/gin-gonic/gin"

	"api/internal/handlers"
)

var GetInvoiceError = errors.New("Failed to get invoice")

func (h *Handler) Get(ctx *gin.Context) {
	invoiceID := ctx.Param("invoice_id")
	if invoiceID == "" {
		handlers.NewBadRequestResponse(ctx, "invoice_id is required")
		return
	}
	if !isValidInvoiceID(invoiceID) {
		handlers.NewBadRequestResponse(ctx, "Invalid invoice ID format: must start with 'in_'")
		return
	}
	inv, err := h.billing.GetInvoice(ctx.Request.Context(), invoiceID)
	if err != nil {
		if handlers.HandleStripeError(ctx, err) {
			return
		}
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", GetInvoiceError, err))
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
