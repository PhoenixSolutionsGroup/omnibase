package users

import (
	"errors"
	"fmt"

	"api/internal/handlers"
	"api/internal/logger"
	"api/internal/services/permissions"

	"github.com/gin-gonic/gin"
)

var ListError = errors.New("Failed to list tenant users")

type UserResponse struct {
	UserID    string `json:"user_id"    example:"550e8400-e29b-41d4-a716-446655440000"`
	FirstName string `json:"first_name" example:"John"`
	LastName  string `json:"last_name"  example:"Doe"`
	Email     string `json:"email"      example:"test@example.com"`
	Role      string `json:"role"       example:"member"`
}

func (h *Handler) List(c *gin.Context) {
	userUuid, tenantUuid := handlers.UserAndTenant(c)

	subject := permissions.SubjectSet{Namespace: "User", Object: userUuid.String()}
	canView, err := h.perms.Check(c.Request.Context(), "Tenant", tenantUuid.String(), "view_users", subject)
	if err != nil {
		logger.Logger.Error("Failed to check permissions", "error", err, "tenant_id", tenantUuid, "user_id", userUuid)
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: %w", ListError, err))
		return
	}
	if !canView {
		handlers.NewForbiddenResponse(c, "Insufficient permissions - must have `view_users` permission")
		return
	}

	rows, err := h.repo.ListTenantUsersByTenant(c.Request.Context(), tenantUuid.String())
	if err != nil {
		logger.Logger.Error("Failed to fetch tenant users", "error", err, "tenant_id", tenantUuid)
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: %w", ListError, err))
		return
	}

	out := make([]UserResponse, 0, len(rows))
	if len(rows) == 0 {
		handlers.NewSuccessResponse(c, out)
		return
	}

	ids := make([]string, len(rows))
	for i, r := range rows {
		ids[i] = r.UserID
	}

	identities, err := h.auth.GetIdentities(c.Request.Context(), ids)
	if err != nil {
		logger.Logger.Error("Failed to fetch identities", "error", err, "tenant_id", tenantUuid)
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: %w", ListError, err))
		return
	}

	for _, r := range rows {
		id := identities[r.UserID]
		out = append(out, UserResponse{
			UserID:    r.UserID,
			FirstName: id.FirstName,
			LastName:  id.LastName,
			Email:     id.Email,
			Role:      r.Role,
		})
	}

	logger.Logger.Debug("Listed tenant users", "tenant_id", tenantUuid, "count", len(out))
	handlers.NewSuccessResponse(c, out)
}
