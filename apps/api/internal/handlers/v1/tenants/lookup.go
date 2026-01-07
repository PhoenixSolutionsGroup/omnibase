package tenants

import (
	"api/internal/handlers"
	"api/internal/logger"
	"api/internal/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// GetTenantByIDResponse represents the response for getting a tenant by ID
type GetTenantByIDResponse struct {
	Tenant models.Tenant `json:"tenant" binding:"required"`
}

// GetTenantByStripeCustomerIDResponse represents the response for getting a tenant by Stripe customer ID
type GetTenantByStripeCustomerIDResponse struct {
	Tenant models.Tenant `json:"tenant" binding:"required"`
}

func (h *TenantHandler) GetTenantByID(ctx *gin.Context) {
	tenantID := ctx.Param("tenant_id")

	if tenantID == "" {
		handlers.NewBadRequestResponse(ctx, "tenant_id is required")
		return
	}

	logger.Logger.Debug("Fetching tenant by ID", "tenant_id", tenantID)

	var tenant models.Tenant
	if err := h.db.Where("id = ?", tenantID).First(&tenant).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			logger.Logger.Debug("Tenant not found", "tenant_id", tenantID)
			handlers.NewNotFoundResponse(ctx, "Tenant not found")
			return
		}
		logger.Logger.Error("Failed to fetch tenant", "error", err, "tenant_id", tenantID)
		handlers.NewInternalServerErrorResponse(ctx, err)
		return
	}

	logger.Logger.Info("Tenant fetched successfully", "tenant_id", tenantID)
	handlers.NewSuccessResponse(ctx, GetTenantByIDResponse{
		Tenant: tenant,
	})
}

func (h *TenantHandler) GetTenantByStripeCustomerID(ctx *gin.Context) {
	stripeCustomerID := ctx.Param("stripe_customer_id")

	if stripeCustomerID == "" {
		handlers.NewBadRequestResponse(ctx, "stripe_customer_id is required")
		return
	}

	logger.Logger.Debug("Fetching tenant by Stripe customer ID", "stripe_customer_id", stripeCustomerID)

	var tenant models.Tenant
	if err := h.db.Where("stripe_customer_id = ?", stripeCustomerID).First(&tenant).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			logger.Logger.Debug("Tenant not found for Stripe customer ID", "stripe_customer_id", stripeCustomerID)
			handlers.NewNotFoundResponse(ctx, "Tenant not found")
			return
		}
		logger.Logger.Error("Failed to fetch tenant by Stripe customer ID", "error", err, "stripe_customer_id", stripeCustomerID)
		handlers.NewInternalServerErrorResponse(ctx, err)
		return
	}

	logger.Logger.Info("Tenant fetched successfully by Stripe customer ID",
		"tenant_id", tenant.ID,
		"stripe_customer_id", stripeCustomerID)
	handlers.NewSuccessResponse(ctx, GetTenantByStripeCustomerIDResponse{
		Tenant: tenant,
	})
}
