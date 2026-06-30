package lifecycle

import (
	"context"
	"errors"
	"fmt"

	"github.com/danielgtaylor/huma/v2"
	"github.com/google/uuid"

	"api/internal/handlers"
	"api/internal/services/tenants"
)

var SwitchActiveError = errors.New("Failed to switch active tenant")

type SwitchActiveRequest struct {
	TenantID string `json:"tenant_id" required:"true" format:"uuid" example:"550e8400-e29b-41d4-a716-446655440000"`
}

type SwitchActiveResponse struct {
	Token   string `json:"token"   example:"eyJhbGciOiJIUzI1NiIs..."`
	Message string `json:"message" example:"Successfully switched tenants"`
}

type SwitchActiveInput struct {
	handlers.AuthCtx
	Body SwitchActiveRequest
}

type SwitchActiveOutput struct {
	Body SwitchActiveResponse
}

func (h *Handler) SwitchActive(ctx context.Context, in *SwitchActiveInput) (*SwitchActiveOutput, error) {
	if in.UserID == uuid.Nil {
		return nil, huma.Error401Unauthorized("User not authenticated")
	}

	tenantUuid, err := uuid.Parse(in.Body.TenantID)
	if err != nil {
		return nil, huma.Error400BadRequest("Invalid tenant_id")
	}

	token, err := h.tenants.SetActive(ctx, in.UserID, tenantUuid)
	if err != nil {
		if errors.Is(err, tenants.NotTenantMemberError) {
			return nil, huma.Error404NotFound("Tenant not found or you don't have access to it")
		}
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", SwitchActiveError, err).Error())
	}

	return &SwitchActiveOutput{Body: SwitchActiveResponse{
		Token:   token,
		Message: "Successfully switched tenants",
	}}, nil
}
