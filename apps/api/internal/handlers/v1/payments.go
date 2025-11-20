package v1

import (
	"api/internal/config"
	"api/internal/database"
	"api/internal/handlers"
	"api/internal/logger"
	services_v1 "api/internal/service/v1"
	"fmt"
	"log"

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

// CreateCheckout creates a Stripe Checkout Session for subscription or one-time payments
// @Summary      Create checkout session
// @Description  Creates a Stripe Checkout Session for the specified price ID. The session URL can be used to redirect users to complete payment.
// @Description
// @Description  ## Authentication
// @Description  Optional cookie authentication. If authenticated and user has a Stripe customer ID, it will be used; otherwise, a new customer will be created.
// @Description
// @Description  ## Use Cases
// @Description  - Subscription sign-ups
// @Description  - One-time purchases
// @Description  - Trial period checkouts
// @Description  - Promotional code redemption
// @Tags         V1 Payments
// @Accept       json
// @Produce      json
// @Param        request body CreateCheckoutRequest true "Checkout session parameters"
// @Success      200 {object} handlers.SuccessResponse{data=CreateCheckoutResponse} "Checkout session created successfully"
// @Failure      400 {object} handlers.BadRequestResponse "Invalid request payload - price_id, success_url, and cancel_url cannot be empty"
// @Failure      401 {object} handlers.UnauthorizedResponse "Invalid or missing JWT token"
// @Failure      404 {object} handlers.NotFoundErrorResponse "No Stripe price mapping found for the provided price_id"
// @Failure      500 {object} handlers.InternalServerErrorResponse "Failed to create checkout session"
// @Router       /api/v1/payments/checkout [post]
// @ID           createCheckout
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

// RecordUsage records metered billing usage for the authenticated customer
// @Summary      Record metered usage
// @Description  Records a usage event for metered billing. The customer must have an active subscription with metered pricing.
// @Description
// @Description  ## Authentication
// @Description  Requires cookie authentication with an associated Stripe customer ID (set via payments middleware).
// @Description
// @Description  ## Prerequisites
// @Description  - User must be authenticated
// @Description  - Tenant must have a Stripe customer ID configured
// @Description  - If stripe_customer_id not found in context, returns 400: "stripe_customer_id not found in context"
// @Description
// @Description  ## Use Cases
// @Description  - API request metering
// @Description  - Compute time tracking
// @Description  - Storage usage recording
// @Description  - Any metered billing scenario
// @Tags         V1 Payments
// @Accept       json
// @Produce      json
// @Param        request body RecordUsageRequest true "Usage event parameters"
// @Success      200 {object} handlers.SuccessResponse "Usage recorded successfully"
// @Failure      400 {object} handlers.BadRequestResponse "Invalid request, empty fields, or stripe_customer_id not found in context"
// @Failure      401 {object} handlers.UnauthorizedResponse "Invalid or missing JWT token"
// @Failure      500 {object} handlers.InternalServerErrorResponse "Failed to record usage"
// @Router       /api/v1/payments/usage [post]
// @ID           recordUsage
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
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Error recording usage in stripe: %s", err))
		return
	}

	logger.Logger.Info("Usage recorded successfully", "meter_event_name", req.MeterEventName, "customer_id", customerID.(string))
	handlers.NewSuccessResponse(ctx, nil)
}

// CreateCustomerPortal creates a Stripe Customer Portal session
// @Summary      Create customer portal session
// @Description  Creates a Stripe Customer Portal session where users can manage their subscription, payment methods, and billing history.
// @Description
// @Description  ## Authentication
// @Description  Requires cookie authentication with an associated Stripe customer ID (set via payments middleware).
// @Description
// @Description  ## Prerequisites
// @Description  - User must be authenticated
// @Description  - Tenant must have a Stripe customer ID configured
// @Description  - If stripe_customer_id not found in context, returns 400: "stripe_customer_id not found in context"
// @Description
// @Description  ## Use Cases
// @Description  - Subscription management
// @Description  - Payment method updates
// @Description  - Invoice history viewing
// @Description  - Subscription cancellation
// @Tags         V1 Payments
// @Accept       json
// @Produce      json
// @Param        request body CreatePortalRequest true "Portal session parameters"
// @Success      200 {object} handlers.SuccessResponse{data=CreatePortalResponse} "Portal session created successfully"
// @Failure      400 {object} handlers.BadRequestResponse "Invalid request, empty return_url, or stripe_customer_id not found in context"
// @Failure      401 {object} handlers.UnauthorizedResponse "Invalid or missing JWT token"
// @Failure      500 {object} handlers.InternalServerErrorResponse "Failed to create portal session"
// @Router       /api/v1/payments/portal [post]
// @ID           createCustomerPortal
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
