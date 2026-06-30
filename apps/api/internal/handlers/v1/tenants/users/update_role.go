package users

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

var UpdateUserRoleError = errors.New("Failed to update user role")

type UpdateUserRoleRequest struct {
	Role         string `json:"role"    required:"true" example:"member"`
	TargetUserID string `json:"user_id" required:"true" example:"550e8400-e29b-41d4-a716-446655440001"`
}

type UpdateUserRoleResponse struct {
	Message string `json:"message" example:"User role updated successfully"`
}

type UpdateUserRoleInput struct {
	handlers.AuthCtx
	Body UpdateUserRoleRequest
}

type UpdateUserRoleOutput struct {
	Body UpdateUserRoleResponse
}

func (h *Handler) UpdateRole(ctx context.Context, in *UpdateUserRoleInput) (*UpdateUserRoleOutput, error) {
	req := in.Body

	targetUuid, err := uuid.Parse(req.TargetUserID)
	if err != nil {
		return nil, huma.Error400BadRequest("Invalid user_id")
	}

	subject := permissions.SubjectSet{Namespace: "User", Object: in.UserID.String()}
	canManage, err := h.perms.Check(ctx, "Tenant", in.TenantID.String(), "update_user_role", subject)
	if err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", UpdateUserRoleError, err).Error())
	}
	if !canManage {
		return nil, huma.Error403Forbidden("Insufficient permissions - must have `update_user_role` permission")
	}

	target, err := h.repo.GetTenantUser(ctx, repository.GetTenantUserParams{
		TenantID: in.TenantID.String(),
		UserID:   targetUuid.String(),
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, huma.Error404NotFound("User not found in tenant")
		}
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", UpdateUserRoleError, err).Error())
	}
	previousRole := target.Role

	if req.Role == "owner" {
		canPromote, err := h.perms.Check(ctx, "Tenant", in.TenantID.String(), "update_user_role_to_owner", subject)
		if err != nil {
			return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", UpdateUserRoleError, err).Error())
		}
		if !canPromote {
			return nil, huma.Error403Forbidden("Insufficient permissions - must have `update_user_role_to_owner` permission to promote to owner")
		}
	}

	if previousRole == "owner" && req.Role != "owner" {
		canDemote, err := h.perms.Check(ctx, "Tenant", in.TenantID.String(), "remove_owner_role", subject)
		if err != nil {
			return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", UpdateUserRoleError, err).Error())
		}
		if !canDemote {
			return nil, huma.Error403Forbidden("Insufficient permissions - must have `remove_owner_role` permission to demote an owner")
		}

		owners, err := h.repo.CountOwnersByTenant(ctx, in.TenantID.String())
		if err != nil {
			return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", UpdateUserRoleError, err).Error())
		}
		if owners <= 1 {
			return nil, huma.Error400BadRequest("Cannot demote the last owner from the tenant")
		}
	}

	if err := h.rbac.RevokeUser(ctx, targetUuid, in.TenantID, previousRole); err != nil {
		logger.Logger.Error("Failed to revoke old role", "error", err, "tenant_id", in.TenantID, "target_user_id", targetUuid, "previous_role", previousRole)
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", UpdateUserRoleError, err).Error())
	}

	if err := h.repo.UpdateTenantUserRole(ctx, repository.UpdateTenantUserRoleParams{
		TenantID: in.TenantID.String(),
		UserID:   targetUuid.String(),
		Role:     req.Role,
	}); err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", UpdateUserRoleError, err).Error())
	}

	if err := h.rbac.Assign(ctx, targetUuid, in.TenantID, req.Role); err != nil {
		logger.Logger.Error("Failed to assign new role", "error", err, "tenant_id", in.TenantID, "target_user_id", targetUuid, "new_role", req.Role)
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", UpdateUserRoleError, err).Error())
	}

	logger.Logger.Info("Updated user role", "tenant_id", in.TenantID, "target_user_id", targetUuid, "previous_role", previousRole, "new_role", req.Role)
	return &UpdateUserRoleOutput{Body: UpdateUserRoleResponse{Message: "User role updated successfully"}}, nil
}
