package tenants

import (
	"api/internal/handlers"
	"api/internal/models"
	"fmt"

	"github.com/gin-gonic/gin"
)

// DELETE api/v1/tenants/users - update Keto
func (h *TenantHandler) DeleteTenantUser(ctx *gin.Context) {
	tenantID := ctx.GetString("tenant_id")
	currentUserID := ctx.GetString("user_id")

	var req struct {
		TargetUserID string `json:"user_id" binding:"required"`
	}
	if err := ctx.ShouldBindJSON(&req); err != nil {
		handlers.NewBadRequestResponse(ctx, "Invalid request format")
		return
	}

	if req.TargetUserID == "" {
		handlers.NewBadRequestResponse(ctx, "Tenant ID and User ID are required")
		return
	}

	if currentUserID == "" || tenantID == "" {
		handlers.NewUnauthorizedResponse(ctx, "User not authenticated")
		return
	}

	// Check if current user can manage members in this tenant
	canManage, err := h.keto.CheckPermission(ctx.Request.Context(), "Tenant", tenantID, "remove_user", currentUserID)
	if err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to check permissions: %w", err))
		return
	}
	if !canManage {
		handlers.NewForbiddenResponse(ctx, "Insufficient permissions")
		return
	}

	// Remove from database
	if err := h.db.Where("tenant_id = ? AND user_id = ?", tenantID, req.TargetUserID).Delete(&models.TenantUser{}).Error; err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to remove user from tenant: %s", err))
		return
	}

	tuples, err := h.keto.ListRelationTuples(ctx.Request.Context(), "Tenant", tenantID, "", req.TargetUserID)
	if err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed ot list all relationship tuples"))
		return
	}

	for _, tuple := range tuples {
		err := h.keto.DeleteRelationTuple(
			ctx.Request.Context(),
			tuple.Namespace,
			tuple.Object,
			tuple.Relation,
			tuple.SubjectID,
		)
		if err != nil {
			handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed when deleting relation tuple"))
			return
		}
	}

	if err := h.tenants.HandleUserTenantCleanup(ctx, req.TargetUserID); err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to cleanup user tenant state: %s", err))
		return
	}

	handlers.NewSuccessResponse(ctx, "")
}

// PUT api/v1/tenants/users - update Keto
func (h *TenantHandler) UpdateTenantUserRole(ctx *gin.Context) {
	tenantID := ctx.GetString("tenant_id")
	userID := ctx.GetString("user_id")

	if tenantID == "" || userID == "" {
		handlers.NewUnauthorizedResponse(ctx, "User not authenticated")
		return
	}

	var req struct {
		Role         string `json:"role" binding:"required"`
		TargetUserID string `json:"user_id" binding:"required"`
	}
	if err := ctx.ShouldBindJSON(&req); err != nil {
		handlers.NewBadRequestResponse(ctx, "Invalid request format")
		return
	}

	// Check if current user can manage members in this tenant
	canManage, err := h.keto.CheckPermission(ctx.Request.Context(), "Tenant", tenantID, "update_user_role", userID)
	if err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to check permissions: %w", err))
		return
	}
	if !canManage {
		handlers.NewForbiddenResponse(ctx, "Insufficient permissions - must have `update_user_role` permission")
		return
	}

	if req.Role == "owner" {
		var user models.TenantUser
		if err := h.db.Where("tenant_id = ? AND user_id = ?", tenantID, userID).First(&user).Error; err != nil {
			handlers.NewNotFoundResponse(ctx, "User not found in tenant")
			return
		}
		if user.Role != "owner" {
			handlers.NewForbiddenResponse(ctx, "Insufficient permissions - must be `owner` to update user to `owner` role")
			return
		}
	}

	// Fetch current role from database
	var tenantUser models.TenantUser
	if err := h.db.Where("tenant_id = ? AND user_id = ?", tenantID, req.TargetUserID).First(&tenantUser).Error; err != nil {
		handlers.NewNotFoundResponse(ctx, "User not found in tenant")
		return
	}
	previousRole := tenantUser.Role

	// Update database
	if err := h.db.Model(&models.TenantUser{}).Where("tenant_id = ? AND user_id = ?", tenantID, req.TargetUserID).Update("role", req.Role).Error; err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to update user role: %s", err))
		return
	}

	// Update Keto relations - remove old relations and add new one
	h.keto.DeleteRelationTuple(ctx.Request.Context(), "Tenant", tenantID, previousRole, req.TargetUserID)

	if err := h.keto.CreateRelationTuple(ctx.Request.Context(), "Tenant", tenantID, req.Role, req.TargetUserID); err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to update permissions: %w", err))
		return
	}

	handlers.NewSuccessResponse(ctx, gin.H{"message": "User role updated successfully"})
}
