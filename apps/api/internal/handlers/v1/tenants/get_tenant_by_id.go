package tenants

import (
	"context"
	"errors"
	"fmt"

	"github.com/danielgtaylor/huma/v2"
	"github.com/jackc/pgx/v5"

	"api/internal/database/repository"
	"api/internal/handlers"
	"api/internal/logger"
)

var GetTenantByIDError = errors.New("Failed to fetch tenant")

type GetTenantByIDInput struct {
	handlers.AuthCtx
	TenantID string `path:"tenant_id"`
}

type GetTenantByIDOutput struct {
	Body repository.GetTenantByIDRow
}

func (h *Handler) GetTenantByID(ctx context.Context, in *GetTenantByIDInput) (*GetTenantByIDOutput, error) {
	if in.TenantID == "" {
		return nil, huma.Error400BadRequest("tenant_id is required")
	}

	row, err := h.repo.GetTenantByID(ctx, in.TenantID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, huma.Error404NotFound("Tenant not found")
		}
		logger.Logger.Error("Failed to fetch tenant", "error", err, "tenant_id", in.TenantID)
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", GetTenantByIDError, err).Error())
	}

	return &GetTenantByIDOutput{Body: row}, nil
}
