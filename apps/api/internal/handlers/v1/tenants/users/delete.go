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

var DeleteError = errors.New("Failed to delete tenant user")

type DeleteRequest struct {
	TargetUserID string `json:"user_id" required:"true" minLength:"1" example:"550e8400-e29b-41d4-a716-446655440001"`
}

type DeleteInput struct {
	handlers.AuthCtx
	Body DeleteRequest
}

type DeleteOutput struct {
	Body any
}

func (h *Handler) Delete(ctx context.Context, in *DeleteInput) (*DeleteOutput, error) {
	req := in.Body

	targetUuid, err := uuid.Parse(req.TargetUserID)
	if err != nil {
		return nil, huma.Error400BadRequest("Invalid user_id")
	}

	target, err := h.repo.GetTenantUser(ctx, repository.GetTenantUserParams{
		TenantID: in.TenantID.String(),
		UserID:   targetUuid.String(),
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, huma.Error404NotFound("User not found in tenant")
		}
		logger.Logger.Error("Failed to fetch target tenant user", "error", err, "tenant_id", in.TenantID, "target_user_id", targetUuid)
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", DeleteError, err).Error())
	}

	subject := permissions.SubjectSet{Namespace: "User", Object: in.UserID.String()}
	canRemove, err := h.perms.Check(ctx, "Tenant", in.TenantID.String(), "remove_user", subject)
	if err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", DeleteError, err).Error())
	}
	if !canRemove {
		return nil, huma.Error403Forbidden("Insufficient permissions")
	}

	if target.Role == "owner" {
		canRemoveOwner, err := h.perms.Check(ctx, "Tenant", in.TenantID.String(), "remove_owner_role", subject)
		if err != nil {
			return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", DeleteError, err).Error())
		}
		if !canRemoveOwner {
			return nil, huma.Error403Forbidden("Insufficient permissions - must have `remove_owner_role` permission to remove an owner")
		}

		owners, err := h.repo.CountOwnersByTenant(ctx, in.TenantID.String())
		if err != nil {
			return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", DeleteError, err).Error())
		}
		if owners <= 1 {
			return nil, huma.Error400BadRequest("Cannot remove the last owner from the tenant")
		}
	}

	if err := h.rbac.RevokeUser(ctx, targetUuid, in.TenantID, target.Role); err != nil {
		logger.Logger.Error("Failed to revoke user role", "error", err, "tenant_id", in.TenantID, "target_user_id", targetUuid)
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", DeleteError, err).Error())
	}

	if err := h.repo.DeleteTenantUser(ctx, repository.DeleteTenantUserParams{
		TenantID: in.TenantID.String(),
		UserID:   targetUuid.String(),
	}); err != nil {
		logger.Logger.Error("Failed to delete tenant user", "error", err, "tenant_id", in.TenantID, "target_user_id", targetUuid)
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", DeleteError, err).Error())
	}

	if err := h.tenants.HandleUserCleanup(ctx, targetUuid); err != nil {
		logger.Logger.Error("Failed to handle user cleanup", "error", err, "target_user_id", targetUuid)
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", DeleteError, err).Error())
	}

	logger.Logger.Info("Removed user from tenant", "tenant_id", in.TenantID, "target_user_id", targetUuid)
	return &DeleteOutput{}, nil
}
