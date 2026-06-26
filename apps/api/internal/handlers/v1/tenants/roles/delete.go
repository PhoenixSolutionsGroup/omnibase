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

func (h *Handler) DeleteRole(c *gin.Context) {
	userUuid, tenantUuid := handlers.UserAndTenant(c)

	subject := permissions.SubjectSet{Namespace: "User", Object: userUuid.String()}
	canDeleteRoles, err := h.perms.Check(c.Request.Context(), "Tenant", tenantUuid.String(), "delete_roles", subject)
	if err != nil {
		logger.Logger.Error("Failed to check permissions", "error", err, "tenant_id", tenantUuid, "user_id", userUuid)
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("Failed to check permissions: %w", err))
		return
	}
	if !canDeleteRoles {
		handlers.NewForbiddenResponse(c, "Insufficient permissions - must have `delete_roles` permission")
		return
	}

	roleUuid, err := uuid.Parse(c.Param("role_id"))
	if err != nil {
		handlers.NewBadRequestResponse(c, "Invalid role_id")
		return
	}

	role, err := h.repo.GetRoleByIDAndTenant(c.Request.Context(), repository.GetRoleByIDAndTenantParams{
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

	logger.Logger.Debug("Revoking keto tuples for role", "role_id", roleUuid, "role_name", role.RoleName, "user_count", len(role.UserIds), "permissions_count", len(role.Permissions))
	for _, uid := range role.UserIds {
		for _, perm := range role.Permissions {
			ns, obj, rel, perr := permissions.ParsePermission(perm, tenantUuid.String())
			if perr != nil {
				continue
			}
			_ = h.perms.Delete(c.Request.Context(), ns, obj, rel, permissions.SubjectSet{Namespace: "User", Object: uid.String()})
		}
	}

	if err := h.repo.DeleteRoleByIDAndTenant(c.Request.Context(), repository.DeleteRoleByIDAndTenantParams{
		ID:       roleUuid,
		TenantID: tenantUuid,
	}); err != nil {
		logger.Logger.Error("Failed to delete role", "role_id", roleUuid, "error", err)
		handlers.NewInternalServerErrorResponse(c, err)
		return
	}

	logger.Logger.Info("Deleted role", "role_id", roleUuid, "role_name", role.RoleName)
	handlers.NewSuccessResponse(c, nil)
}
