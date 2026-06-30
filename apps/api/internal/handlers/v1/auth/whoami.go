package auth

import (
	"context"

	"github.com/danielgtaylor/huma/v2"

	"api/internal/handlers"
)

type WhoAmIInput struct {
	handlers.AuthCtx
}

type WhoAmIBody struct {
	Authenticated bool   `json:"authenticated" required:"true" example:"true"`
	UserID        string `json:"user_id" required:"true" example:"550e8400-e29b-41d4-a716-446655440000"`
}

type WhoAmIOutput struct {
	Body WhoAmIBody
}

func (h *Handler) WhoAmI(_ context.Context, in *WhoAmIInput) (*WhoAmIOutput, error) {
	if in.Session == nil || in.Session.Identity == nil {
		return nil, huma.Error401Unauthorized("no session")
	}
	return &WhoAmIOutput{Body: WhoAmIBody{
		Authenticated: true,
		UserID:        in.Session.Identity.GetId(),
	}}, nil
}
