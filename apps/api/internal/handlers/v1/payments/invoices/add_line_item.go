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

var AddLineItemError = errors.New("Failed to add invoice line item")

type AddLineItemRequest struct {
	Amount      int64  `json:"amount" required:"true"`
	Description string `json:"description" required:"true" minLength:"1"`
	Currency    string `json:"currency" required:"true" minLength:"3" maxLength:"3"`
}

type AddLineItemInput struct {
	payments.PaymentsCtx
	InvoiceID string `path:"invoice_id"`
	Body      AddLineItemRequest
}

type AddLineItemOutput struct {
	Body InvoiceLineItemResponse
}

func (h *Handler) AddLineItem(ctx context.Context, in *AddLineItemInput) (*AddLineItemOutput, error) {
	if in.InvoiceID == "" {
		return nil, huma.Error400BadRequest("invoice_id is required")
	}
	if !isValidInvoiceID(in.InvoiceID) {
		return nil, huma.Error400BadRequest("Invalid invoice ID format: must start with 'in_'")
	}
	if in.StripeCustomerID == "" {
		return nil, huma.Error400BadRequest("stripe_customer_id not found in context")
	}

	item, err := h.billing.AddInvoiceLineItem(ctx, billing.AddInvoiceLineItemArgs{
		InvoiceID:        in.InvoiceID,
		StripeCustomerID: in.StripeCustomerID,
		Amount:           in.Body.Amount,
		Currency:         in.Body.Currency,
		Description:      in.Body.Description,
	})
	if err != nil {
		if mapped := handlers.StripeError(err); mapped != nil {
			return nil, mapped
		}
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", AddLineItemError, err).Error())
	}
	return &AddLineItemOutput{Body: InvoiceLineItemResponse{
		ID:          item.ID,
		Amount:      item.Amount,
		Description: item.Description,
	}}, nil
}
