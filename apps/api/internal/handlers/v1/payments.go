package v1

import (
	"api/internal/config"
	"api/internal/database"
	"api/internal/handlers"
	"api/internal/logger"
	services_v1 "api/internal/service/v1"
	"fmt"
	"log"
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type PaymentsHandler struct {
	stripe *services_v1.StripeService
	db     *gorm.DB
}

func NewPaymentsHandler(cfg *config.Config) *PaymentsHandler {
	logger.Logger.Info("Initializing PaymentsHandler")
	db, err := database.GetConnection(cfg.Database)
	if err != nil {
		logger.Logger.Error("Failed to connect to database", "error", err)
		log.Panicf("Failed to connect to database: %s", err)
	}

	stripe := services_v1.NewStripeService(cfg, db)
	logger.Logger.Info("PaymentsHandler initialized successfully")
	return &PaymentsHandler{
		stripe: stripe,
		db:     db,
	}
}

// isValidInvoiceID checks if the invoice ID has the correct Stripe format
func isValidInvoiceID(invoiceID string) bool {
	return strings.HasPrefix(invoiceID, "in_")
}

// CreateCheckoutRequest represents the request to create a checkout session
type CreateCheckoutRequest struct {
	// The price ID from your Stripe configuration (required, cannot be empty)
	PriceID string `json:"price_id" binding:"required,min=1" example:"price_test_basic"`
	// URL to redirect to after successful checkout (required, cannot be empty)
	SuccessURL string `json:"success_url" binding:"required,min=1" example:"https://test.example.com/success"`
	// URL to redirect to if checkout is cancelled (required, cannot be empty)
	CancelURL string `json:"cancel_url" binding:"required,min=1" example:"https://test.example.com/cancel"`
	// Optional trial period in days
	TrialPeriodDays *int64 `json:"trial_period_days,omitempty" example:"14"`
	// Optional promotion code to apply
	PromotionCode string `json:"promotion_code,omitempty" example:"SUMMER2024"`
	// Whether to allow promotion codes to be entered
	AllowPromotionCodes *bool `json:"allow_promotion_codes,omitempty" example:"true"`
}

// CreateCheckoutResponse represents the checkout session response
type CreateCheckoutResponse struct {
	// Stripe Checkout Session URL
	URL string `json:"url" binding:"required" example:"https://checkout.stripe.com/pay/cs_test_..."`
	// Stripe Checkout Session ID
	SessionID string `json:"session_id" binding:"required" example:"cs_test_a1b2c3d4e5f6"`
}

// RecordUsageRequest represents a metered billing usage record
type RecordUsageRequest struct {
	// The meter event name as defined in your Stripe configuration (required, cannot be empty)
	MeterEventName string `json:"meter_event_name" binding:"required,min=1" example:"api_requests"`
	// The usage value to record (required, cannot be empty)
	Value string `json:"value" binding:"required,min=1" example:"100"`
}

// CreatePortalRequest represents the customer portal session request
type CreatePortalRequest struct {
	// URL to redirect to after leaving the portal (required, cannot be empty)
	ReturnURL string `json:"return_url" binding:"required,min=1" example:"https://test.example.com/dashboard"`
}

// CreatePortalResponse represents the customer portal session response
type CreatePortalResponse struct {
	// Stripe Customer Portal URL
	URL string `json:"url" binding:"required" example:"https://billing.stripe.com/session/live_..."`
}

// CreateInvoiceRequest represents the request to create a new invoice
type CreateInvoiceRequest struct {
	// Three-letter ISO currency code (required)
	Currency string `json:"currency" binding:"required,len=3" example:"usd"`
	// Whether to auto-advance the invoice (send immediately after finalization)
	AutoAdvance bool `json:"auto_advance" example:"false"`
	// How to collect payment: "charge_automatically" (default) or "send_invoice"
	CollectionMethod string `json:"collection_method,omitempty" binding:"omitempty,oneof=charge_automatically send_invoice" example:"send_invoice"`
	// Days until invoice is due (required when collection_method=send_invoice)
	DaysUntilDue int64 `json:"days_until_due,omitempty" binding:"omitempty,min=0,max=365" example:"7"`
	// Optional description for the invoice
	Description string `json:"description,omitempty" example:"Monthly platform fees"`
	// Optional metadata key-value pairs
	Metadata map[string]string `json:"metadata,omitempty"`
}

// UpdateInvoiceRequest represents the request to update an invoice
type UpdateInvoiceRequest struct {
	// Optional description to set on the invoice
	Description *string `json:"description,omitempty" example:"Monthly subscription - January 2025"`
	// Optional metadata key-value pairs to add
	Metadata map[string]string `json:"metadata,omitempty"`
}

// AddInvoiceLineItemRequest represents the request to add a line item to an invoice
type AddInvoiceLineItemRequest struct {
	// Amount in cents (required)
	Amount int64 `json:"amount" binding:"required" example:"1000"`
	// Description for the line item (required)
	Description string `json:"description" binding:"required,min=1" example:"Platform fee"`
	// Three-letter ISO currency code (required)
	Currency string `json:"currency" binding:"required,len=3" example:"usd"`
}

// FinalizeInvoiceRequest represents the request to finalize an invoice
type FinalizeInvoiceRequest struct {
	// Whether to auto-advance the invoice (send immediately)
	AutoAdvance bool `json:"auto_advance" example:"true"`
}

// AddInvoiceLineItemWithPriceIDRequest represents the request to add a line item using a price ID
type AddInvoiceLineItemWithPriceIDRequest struct {
	// Config price ID (e.g., "hetzner_cx23_nbg1_hourly") - looked up via GetStripeIDByConfigID
	PriceID string `json:"price_id,omitempty" example:"hetzner_cx23_nbg1_hourly"`
	// Raw Stripe price ID (e.g., "price_1ABC...") - used directly
	StripePriceID string `json:"stripe_price_id,omitempty" example:"price_1ABC123"`
	// Quantity of units (required)
	Quantity int64 `json:"quantity" binding:"required" example:"720"`
	// Description for the line item (required)
	Description string `json:"description" binding:"required,min=1" example:"VPS Compute - 720 hours"`
	// Three-letter ISO currency code (required)
	Currency string `json:"currency" binding:"required,len=3" example:"usd"`
	// Optional metadata key-value pairs
	Metadata map[string]string `json:"metadata,omitempty"`
}

// InvoiceResponse represents the invoice response
type InvoiceResponse struct {
	// Stripe Invoice ID
	ID string `json:"id" binding:"required" example:"in_1234567890"`
	// Invoice status
	Status string `json:"status" binding:"required" example:"draft"`
	// Total amount in cents
	AmountDue int64 `json:"amount_due" example:"2000"`
	// Currency
	Currency string `json:"currency" example:"usd"`
	// Customer ID
	CustomerID string `json:"customer_id" example:"cus_1234567890"`
	// Invoice PDF URL (if available)
	InvoicePDF string `json:"invoice_pdf,omitempty" example:"https://pay.stripe.com/invoice/..."`
	// Hosted invoice URL
	HostedInvoiceURL string `json:"hosted_invoice_url,omitempty" example:"https://invoice.stripe.com/i/..."`
}

// InvoiceLineItemResponse represents the invoice line item response
type InvoiceLineItemResponse struct {
	// Stripe Invoice Item ID
	ID string `json:"id" binding:"required" example:"ii_1234567890"`
	// Amount in cents
	Amount int64 `json:"amount" example:"1000"`
	// Description
	Description string `json:"description" example:"Platform fee"`
}

func (h *PaymentsHandler) CreateCheckout(ctx *gin.Context) {
	logger.Logger.Info("CreateCheckout handler started")
	var req CreateCheckoutRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		logger.Logger.Warn("Invalid request payload", "error", err)
		handlers.NewBadRequestResponse(ctx, "Request payload incorrect")
		return
	}

	logger.Logger.Debug("Creating checkout session", "price_id", req.PriceID, "success_url", req.SuccessURL)

	priceID, err := h.stripe.GetStripeIDByConfigID(req.PriceID)
	if err != nil {
		logger.Logger.Warn("Config ID not found", "config_id", req.PriceID, "error", err)
		handlers.NewNotFoundResponse(ctx, fmt.Sprintf("No Stripe price mapping found for config_id: %s", req.PriceID))
		return
	}

	logger.Logger.Debug("Mapped config_id to stripe_id", "config_id", req.PriceID, "stripe_id", priceID)

	// Get customer_id from middleware context (may be empty string if not set)
	customerID, _ := ctx.Get("stripe_customer_id")
	customerIDStr := ""
	if customerID != nil {
		customerIDStr = customerID.(string)
		logger.Logger.Debug("Using existing customer", "customer_id", customerIDStr)
	} else {
		logger.Logger.Debug("No existing customer ID found, will create new customer")
	}

	// Convert promotion_code to pointer for consistency
	var promotionCode *string
	if req.PromotionCode != "" {
		promotionCode = &req.PromotionCode
	}

	session, err := h.stripe.CreateCheckoutSession(
		priceID,
		req.SuccessURL,
		req.CancelURL,
		customerIDStr,
		req.TrialPeriodDays,
		promotionCode,
		req.AllowPromotionCodes,
	)

	if err != nil {
		logger.Logger.Error("Failed to create checkout session", "price_id", priceID, "error", err)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to create checkout session: %s", err))
		return
	}

	logger.Logger.Info("Checkout session created successfully", "session_id", session.ID, "customer_id", customerIDStr)
	handlers.NewSuccessResponse(ctx, &CreateCheckoutResponse{
		URL:       session.URL,
		SessionID: session.ID,
	})
}

func (h *PaymentsHandler) RecordUsage(ctx *gin.Context) {
	logger.Logger.Info("RecordUsage handler started")
	var req RecordUsageRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		logger.Logger.Warn("Invalid request payload", "error", err)
		handlers.NewBadRequestResponse(ctx, "Request payload incorrect")
		return
	}

	// Get customer_id from middleware context
	customerID, exists := ctx.Get("stripe_customer_id")
	if !exists || customerID == nil {
		logger.Logger.Warn("Missing stripe_customer_id in context")
		handlers.NewBadRequestResponse(ctx, "stripe_customer_id not found in context")
		return
	}

	logger.Logger.Debug("Recording usage", "meter_event_name", req.MeterEventName, "customer_id", customerID.(string), "value", req.Value)
	err := h.stripe.RecordUsage(req.MeterEventName, customerID.(string), req.Value)
	if err != nil {
		logger.Logger.Error("Error recording usage in stripe", "meter_event_name", req.MeterEventName, "customer_id", customerID.(string), "error", err)
		if !handlers.HandleStripeError(ctx, err) {
			handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Error recording usage in stripe: %s", err))
		}
		return
	}

	logger.Logger.Info("Usage recorded successfully", "meter_event_name", req.MeterEventName, "customer_id", customerID.(string))
	handlers.NewSuccessResponse(ctx, nil)
}

func (h *PaymentsHandler) CreateCustomerPortal(ctx *gin.Context) {
	logger.Logger.Info("CreateCustomerPortal handler started")
	var req CreatePortalRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		logger.Logger.Warn("Invalid request payload", "error", err)
		handlers.NewBadRequestResponse(ctx, "Request payload incorrect")
		return
	}

	// Get customer_id from middleware context
	customerID, exists := ctx.Get("stripe_customer_id")
	if !exists || customerID == nil {
		logger.Logger.Warn("Missing stripe_customer_id in context")
		handlers.NewBadRequestResponse(ctx, "stripe_customer_id not found in context")
		return
	}

	logger.Logger.Debug("Creating customer portal session", "customer_id", customerID.(string), "return_url", req.ReturnURL)
	session, err := h.stripe.CreatePortalSession(customerID.(string), req.ReturnURL)
	if err != nil {
		logger.Logger.Error("Failed to create stripe portal session", "customer_id", customerID.(string), "error", err)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to create stripe portal session with stripe: %s", err))
		return
	}

	logger.Logger.Info("Customer portal session created successfully", "customer_id", customerID.(string), "session_url", session.URL)
	handlers.NewSuccessResponse(ctx, &CreatePortalResponse{
		URL: session.URL,
	})
}

func (h *PaymentsHandler) CreateInvoice(ctx *gin.Context) {
	var req CreateInvoiceRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		logger.Logger.Warn("Invalid request payload", "error", err)
		handlers.NewBadRequestResponse(ctx, "Request payload incorrect")
		return
	}

	customerID, exists := ctx.Get("stripe_customer_id")
	if !exists || customerID == nil {
		logger.Logger.Warn("Missing stripe_customer_id in context")
		handlers.NewBadRequestResponse(ctx, "stripe_customer_id not found in context")
		return
	}

	logger.Logger.Debug("Creating invoice", "customer_id", customerID.(string), "currency", req.Currency, "collection_method", req.CollectionMethod)
	inv, err := h.stripe.CreateInvoice(customerID.(string), req.Currency, req.AutoAdvance, req.CollectionMethod, req.DaysUntilDue, req.Description, req.Metadata)
	if err != nil {
		logger.Logger.Error("Failed to create invoice", "customer_id", customerID.(string), "error", err)
		if handlers.HandleStripeError(ctx, err) {
			return
		}
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to create invoice: %s", err))
		return
	}

	logger.Logger.Info("Invoice created successfully", "invoice_id", inv.ID, "customer_id", customerID.(string))
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

func (h *PaymentsHandler) GetInvoice(ctx *gin.Context) {
	invoiceID := ctx.Param("invoice_id")
	if invoiceID == "" {
		logger.Logger.Warn("Missing invoice_id parameter")
		handlers.NewBadRequestResponse(ctx, "invoice_id is required")
		return
	}
	if !isValidInvoiceID(invoiceID) {
		logger.Logger.Warn("Invalid invoice_id format", "invoice_id", invoiceID)
		handlers.NewBadRequestResponse(ctx, "Invalid invoice ID format: must start with 'in_'")
		return
	}

	logger.Logger.Debug("Getting invoice", "invoice_id", invoiceID)
	inv, err := h.stripe.GetInvoice(invoiceID)
	if err != nil {
		logger.Logger.Error("Failed to get invoice", "invoice_id", invoiceID, "error", err)
		if handlers.HandleStripeError(ctx, err) {
			return
		}
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to get invoice: %s", err))
		return
	}

	logger.Logger.Info("Invoice retrieved successfully", "invoice_id", invoiceID, "status", inv.Status)
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

func (h *PaymentsHandler) UpdateInvoice(ctx *gin.Context) {
	invoiceID := ctx.Param("invoice_id")
	if invoiceID == "" {
		logger.Logger.Warn("Missing invoice_id parameter")
		handlers.NewBadRequestResponse(ctx, "invoice_id is required")
		return
	}
	if !isValidInvoiceID(invoiceID) {
		logger.Logger.Warn("Invalid invoice_id format", "invoice_id", invoiceID)
		handlers.NewBadRequestResponse(ctx, "Invalid invoice ID format: must start with 'in_'")
		return
	}

	var req UpdateInvoiceRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		logger.Logger.Warn("Invalid request payload", "error", err)
		handlers.NewBadRequestResponse(ctx, "Request payload incorrect")
		return
	}

	logger.Logger.Debug("Updating invoice", "invoice_id", invoiceID)
	inv, err := h.stripe.UpdateInvoice(invoiceID, req.Description, req.Metadata)
	if err != nil {
		logger.Logger.Error("Failed to update invoice", "invoice_id", invoiceID, "error", err)
		if handlers.HandleStripeError(ctx, err) {
			return
		}
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to update invoice: %s", err))
		return
	}

	logger.Logger.Info("Invoice updated successfully", "invoice_id", invoiceID)
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

func (h *PaymentsHandler) AddInvoiceLineItem(ctx *gin.Context) {
	invoiceID := ctx.Param("invoice_id")
	if invoiceID == "" {
		logger.Logger.Warn("Missing invoice_id parameter")
		handlers.NewBadRequestResponse(ctx, "invoice_id is required")
		return
	}
	if !isValidInvoiceID(invoiceID) {
		logger.Logger.Warn("Invalid invoice_id format", "invoice_id", invoiceID)
		handlers.NewBadRequestResponse(ctx, "Invalid invoice ID format: must start with 'in_'")
		return
	}

	var req AddInvoiceLineItemRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		logger.Logger.Warn("Invalid request payload", "error", err)
		handlers.NewBadRequestResponse(ctx, "Request payload incorrect")
		return
	}

	// Get customer_id from middleware context
	customerID, exists := ctx.Get("stripe_customer_id")
	if !exists || customerID == nil {
		logger.Logger.Warn("Missing stripe_customer_id in context")
		handlers.NewBadRequestResponse(ctx, "stripe_customer_id not found in context")
		return
	}

	logger.Logger.Debug("Adding invoice line item", "invoice_id", invoiceID, "amount", req.Amount, "currency", req.Currency)
	item, err := h.stripe.AddInvoiceLineItem(invoiceID, customerID.(string), req.Amount, req.Currency, req.Description)
	if err != nil {
		logger.Logger.Error("Failed to add invoice line item", "invoice_id", invoiceID, "error", err)
		if handlers.HandleStripeError(ctx, err) {
			return
		}
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to add invoice line item: %s", err))
		return
	}

	logger.Logger.Info("Invoice line item added successfully", "invoice_id", invoiceID, "item_id", item.ID)
	handlers.NewSuccessResponse(ctx, &InvoiceLineItemResponse{
		ID:          item.ID,
		Amount:      item.Amount,
		Description: item.Description,
	})
}

func (h *PaymentsHandler) FinalizeInvoice(ctx *gin.Context) {
	invoiceID := ctx.Param("invoice_id")
	if invoiceID == "" {
		logger.Logger.Warn("Missing invoice_id parameter")
		handlers.NewBadRequestResponse(ctx, "invoice_id is required")
		return
	}
	if !isValidInvoiceID(invoiceID) {
		logger.Logger.Warn("Invalid invoice_id format", "invoice_id", invoiceID)
		handlers.NewBadRequestResponse(ctx, "Invalid invoice ID format: must start with 'in_'")
		return
	}

	var req FinalizeInvoiceRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		logger.Logger.Warn("Invalid request payload", "error", err)
		handlers.NewBadRequestResponse(ctx, "Request payload incorrect")
		return
	}

	logger.Logger.Debug("Finalizing invoice", "invoice_id", invoiceID, "auto_advance", req.AutoAdvance)
	inv, err := h.stripe.FinalizeInvoice(invoiceID, req.AutoAdvance)
	if err != nil {
		logger.Logger.Error("Failed to finalize invoice", "invoice_id", invoiceID, "error", err)
		if handlers.HandleStripeError(ctx, err) {
			return
		}
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to finalize invoice: %s", err))
		return
	}

	logger.Logger.Info("Invoice finalized successfully", "invoice_id", invoiceID, "status", inv.Status)
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

func (h *PaymentsHandler) AddInvoiceLineItemWithPriceID(ctx *gin.Context) {
	invoiceID := ctx.Param("invoice_id")
	if invoiceID == "" {
		logger.Logger.Warn("Missing invoice_id parameter")
		handlers.NewBadRequestResponse(ctx, "invoice_id is required")
		return
	}
	if !isValidInvoiceID(invoiceID) {
		logger.Logger.Warn("Invalid invoice_id format", "invoice_id", invoiceID)
		handlers.NewBadRequestResponse(ctx, "Invalid invoice ID format: must start with 'in_'")
		return
	}

	var req AddInvoiceLineItemWithPriceIDRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		logger.Logger.Warn("Invalid request payload", "error", err)
		handlers.NewBadRequestResponse(ctx, "Request payload incorrect")
		return
	}

	// Validate: require either price_id OR stripe_price_id (not both, not neither)
	if req.PriceID == "" && req.StripePriceID == "" {
		handlers.NewBadRequestResponse(ctx, "Either price_id or stripe_price_id is required")
		return
	}
	if req.PriceID != "" && req.StripePriceID != "" {
		handlers.NewBadRequestResponse(ctx, "Provide only one of price_id or stripe_price_id, not both")
		return
	}

	// Get customer_id from middleware context
	customerID, exists := ctx.Get("stripe_customer_id")
	if !exists || customerID == nil {
		logger.Logger.Warn("Missing stripe_customer_id in context")
		handlers.NewBadRequestResponse(ctx, "stripe_customer_id not found in context")
		return
	}

	// Resolve the actual Stripe price ID
	var stripePriceID string
	if req.StripePriceID != "" {
		stripePriceID = req.StripePriceID
	} else {
		resolvedID, err := h.stripe.GetStripeIDByConfigID(req.PriceID)
		if err != nil {
			logger.Logger.Warn("Config ID not found", "config_id", req.PriceID, "error", err)
			handlers.NewNotFoundResponse(ctx, fmt.Sprintf("No Stripe price mapping found for config_id: %s", req.PriceID))
			return
		}
		stripePriceID = resolvedID
	}

	logger.Logger.Debug("Adding invoice line item with price", "invoice_id", invoiceID, "price_id", stripePriceID, "quantity", req.Quantity)
	item, err := h.stripe.AddInvoiceLineItemByPrice(invoiceID, customerID.(string), stripePriceID, req.Quantity, req.Currency, req.Description, req.Metadata)
	if err != nil {
		logger.Logger.Error("Failed to add invoice line item with price", "invoice_id", invoiceID, "error", err)
		if handlers.HandleStripeError(ctx, err) {
			return
		}
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to add invoice line item: %s", err))
		return
	}

	logger.Logger.Info("Invoice line item with price added successfully", "invoice_id", invoiceID, "item_id", item.ID)
	handlers.NewSuccessResponse(ctx, &InvoiceLineItemResponse{
		ID:          item.ID,
		Amount:      item.Amount,
		Description: item.Description,
	})
}
