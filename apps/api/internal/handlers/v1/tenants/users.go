package tenants

import (
	"api/internal/handlers"
	"api/internal/logger"
	"api/internal/models"
	services_v1 "api/internal/service/v1"
	"fmt"

	"github.com/gin-gonic/gin"
)

// TenantUserResponse represents the user data returned by the API
type TenantUserResponse struct {
	// User ID
	UserID string `json:"user_id" binding:"required" example:"550e8400-e29b-41d4-a716-446655440000"`
	// User's first name
	FirstName string `json:"first_name" binding:"required" example:"John"`
	// User's last name
	LastName string `json:"last_name" binding:"required" example:"Doe"`
	// User's email
	Email string `json:"email" binding:"required" example:"test@example.com"`
	// User's role in the tenant
	Role string `json:"role" binding:"required" example:"member"`
}

// DeleteTenantUserRequest represents the request to remove a user from a tenant
type DeleteTenantUserRequest struct {
	// Target user ID to remove
	TargetUserID string `json:"user_id" binding:"required,min=1" example:"550e8400-e29b-41d4-a716-446655440001"`
}

// UpdateTenantUserRoleRequest represents the request to update a user's role
type UpdateTenantUserRoleRequest struct {
	// New role to assign
	Role string `json:"role" binding:"required" example:"member"`
	// Target user ID
	TargetUserID string `json:"user_id" binding:"required" example:"550e8400-e29b-41d4-a716-446655440001"`
}

// UpdateTenantUserRoleResponse represents the role update response
type UpdateTenantUserRoleResponse struct {
	// Success message
	Message string `json:"message" binding:"required" example:"User role updated successfully"`
}

func (h *TenantHandler) GetTenantUsers(ctx *gin.Context) {
	tenantID := ctx.GetString("tenant_id")
	userID := ctx.GetString("user_id")

	if tenantID == "" || userID == "" {
		handlers.NewUnauthorizedResponse(ctx, "User not authenticated")
		return
	}

	logger.Logger.Debug("Fetching tenant users", "tenant_id", tenantID, "requesting_user_id", userID)

	// Check if current user can view members in this tenant
	subject := services_v1.SubjectSet{Namespace: "User", Object: userID, Relation: ""}
	canView, err := h.keto.CheckPermission(ctx.Request.Context(), "Tenant", tenantID, "view_users", subject)
	if err != nil {
		logger.Logger.Error("Failed to check permissions", "error", err, "tenant_id", tenantID, "user_id", userID)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to check permissions: %w", err))
		return
	}
	if !canView {
		logger.Logger.Warn("User lacks permission to view tenant users", "tenant_id", tenantID, "user_id", userID)
		handlers.NewForbiddenResponse(ctx, "Insufficient permissions - must have `view_users` permission")
		return
	}

	// Query to join tenant_users with identities and extract traits
	var users []TenantUserResponse
	err = h.db.Raw(`
		SELECT
			tu.user_id,
			COALESCE(i.traits->'name'->>'first', '') as first_name,
			COALESCE(i.traits->'name'->>'last', '') as last_name,
			COALESCE(i.traits->>'email', '') as email,
			tu.role
		FROM auth.tenant_users tu
		INNER JOIN auth.identities i ON tu.user_id::uuid = i.id
		WHERE tu.tenant_id = ?
		ORDER BY tu.joined_at DESC
	`, tenantID).Scan(&users).Error

	if err != nil {
		logger.Logger.Error("Failed to fetch tenant users", "error", err, "tenant_id", tenantID)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to fetch tenant users: %w", err))
		return
	}

	logger.Logger.Info("Successfully fetched tenant users", "tenant_id", tenantID, "user_count", len(users))
	handlers.NewSuccessResponse(ctx, users)
}

func (h *TenantHandler) DeleteTenantUser(ctx *gin.Context) {
	tenantID := ctx.GetString("tenant_id")
	currentUserID := ctx.GetString("user_id")

	var req DeleteTenantUserRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		handlers.NewBadRequestResponse(ctx, "Invalid request format")
		return
	}

	if currentUserID == "" || tenantID == "" {
		handlers.NewUnauthorizedResponse(ctx, "User not authenticated")
		return
	}

	logger.Logger.Debug("Attempting to delete tenant user", "tenant_id", tenantID, "target_user_id", req.TargetUserID, "requesting_user_id", currentUserID)

	// Get target user to check their role
	var targetUser models.TenantUser
	if err := h.db.Where("tenant_id = ? AND user_id = ?", tenantID, req.TargetUserID).First(&targetUser).Error; err != nil {
		logger.Logger.Error("Failed to fetch target user", "error", err, "tenant_id", tenantID, "target_user_id", req.TargetUserID)
		handlers.NewNotFoundResponse(ctx, "User not found in tenant")
		return
	}

	// Check if current user can manage members in this tenant
	subject := services_v1.SubjectSet{Namespace: "User", Object: currentUserID, Relation: ""}
	canManage, err := h.keto.CheckPermission(ctx.Request.Context(), "Tenant", tenantID, "remove_user", subject)
	if err != nil {
		logger.Logger.Error("Failed to check permissions", "error", err, "tenant_id", tenantID, "user_id", currentUserID)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to check permissions: %w", err))
		return
	}
	if !canManage {
		logger.Logger.Warn("User lacks permission to remove tenant users", "tenant_id", tenantID, "user_id", currentUserID)
		handlers.NewForbiddenResponse(ctx, "Insufficient permissions")
		return
	}

	// If target user is an owner, check for remove_owner_role permission
	if targetUser.Role == "owner" {
		canRemoveOwner, err := h.keto.CheckPermission(ctx.Request.Context(), "Tenant", tenantID, "remove_owner_role", subject)
		if err != nil {
			logger.Logger.Error("Failed to check remove_owner_role permission", "error", err, "tenant_id", tenantID, "user_id", currentUserID)
			handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to check permissions: %w", err))
			return
		}
		if !canRemoveOwner {
			logger.Logger.Warn("User lacks permission to remove owner users", "tenant_id", tenantID, "user_id", currentUserID)
			handlers.NewForbiddenResponse(ctx, "Insufficient permissions - must have `remove_owner_role` permission to remove an owner")
			return
		}

		// Ensure at least one owner remains
		var ownerCount int64
		if err := h.db.Model(&models.TenantUser{}).Where("tenant_id = ? AND role = ?", tenantID, "owner").Count(&ownerCount).Error; err != nil {
			logger.Logger.Error("Failed to count owners", "error", err, "tenant_id", tenantID)
			handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to validate owner count: %w", err))
			return
		}

		if ownerCount <= 1 {
			logger.Logger.Warn("Attempted to remove last owner", "tenant_id", tenantID, "target_user_id", req.TargetUserID)
			handlers.NewBadRequestResponse(ctx, "Cannot remove the last owner from the tenant")
			return
		}
	}

	logger.Logger.Info("Removing user from tenant",
		"tenant_id", tenantID,
		"target_user_id", req.TargetUserID,
		"target_role", targetUser.Role)

	// Remove all Keto relationships for the user's current role
	logger.Logger.Debug("Getting role definition to remove permissions", "role_name", targetUser.Role)
	var role models.Role
	if err := h.db.Where("role_name = ? AND tenant_id = ?", targetUser.Role, tenantID).First(&role).Error; err != nil {
		logger.Logger.Error("Failed to find role", "error", err, "role_name", targetUser.Role, "tenant_id", tenantID)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to find user's role: %w", err))
		return
	}

	// Remove user from role's user_ids array
	updatedUserIDs := make([]string, 0)
	for _, uid := range role.UserIDs {
		if uid != req.TargetUserID {
			updatedUserIDs = append(updatedUserIDs, uid)
		}
	}
	role.UserIDs = updatedUserIDs
	if err := h.db.Save(&role).Error; err != nil {
		logger.Logger.Error("Failed to update role user list", "error", err, "role_id", role.ID)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to update role: %w", err))
		return
	}

	// Delete all Keto relationships for this role's permissions
	logger.Logger.Debug("Deleting Keto relationships", "permissions_count", len(role.Permissions))
	targetSubject := services_v1.SubjectSet{Namespace: "User", Object: req.TargetUserID, Relation: ""}
	tuples, err := h.keto.ListRelationTuples(ctx.Request.Context(), "Tenant", tenantID, "", &targetSubject)
	if err != nil {
		logger.Logger.Error("Failed to list relation tuples", "error", err, "tenant_id", tenantID, "target_user_id", req.TargetUserID)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to list all relationship tuples: %w", err))
		return
	}

	for _, tuple := range tuples {
		if tuple.SubjectSet == nil {
			continue
		}
		err := h.keto.DeleteRelationTuple(
			ctx.Request.Context(),
			tuple.Namespace,
			tuple.Object,
			tuple.Relation,
			*tuple.SubjectSet,
		)
		if err != nil {
			logger.Logger.Error("Failed to delete relation tuple", "error", err, "namespace", tuple.Namespace, "object", tuple.Object, "relation", tuple.Relation)
			handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed when deleting relation tuple: %w", err))
			return
		}
	}

	// Remove from database
	if err := h.db.Where("tenant_id = ? AND user_id = ?", tenantID, req.TargetUserID).Delete(&models.TenantUser{}).Error; err != nil {
		logger.Logger.Error("Failed to remove user from tenant in database", "error", err, "tenant_id", tenantID, "target_user_id", req.TargetUserID)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to remove user from tenant: %w", err))
		return
	}

	logger.Logger.Debug("Keto relations removed, cleaning up user tenant state", "tenant_id", tenantID, "target_user_id", req.TargetUserID)

	if err := h.tenants.HandleUserTenantCleanup(ctx, req.TargetUserID); err != nil {
		logger.Logger.Error("Failed to cleanup user tenant state", "error", err, "target_user_id", req.TargetUserID)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to cleanup user tenant state: %w", err))
		return
	}

	logger.Logger.Info("Successfully removed user from tenant", "tenant_id", tenantID, "target_user_id", req.TargetUserID)
	handlers.NewSuccessResponse(ctx, "")
}

func (h *TenantHandler) UpdateTenantUserRole(ctx *gin.Context) {
	tenantID := ctx.GetString("tenant_id")
	userID := ctx.GetString("user_id")

	if tenantID == "" || userID == "" {
		handlers.NewUnauthorizedResponse(ctx, "User not authenticated")
		return
	}

	var req UpdateTenantUserRoleRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		handlers.NewBadRequestResponse(ctx, "Invalid request format")
		return
	}

	logger.Logger.Debug("Attempting to update tenant user role", "tenant_id", tenantID, "target_user_id", req.TargetUserID, "new_role", req.Role, "requesting_user_id", userID)

	// Check if current user can manage members in this tenant
	subject := services_v1.SubjectSet{Namespace: "User", Object: userID, Relation: ""}
	canManage, err := h.keto.CheckPermission(ctx.Request.Context(), "Tenant", tenantID, "update_user_role", subject)
	if err != nil {
		logger.Logger.Error("Failed to check permissions", "error", err, "tenant_id", tenantID, "user_id", userID)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to check permissions: %w", err))
		return
	}
	if !canManage {
		logger.Logger.Warn("User lacks permission to update user roles", "tenant_id", tenantID, "user_id", userID)
		handlers.NewForbiddenResponse(ctx, "Insufficient permissions - must have `update_user_role` permission")
		return
	}

	// Fetch current role from database
	var tenantUser models.TenantUser
	if err := h.db.Where("tenant_id = ? AND user_id = ?", tenantID, req.TargetUserID).First(&tenantUser).Error; err != nil {
		logger.Logger.Error("Failed to fetch target user", "error", err, "tenant_id", tenantID, "target_user_id", req.TargetUserID)
		handlers.NewNotFoundResponse(ctx, "User not found in tenant")
		return
	}
	previousRole := tenantUser.Role

	// If promoting to owner, check for update_user_role_to_owner permission
	if req.Role == "owner" {
		canPromote, err := h.keto.CheckPermission(ctx.Request.Context(), "Tenant", tenantID, "update_user_role_to_owner", subject)
		if err != nil {
			logger.Logger.Error("Failed to check update_user_role_to_owner permission", "error", err, "tenant_id", tenantID, "user_id", userID)
			handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to check permissions: %w", err))
			return
		}
		if !canPromote {
			logger.Logger.Warn("User lacks permission to promote to owner", "tenant_id", tenantID, "user_id", userID)
			handlers.NewForbiddenResponse(ctx, "Insufficient permissions - must have `update_user_role_to_owner` permission to promote to owner")
			return
		}
	}

	// If demoting from owner, check for remove_owner_role permission
	if previousRole == "owner" && req.Role != "owner" {
		canDemote, err := h.keto.CheckPermission(ctx.Request.Context(), "Tenant", tenantID, "remove_owner_role", subject)
		if err != nil {
			logger.Logger.Error("Failed to check remove_owner_role permission", "error", err, "tenant_id", tenantID, "user_id", userID)
			handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to check permissions: %w", err))
			return
		}
		if !canDemote {
			logger.Logger.Warn("User lacks permission to demote owner", "tenant_id", tenantID, "user_id", userID)
			handlers.NewForbiddenResponse(ctx, "Insufficient permissions - must have `remove_owner_role` permission to demote an owner")
			return
		}

		// Ensure at least one owner remains
		var ownerCount int64
		if err := h.db.Model(&models.TenantUser{}).Where("tenant_id = ? AND role = ?", tenantID, "owner").Count(&ownerCount).Error; err != nil {
			logger.Logger.Error("Failed to count owners", "error", err, "tenant_id", tenantID)
			handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to validate owner count: %w", err))
			return
		}

		if ownerCount <= 1 {
			logger.Logger.Warn("Attempted to demote last owner", "tenant_id", tenantID, "target_user_id", req.TargetUserID)
			handlers.NewBadRequestResponse(ctx, "Cannot demote the last owner from the tenant")
			return
		}
	}

	logger.Logger.Info("Updating user role with permission-based assignment",
		"tenant_id", tenantID,
		"target_user_id", req.TargetUserID,
		"previous_role", previousRole,
		"new_role", req.Role)

	// Get the old role to remove permissions
	var oldRole models.Role
	if err := h.db.Where("role_name = ? AND tenant_id = ?", previousRole, tenantID).First(&oldRole).Error; err != nil {
		logger.Logger.Error("Failed to find old role", "error", err, "role_name", previousRole, "tenant_id", tenantID)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to find old role: %w", err))
		return
	}

	// Remove user from old role's user_ids array
	updatedUserIDs := make([]string, 0)
	for _, uid := range oldRole.UserIDs {
		if uid != req.TargetUserID {
			updatedUserIDs = append(updatedUserIDs, uid)
		}
	}
	oldRole.UserIDs = updatedUserIDs
	if err := h.db.Save(&oldRole).Error; err != nil {
		logger.Logger.Error("Failed to update old role user list", "error", err, "role_id", oldRole.ID)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to update old role: %w", err))
		return
	}

	// Delete all Keto relationships for the old role
	logger.Logger.Debug("Removing old role permissions", "role_name", previousRole, "permissions_count", len(oldRole.Permissions))
	targetSubject := services_v1.SubjectSet{Namespace: "User", Object: req.TargetUserID, Relation: ""}
	tuples, err := h.keto.ListRelationTuples(ctx.Request.Context(), "Tenant", tenantID, "", &targetSubject)
	if err != nil {
		logger.Logger.Error("Failed to list relation tuples", "error", err, "tenant_id", tenantID, "target_user_id", req.TargetUserID)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to list relationship tuples: %w", err))
		return
	}

	for _, tuple := range tuples {
		if tuple.SubjectSet == nil {
			continue
		}
		err := h.keto.DeleteRelationTuple(
			ctx.Request.Context(),
			tuple.Namespace,
			tuple.Object,
			tuple.Relation,
			*tuple.SubjectSet,
		)
		if err != nil {
			logger.Logger.Error("Failed to delete relation tuple", "error", err, "namespace", tuple.Namespace, "object", tuple.Object, "relation", tuple.Relation)
			// Continue on error to try to clean up as much as possible
		}
	}

	// Update database
	if err := h.db.Model(&models.TenantUser{}).Where("tenant_id = ? AND user_id = ?", tenantID, req.TargetUserID).Update("role", req.Role).Error; err != nil {
		logger.Logger.Error("Failed to update user role in database", "error", err, "tenant_id", tenantID, "target_user_id", req.TargetUserID)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to update user role: %w", err))
		return
	}

	// Assign new role with all its permissions
	logger.Logger.Debug("Assigning new role", "role_name", req.Role)
	if err := h.roles.AssignRoleByName(ctx.Request.Context(), req.TargetUserID, req.Role, tenantID); err != nil {
		logger.Logger.Error("Failed to assign new role", "error", err, "role_name", req.Role, "target_user_id", req.TargetUserID)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to assign new role: %w", err))
		return
	}

	logger.Logger.Info("Successfully updated user role", "tenant_id", tenantID, "target_user_id", req.TargetUserID, "previous_role", previousRole, "new_role", req.Role)
	handlers.NewSuccessResponse(ctx, UpdateTenantUserRoleResponse{Message: "User role updated successfully"})
}
