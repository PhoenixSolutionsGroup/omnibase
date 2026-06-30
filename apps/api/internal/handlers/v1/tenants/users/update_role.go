package users

import (
	"errors"
	"fmt"

	"api/internal/database/repository"
	"api/internal/handlers"
	"api/internal/logger"
	"api/internal/services/permissions"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

var UpdateRoleError = errors.New("Failed to update user role")

type UpdateRoleRequest struct {
	Role         string `json:"role"    binding:"required" example:"member"`
	TargetUserID string `json:"user_id" binding:"required" example:"550e8400-e29b-41d4-a716-446655440001"`
}

type UpdateRoleResponse struct {
	Message string `json:"message" example:"User role updated successfully"`
}

func (h *Handler) UpdateRole(c *gin.Context) {
	userUuid, tenantUuid := handlers.UserAndTenant(c)

	var req UpdateRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		handlers.NewBadRequestResponse(c, "Invalid request format")
		return
	}
	targetUuid, err := uuid.Parse(req.TargetUserID)
	if err != nil {
		handlers.NewBadRequestResponse(c, "Invalid user_id")
		return
	}

	subject := permissions.SubjectSet{Namespace: "User", Object: userUuid.String()}
	canManage, err := h.perms.Check(c.Request.Context(), "Tenant", tenantUuid.String(), "update_user_role", subject)
	if err != nil {
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: %w", UpdateRoleError, err))
		return
	}
	if !canManage {
		handlers.NewForbiddenResponse(c, "Insufficient permissions - must have `update_user_role` permission")
		return
	}

	target, err := h.repo.GetTenantUser(c.Request.Context(), repository.GetTenantUserParams{
		TenantID: tenantUuid.String(),
		UserID:   targetUuid.String(),
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			handlers.NewNotFoundResponse(c, "User not found in tenant")
			return
		}
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: %w", UpdateRoleError, err))
		return
	}
	previousRole := target.Role

	if req.Role == "owner" {
		canPromote, err := h.perms.Check(c.Request.Context(), "Tenant", tenantUuid.String(), "update_user_role_to_owner", subject)
		if err != nil {
			handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: %w", UpdateRoleError, err))
			return
		}
		if !canPromote {
			handlers.NewForbiddenResponse(c, "Insufficient permissions - must have `update_user_role_to_owner` permission to promote to owner")
			return
		}
	}

	if previousRole == "owner" && req.Role != "owner" {
		canDemote, err := h.perms.Check(c.Request.Context(), "Tenant", tenantUuid.String(), "remove_owner_role", subject)
		if err != nil {
			handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: %w", UpdateRoleError, err))
			return
		}
		if !canDemote {
			handlers.NewForbiddenResponse(c, "Insufficient permissions - must have `remove_owner_role` permission to demote an owner")
			return
		}

		owners, err := h.repo.CountOwnersByTenant(c.Request.Context(), tenantUuid.String())
		if err != nil {
			handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: %w", UpdateRoleError, err))
			return
		}
		if owners <= 1 {
			handlers.NewBadRequestResponse(c, "Cannot demote the last owner from the tenant")
			return
		}
	}

	if err := h.rbac.RevokeUser(c.Request.Context(), targetUuid, tenantUuid, previousRole); err != nil {
		logger.Logger.Error("Failed to revoke old role", "error", err, "tenant_id", tenantUuid, "target_user_id", targetUuid, "previous_role", previousRole)
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: %w", UpdateRoleError, err))
		return
	}

	if err := h.repo.UpdateTenantUserRole(c.Request.Context(), repository.UpdateTenantUserRoleParams{
		TenantID: tenantUuid.String(),
		UserID:   targetUuid.String(),
		Role:     req.Role,
	}); err != nil {
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: %w", UpdateRoleError, err))
		return
	}

	if err := h.rbac.Assign(c.Request.Context(), targetUuid, tenantUuid, req.Role); err != nil {
		logger.Logger.Error("Failed to assign new role", "error", err, "tenant_id", tenantUuid, "target_user_id", targetUuid, "new_role", req.Role)
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: %w", UpdateRoleError, err))
		return
	}

	logger.Logger.Info("Updated user role", "tenant_id", tenantUuid, "target_user_id", targetUuid, "previous_role", previousRole, "new_role", req.Role)
	handlers.NewSuccessResponse(c, UpdateRoleResponse{Message: "User role updated successfully"})
}
