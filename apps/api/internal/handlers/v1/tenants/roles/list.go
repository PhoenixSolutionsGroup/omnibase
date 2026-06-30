package roles

import (
	"context"
	"errors"
	"fmt"

	"github.com/danielgtaylor/huma/v2"

	"api/internal/database/repository"
	"api/internal/handlers"
	"api/internal/logger"
)

var ListRolesError = errors.New("Failed to list roles")

type ListRolesInput struct {
	handlers.AuthCtx
}

type ListRolesOutput struct {
	Body []repository.ListRolesByTenantRow
}

func (h *Handler) ListRoles(ctx context.Context, in *ListRolesInput) (*ListRolesOutput, error) {
	tenantUuid := in.TenantID
	logger.Logger.Debug("Listing roles for tenant", "tenant_id", tenantUuid)

	roles, err := h.repo.ListRolesByTenant(ctx, tenantUuid)
	if err != nil {
		logger.Logger.Error("Failed to list roles", "tenant_id", tenantUuid, "error", err)
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", ListRolesError, err).Error())
	}

	logger.Logger.Debug("Successfully listed roles", "tenant_id", tenantUuid, "count", len(roles))
	return &ListRolesOutput{Body: roles}, nil
}
