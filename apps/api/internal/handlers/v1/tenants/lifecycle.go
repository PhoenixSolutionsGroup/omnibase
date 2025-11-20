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

// CreateTenantRequest represents the request to create a new tenant
type CreateTenantRequest struct {
	// Organization name
	Name string `json:"name" binding:"required,min=1" example:"Test Organization"`
	// Billing email for Stripe customer
	BillingEmail string `json:"billing_email" example:"billing@test.example.com"`
}

// CreateTenantResponse represents the tenant creation response
type CreateTenantResponse struct {
	// Created tenant
	Tenant models.Tenant `json:"tenant" binding:"required"`
	// JWT token with tenant context
	Token string `json:"token" binding:"required" example:"eyJhbGciOiJIUzI1NiIs..."`
	// Success message
	Message string `json:"message" binding:"required" example:"Tenant created successfully"`
}

// SwitchTenantRequest represents the request to switch active tenant
type SwitchTenantRequest struct {
	// Target tenant ID
	TenantID string `json:"tenant_id" binding:"required,min=1" example:"tenant_test_123"`
}

// SwitchTenantResponse represents the tenant switch response
type SwitchTenantResponse struct {
	// New JWT token with updated tenant context
	Token string `json:"token" binding:"required" example:"eyJhbGciOiJIUzI1NiIs..."`
	// Success message
	Message string `json:"message" binding:"required" example:"Successfully switched tenants"`
}

// DeleteTenantResponse represents the tenant deletion response
type DeleteTenantResponse struct {
	// Success message
	Message string `json:"message" binding:"required" example:"Tenant deleted successfully"`
}

// JWTTokenResponse represents the JWT token response
type JWTTokenResponse struct {
	// PostgREST JWT token
	Token string `json:"token" binding:"required" example:"eyJhbGciOiJIUzI1NiIs..."`
}

func (h *TenantHandler) CreateTenant(ctx *gin.Context) {
	logger.Logger.Info("CreateTenant handler started")

	var req CreateTenantRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		logger.Logger.Warn("Failed to bind JSON request", "error", err, "user_id", ctx.GetString("user_id"))
		handlers.NewBadRequestResponse(ctx, "Invalid request format")
		return
	}

	logger.Logger.Debug("Request bound successfully", "tenant_name", req.Name)

	userID := ctx.GetString("user_id")
	if userID == "" {
		handlers.NewUnauthorizedResponse(ctx, "User not authenticated")
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
		UserID:   userID,
		Role:     "owner",
		IsActive: true, // This will be the active tenant
		JoinedAt: time.Now(),
	}

	if err := h.db.Create(&tenantUser).Error; err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to add user to tenant: %s", err))
		return
	}

	// Clone role templates for this tenant
	logger.Logger.Info("Cloning role templates for tenant", "tenant_id", tenant.ID)
	if err := h.cloneRoleTemplates(tenant.ID); err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to clone role templates: %w", err))
		return
	}

	// Assign owner role to user with all its permissions
	logger.Logger.Info("Assigning owner role to tenant creator",
		"user_id", userID,
		"tenant_id", tenant.ID)

	if err := h.roles.AssignRoleByName(ctx.Request.Context(), userID, "owner", tenant.ID); err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to assign owner role: %w", err))
		return
	}

	// Set this as the active tenant for the user
	token, err := h.tenants.SetActiveTenant(userID, tenant.ID)

	if err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to set active tenant: %s", err))
		return
	}

	err = h.tenants.UpdateUserMetadata(ctx, userID, true)
	if err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to update user metadata: %s", err))
		return
	}

	handlers.NewSuccessResponse(ctx, CreateTenantResponse{
		Tenant:  tenant,
		Token:   token,
		Message: "Tenant created successfully",
	})
}

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
	logger.Logger.Info("Cleaning up tenant users after tenant deletion", "user_count", len(tenantUsers))
	for _, tenantUser := range tenantUsers {
		if err := h.tenants.HandleUserTenantCleanup(ctx, tenantUser.UserID); err != nil {
			logger.Logger.Warn("Failed to cleanup user after tenant deletion", "user_id", tenantUser.UserID, "error", err)
		} else {
			logger.Logger.Debug("Successfully cleaned up user after tenant deletion", "user_id", tenantUser.UserID)
		}
	}

	handlers.NewSuccessResponse(ctx, DeleteTenantResponse{
		Message: "Tenant deleted successfully",
	})

}

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

	handlers.NewSuccessResponse(ctx, SwitchTenantResponse{
		Token:   token,
		Message: "Successfully switched tenants",
	})
}

func (h *TenantHandler) GetPostgRESTJWTToken(ctx *gin.Context) {
	userID := ctx.GetString("user_id")
	if userID == "" {
		handlers.NewUnauthorizedResponse(ctx, "User not authenticated")
		return
	}

	tenantID := ctx.GetString("tenant_id")
	if tenantID == "" {
		handlers.NewUnauthorizedResponse(ctx, "Tenant not authenticated")
		return
	}

	var tenantUser models.TenantUser
	if err := h.db.Where("user_id = ? AND tenant_id = ?", userID, tenantID).First(&tenantUser).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			handlers.NewForbiddenResponse(ctx, "User is not a member of this tenant")
			return
		}
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to verify tenant membership: %s", err))
		return
	}

	// Create JWT token
	token, err := h.tenants.CreateJWTToken(userID, tenantID)
	if err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to create JWT token: %s", err))
		return
	}

	handlers.NewSuccessResponse(ctx, JWTTokenResponse{
		Token: token,
	})
}

// cloneRoleTemplates creates tenant-specific copies of all role templates
func (h *TenantHandler) cloneRoleTemplates(tenantID string) error {
	logger.Logger.Debug("Fetching role templates", "tenant_id", tenantID)

	var templates []models.RoleTemplate
	if err := h.db.Find(&templates).Error; err != nil {
		logger.Logger.Error("Failed to fetch role templates", "error", err)
		return err
	}

	logger.Logger.Info("Cloning role templates to tenant",
		"tenant_id", tenantID,
		"template_count", len(templates))

	for _, template := range templates {
		role := models.Role{
			TenantID:    tenantID,
			RoleName:    template.RoleName,
			Permissions: template.Permissions,
			TemplateID:  &template.ID,
			UserIDs:     []string{},
		}

		if err := h.db.Create(&role).Error; err != nil {
			logger.Logger.Error("Failed to create tenant role from template",
				"template_id", template.ID,
				"role_name", template.RoleName,
				"error", err)
			return err
		}

		logger.Logger.Debug("Cloned role template",
			"template_id", template.ID,
			"role_name", template.RoleName,
			"tenant_id", tenantID)
	}

	logger.Logger.Info("Successfully cloned all role templates",
		"tenant_id", tenantID,
		"count", len(templates))
	return nil
}
