package lifecycle

import (
	"context"
	"errors"
	"fmt"

	"github.com/danielgtaylor/huma/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"

	"api/internal/handlers"
	"api/internal/logger"
	"api/internal/services/permissions"
)

var (
	DeleteTenantError     = errors.New("Failed to delete tenant")
	DeleteTenantForbidden = errors.New("Insufficient permissions to delete tenant")
)

type DeleteTenantResponse struct {
	Message string `json:"message"`
}

type DeleteTenantInput struct {
	handlers.AuthCtx
}

type DeleteTenantOutput struct {
	Body DeleteTenantResponse
}

func (h *Handler) DeleteTenant(ctx context.Context, in *DeleteTenantInput) (*DeleteTenantOutput, error) {
	if in.TenantID == uuid.Nil {
		return nil, huma.Error400BadRequest("Tenant ID is required")
	}
	if in.UserID == uuid.Nil {
		return nil, huma.Error401Unauthorized("User not authenticated")
	}
	tenantID := in.TenantID.String()
	userID := in.UserID.String()

	if _, err := h.repo.GetTenantByID(ctx, tenantID); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, huma.Error404NotFound("Tenant not found")
		}
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", DeleteTenantError, err).Error())
	}

	subject := permissions.SubjectSet{Namespace: "User", Object: userID}
	canDelete, err := h.perms.Check(ctx, "Tenant", tenantID, "delete_tenant", subject)
	if err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", DeleteTenantError, err).Error())
	}
	if !canDelete {
		return nil, huma.Error403Forbidden(DeleteTenantForbidden.Error())
	}

	tenantUsers, err := h.repo.ListTenantUsersByTenant(ctx, tenantID)
	if err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", DeleteTenantError, err).Error())
	}

	tenantRow, _ := h.repo.GetTenantByID(ctx, tenantID)
	if tenantRow.StripeCustomerID != nil && *tenantRow.StripeCustomerID != "" {
		if err := h.billing.ArchiveCustomer(ctx, *tenantRow.StripeCustomerID); err != nil {
			return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", DeleteTenantError, err).Error())
		}
	}

	if err := h.repo.DeleteTenant(ctx, tenantID); err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23503" {
			return nil, huma.Error409Conflict("tenant has associated resources that must be deleted first")
		}
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", DeleteTenantError, err).Error())
	}

	logger.Logger.Info("tenant deleted; cleaning up tenant users", "tenant_id", tenantID, "user_count", len(tenantUsers))
	for _, tu := range tenantUsers {
		uid, err := parseUUID(tu.UserID)
		if err != nil {
			logger.Logger.Warn("invalid user_id in tenant_user row", "user_id", tu.UserID, "error", err)
			continue
		}
		if err := h.tenants.HandleUserCleanup(ctx, uid); err != nil {
			logger.Logger.Warn("user cleanup failed", "user_id", tu.UserID, "error", err)
		}
	}

	return &DeleteTenantOutput{Body: DeleteTenantResponse{Message: "Tenant deleted successfully"}}, nil
}
