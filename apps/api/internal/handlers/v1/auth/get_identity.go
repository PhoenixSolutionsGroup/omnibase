package auth

import (
	"context"

	"github.com/danielgtaylor/huma/v2"
	kratos "github.com/ory/kratos-client-go"

	"api/internal/handlers"
)

type GetIdentityInput struct {
	handlers.AuthCtx
}

type GetIdentityOutput struct {
	Body *kratos.Identity
}

func (h *Handler) GetIdentity(_ context.Context, in *GetIdentityInput) (*GetIdentityOutput, error) {
	if in.Identity == nil {
		return nil, huma.Error401Unauthorized("no identity")
	}
	return &GetIdentityOutput{Body: in.Identity}, nil
}
