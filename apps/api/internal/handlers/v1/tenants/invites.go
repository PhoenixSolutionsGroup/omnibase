package tenants

import (
	"api/internal/handlers"
	"api/internal/logger"
	"api/internal/models"
	services_v1 "api/internal/service/v1"
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	kratos "github.com/ory/kratos-client-go"
)

// CreateTenantUserInviteRequest represents the request to invite a user to a tenant
type CreateTenantUserInviteRequest struct {
	// Email address of the user to invite
	Email string `json:"email" binding:"required,email" example:"test@example.com"`
	// Role to assign to the invited user
	Role string `json:"role" binding:"required" example:"member"`
	// Base URL for the invite acceptance page
	InviteURL string `json:"invite_url" binding:"required,url" example:"https://test.example.com/accept-invite"`
}

// CreateTenantUserInviteResponse represents the invite creation response
type CreateTenantUserInviteResponse struct {
	// Created invite
	Invite models.TenantInvite `json:"invite" binding:"required"`
	// Success message
	Message string `json:"message" binding:"required" example:"Invite sent successfully"`
}

// AcceptInviteRequest represents the request to accept a tenant invite
type AcceptInviteRequest struct {
	// Invite token from email
	Token string `json:"token" binding:"required" example:"tok_test_abc123xyz"`
}

// AcceptInviteResponse represents the invite acceptance response
type AcceptInviteResponse struct {
	// Tenant ID the user joined
	TenantID string `json:"tenant_id" binding:"required" example:"tenant_test_123"`
	// New JWT token with tenant context
	Token string `json:"token" binding:"required" example:"eyJhbGciOiJIUzI1NiIs..."`
	// Success message
	Message string `json:"message" binding:"required" example:"Successfully joined organization"`
}

func (h *TenantHandler) AcceptInvite(ctx *gin.Context) {
	var req AcceptInviteRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		handlers.NewBadRequestResponse(ctx, "Invalid request format")
		return
	}

	// Find invite by token and retrieve email
	var invite models.TenantInvite
	err := h.db.Select("id, tenant_id, email, role, token, inviter_id, expires_at, used_at, created_at").
		Where("token = ? AND used_at IS NULL AND expires_at > ?",
			req.Token, time.Now()).First(&invite).Error
	if err != nil {
		handlers.NewBadRequestResponse(ctx, "Invalid or expired invite token")
		return
	}

	serviceAuth := ctx.GetBool("is_service_auth")

	// Get user ID and identity from context (set by auth middleware)
	userID := ctx.GetString("user_id")
	if userID == "" {
		handlers.NewUnauthorizedResponse(ctx, "User not authenticated")
		return
	}

	// Identity is not available in service auth context
	// This is because the identity is extracted from the session
	// Uses Service Tokens elevated privileges to bypass checks
	if !serviceAuth {

		// Get identity from context to verify email
		identityValue, exists := ctx.Get("identity")
		if !exists {
			handlers.NewUnauthorizedResponse(ctx, "Identity not found in session")
			return
		}

		identity, ok := identityValue.(*kratos.Identity)
		if !ok {
			handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Invalid identity type"))
			return
		}

		// Extract email from identity traits
		traits, ok := identity.Traits.(map[string]interface{})
		if !ok {
			handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Invalid identity traits"))
			return
		}

		identityEmail, ok := traits["email"].(string)
		if !ok || identityEmail == "" {
			handlers.NewBadRequestResponse(ctx, "Email not found in identity")
			return
		}

		// Verify that the identity email matches the invite email
		if identityEmail != invite.Email {
			handlers.NewForbiddenResponse(ctx, "This invite was sent to a different email address")
			return
		}
	}

	// Mark invite as used
	now := time.Now()
	invite.UsedAt = &now
	if err := h.db.Save(&invite).Error; err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to update invite: %s", err))
		return
	}

	// Add user to tenant
	tenantUser := models.TenantUser{
		ID:       uuid.New().String(),
		TenantID: invite.TenantID,
		UserID:   userID,
		Role:     invite.Role,
		IsActive: true,
		JoinedAt: time.Now(),
	}

	if err := h.db.Create(&tenantUser).Error; err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to add user to tenant: %s", err))
		return
	}

	logger.Logger.Info("Assigning role to user accepting invite",
		"user_id", userID,
		"role_name", invite.Role,
		"tenant_id", invite.TenantID)

	// Assign the role with all its permissions (supports both system and custom roles)
	if err := h.roles.AssignRoleByName(ctx.Request.Context(), userID, invite.Role, invite.TenantID); err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to assign role permissions: %w", err))
		return
	}

	logger.Logger.Info("Successfully assigned role to user",
		"user_id", userID,
		"role_name", invite.Role)

	token, err := h.tenants.SetActiveTenant(userID, invite.TenantID)
	if err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to set active tenant: %s", err))
		return
	}

	err = h.tenants.UpdateUserMetadata(ctx, userID, true)
	if err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to update user metadata: %s", err))
	}

	handlers.NewSuccessResponse(ctx, AcceptInviteResponse{
		TenantID: invite.TenantID,
		Token:    token,
		Message:  "Successfully joined organization",
	})
}

func (h *TenantHandler) CreateTenantUserInvite(ctx *gin.Context) {

	tenantID := ctx.GetString("tenant_id")
	if tenantID == "" {
		handlers.NewUnauthorizedResponse(ctx, "Tenant ID is required")
		return
	}

	userID := ctx.GetString("user_id")
	if userID == "" {
		handlers.NewUnauthorizedResponse(ctx, "User not authenticated")
		return
	}

	var req CreateTenantUserInviteRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		handlers.NewBadRequestResponse(ctx, "Invalid request format")
		return
	}

	// Check if user can invite others to this tenant
	subject := services_v1.SubjectSet{Namespace: "User", Object: userID, Relation: ""}
	canInvite, err := h.keto.CheckPermission(ctx.Request.Context(), "Tenant", tenantID, "invite_user", subject)
	if err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to check permissions: %w", err))
		return
	}
	if !canInvite {
		handlers.NewForbiddenResponse(ctx, "Insufficient permissions to invite users")
		return
	}

	// Get tenant
	var tenant models.Tenant
	if err := h.db.First(&tenant, "id = ?", tenantID).Error; err != nil {
		handlers.NewNotFoundResponse(ctx, "Tenant not found")
		return
	}

	// Create invite
	invite := models.TenantInvite{
		ID:        uuid.New().String(),
		TenantID:  tenantID,
		Email:     req.Email,
		Role:      req.Role,
		Token:     uuid.New().String(),
		InviterID: userID,
		ExpiresAt: time.Now().Add(7 * 24 * time.Hour),
		CreatedAt: time.Now(),
	}

	if err := h.db.Create(&invite).Error; err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to create invite: %s", err))
		return
	}

	// Send email asynchronously to avoid blocking
	inviteURL := fmt.Sprintf("%s?token=%s", req.InviteURL, invite.Token)
	logger.Logger.Info("Sending invite email", "email", invite.Email, "tenant", tenant.Name, "role", invite.Role)
	if err := h.email.SendInviteEmail(invite.Email, tenant.Name, invite.Role, inviteURL); err != nil {
		logger.Logger.Error("Failed to send invite email", "email", invite.Email, "error", err)
	} else {
		logger.Logger.Info("Invite email sent successfully", "email", invite.Email)
	}

	handlers.NewSuccessResponse(ctx, CreateTenantUserInviteResponse{
		Invite:  invite,
		Message: "Invite sent successfully",
	})
}
