package auth

import (
	"context"
	"errors"
	"fmt"

	"github.com/danielgtaylor/huma/v2"
	"github.com/google/uuid"

	"api/internal/database/repository"
	"api/internal/handlers"
	"api/internal/logger"
)

var ListTenantsError = errors.New("Failed to list tenants")

type UserTenantListItem struct {
	IsActive bool                        `json:"is_active" required:"true" example:"true"`
	Tenant   repository.GetTenantByIDRow `json:"tenant" required:"true"`
}

type ListTenantsResponse struct {
	Tenants []UserTenantListItem `json:"tenants" required:"true"`
}

type ListTenantsInput struct {
	handlers.AuthCtx
}

type ListTenantsOutput struct {
	Body ListTenantsResponse
}

func (h *Handler) ListTenants(ctx context.Context, in *ListTenantsInput) (*ListTenantsOutput, error) {
	if in.UserID == uuid.Nil {
		return nil, huma.Error401Unauthorized("UserID not found in context")
	}

	rows, err := h.repo.ListTenantsForUser(ctx, in.UserID.String())
	if err != nil {
		logger.Logger.Error("Failed to list tenants for user", "user_id", in.UserID, "error", err)
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", ListTenantsError, err).Error())
	}

	items := make([]UserTenantListItem, 0, len(rows))
	for _, r := range rows {
		items = append(items, UserTenantListItem{
			IsActive: r.IsActive,
			Tenant: repository.GetTenantByIDRow{
				ID:                 r.ID,
				Name:               r.Name,
				StripeCustomerID:   r.StripeCustomerID,
				EnterpriseTemplate: r.EnterpriseTemplate,
				EnterpriseID:       r.EnterpriseID,
				Type:               r.Type,
				CreatedAt:          r.CreatedAt,
				UpdatedAt:          r.UpdatedAt,
			},
		})
	}

	return &ListTenantsOutput{Body: ListTenantsResponse{Tenants: items}}, nil
}
