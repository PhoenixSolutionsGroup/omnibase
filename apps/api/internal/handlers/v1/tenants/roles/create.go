package roles

import (
	"context"
	"errors"
	"fmt"
	"slices"
	"strings"

	"github.com/danielgtaylor/huma/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgconn"

	"api/internal/database/repository"
	"api/internal/handlers"
	"api/internal/logger"
	"api/internal/services/permissions"
)

var CreateRoleError = errors.New("Failed to create role")

type CreateRoleRequest struct {
	RoleName    string   `json:"role_name" required:"true" minLength:"1" example:"test_project_viewer"`
	Permissions []string `json:"permissions" required:"true" minLength:"1" example:"project:*#view,tenant#read"`
}

type CreateRoleInput struct {
	handlers.AuthCtx
	Body CreateRoleRequest
}

type CreateRoleOutput struct {
	Body repository.CreateRoleRow
}

func (h *Handler) CreateRole(ctx context.Context, in *CreateRoleInput) (*CreateRoleOutput, error) {
	userUuid := in.UserID
	tenantUuid := in.TenantID

	subject := permissions.SubjectSet{Namespace: "User", Object: userUuid.String()}
	canCreateRoles, err := h.perms.Check(ctx, "Tenant", tenantUuid.String(), "create_roles", subject)
	if err != nil {
		logger.Logger.Error("Failed to check permissions", "error", err, "tenant_id", tenantUuid, "user_id", userUuid)
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", CreateRoleError, err).Error())
	}
	if !canCreateRoles {
		return nil, huma.Error403Forbidden("Insufficient permissions - must have `create_roles` permission")
	}

	req := in.Body
	if slices.Contains(req.Permissions, "") {
		return nil, huma.Error400BadRequest("Permissions array cannot contain empty values")
	}

	logger.Logger.Debug("Creating new role", "tenant_id", tenantUuid, "role_name", req.RoleName, "permissions_count", len(req.Permissions))

	row, err := h.repo.CreateRole(ctx, repository.CreateRoleParams{
		TenantID:    tenantUuid,
		RoleName:    req.RoleName,
		Permissions: req.Permissions,
		TemplateID:  nil,
		UserIds:     []uuid.UUID{},
	})
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return nil, huma.Error409Conflict("Role with this name already exists for tenant")
		}
		if strings.Contains(err.Error(), "duplicate key") {
			return nil, huma.Error409Conflict("Role with this name already exists for tenant")
		}
		logger.Logger.Error("Failed to create role", "tenant_id", tenantUuid, "role_name", req.RoleName, "error", err)
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", CreateRoleError, err).Error())
	}

	logger.Logger.Info("Created role", "tenant_id", tenantUuid, "role_id", row.ID, "role_name", row.RoleName)
	return &CreateRoleOutput{Body: row}, nil
}
