package invoices

import (
	"strings"

	"api/internal/services/billing"
)

type Handler struct {
	billing *billing.Service
}

type Deps struct {
	Billing *billing.Service
}

func New(deps Deps) *Handler {
	return &Handler{billing: deps.Billing}
}

func isValidInvoiceID(invoiceID string) bool {
	return strings.HasPrefix(invoiceID, "in_")
}

type InvoiceResponse struct {
	ID               string `json:"id" required:"true"`
	Status           string `json:"status" required:"true"`
	AmountDue        int64  `json:"amount_due"`
	Currency         string `json:"currency"`
	CustomerID       string `json:"customer_id"`
	InvoicePDF       string `json:"invoice_pdf,omitempty"`
	HostedInvoiceURL string `json:"hosted_invoice_url,omitempty"`
}

type InvoiceLineItemResponse struct {
	ID          string `json:"id" required:"true"`
	Amount      int64  `json:"amount"`
	Description string `json:"description"`
}
