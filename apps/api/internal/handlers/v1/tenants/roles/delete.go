package roles

import (
	"context"
	"errors"
	"fmt"

	"github.com/danielgtaylor/huma/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"api/internal/database/repository"
	"api/internal/handlers"
	"api/internal/logger"
	"api/internal/services/permissions"
)

var DeleteRoleError = errors.New("Failed to delete role")

type DeleteRoleInput struct {
	handlers.AuthCtx
	RoleID string `path:"role_id"`
}

type DeleteRoleOutput struct {
	Body any
}

func (h *Handler) DeleteRole(ctx context.Context, in *DeleteRoleInput) (*DeleteRoleOutput, error) {
	userUuid := in.UserID
	tenantUuid := in.TenantID

	subject := permissions.SubjectSet{Namespace: "User", Object: userUuid.String()}
	canDeleteRoles, err := h.perms.Check(ctx, "Tenant", tenantUuid.String(), "delete_roles", subject)
	if err != nil {
		logger.Logger.Error("Failed to check permissions", "error", err, "tenant_id", tenantUuid, "user_id", userUuid)
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", DeleteRoleError, err).Error())
	}
	if !canDeleteRoles {
		return nil, huma.Error403Forbidden("Insufficient permissions - must have `delete_roles` permission")
	}

	roleUuid, err := uuid.Parse(in.RoleID)
	if err != nil {
		return nil, huma.Error400BadRequest("Invalid role_id")
	}

	role, err := h.repo.GetRoleByIDAndTenant(ctx, repository.GetRoleByIDAndTenantParams{
		ID:       roleUuid,
		TenantID: tenantUuid,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, huma.Error404NotFound("Role not found")
		}
		logger.Logger.Error("Failed to fetch role", "role_id", roleUuid, "error", err)
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", DeleteRoleError, err).Error())
	}

	logger.Logger.Debug("Revoking keto tuples for role", "role_id", roleUuid, "role_name", role.RoleName, "user_count", len(role.UserIds), "permissions_count", len(role.Permissions))
	for _, uid := range role.UserIds {
		for _, perm := range role.Permissions {
			ns, obj, rel, perr := permissions.ParsePermission(perm, tenantUuid.String())
			if perr != nil {
				continue
			}
			_ = h.perms.Delete(ctx, ns, obj, rel, permissions.SubjectSet{Namespace: "User", Object: uid.String()})
		}
	}

	if err := h.repo.DeleteRoleByIDAndTenant(ctx, repository.DeleteRoleByIDAndTenantParams{
		ID:       roleUuid,
		TenantID: tenantUuid,
	}); err != nil {
		logger.Logger.Error("Failed to delete role", "role_id", roleUuid, "error", err)
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", DeleteRoleError, err).Error())
	}

	logger.Logger.Info("Deleted role", "role_id", roleUuid, "role_name", role.RoleName)
	return &DeleteRoleOutput{}, nil
}
