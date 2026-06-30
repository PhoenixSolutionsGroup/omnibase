package invoices

import (
	"errors"
	"fmt"

	"github.com/gin-gonic/gin"

	"api/internal/handlers"
	"api/internal/services/billing"
)

var CreateInvoiceError = errors.New("Failed to create invoice")

type CreateInvoiceRequest struct {
	Currency         string            `json:"currency" binding:"required,len=3"`
	AutoAdvance      bool              `json:"auto_advance"`
	CollectionMethod string            `json:"collection_method,omitempty" binding:"omitempty,oneof=charge_automatically send_invoice"`
	DaysUntilDue     int64             `json:"days_until_due,omitempty" binding:"omitempty,min=0,max=365"`
	Description      string            `json:"description,omitempty"`
	Metadata         map[string]string `json:"metadata,omitempty"`
}

func (h *Handler) Create(ctx *gin.Context) {
	var req CreateInvoiceRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		handlers.NewBadRequestResponse(ctx, "Request payload incorrect")
		return
	}
	customerID, exists := ctx.Get("stripe_customer_id")
	if !exists || customerID == nil {
		handlers.NewBadRequestResponse(ctx, "stripe_customer_id not found in context")
		return
	}
	inv, err := h.billing.CreateInvoice(ctx.Request.Context(), billing.CreateInvoiceArgs{
		StripeCustomerID: customerID.(string),
		Currency:         req.Currency,
		AutoAdvance:      req.AutoAdvance,
		CollectionMethod: req.CollectionMethod,
		DaysUntilDue:     req.DaysUntilDue,
		Description:      req.Description,
		Metadata:         req.Metadata,
	})
	if err != nil {
		if handlers.HandleStripeError(ctx, err) {
			return
		}
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", CreateInvoiceError, err))
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
