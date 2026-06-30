package invoices

import (
	"context"
	"errors"
	"fmt"

	"github.com/danielgtaylor/huma/v2"

	"api/internal/handlers"
	"api/internal/handlers/v1/payments"
	"api/internal/services/billing"
)

var CreateInvoiceError = errors.New("Failed to create invoice")

type CreateInvoiceRequest struct {
	Currency         string            `json:"currency" required:"true" minLength:"3" maxLength:"3"`
	AutoAdvance      bool              `json:"auto_advance,omitempty"`
	CollectionMethod string            `json:"collection_method,omitempty" enum:"charge_automatically,send_invoice"`
	DaysUntilDue     int64             `json:"days_until_due,omitempty" minimum:"0" maximum:"365"`
	Description      string            `json:"description,omitempty"`
	Metadata         map[string]string `json:"metadata,omitempty"`
}

type CreateInvoiceInput struct {
	payments.PaymentsCtx
	Body CreateInvoiceRequest
}

type CreateInvoiceOutput struct {
	Body InvoiceResponse
}

func (h *Handler) Create(ctx context.Context, in *CreateInvoiceInput) (*CreateInvoiceOutput, error) {
	if in.StripeCustomerID == "" {
		return nil, huma.Error400BadRequest("stripe_customer_id not found in context")
	}

	inv, err := h.billing.CreateInvoice(ctx, billing.CreateInvoiceArgs{
		StripeCustomerID: in.StripeCustomerID,
		Currency:         in.Body.Currency,
		AutoAdvance:      in.Body.AutoAdvance,
		CollectionMethod: in.Body.CollectionMethod,
		DaysUntilDue:     in.Body.DaysUntilDue,
		Description:      in.Body.Description,
		Metadata:         in.Body.Metadata,
	})
	if err != nil {
		if mapped := handlers.StripeError(err); mapped != nil {
			return nil, mapped
		}
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", CreateInvoiceError, err).Error())
	}
	return &CreateInvoiceOutput{Body: InvoiceResponse{
		ID:               inv.ID,
		Status:           string(inv.Status),
		AmountDue:        inv.AmountDue,
		Currency:         string(inv.Currency),
		CustomerID:       inv.Customer.ID,
		InvoicePDF:       inv.InvoicePDF,
		HostedInvoiceURL: inv.HostedInvoiceURL,
	}}, nil
}
