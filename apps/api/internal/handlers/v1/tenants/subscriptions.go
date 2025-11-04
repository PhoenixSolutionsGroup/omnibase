package tenants

import (
	"api/internal/handlers"
	"api/internal/logger"
	"api/internal/models"
	"fmt"

	"github.com/gin-gonic/gin"
)

// GET /api/v1/tenants/subscriptions
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

	logger.Logger.Info("Successfully fetched tenant subscriptions", "tenant_id", tenantID, "subscription_count", len(subscriptions))
	handlers.NewSuccessResponse(ctx, subscriptions)
}

// GET /api/v1/tenants/billing-status
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
			HasBillingInfo: false,
			IsActive:       false,
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
		HasBillingInfo: hasBilling,
		IsActive:       hasBilling,
	})
}
