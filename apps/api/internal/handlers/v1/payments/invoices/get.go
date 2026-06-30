package invoices

import (
	"context"
	"errors"
	"fmt"

	"github.com/danielgtaylor/huma/v2"

	"api/internal/handlers"
	"api/internal/handlers/v1/payments"
)

var GetInvoiceError = errors.New("Failed to get invoice")

type GetInvoiceInput struct {
	payments.PaymentsCtx
	InvoiceID string `path:"invoice_id"`
}

type GetInvoiceOutput struct {
	Body InvoiceResponse
}

func (h *Handler) Get(ctx context.Context, in *GetInvoiceInput) (*GetInvoiceOutput, error) {
	if in.InvoiceID == "" {
		return nil, huma.Error400BadRequest("invoice_id is required")
	}
	if !isValidInvoiceID(in.InvoiceID) {
		return nil, huma.Error400BadRequest("Invalid invoice ID format: must start with 'in_'")
	}
	inv, err := h.billing.GetInvoice(ctx, in.InvoiceID)
	if err != nil {
		if mapped := handlers.StripeError(err); mapped != nil {
			return nil, mapped
		}
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", GetInvoiceError, err).Error())
	}
	return &GetInvoiceOutput{Body: InvoiceResponse{
		ID:               inv.ID,
		Status:           string(inv.Status),
		AmountDue:        inv.AmountDue,
		Currency:         string(inv.Currency),
		CustomerID:       inv.Customer.ID,
		InvoicePDF:       inv.InvoicePDF,
		HostedInvoiceURL: inv.HostedInvoiceURL,
	}}, nil
}
