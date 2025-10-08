package tenants

import (
	"api/internal/handlers"
	"api/internal/models"
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type CreateTenantUserInviteRequest struct {
	Email string `json:"email" binding:"required,email"`
	Role  string `json:"role" binding:"required"`
}

type AcceptInviteRequest struct {
	Token string `json:"token" binding:"required"`
}

// PUT api/v1/tenants/invites/{invite_id} - Accept invite using token
func (h *TenantHandler) AcceptInvite(ctx *gin.Context) {
	var req AcceptInviteRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		handlers.NewBadRequestResponse(ctx, "Invalid request format")
		return
	}

	// Find invite by token
	var invite models.TenantInvite
	err := h.db.Where("token = ? AND used_at IS NULL AND expires_at > ?",
		req.Token, time.Now()).First(&invite).Error
	if err != nil {
		handlers.NewBadRequestResponse(ctx, "Invalid or expired invite token")
		return
	}

	// Get user ID from context (would be set by auth middleware)
	userID := ctx.GetString("user_id")
	if userID == "" {
		handlers.NewUnauthorizedResponse(ctx, "User not authenticated")
		return
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

	if err := h.keto.CreateRelationTuple(ctx.Request.Context(), "Tenant", invite.TenantID, invite.Role, userID); err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to create permission relation: %w", err))
		return
	}

	token, err := h.tenants.SetActiveTenant(userID, invite.TenantID)
	if err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to set active tenant: %s", err))
		return
	}

	err = h.tenants.UpdateUserMetadata(ctx, userID, true)
	if err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to update user metadata: %s", err))
	}

	handlers.NewSuccessResponse(ctx, gin.H{
		"tenant_id": invite.TenantID,
		"token":     token,
		"message":   "Successfully joined organization",
	})
}

// POST api/v1/tenants/{id}/invites - Send emails, generate invite tokens (w/ expire time)
func (h *TenantHandler) CreateTenantUserInvite(ctx *gin.Context) {

	tenantID := ctx.Param("id")
	if tenantID == "" {
		handlers.NewBadRequestResponse(ctx, "Tenant ID is required")
		return
	}

	var req CreateTenantUserInviteRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		handlers.NewBadRequestResponse(ctx, "Invalid request format")
		return
	}

	userID := ctx.GetString("user_id")
	if userID == "" {
		handlers.NewUnauthorizedResponse(ctx, "User not authenticated")
		return
	}

	// Check if user can invite others to this tenant
	canInvite, err := h.keto.CheckPermission(ctx.Request.Context(), "Tenant", tenantID, "invite", userID)
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
	inviteURL := fmt.Sprintf("%s/auth/invite/accept?token=%s", h.cfg.SMTPConfig.FrontendURL, invite.Token)
	if err := h.email.SendInviteEmail(invite.Email, tenant.Name, invite.Role, inviteURL); err != nil {
		fmt.Printf("Failed to send invite email: %v\n", err)
	}
	print("After")

	handlers.NewSuccessResponse(ctx, gin.H{
		"invite":  invite,
		"message": "Invite sent successfully",
	})
}
