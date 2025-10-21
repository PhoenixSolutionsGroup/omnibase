package v1

import (
	"api/internal/config"
	"api/internal/database"
	"api/internal/handlers"
	services_v1 "api/internal/service/v1"
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
)

type PaymentsHandler struct {
	stripe *services_v1.StripeService
}

func NewPaymentsHandler(cfg *config.Config) *PaymentsHandler {
	db, err := database.GetConnection(cfg.Database)
	if err != nil {
		log.Panicf("Failed to connect to database: %s", err)
	}

	stripe := services_v1.NewStripeService(cfg, db)
	return &PaymentsHandler{
		stripe: stripe,
	}
}

type CreateCheckoutRequest struct {
	PriceID    string `json:"price_id" binding:"required"`
	SuccessURL string `json:"success_url" binding:"required"`
	CancelURL  string `json:"cancel_url" binding:"required"`
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
	var req CreateCheckoutRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		handlers.NewBadRequestResponse(ctx, "Request payload incorrect")
		return
	}

	priceID, err := h.stripe.GetStripeIDByConfigID(req.PriceID)
	if err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to map config_id -> stripe_id: %s", err))
		return
	}

	// Get customer_id from middleware context (may be empty string if not set)
	customerID, _ := ctx.Get("stripe_customer_id")
	customerIDStr := ""
	if customerID != nil {
		customerIDStr = customerID.(string)
	}

	session, err := h.stripe.CreateCheckoutSession(
		priceID,
		req.SuccessURL,
		req.CancelURL,
		customerIDStr,
	)

	if err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to create checkout session: %s", err))
		return
	}

	handlers.NewSuccessResponse(ctx, &CreateCheckoutResponse{
		URL:       session.URL,
		SessionID: session.ID,
	})
}

// (POST) /api/v1/payments/usage
func (h *PaymentsHandler) RecordUsage(ctx *gin.Context) {
	var req RecordUsageRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		handlers.NewBadRequestResponse(ctx, "Request payload incorrect")
		return
	}

	// Get customer_id from middleware context
	customerID, exists := ctx.Get("stripe_customer_id")
	if !exists || customerID == nil {
		handlers.NewBadRequestResponse(ctx, "stripe_customer_id not found in context")
		return
	}

	err := h.stripe.RecordUsage(req.MeterEventName, customerID.(string), req.Value)
	if err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Error recording usage in stripe: %s", err))
		return
	}

	handlers.NewSuccessResponse(ctx, "")
}

// (POST) /api/v1/payments/portal
func (h *PaymentsHandler) CreateCustomerPortal(ctx *gin.Context) {
	var req CreatePortalRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		handlers.NewBadRequestResponse(ctx, "Request payload incorrect")
		return
	}

	// Get customer_id from middleware context
	customerID, exists := ctx.Get("stripe_customer_id")
	if !exists || customerID == nil {
		handlers.NewBadRequestResponse(ctx, "stripe_customer_id not found in context")
		return
	}

	session, err := h.stripe.CreatePortalSession(customerID.(string), req.ReturnURL)
	if err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to create stripe portal session with stripe: %s", err))
		return
	}

	handlers.NewSuccessResponse(ctx, &CreatePortalResponse{
		URL: session.URL,
	})
}
