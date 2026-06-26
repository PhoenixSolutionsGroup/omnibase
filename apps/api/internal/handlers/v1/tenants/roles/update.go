package roles

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

type UpdateRoleRequest struct {
	Permissions []string `json:"permissions" binding:"required" example:"project:*#view,project:*#edit"`
}

func (h *Handler) UpdateRole(c *gin.Context) {
	userUuid, tenantUuid := handlers.UserAndTenant(c)

	subject := permissions.SubjectSet{Namespace: "User", Object: userUuid.String()}
	canUpdateRoles, err := h.perms.Check(c.Request.Context(), "Tenant", tenantUuid.String(), "update_roles", subject)
	if err != nil {
		logger.Logger.Error("Failed to check permissions", "error", err, "tenant_id", tenantUuid, "user_id", userUuid)
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("Failed to check permissions: %w", err))
		return
	}
	if !canUpdateRoles {
		handlers.NewForbiddenResponse(c, "Insufficient permissions - must have `update_roles` permission")
		return
	}

	roleUuid, err := uuid.Parse(c.Param("role_id"))
	if err != nil {
		handlers.NewBadRequestResponse(c, "Invalid role_id")
		return
	}

	var req UpdateRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		handlers.NewBadRequestResponse(c, err.Error())
		return
	}

	existing, err := h.repo.GetRoleByIDAndTenant(c.Request.Context(), repository.GetRoleByIDAndTenantParams{
		ID:       roleUuid,
		TenantID: tenantUuid,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			handlers.NewNotFoundResponse(c, "Role not found")
			return
		}
		logger.Logger.Error("Failed to fetch role", "role_id", roleUuid, "error", err)
		handlers.NewInternalServerErrorResponse(c, err)
		return
	}

	logger.Logger.Debug("Revoking old keto tuples", "role_id", roleUuid, "user_count", len(existing.UserIds), "old_permissions_count", len(existing.Permissions))
	for _, uid := range existing.UserIds {
		for _, perm := range existing.Permissions {
			ns, obj, rel, perr := permissions.ParsePermission(perm, tenantUuid.String())
			if perr != nil {
				continue
			}
			_ = h.perms.Delete(c.Request.Context(), ns, obj, rel, permissions.SubjectSet{Namespace: "User", Object: uid.String()})
		}
	}

	updated, err := h.repo.UpdateRolePermissions(c.Request.Context(), repository.UpdateRolePermissionsParams{
		Permissions: req.Permissions,
		ID:          roleUuid,
		TenantID:    tenantUuid,
	})
	if err != nil {
		logger.Logger.Error("Failed to update role", "role_id", roleUuid, "error", err)
		handlers.NewInternalServerErrorResponse(c, err)
		return
	}

	logger.Logger.Debug("Granting new keto tuples", "role_id", roleUuid, "user_count", len(updated.UserIds), "new_permissions_count", len(updated.Permissions))
	for _, uid := range updated.UserIds {
		for _, perm := range updated.Permissions {
			ns, obj, rel, perr := permissions.ParsePermission(perm, tenantUuid.String())
			if perr != nil {
				logger.Logger.Error("Failed to parse permission", "permission", perm, "error", perr)
				handlers.NewInternalServerErrorResponse(c, perr)
				return
			}
			if err := h.perms.Create(c.Request.Context(), ns, obj, rel, permissions.SubjectSet{Namespace: "User", Object: uid.String()}); err != nil {
				logger.Logger.Error("Failed to create keto tuple", "user_id", uid, "permission", perm, "error", err)
				handlers.NewInternalServerErrorResponse(c, err)
				return
			}
		}
	}

	logger.Logger.Info("Updated role", "role_id", roleUuid, "old_permissions", existing.Permissions, "new_permissions", updated.Permissions)
	handlers.NewSuccessResponse(c, updated)
}
