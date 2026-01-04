package tenants

import (
	"api/internal/handlers"
	"api/internal/logger"
	"api/internal/models"
	"fmt"

	"github.com/gin-gonic/gin"
)

func (h *TenantHandler) ListTenantSubscriptions(ctx *gin.Context) {
	tenantID := ctx.GetString("tenant_id")

	if tenantID == "" {
		handlers.NewUnauthorizedResponse(ctx, "User not authenticated")
		return
	}

	logger.Logger.Debug("Fetching tenant subscriptions", "tenant_id", tenantID)

	var tenant models.Tenant
	if err := h.db.Where("id = ?", tenantID).First(&tenant).Error; err != nil {
		logger.Logger.Error("Failed to fetch tenant", "error", err, "tenant_id", tenantID)
		handlers.NewNotFoundResponse(ctx, "Tenant not found")
		return
	}

	if tenant.StripeCustomerID == nil || *tenant.StripeCustomerID == "" {
		logger.Logger.Debug("Tenant has no Stripe customer ID, returning empty subscriptions", "tenant_id", tenantID)
		handlers.NewSuccessResponse(ctx, []interface{}{})
		return
	}

	subscriptions, err := h.stripe.GetTenantActiveSubscriptions(*tenant.StripeCustomerID)
	if err != nil {
		logger.Logger.Error("Failed to fetch subscriptions from Stripe", "error", err, "tenant_id", tenantID, "stripe_customer_id", *tenant.StripeCustomerID)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to fetch subscriptions: %w", err))
		return
	}

	// Ensure subscriptions is never null
	if subscriptions == nil {
		subscriptions = []models.SubscriptionResponse{}
	}

	logger.Logger.Info("Successfully fetched tenant subscriptions", "tenant_id", tenantID, "subscription_count", len(subscriptions))
	handlers.NewSuccessResponse(ctx, subscriptions)
}

func (h *TenantHandler) GetTenantSubscription(ctx *gin.Context) {
	tenantID := ctx.GetString("tenant_id")
	configPriceID := ctx.Param("config_price_id")

	if tenantID == "" {
		handlers.NewUnauthorizedResponse(ctx, "User not authenticated")
		return
	}

	if configPriceID == "" {
		handlers.NewBadRequestResponse(ctx, "config_price_id is required")
		return
	}

	logger.Logger.Debug("Fetching tenant subscription", "tenant_id", tenantID, "config_price_id", configPriceID)

	var tenant models.Tenant
	if err := h.db.Where("id = ?", tenantID).First(&tenant).Error; err != nil {
		logger.Logger.Error("Failed to fetch tenant", "error", err, "tenant_id", tenantID)
		handlers.NewNotFoundResponse(ctx, "Tenant not found")
		return
	}

	if tenant.StripeCustomerID == nil || *tenant.StripeCustomerID == "" {
		logger.Logger.Debug("Tenant has no Stripe customer ID", "tenant_id", tenantID)
		handlers.NewNotFoundResponse(ctx, fmt.Sprintf("No subscription found for plan: %s", configPriceID))
		return
	}

	subscriptions, err := h.stripe.GetTenantActiveSubscriptions(*tenant.StripeCustomerID)
	if err != nil {
		logger.Logger.Error("Failed to fetch subscriptions from Stripe", "error", err, "tenant_id", tenantID, "stripe_customer_id", *tenant.StripeCustomerID)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to fetch subscriptions: %w", err))
		return
	}

	for _, sub := range subscriptions {
		if sub.ConfigPriceID == configPriceID {
			logger.Logger.Info("Found subscription for plan", "tenant_id", tenantID, "config_price_id", configPriceID, "subscription_id", sub.SubscriptionID)
			handlers.NewSuccessResponse(ctx, sub)
			return
		}
	}

	logger.Logger.Debug("No subscription found for plan", "tenant_id", tenantID, "config_price_id", configPriceID)
	handlers.NewNotFoundResponse(ctx, fmt.Sprintf("No subscription found for plan: %s", configPriceID))
}

func (h *TenantHandler) GetBillingStatus(ctx *gin.Context) {
	tenantID := ctx.GetString("tenant_id")

	if tenantID == "" {
		handlers.NewUnauthorizedResponse(ctx, "User not authenticated")
		return
	}

	logger.Logger.Debug("Checking tenant billing status", "tenant_id", tenantID)

	var tenant models.Tenant
	if err := h.db.Where("id = ?", tenantID).First(&tenant).Error; err != nil {
		logger.Logger.Error("Failed to fetch tenant", "error", err, "tenant_id", tenantID)
		handlers.NewNotFoundResponse(ctx, "Tenant not found")
		return
	}

	if tenant.StripeCustomerID == nil || *tenant.StripeCustomerID == "" {
		logger.Logger.Debug("Tenant has no Stripe customer ID, no billing info", "tenant_id", tenantID)
		handlers.NewSuccessResponse(ctx, models.BillingStatusResponse{
			IsActive: false,
		})
		return
	}

	hasBilling, err := h.stripe.CheckBillingStatus(*tenant.StripeCustomerID)
	if err != nil {
		logger.Logger.Error("Failed to check billing status", "error", err, "tenant_id", tenantID, "stripe_customer_id", *tenant.StripeCustomerID)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to check billing status: %w", err))
		return
	}

	logger.Logger.Info("Successfully checked billing status", "tenant_id", tenantID, "has_billing", hasBilling)
	handlers.NewSuccessResponse(ctx, models.BillingStatusResponse{
		IsActive: hasBilling,
	})
}

// AddSubscriptionRequest represents the request to add a subscription
type AddSubscriptionRequest struct {
	// The plan ID from your Stripe configuration (required, cannot be empty)
	PlanID string `json:"plan_id" binding:"required,min=1" example:"price_test_basic"`
	// Optional Stripe customer ID to use directly (provide either tenant_id OR stripe_customer_id)
	StripeCustomerID string `json:"stripe_customer_id,omitempty" binding:"omitempty,min=1" example:"cus_test_123"`
}

// AddSubscriptionResponse represents the subscription addition response
type AddSubscriptionResponse struct {
	// Stripe Subscription ID
	SubscriptionID string `json:"subscription_id" example:"sub_test_123"`
	// Subscription status (active, trialing, etc.)
	Status string `json:"status" example:"active"`
	// Message confirming the addition
	Message string `json:"message" example:"Subscription added successfully"`
}

func (h *TenantHandler) AddSubscription(ctx *gin.Context) {
	logger.Logger.Info("AddSubscription handler started")

	tenantID := ctx.GetString("tenant_id")
	if tenantID == "" {
		handlers.NewUnauthorizedResponse(ctx, "User not authenticated")
		return
	}

	var req AddSubscriptionRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		logger.Logger.Warn("Invalid JSON format in AddSubscription request", "error", err)
		handlers.NewBadRequestResponse(ctx, "Invalid JSON format")
		return
	}

	logger.Logger.Debug("Processing subscription addition", "tenant_id", tenantID, "plan_id", req.PlanID)

	// Resolve config plan_id to stripe price_id
	priceID, err := h.stripe.GetStripeIDByConfigID(req.PlanID)
	if err != nil {
		logger.Logger.Warn("Failed to map plan_id to stripe_id", "plan_id", req.PlanID, "error", err)
		handlers.NewNotFoundResponse(ctx, fmt.Sprintf("Plan not found: %s", req.PlanID))
		return
	}

	logger.Logger.Debug("Mapped plan_id to stripe_id", "plan_id", req.PlanID, "stripe_id", priceID)

	// Resolve customer ID
	if req.StripeCustomerID == "" {
		var tenant models.Tenant
		if err := h.db.Where("id = ?", tenantID).First(&tenant).Error; err != nil {
			logger.Logger.Error("Failed to fetch tenant from database", "tenant_id", tenantID, "error", err)
			handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Tenant not found: %s", err))
			return
		}

		if tenant.StripeCustomerID == nil || *tenant.StripeCustomerID == "" {
			logger.Logger.Error("Tenant missing stripe_customer_id", "tenant_id", tenantID)
			handlers.NewBadRequestResponse(ctx, "Tenant does not have a Stripe customer ID")
			return
		}

		req.StripeCustomerID = *tenant.StripeCustomerID
	}

	logger.Logger.Debug("Checking for existing subscription",
		"tenant_id", tenantID,
		"customer_id", req.StripeCustomerID,
		"price_id", priceID)

	// Get all active subscriptions to check if subscription already exists
	subscriptions, err := h.stripe.GetTenantActiveSubscriptions(req.StripeCustomerID)
	if err != nil {
		logger.Logger.Error("Failed to fetch tenant subscriptions",
			"customer_id", req.StripeCustomerID,
			"error", err)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to fetch subscriptions: %s", err))
		return
	}

	// Check if subscription already exists for this plan
	for _, sub := range subscriptions {
		if sub.ConfigPriceID == req.PlanID {
			logger.Logger.Warn("Subscription already exists for plan",
				"plan_id", req.PlanID,
				"subscription_id", sub.SubscriptionID,
				"customer_id", req.StripeCustomerID)
			handlers.NewBadRequestResponse(ctx, fmt.Sprintf("Subscription already exists for plan: %s", req.PlanID))
			return
		}
	}

	logger.Logger.Debug("Creating subscription for tenant",
		"tenant_id", tenantID,
		"customer_id", req.StripeCustomerID,
		"price_id", priceID)

	// Create subscription via Stripe service
	subscription, err := h.stripe.CreateSubscription(req.StripeCustomerID, priceID)
	if err != nil {
		logger.Logger.Error("Failed to create Stripe subscription",
			"customer_id", req.StripeCustomerID,
			"price_id", priceID,
			"error", err)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to create subscription: %s", err))
		return
	}

	logger.Logger.Info("Subscription added successfully",
		"subscription_id", subscription.ID,
		"customer_id", req.StripeCustomerID,
		"status", subscription.Status,
		"plan_id", req.PlanID)

	handlers.NewSuccessResponse(ctx, &AddSubscriptionResponse{
		SubscriptionID: subscription.ID,
		Status:         string(subscription.Status),
		Message:        "Subscription added successfully",
	})
}

// RemoveSubscriptionRequest represents the request to remove a subscription
type RemoveSubscriptionRequest struct {
	// The plan ID from your Stripe configuration (required, cannot be empty)
	PlanID string `json:"plan_id" binding:"required,min=1" example:"price_test_basic"`
	// Optional Stripe customer ID to use directly (provide either tenant_id OR stripe_customer_id)
	StripeCustomerID string `json:"stripe_customer_id,omitempty" binding:"omitempty,min=1" example:"cus_test_123"`
}

// RemoveSubscriptionResponse represents the subscription removal response
type RemoveSubscriptionResponse struct {
	// Stripe Subscription ID that was canceled
	SubscriptionID string `json:"subscription_id" example:"sub_test_123"`
	// Subscription status after cancellation
	Status string `json:"status" example:"canceled"`
	// Message confirming the cancellation
	Message string `json:"message" example:"Subscription canceled successfully"`
}

func (h *TenantHandler) RemoveSubscription(ctx *gin.Context) {
	logger.Logger.Info("RemoveSubscription handler started")

	tenantID := ctx.GetString("tenant_id")
	if tenantID == "" {
		handlers.NewUnauthorizedResponse(ctx, "User not authenticated")
		return
	}

	var req RemoveSubscriptionRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		logger.Logger.Warn("Invalid JSON format in RemoveSubscription request", "error", err)
		handlers.NewBadRequestResponse(ctx, "Invalid JSON format")
		return
	}

	logger.Logger.Debug("Processing subscription removal", "tenant_id", tenantID, "plan_id", req.PlanID)

	// Resolve config plan_id to stripe price_id
	priceID, err := h.stripe.GetStripeIDByConfigID(req.PlanID)
	if err != nil {
		logger.Logger.Warn("Failed to map plan_id to stripe_id", "plan_id", req.PlanID, "error", err)
		handlers.NewNotFoundResponse(ctx, fmt.Sprintf("Plan not found: %s", req.PlanID))
		return
	}

	logger.Logger.Debug("Mapped plan_id to stripe_id", "plan_id", req.PlanID, "stripe_id", priceID)

	// Resolve customer ID
	if req.StripeCustomerID == "" {
		var tenant models.Tenant
		if err := h.db.Where("id = ?", tenantID).First(&tenant).Error; err != nil {
			logger.Logger.Error("Failed to fetch tenant from database", "tenant_id", tenantID, "error", err)
			handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Tenant not found: %s", err))
			return
		}

		if tenant.StripeCustomerID == nil || *tenant.StripeCustomerID == "" {
			logger.Logger.Error("Tenant missing stripe_customer_id", "tenant_id", tenantID)
			handlers.NewBadRequestResponse(ctx, "Tenant does not have a Stripe customer ID")
			return
		}

		req.StripeCustomerID = *tenant.StripeCustomerID
	}

	logger.Logger.Debug("Fetching tenant subscriptions to find matching subscription",
		"tenant_id", tenantID,
		"customer_id", req.StripeCustomerID,
		"price_id", priceID)

	// Get all active subscriptions to find the one with matching price
	subscriptions, err := h.stripe.GetTenantActiveSubscriptions(req.StripeCustomerID)
	if err != nil {
		logger.Logger.Error("Failed to fetch tenant subscriptions",
			"customer_id", req.StripeCustomerID,
			"error", err)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to fetch subscriptions: %s", err))
		return
	}

	// Find subscription matching the plan_id
	var subscriptionID string
	for _, sub := range subscriptions {
		if sub.ConfigPriceID == req.PlanID {
			subscriptionID = sub.SubscriptionID
			logger.Logger.Debug("Found matching subscription",
				"subscription_id", subscriptionID,
				"config_price_id", sub.ConfigPriceID)
			break
		}
	}

	if subscriptionID == "" {
		logger.Logger.Warn("No active subscription found for plan",
			"plan_id", req.PlanID,
			"customer_id", req.StripeCustomerID)
		handlers.NewNotFoundResponse(ctx, fmt.Sprintf("No active subscription found for plan: %s", req.PlanID))
		return
	}

	logger.Logger.Debug("Canceling subscription",
		"subscription_id", subscriptionID,
		"customer_id", req.StripeCustomerID,
		"plan_id", req.PlanID)

	// Cancel the subscription via Stripe service
	canceledSub, err := h.stripe.CancelSubscription(subscriptionID)
	if err != nil {
		logger.Logger.Error("Failed to cancel Stripe subscription",
			"subscription_id", subscriptionID,
			"error", err)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to cancel subscription: %s", err))
		return
	}

	logger.Logger.Info("Subscription canceled successfully",
		"subscription_id", canceledSub.ID,
		"customer_id", req.StripeCustomerID,
		"status", canceledSub.Status,
		"plan_id", req.PlanID)

	handlers.NewSuccessResponse(ctx, &RemoveSubscriptionResponse{
		SubscriptionID: canceledSub.ID,
		Status:         string(canceledSub.Status),
		Message:        "Subscription canceled successfully",
	})
}
