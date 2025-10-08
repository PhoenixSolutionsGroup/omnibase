package tenants

import (
	"api/internal/handlers"
	"api/internal/models"
	"fmt"

	"github.com/gin-gonic/gin"
)

// DELETE api/v1/tenants/{id}/users/{user_id} - update Keto
func (h *TenantHandler) DeleteTenantUser(ctx *gin.Context) {
	tenantID := ctx.Param("id")
	targetUserID := ctx.Param("user_id")
	currentUserID := ctx.GetString("user_id")

	if tenantID == "" || targetUserID == "" {
		handlers.NewBadRequestResponse(ctx, "Tenant ID and User ID are required")
		return
	}

	if currentUserID == "" {
		handlers.NewUnauthorizedResponse(ctx, "User not authenticated")
		return
	}

	// Check if current user can manage members in this tenant
	canManage, err := h.keto.CheckPermission(ctx.Request.Context(), "Tenant", tenantID, "manage_members", currentUserID)
	if err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to check permissions: %w", err))
		return
	}
	if !canManage {
		handlers.NewForbiddenResponse(ctx, "Insufficient permissions")
		return
	}

	// Remove from database
	if err := h.db.Where("tenant_id = ? AND user_id = ?", tenantID, targetUserID).Delete(&models.TenantUser{}).Error; err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to remove user from tenant: %s", err))
		return
	}

	// Remove all Keto relations for this user-tenant combination
	relations := []string{"owners", "admins", "members"}
	for _, relation := range relations {
		h.keto.DeleteRelationTuple(ctx.Request.Context(), "Tenant", tenantID, relation, targetUserID)
	}

	// Handle tenant cleanup for the removed user
	if err := h.tenants.HandleUserTenantCleanup(ctx, targetUserID); err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to cleanup user tenant state: %s", err))
		return
	}

	handlers.NewSuccessResponse(ctx, gin.H{"message": "User removed successfully"})
}

// PUT api/v1/tenants/{id}/users/{user_id}/role - update Keto
func (h *TenantHandler) UpdateTenantUserRole(ctx *gin.Context) {
	tenantID := ctx.Param("id")
	targetUserID := ctx.Param("user_id")
	currentUserID := ctx.GetString("user_id")

	if tenantID == "" || targetUserID == "" {
		handlers.NewBadRequestResponse(ctx, "Tenant ID and User ID are required")
		return
	}

	if currentUserID == "" {
		handlers.NewUnauthorizedResponse(ctx, "User not authenticated")
		return
	}

	var req struct {
		Role         string `json:"role" binding:"required"`
		PreviousRole string `json:"previous_role" binding:"required"`
	}
	if err := ctx.ShouldBindJSON(&req); err != nil {
		handlers.NewBadRequestResponse(ctx, "Invalid request format")
		return
	}

	// Check if current user can manage members in this tenant
	canManage, err := h.keto.CheckPermission(ctx.Request.Context(), "Tenant", tenantID, "manage_members", currentUserID)
	if err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to check permissions: %w", err))
		return
	}
	if !canManage {
		handlers.NewForbiddenResponse(ctx, "Insufficient permissions")
		return
	}

	// Update database
	if err := h.db.Model(&models.TenantUser{}).Where("tenant_id = ? AND user_id = ?", tenantID, targetUserID).Update("role", req.Role).Error; err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to update user role: %s", err))
		return
	}

	// Update Keto relations - remove old relations and add new one
	h.keto.DeleteRelationTuple(ctx.Request.Context(), "Tenant", tenantID, req.PreviousRole, targetUserID)

	if err := h.keto.CreateRelationTuple(ctx.Request.Context(), "Tenant", tenantID, req.Role, targetUserID); err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to update permissions: %w", err))
		return
	}

	handlers.NewSuccessResponse(ctx, gin.H{"message": "User role updated successfully"})
}
