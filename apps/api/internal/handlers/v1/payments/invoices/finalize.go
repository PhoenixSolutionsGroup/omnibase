package invoices

import (
	"context"
	"errors"
	"fmt"

	"github.com/danielgtaylor/huma/v2"

	"api/internal/handlers"
	"api/internal/handlers/v1/payments"
)

var FinalizeInvoiceError = errors.New("Failed to finalize invoice")

type FinalizeRequest struct {
	AutoAdvance bool `json:"auto_advance,omitempty"`
}

type FinalizeInvoiceInput struct {
	payments.PaymentsCtx
	InvoiceID string `path:"invoice_id"`
	Body      FinalizeRequest
}

type FinalizeInvoiceOutput struct {
	Body InvoiceResponse
}

func (h *Handler) Finalize(ctx context.Context, in *FinalizeInvoiceInput) (*FinalizeInvoiceOutput, error) {
	if in.InvoiceID == "" {
		return nil, huma.Error400BadRequest("invoice_id is required")
	}
	if !isValidInvoiceID(in.InvoiceID) {
		return nil, huma.Error400BadRequest("Invalid invoice ID format: must start with 'in_'")
	}
	inv, err := h.billing.FinalizeInvoice(ctx, in.InvoiceID, in.Body.AutoAdvance)
	if err != nil {
		if mapped := handlers.StripeError(err); mapped != nil {
			return nil, mapped
		}
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", FinalizeInvoiceError, err).Error())
	}
	return &FinalizeInvoiceOutput{Body: InvoiceResponse{
		ID:               inv.ID,
		Status:           string(inv.Status),
		AmountDue:        inv.AmountDue,
		Currency:         string(inv.Currency),
		CustomerID:       inv.Customer.ID,
		InvoicePDF:       inv.InvoicePDF,
		HostedInvoiceURL: inv.HostedInvoiceURL,
	}}, nil
}
