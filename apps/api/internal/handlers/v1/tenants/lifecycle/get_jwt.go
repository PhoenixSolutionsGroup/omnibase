package lifecycle

import (
	"context"
	"errors"
	"fmt"

	"github.com/danielgtaylor/huma/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"api/internal/handlers"
)

var GetJWTError = errors.New("Failed to create JWT")

type JWTResponse struct {
	Token string `json:"token" example:"eyJhbGciOiJIUzI1NiIs..."`
}

type GetJWTInput struct {
	handlers.AuthCtx
}

type GetJWTOutput struct {
	Body JWTResponse
}

func (h *Handler) GetJWT(ctx context.Context, in *GetJWTInput) (*GetJWTOutput, error) {
	if in.UserID == uuid.Nil {
		return nil, huma.Error401Unauthorized("User not authenticated")
	}
	if in.TenantID == uuid.Nil {
		return nil, huma.Error400BadRequest("Tenant ID is required")
	}

	token, err := h.tenants.CreateJWT(ctx, in.UserID, in.TenantID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, huma.Error403Forbidden("User is not a member of this tenant")
		}
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", GetJWTError, err).Error())
	}

	return &GetJWTOutput{Body: JWTResponse{Token: token}}, nil
}
