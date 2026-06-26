package roles

import (
	"errors"
	"fmt"
	"slices"
	"strings"

	"api/internal/database/repository"
	"api/internal/handlers"
	"api/internal/logger"
	"api/internal/services/permissions"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgconn"
)

type CreateRoleRequest struct {
	RoleName    string   `json:"role_name" binding:"required,min=1" example:"test_project_viewer"`
	Permissions []string `json:"permissions" binding:"required,min=1" validate:"required,min=1,dive,min=1" example:"project:*#view,tenant#read"`
}

func (h *Handler) CreateRole(c *gin.Context) {
	userUuid, tenantUuid := handlers.UserAndTenant(c)

	subject := permissions.SubjectSet{Namespace: "User", Object: userUuid.String()}
	canCreateRoles, err := h.perms.Check(c.Request.Context(), "Tenant", tenantUuid.String(), "create_roles", subject)
	if err != nil {
		logger.Logger.Error("Failed to check permissions", "error", err, "tenant_id", tenantUuid, "user_id", userUuid)
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("Failed to check permissions: %w", err))
		return
	}
	if !canCreateRoles {
		handlers.NewForbiddenResponse(c, "Insufficient permissions - must have `create_roles` permission")
		return
	}

	var req CreateRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		handlers.NewBadRequestResponse(c, err.Error())
		return
	}
	if slices.Contains(req.Permissions, "") {
		handlers.NewBadRequestResponse(c, "Permissions array cannot contain empty values")
		return
	}

	logger.Logger.Debug("Creating new role", "tenant_id", tenantUuid, "role_name", req.RoleName, "permissions_count", len(req.Permissions))

	row, err := h.repo.CreateRole(c.Request.Context(), repository.CreateRoleParams{
		TenantID:    tenantUuid,
		RoleName:    req.RoleName,
		Permissions: req.Permissions,
		TemplateID:  nil,
		UserIds:     []uuid.UUID{},
	})
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			handlers.NewConflictResponse(c, "Role with this name already exists for tenant")
			return
		}
		if strings.Contains(err.Error(), "duplicate key") {
			handlers.NewConflictResponse(c, "Role with this name already exists for tenant")
			return
		}
		logger.Logger.Error("Failed to create role", "tenant_id", tenantUuid, "role_name", req.RoleName, "error", err)
		handlers.NewInternalServerErrorResponse(c, err)
		return
	}

	logger.Logger.Info("Created role", "tenant_id", tenantUuid, "role_id", row.ID, "role_name", row.RoleName)
	handlers.NewSuccessResponse(c, row)
}
