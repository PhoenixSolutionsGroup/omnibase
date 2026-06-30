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

var AddLineItemByPriceError = errors.New("Failed to add invoice line item by price")

type AddLineItemByPriceRequest struct {
	PriceID       string            `json:"price_id,omitempty"`
	StripePriceID string            `json:"stripe_price_id,omitempty"`
	Quantity      int64             `json:"quantity" required:"true"`
	Description   string            `json:"description" required:"true" minLength:"1"`
	Currency      string            `json:"currency" required:"true" minLength:"3" maxLength:"3"`
	Metadata      map[string]string `json:"metadata,omitempty"`
}

type AddLineItemByPriceInput struct {
	payments.PaymentsCtx
	InvoiceID string `path:"invoice_id"`
	Body      AddLineItemByPriceRequest
}

type AddLineItemByPriceOutput struct {
	Body InvoiceLineItemResponse
}

func (h *Handler) AddLineItemByPrice(ctx context.Context, in *AddLineItemByPriceInput) (*AddLineItemByPriceOutput, error) {
	if in.InvoiceID == "" {
		return nil, huma.Error400BadRequest("invoice_id is required")
	}
	if !isValidInvoiceID(in.InvoiceID) {
		return nil, huma.Error400BadRequest("Invalid invoice ID format: must start with 'in_'")
	}
	req := in.Body
	if req.PriceID == "" && req.StripePriceID == "" {
		return nil, huma.Error400BadRequest("Either price_id or stripe_price_id is required")
	}
	if req.PriceID != "" && req.StripePriceID != "" {
		return nil, huma.Error400BadRequest("Provide only one of price_id or stripe_price_id, not both")
	}
	if in.StripeCustomerID == "" {
		return nil, huma.Error400BadRequest("stripe_customer_id not found in context")
	}

	stripePriceID := req.StripePriceID
	if stripePriceID == "" {
		mapping, err := h.billing.GetMappingByConfigID(ctx, req.PriceID, "price")
		if err != nil {
			return nil, huma.Error404NotFound(fmt.Sprintf("No Stripe price mapping found for config_id: %s", req.PriceID))
		}
		stripePriceID = mapping.StripeID
	}

	item, err := h.billing.AddInvoiceLineItemByPrice(ctx, billing.AddInvoiceLineItemByPriceArgs{
		InvoiceID:        in.InvoiceID,
		StripeCustomerID: in.StripeCustomerID,
		StripePriceID:    stripePriceID,
		Quantity:         req.Quantity,
		Currency:         req.Currency,
		Description:      req.Description,
		Metadata:         req.Metadata,
	})
	if err != nil {
		if mapped := handlers.StripeError(err); mapped != nil {
			return nil, mapped
		}
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", AddLineItemByPriceError, err).Error())
	}
	return &AddLineItemByPriceOutput{Body: InvoiceLineItemResponse{
		ID:          item.ID,
		Amount:      item.Amount,
		Description: item.Description,
	}}, nil
}
