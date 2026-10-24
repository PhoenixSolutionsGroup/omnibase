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

var UpdateRoleError = errors.New("Failed to update role")

type UpdateRoleRequest struct {
	Permissions []string `json:"permissions" required:"true" example:"project:*#view,project:*#edit"`
}

type UpdateRoleInput struct {
	handlers.AuthCtx
	RoleID string `path:"role_id"`
	Body   UpdateRoleRequest
}

type UpdateRoleOutput struct {
	Body repository.UpdateRolePermissionsRow
}

func (h *Handler) UpdateRole(ctx context.Context, in *UpdateRoleInput) (*UpdateRoleOutput, error) {
	tenantUuid := in.TenantID

	roleUuid, err := uuid.Parse(in.RoleID)
	if err != nil {
		return nil, huma.Error400BadRequest("Invalid role_id")
	}

	req := in.Body

	existing, err := h.repo.GetRoleByIDAndTenant(ctx, repository.GetRoleByIDAndTenantParams{
		ID:       roleUuid,
		TenantID: tenantUuid,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, huma.Error404NotFound("Role not found")
		}
		logger.Logger.Error("Failed to fetch role", "role_id", roleUuid, "error", err)
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", UpdateRoleError, err).Error())
	}

	logger.Logger.Debug("Revoking old keto tuples", "role_id", roleUuid, "user_count", len(existing.UserIds), "old_permissions_count", len(existing.Permissions))
	for _, uid := range existing.UserIds {
		for _, perm := range existing.Permissions {
			ns, obj, rel, perr := permissions.ParsePermission(perm, tenantUuid.String())
			if perr != nil {
				continue
			}
			_ = h.perms.Delete(ctx, ns, obj, rel, permissions.SubjectSet{Namespace: "User", Object: uid.String()})
		}
	}

	updated, err := h.repo.UpdateRolePermissions(ctx, repository.UpdateRolePermissionsParams{
		Permissions: req.Permissions,
		ID:          roleUuid,
		TenantID:    tenantUuid,
	})
	if err != nil {
		logger.Logger.Error("Failed to update role", "role_id", roleUuid, "error", err)
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", UpdateRoleError, err).Error())
	}

	logger.Logger.Debug("Granting new keto tuples", "role_id", roleUuid, "user_count", len(updated.UserIds), "new_permissions_count", len(updated.Permissions))
	for _, uid := range updated.UserIds {
		for _, perm := range updated.Permissions {
			ns, obj, rel, perr := permissions.ParsePermission(perm, tenantUuid.String())
			if perr != nil {
				logger.Logger.Error("Failed to parse permission", "permission", perm, "error", perr)
				return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", UpdateRoleError, perr).Error())
			}
			if err := h.perms.Create(ctx, ns, obj, rel, permissions.SubjectSet{Namespace: "User", Object: uid.String()}); err != nil {
				logger.Logger.Error("Failed to create keto tuple", "user_id", uid, "permission", perm, "error", err)
				return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", UpdateRoleError, err).Error())
			}
		}
	}

	logger.Logger.Info("Updated role", "role_id", roleUuid, "old_permissions", existing.Permissions, "new_permissions", updated.Permissions)
	return &UpdateRoleOutput{Body: updated}, nil
}
