package auth

import (
	"context"
	"errors"

	"github.com/danielgtaylor/huma/v2"
	"github.com/google/uuid"
	kratos "github.com/ory/kratos-client-go"

	"api/internal/database/repository"
	"api/internal/handlers"
	"api/internal/logger"
)

var GetSessionError = errors.New("Failed to get session")

type SessionResponse struct {
	Session  *kratos.Session              `json:"session" required:"true"`
	Identity *kratos.Identity             `json:"identity" required:"true"`
	Tenant   *repository.GetTenantByIDRow `json:"tenant,omitempty"`
}

type GetSessionInput struct {
	handlers.AuthCtx
}

type GetSessionOutput struct {
	Body SessionResponse
}

func (h *Handler) GetSession(ctx context.Context, in *GetSessionInput) (*GetSessionOutput, error) {
	if in.Session == nil || in.Identity == nil {
		return nil, huma.Error401Unauthorized("no session")
	}

	resp := SessionResponse{
		Session:  in.Session,
		Identity: in.Identity,
	}

	if in.TenantID != uuid.Nil {
		tenant, err := h.repo.GetTenantByID(ctx, in.TenantID.String())
		if err != nil {
			logger.Logger.Warn("Failed to fetch tenant", "tenant_id", in.TenantID, "error", err)
		} else {
			resp.Tenant = &tenant
		}
	}

	return &GetSessionOutput{Body: resp}, nil
}
