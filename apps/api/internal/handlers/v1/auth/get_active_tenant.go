package auth

import (
	"context"
	"errors"

	"github.com/danielgtaylor/huma/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"api/internal/database/repository"
	"api/internal/handlers"
	"api/internal/logger"
)

type ActiveTenantResponse struct {
	Tenant *repository.GetTenantByIDRow `json:"tenant,omitempty"`
}

type GetActiveTenantInput struct {
	handlers.AuthCtx
}

type GetActiveTenantOutput struct {
	Body ActiveTenantResponse
}

func (h *Handler) GetActiveTenant(ctx context.Context, in *GetActiveTenantInput) (*GetActiveTenantOutput, error) {
	if in.UserID == uuid.Nil {
		return nil, huma.Error401Unauthorized("User ID not found in context")
	}

	resp := ActiveTenantResponse{}

	if in.TenantID != uuid.Nil {
		tenant, err := h.repo.GetTenantByID(ctx, in.TenantID.String())
		if err != nil {
			logger.Logger.Warn("Failed to fetch tenant", "tenant_id", in.TenantID, "error", err)
		} else {
			resp.Tenant = &tenant
		}
		return &GetActiveTenantOutput{Body: resp}, nil
	}

	row, err := h.repo.GetActiveTenantForUser(ctx, in.UserID.String())
	if err != nil && !errors.Is(err, pgx.ErrNoRows) {
		logger.Logger.Warn("Failed to fetch active tenant for user", "user_id", in.UserID, "error", err)
	} else if err == nil {
		resp.Tenant = &repository.GetTenantByIDRow{
			ID:                 row.ID,
			Name:               row.Name,
			StripeCustomerID:   row.StripeCustomerID,
			EnterpriseTemplate: row.EnterpriseTemplate,
			EnterpriseID:       row.EnterpriseID,
			Type:               row.Type,
			CreatedAt:          row.CreatedAt,
			UpdatedAt:          row.UpdatedAt,
		}
	}

	return &GetActiveTenantOutput{Body: resp}, nil
}
