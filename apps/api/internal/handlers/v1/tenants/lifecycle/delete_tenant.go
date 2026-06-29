package lifecycle

import (
	"errors"
	"fmt"

	"github.com/gin-gonic/gin"
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

func (h *Handler) DeleteTenant(ctx *gin.Context) {
	tenantID := ctx.GetString("tenant_id")
	if tenantID == "" {
		handlers.NewBadRequestResponse(ctx, "Tenant ID is required")
		return
	}
	userID := ctx.GetString("user_id")
	if userID == "" {
		handlers.NewUnauthorizedResponse(ctx, "User not authenticated")
		return
	}

	if _, err := h.repo.GetTenantByID(ctx.Request.Context(), tenantID); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			handlers.NewNotFoundResponse(ctx, "Tenant not found")
			return
		}
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", DeleteTenantError, err))
		return
	}

	subject := permissions.SubjectSet{Namespace: "User", Object: userID}
	canDelete, err := h.perms.Check(ctx.Request.Context(), "Tenant", tenantID, "delete_tenant", subject)
	if err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", DeleteTenantError, err))
		return
	}
	if !canDelete {
		handlers.NewForbiddenResponse(ctx, DeleteTenantForbidden.Error())
		return
	}

	tenantUsers, err := h.repo.ListTenantUsersByTenant(ctx.Request.Context(), tenantID)
	if err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", DeleteTenantError, err))
		return
	}

	tenantRow, _ := h.repo.GetTenantByID(ctx.Request.Context(), tenantID)
	if tenantRow.StripeCustomerID != nil && *tenantRow.StripeCustomerID != "" {
		if err := h.billing.ArchiveCustomer(ctx.Request.Context(), *tenantRow.StripeCustomerID); err != nil {
			handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", DeleteTenantError, err))
			return
		}
	}

	if err := h.repo.DeleteTenant(ctx.Request.Context(), tenantID); err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23503" {
			handlers.NewConflictResponse(ctx, "tenant has associated resources that must be deleted first")
			return
		}
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", DeleteTenantError, err))
		return
	}

	logger.Logger.Info("tenant deleted; cleaning up tenant users", "tenant_id", tenantID, "user_count", len(tenantUsers))
	for _, tu := range tenantUsers {
		uid, err := parseUUID(tu.UserID)
		if err != nil {
			logger.Logger.Warn("invalid user_id in tenant_user row", "user_id", tu.UserID, "error", err)
			continue
		}
		if err := h.tenants.HandleUserCleanup(ctx.Request.Context(), uid); err != nil {
			logger.Logger.Warn("user cleanup failed", "user_id", tu.UserID, "error", err)
		}
	}

	handlers.NewSuccessResponse(ctx, DeleteTenantResponse{Message: "Tenant deleted successfully"})
}
