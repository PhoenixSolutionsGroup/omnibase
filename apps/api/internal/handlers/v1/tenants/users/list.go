package users

import (
	"context"
	"errors"
	"fmt"

	"github.com/danielgtaylor/huma/v2"

	"api/internal/handlers"
	"api/internal/logger"
	"api/internal/services/permissions"
)

var ListError = errors.New("Failed to list tenant users")

type UserResponse struct {
	UserID    string `json:"user_id"    example:"550e8400-e29b-41d4-a716-446655440000"`
	FirstName string `json:"first_name" example:"John"`
	LastName  string `json:"last_name"  example:"Doe"`
	Email     string `json:"email"      example:"test@example.com"`
	Role      string `json:"role"       example:"member"`
}

type ListInput struct {
	handlers.AuthCtx
}

type ListOutput struct {
	Body []UserResponse
}

func (h *Handler) List(ctx context.Context, in *ListInput) (*ListOutput, error) {
	subject := permissions.SubjectSet{Namespace: "User", Object: in.UserID.String()}
	canView, err := h.perms.Check(ctx, "Tenant", in.TenantID.String(), "view_users", subject)
	if err != nil {
		logger.Logger.Error("Failed to check permissions", "error", err, "tenant_id", in.TenantID, "user_id", in.UserID)
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", ListError, err).Error())
	}
	if !canView {
		return nil, huma.Error403Forbidden("Insufficient permissions - must have `view_users` permission")
	}

	rows, err := h.repo.ListTenantUsersByTenant(ctx, in.TenantID.String())
	if err != nil {
		logger.Logger.Error("Failed to fetch tenant users", "error", err, "tenant_id", in.TenantID)
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", ListError, err).Error())
	}

	out := make([]UserResponse, 0, len(rows))
	if len(rows) == 0 {
		return &ListOutput{Body: out}, nil
	}

	ids := make([]string, len(rows))
	for i, r := range rows {
		ids[i] = r.UserID
	}

	identities, err := h.auth.GetIdentities(ctx, ids)
	if err != nil {
		logger.Logger.Error("Failed to fetch identities", "error", err, "tenant_id", in.TenantID)
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", ListError, err).Error())
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

	logger.Logger.Debug("Listed tenant users", "tenant_id", in.TenantID, "count", len(out))
	return &ListOutput{Body: out}, nil
}
