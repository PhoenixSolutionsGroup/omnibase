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
)

type PaymentsHandler struct {
	stripe *services_v1.StripeService
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
	}
}

type CreateCheckoutRequest struct {
	PriceID             string `json:"price_id" binding:"required"`
	SuccessURL          string `json:"success_url" binding:"required"`
	CancelURL           string `json:"cancel_url" binding:"required"`
	TrialPeriodDays     *int64 `json:"trial_period_days,omitempty"`
	PromotionCode       string `json:"promotion_code,omitempty"`
	AllowPromotionCodes *bool  `json:"allow_promotion_codes,omitempty"`
}

type CreateCheckoutResponse struct {
	URL       string `json:"url"`
	SessionID string `json:"session_id"`
}

type RecordUsageRequest struct {
	MeterEventName string `json:"meter_event_name" binding:"required"`
	Value          string `json:"value" binding:"required"`
}

type CreatePortalRequest struct {
	ReturnURL string `json:"return_url" binding:"required"`
}

type CreatePortalResponse struct {
	URL string `json:"url" binding:"required"`
}

// (POST) /api/v1/payments/checkout
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
		logger.Logger.Error("Failed to map config_id to stripe_id", "config_id", req.PriceID, "error", err)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to map config_id -> stripe_id: %s", err))
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

// (POST) /api/v1/payments/usage
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
	handlers.NewSuccessResponse(ctx, "")
}

// (POST) /api/v1/payments/portal
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
