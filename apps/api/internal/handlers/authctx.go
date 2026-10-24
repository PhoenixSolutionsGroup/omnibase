package handlers

import (
	"api/internal/authn"

	"github.com/danielgtaylor/huma/v2"
	"github.com/danielgtaylor/huma/v2/adapters/humagin"
	"github.com/google/uuid"
	kratos "github.com/ory/kratos-client-go"
)

type AuthCtx struct {
	Method   authn.AuthMethod
	UserID   uuid.UUID
	TenantID uuid.UUID
	Session  *kratos.Session
	Identity *kratos.Identity
}

func (a *AuthCtx) Resolve(ctx huma.Context) []error {
	gc := humagin.Unwrap(ctx)

	principal, ok := authn.Get(gc)
	if !ok {
		return nil
	}

	a.Method = principal.Method
	a.UserID = principal.UserID
	a.TenantID = principal.TenantID
	a.Session = principal.Session
	a.Identity = principal.Identity
	return nil
}
