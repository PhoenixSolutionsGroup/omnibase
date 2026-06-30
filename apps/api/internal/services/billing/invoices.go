package billing

import (
	"context"
	"errors"
	"fmt"

	"github.com/stripe/stripe-go/v82"
)

var (
	CreateInvoiceError          = errors.New("Failed to create invoice")
	GetInvoiceError             = errors.New("Failed to get invoice")
	UpdateInvoiceError          = errors.New("Failed to update invoice")
	AddInvoiceLineItemError     = errors.New("Failed to add invoice line item")
	FinalizeInvoiceError        = errors.New("Failed to finalize invoice")
	PreviewInvoiceError         = errors.New("Failed to preview invoice")
)

type CreateInvoiceArgs struct {
	StripeCustomerID string
	Currency         string
	AutoAdvance      bool
	CollectionMethod string
	DaysUntilDue     int64
	Description      string
	Metadata         map[string]string
}

func (s *Service) CreateInvoice(ctx context.Context, args CreateInvoiceArgs) (*stripe.Invoice, error) {
	params := &stripe.InvoiceCreateParams{
		Customer:    stripe.String(args.StripeCustomerID),
		Currency:    stripe.String(args.Currency),
		AutoAdvance: stripe.Bool(args.AutoAdvance),
	}
	if args.CollectionMethod != "" {
		params.CollectionMethod = stripe.String(args.CollectionMethod)
	}
	if args.DaysUntilDue > 0 {
		params.DaysUntilDue = stripe.Int64(args.DaysUntilDue)
	}
	if args.Description != "" {
		params.Description = stripe.String(args.Description)
	}
	for k, v := range args.Metadata {
		params.AddMetadata(k, v)
	}
	s.stripe.ApplyAccount(params)
	// fee on invoice create is unknown until line items; finalize re-applies

	inv, err := s.stripe.Stripe.V1Invoices.Create(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("%w: %w", CreateInvoiceError, err)
	}
	return inv, nil
}

func (s *Service) GetInvoice(ctx context.Context, invoiceID string) (*stripe.Invoice, error) {
	params := &stripe.InvoiceRetrieveParams{}
	s.stripe.ApplyAccount(params)

	inv, err := s.stripe.Stripe.V1Invoices.Retrieve(ctx, invoiceID, params)
	if err != nil {
		return nil, fmt.Errorf("%w: %w", GetInvoiceError, err)
	}
	return inv, nil
}

type UpdateInvoiceArgs struct {
	InvoiceID   string
	Description *string
	Metadata    map[string]string
}

func (s *Service) UpdateInvoice(ctx context.Context, args UpdateInvoiceArgs) (*stripe.Invoice, error) {
	params := &stripe.InvoiceUpdateParams{}
	if args.Description != nil {
		params.Description = args.Description
	}
	for k, v := range args.Metadata {
		params.AddMetadata(k, v)
	}
	s.stripe.ApplyAccount(params)

	inv, err := s.stripe.Stripe.V1Invoices.Update(ctx, args.InvoiceID, params)
	if err != nil {
		return nil, fmt.Errorf("%w: %w", UpdateInvoiceError, err)
	}
	return inv, nil
}

type AddInvoiceLineItemArgs struct {
	InvoiceID        string
	StripeCustomerID string
	Amount           int64
	Currency         string
	Description      string
}

func (s *Service) AddInvoiceLineItem(ctx context.Context, args AddInvoiceLineItemArgs) (*stripe.InvoiceItem, error) {
	params := &stripe.InvoiceItemCreateParams{
		Customer:    stripe.String(args.StripeCustomerID),
		Invoice:     stripe.String(args.InvoiceID),
		Amount:      stripe.Int64(args.Amount),
		Currency:    stripe.String(args.Currency),
		Description: stripe.String(args.Description),
	}
	s.stripe.ApplyAccount(params)

	item, err := s.stripe.Stripe.V1InvoiceItems.Create(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("%w: %w", AddInvoiceLineItemError, err)
	}
	return item, nil
}

type AddInvoiceLineItemByPriceArgs struct {
	InvoiceID        string
	StripeCustomerID string
	StripePriceID    string
	Quantity         int64
	Currency         string
	Description      string
	Metadata         map[string]string
}

func (s *Service) AddInvoiceLineItemByPrice(ctx context.Context, args AddInvoiceLineItemByPriceArgs) (*stripe.InvoiceItem, error) {
	params := &stripe.InvoiceItemCreateParams{
		Customer:    stripe.String(args.StripeCustomerID),
		Invoice:     stripe.String(args.InvoiceID),
		Quantity:    stripe.Int64(args.Quantity),
		Currency:    stripe.String(args.Currency),
		Description: stripe.String(args.Description),
		Pricing: &stripe.InvoiceItemCreatePricingParams{
			Price: stripe.String(args.StripePriceID),
		},
	}
	for k, v := range args.Metadata {
		params.AddMetadata(k, v)
	}
	s.stripe.ApplyAccount(params)

	item, err := s.stripe.Stripe.V1InvoiceItems.Create(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("%w: %w", AddInvoiceLineItemError, err)
	}
	return item, nil
}

func (s *Service) FinalizeInvoice(ctx context.Context, invoiceID string, autoAdvance bool) (*stripe.Invoice, error) {
	if s.feeActive() {
		draft, err := s.GetInvoice(ctx, invoiceID)
		if err == nil && draft.Subtotal > 0 {
			feeAmount := int64(float64(draft.Subtotal) * (s.feePct / 100))
			if feeAmount > 0 {
				updateParams := &stripe.InvoiceUpdateParams{
					ApplicationFeeAmount: stripe.Int64(feeAmount),
				}
				s.stripe.ApplyAccount(updateParams)
				if _, err := s.stripe.Stripe.V1Invoices.Update(ctx, invoiceID, updateParams); err != nil {
					return nil, fmt.Errorf("%w: failed to set application fee before finalize: %w", FinalizeInvoiceError, err)
				}
			}
		}
	}

	params := &stripe.InvoiceFinalizeInvoiceParams{
		AutoAdvance: stripe.Bool(autoAdvance),
	}
	s.stripe.ApplyAccount(params)

	inv, err := s.stripe.Stripe.V1Invoices.FinalizeInvoice(ctx, invoiceID, params)
	if err != nil {
		return nil, fmt.Errorf("%w: %w", FinalizeInvoiceError, err)
	}
	return inv, nil
}

type PreviewInvoiceArgs struct {
	StripeCustomerID     string
	StripeSubscriptionID string
}

func (s *Service) PreviewInvoice(ctx context.Context, args PreviewInvoiceArgs) (*stripe.Invoice, error) {
	params := &stripe.InvoiceCreatePreviewParams{
		Customer: stripe.String(args.StripeCustomerID),
	}
	if args.StripeSubscriptionID != "" {
		params.Subscription = stripe.String(args.StripeSubscriptionID)
	}
	s.stripe.ApplyAccount(params)

	inv, err := s.stripe.Stripe.V1Invoices.CreatePreview(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("%w: %w", PreviewInvoiceError, err)
	}
	return inv, nil
}
