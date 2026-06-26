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

var DeleteError = errors.New("Failed to delete tenant user")

type DeleteRequest struct {
	TargetUserID string `json:"user_id" binding:"required,min=1" example:"550e8400-e29b-41d4-a716-446655440001"`
}

func (h *Handler) Delete(c *gin.Context) {
	userUuid, tenantUuid := handlers.UserAndTenant(c)

	var req DeleteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		handlers.NewBadRequestResponse(c, "Invalid request format")
		return
	}

	targetUuid, err := uuid.Parse(req.TargetUserID)
	if err != nil {
		handlers.NewBadRequestResponse(c, "Invalid user_id")
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
		logger.Logger.Error("Failed to fetch target tenant user", "error", err, "tenant_id", tenantUuid, "target_user_id", targetUuid)
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: %w", DeleteError, err))
		return
	}

	subject := permissions.SubjectSet{Namespace: "User", Object: userUuid.String()}
	canRemove, err := h.perms.Check(c.Request.Context(), "Tenant", tenantUuid.String(), "remove_user", subject)
	if err != nil {
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: %w", DeleteError, err))
		return
	}
	if !canRemove {
		handlers.NewForbiddenResponse(c, "Insufficient permissions")
		return
	}

	if target.Role == "owner" {
		canRemoveOwner, err := h.perms.Check(c.Request.Context(), "Tenant", tenantUuid.String(), "remove_owner_role", subject)
		if err != nil {
			handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: %w", DeleteError, err))
			return
		}
		if !canRemoveOwner {
			handlers.NewForbiddenResponse(c, "Insufficient permissions - must have `remove_owner_role` permission to remove an owner")
			return
		}

		owners, err := h.repo.CountOwnersByTenant(c.Request.Context(), tenantUuid.String())
		if err != nil {
			handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: %w", DeleteError, err))
			return
		}
		if owners <= 1 {
			handlers.NewBadRequestResponse(c, "Cannot remove the last owner from the tenant")
			return
		}
	}

	if err := h.rbac.RevokeUser(c.Request.Context(), targetUuid, tenantUuid, target.Role); err != nil {
		logger.Logger.Error("Failed to revoke user role", "error", err, "tenant_id", tenantUuid, "target_user_id", targetUuid)
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: %w", DeleteError, err))
		return
	}

	if err := h.repo.DeleteTenantUser(c.Request.Context(), repository.DeleteTenantUserParams{
		TenantID: tenantUuid.String(),
		UserID:   targetUuid.String(),
	}); err != nil {
		logger.Logger.Error("Failed to delete tenant user", "error", err, "tenant_id", tenantUuid, "target_user_id", targetUuid)
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: %w", DeleteError, err))
		return
	}

	if err := h.tenants.HandleUserCleanup(c.Request.Context(), targetUuid); err != nil {
		logger.Logger.Error("Failed to handle user cleanup", "error", err, "target_user_id", targetUuid)
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: %w", DeleteError, err))
		return
	}

	logger.Logger.Info("Removed user from tenant", "tenant_id", tenantUuid, "target_user_id", targetUuid)
	handlers.NewSuccessResponse(c, nil)
}
