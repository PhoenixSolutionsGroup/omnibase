package tenants

import (
	"api/internal/handlers"
	"api/internal/logger"
	"api/internal/models"
	"fmt"

	"github.com/gin-gonic/gin"
)

// GetTenantSubscriptions returns active Stripe subscriptions for the tenant
// @Summary      Get tenant subscriptions
// @Description  Returns all active Stripe subscriptions associated with the tenant's Stripe customer.
// @Description
// @Description  ## Authentication
// @Description  Requires JWT token with tenant context.
// @Description
// @Description  ## Use Cases
// @Description  - Display current subscriptions
// @Description  - Billing overview
// @Description  - Subscription management UI
// @Tags         V1 Tenants
// @Produce      json
// @Success      200 {object} handlers.SuccessResponse{data=[]models.SubscriptionResponse} "Tenant subscriptions retrieved successfully"
// @Failure      401 {object} handlers.UnauthorizedResponse "User not authenticated"
// @Failure      404 {object} handlers.NotFoundErrorResponse "Tenant not found"
// @Failure      500 {object} handlers.InternalServerErrorResponse "Failed to fetch subscriptions"
// @Security     CookieAuth,SessionTokenAuth,ServiceKeyAuth
// @Router       /api/v1/tenants/subscriptions [get]
// @ID           listTenantSubscriptions
func (h *TenantHandler) GetTenantSubscriptions(ctx *gin.Context) {
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

// GetBillingStatus checks if the tenant has billing information configured
// @Summary      Get billing status
// @Description  Checks whether the tenant has billing information configured in Stripe and if it's active.
// @Description
// @Description  ## Authentication
// @Description  Requires JWT token with tenant context.
// @Description
// @Description  ## Use Cases
// @Description  - Check if billing setup is required
// @Description  - Conditional feature access
// @Description  - Payment method verification
// @Tags         V1 Tenants
// @Produce      json
// @Success      200 {object} handlers.SuccessResponse{data=models.BillingStatusResponse} "Billing status retrieved successfully"
// @Failure      401 {object} handlers.UnauthorizedResponse "User not authenticated"
// @Failure      404 {object} handlers.NotFoundErrorResponse "Tenant not found"
// @Failure      500 {object} handlers.InternalServerErrorResponse "Failed to check billing status"
// @Security     CookieAuth,SessionTokenAuth,ServiceKeyAuth
// @Router       /api/v1/tenants/billing-status [get]
// @ID           getTenantBillingStatus
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

// AddSubscription adds a Stripe subscription for a customer with a specific plan
// @Summary      Add subscription
// @Description  Adds a Stripe subscription for the authenticated tenant using the provided plan ID.
// @Description
// @Description  ## Authentication
// @Description  Requires JWT token with tenant context.
// @Description
// @Description  ## Request Parameters
// @Description  - **plan_id** (required): The configuration item ID (e.g., "neon_compute_starter") that maps to a Stripe price
// @Description  - **stripe_customer_id** (optional): Override tenant's Stripe customer ID if needed
// @Description
// @Description  ## Process Flow
// @Description  1. Validates the plan_id and maps it to a Stripe price_id via the stripe_id_mappings table
// @Description  2. Resolves the Stripe customer ID from the authenticated tenant (or uses provided stripe_customer_id)
// @Description  3. Checks if subscription already exists for this plan to prevent duplicates
// @Description  4. Creates the subscription in Stripe with the specified price
// @Description  5. Returns the subscription ID and status
// @Description
// @Description  ## Notes
// @Description  - If a subscription for this plan already exists, returns a 400 error
// @Description  - The subscription is created immediately and begins billing
// @Description
// @Description  ## Use Cases
// @Description  - Subscribe tenant to metered pricing plans (compute, storage, workers)
// @Description  - Enable usage-based billing for resources
// @Description  - Add additional services to tenant's billing
// @Tags         V1 Tenants
// @Accept       json
// @Produce      json
// @Param        request body AddSubscriptionRequest true "Subscription addition parameters"
// @Success      200 {object} handlers.SuccessResponse{data=AddSubscriptionResponse} "Subscription added successfully"
// @Failure      400 {object} handlers.BadRequestResponse "Invalid request payload, tenant missing Stripe customer ID, or subscription already exists"
// @Failure      401 {object} handlers.UnauthorizedResponse "User not authenticated"
// @Failure      404 {object} handlers.NotFoundErrorResponse "Plan not found - no Stripe price mapping found for the provided plan_id"
// @Failure      500 {object} handlers.InternalServerErrorResponse "Failed to create subscription or fetch tenant"
// @Security     CookieAuth,SessionTokenAuth,ServiceKeyAuth
// @Router       /api/v1/tenants/subscriptions [post]
// @ID           addSubscription
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

// RemoveSubscription cancels a Stripe subscription for a customer immediately
// @Summary      Remove subscription
// @Description  Cancels a Stripe subscription immediately for the authenticated tenant based on the plan ID.
// @Description
// @Description  ## Authentication
// @Description  Requires JWT token with tenant context.
// @Description
// @Description  ## Request Parameters
// @Description  - **plan_id** (required): The configuration item ID (e.g., "neon_compute_starter") to identify which subscription to cancel
// @Description  - **stripe_customer_id** (optional): Override tenant's Stripe customer ID if needed
// @Description
// @Description  ## Process Flow
// @Description  1. Validates the plan_id and maps it to a Stripe price_id via the stripe_id_mappings table
// @Description  2. Resolves the Stripe customer ID from the authenticated tenant (or uses provided stripe_customer_id)
// @Description  3. Finds the active subscription matching the price_id for the customer
// @Description  4. Cancels the subscription immediately in Stripe
// @Description  5. Returns the cancellation confirmation
// @Description
// @Description  ## Notes
// @Description  - The subscription is canceled immediately, not at the end of the billing period
// @Description  - If no matching subscription is found, returns a 404 error
// @Description  - Only active, trialing, or past_due subscriptions can be canceled
// @Description
// @Description  ## Use Cases
// @Description  - Remove specific service subscriptions from tenant
// @Description  - Downgrade by removing premium features
// @Description  - Stop billing for unused resources
// @Tags         V1 Tenants
// @Accept       json
// @Produce      json
// @Param        request body RemoveSubscriptionRequest true "Subscription removal parameters"
// @Success      200 {object} handlers.SuccessResponse{data=RemoveSubscriptionResponse} "Subscription canceled successfully"
// @Failure      400 {object} handlers.BadRequestResponse "Invalid request payload or tenant missing Stripe customer ID"
// @Failure      401 {object} handlers.UnauthorizedResponse "User not authenticated"
// @Failure      404 {object} handlers.NotFoundErrorResponse "No matching subscription found for the plan"
// @Failure      500 {object} handlers.InternalServerErrorResponse "Failed to cancel subscription or map plan_id"
// @Security     CookieAuth,SessionTokenAuth,ServiceKeyAuth
// @Router       /api/v1/tenants/subscriptions [delete]
// @ID           removeSubscription
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
