package handlers

import (
	"github.com/danielgtaylor/huma/v2"
	"github.com/danielgtaylor/huma/v2/adapters/humagin"
	kratos "github.com/ory/kratos-client-go"
)

type AuthCtx struct {
	UserID   string
	TenantID string
	Session  *kratos.Session
	Identity *kratos.Identity
}

func (a *AuthCtx) Resolve(ctx huma.Context) []error {
	gc := humagin.Unwrap(ctx)
	a.UserID = gc.GetString("user_id")
	a.TenantID = gc.GetString("tenant_id")
	if s, ok := gc.Get("session"); ok {
		a.Session, _ = s.(*kratos.Session)
	}
	if i, ok := gc.Get("identity"); ok {
		a.Identity, _ = i.(*kratos.Identity)
	}
	return nil
}
