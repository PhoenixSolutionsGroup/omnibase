package tenants

import (
	"api/internal/handlers"
	"api/internal/logger"
	"api/internal/models"
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CreateTenantRequest struct {
	Name         string `json:"name" binding:"required"`
	BillingEmail string `json:"billing_email"`
	UserID       string `json:"user_id" binding:"required"`
}

type SwitchTenantRequest struct {
	TenantID string `json:"tenant_id" binding:"required"`
}

// POST api/v1/tenants - Create Tenant + Stripe Customer + Set Active Tenant for User
func (h *TenantHandler) CreateTenant(ctx *gin.Context) {
	var req CreateTenantRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		handlers.NewBadRequestResponse(ctx, "Invalid request format")
		return
	}

	var stripeCustomerID string
	if req.BillingEmail != "" {
		customerID, err := h.stripe.CreateStripeCustomer(req.BillingEmail, req.Name)
		if err != nil {
			handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to create Stripe customer: %s", err))
			return
		}
		stripeCustomerID = customerID
	}

	tenant := models.Tenant{
		ID:               uuid.New().String(),
		Name:             req.Name,
		Type:             "organization",
		StripeCustomerID: &stripeCustomerID,
		CreatedAt:        time.Now(),
		UpdatedAt:        time.Now(),
	}

	if err := h.db.Create(&tenant).Error; err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to create tenant: %s", err))
		return
	}

	tenantSettings := models.TenantSettings{
		TenantID:         tenant.ID,
		AllowUserInvites: true,
		MaxMembers:       10,
	}

	if err := h.db.Create(&tenantSettings).Error; err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to create tenant settings: %s", err))
		return
	}

	tenantUser := models.TenantUser{
		ID:       uuid.New().String(),
		TenantID: tenant.ID,
		UserID:   req.UserID,
		Role:     "owner",
		IsActive: true, // This will be the active tenant
		JoinedAt: time.Now(),
	}

	if err := h.db.Create(&tenantUser).Error; err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to add user to tenant: %s", err))
		return
	}

	// Assign owner role to user with all its permissions
	logger.Logger.Info("Assigning owner role to tenant creator",
		"user_id", req.UserID,
		"tenant_id", tenant.ID)

	if err := h.roles.AssignRoleByName(ctx.Request.Context(), req.UserID, "owner", tenant.ID); err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to assign owner role: %w", err))
		return
	}

	// Set this as the active tenant for the user
	token, err := h.tenants.SetActiveTenant(req.UserID, tenant.ID)

	if err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to set active tenant: %s", err))
		return
	}

	err = h.tenants.UpdateUserMetadata(ctx, req.UserID, true)
	if err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to update user metadata: %s", err))
	}

	handlers.NewSuccessResponse(ctx, gin.H{
		"tenant":  tenant,
		"token":   token,
		"message": "Tenant created successfully",
	})
}

// Delete api/v1/tenants - Cleanup Stripe, Cleanup Keto
func (h *TenantHandler) DeleteTenant(ctx *gin.Context) {
	tenantID := ctx.GetString("tenant_id")
	if tenantID == "" {
		handlers.NewBadRequestResponse(ctx, "Tenant ID is required")
		return
	}

	userID := ctx.GetString("user_id")
	if userID == "" {
		handlers.NewUnauthorizedResponse(ctx, "User not authenticated")
		return
	}

	// Get the tenant to check if it exists and get Stripe customer ID
	var tenant models.Tenant
	if err := h.db.First(&tenant, "id = ?", tenantID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			handlers.NewNotFoundResponse(ctx, "Tenant not found")
			return
		}
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to get tenant: %s", err))
		return
	}

	// Check if user has permission to delete this tenant
	canDelete, err := h.keto.CheckPermission(ctx.Request.Context(), "Tenant", tenantID, "delete_tenant", userID)
	if err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to check permissions: %w", err))
		return
	}
	if !canDelete {
		handlers.NewForbiddenResponse(ctx, "Insufficient permissions to delete tenant")
		return
	}

	// Get all users in this tenant before deletion
	var tenantUsers []models.TenantUser
	if err := h.db.Where("tenant_id = ?", tenantID).Find(&tenantUsers).Error; err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to get tenant users: %s", err))
		return
	}

	// Archive Stripe customer if it exists
	if tenant.StripeCustomerID != nil && *tenant.StripeCustomerID != "" {
		if err := h.stripe.ArchiveStripeCustomer(*tenant.StripeCustomerID); err != nil {
			handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to archive Stripe customer: %s", err))
			return
		}
	}

	// Delete the tenant (this will cascade delete tenant_users, tenant_settings, and tenant_invites)
	if err := h.db.Delete(&tenant).Error; err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to delete tenant: %s", err))
		return
	}

	// Handle tenant cleanup for each user that was in this tenant
	for _, tenantUser := range tenantUsers {
		if err := h.tenants.HandleUserTenantCleanup(ctx, tenantUser.UserID); err != nil {
			fmt.Printf("Warning: Failed to cleanup user %s after tenant deletion: %v\n", tenantUser.UserID, err)
		}
	}

	handlers.NewSuccessResponse(ctx, gin.H{
		"message": "Tenant deleted successfully",
	})

}

// PUT api/v1/tenants/switch-active - Update Kratos identity traits to new active tenant
func (h *TenantHandler) UpdateUsersActiveTenant(ctx *gin.Context) {
	var req SwitchTenantRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		handlers.NewBadRequestResponse(ctx, "Invalid request format")
		return
	}

	userID := ctx.GetString("user_id")
	if userID == "" {
		handlers.NewUnauthorizedResponse(ctx, "User not authenticated")
		return
	}

	token, err := h.tenants.SetActiveTenant(userID, req.TenantID)
	if err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to set active tenant: %s", err))
		return
	}

	handlers.NewSuccessResponse(ctx, gin.H{
		"token":   token,
		"message": "Successfully switched tenants",
	})
}

// GET api/v1/tenants/jwt
func (h *TenantHandler) GetPostgRESTJWTToken(ctx *gin.Context) {
	userID := ctx.GetString("user_id")
	if userID == "" {
		handlers.NewUnauthorizedResponse(ctx, "User not authenticated")
		return
	}

	// Get user's active tenant
	var tenantUser models.TenantUser
	if err := h.db.Where("user_id = ? AND is_active = ?", userID, true).First(&tenantUser).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			handlers.NewBadRequestResponse(ctx, "No active tenant found for user")
			return
		}
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to get active tenant: %s", err))
		return
	}

	// Create JWT token
	token, err := h.tenants.CreateJWTToken(userID, tenantUser.TenantID)
	if err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to create JWT token: %s", err))
		return
	}

	handlers.NewSuccessResponse(ctx, gin.H{
		"token": token,
	})
}
