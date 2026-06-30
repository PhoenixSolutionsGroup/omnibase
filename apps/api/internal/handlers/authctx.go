package handlers

import (
	"fmt"

	"github.com/danielgtaylor/huma/v2"
	"github.com/danielgtaylor/huma/v2/adapters/humagin"
	"github.com/google/uuid"
	kratos "github.com/ory/kratos-client-go"
)

type AuthCtx struct {
	UserID   uuid.UUID
	TenantID uuid.UUID
	Session  *kratos.Session
	Identity *kratos.Identity
}

func (a *AuthCtx) Resolve(ctx huma.Context) []error {
	gc := humagin.Unwrap(ctx)

	if v := gc.GetString("user_id"); v != "" {
		parsed, err := uuid.Parse(v)
		if err != nil {
			return []error{fmt.Errorf("invalid user_id: %w", err)}
		}
		a.UserID = parsed
	}

	if v := gc.GetString("tenant_id"); v != "" {
		parsed, err := uuid.Parse(v)
		if err != nil {
			return []error{fmt.Errorf("invalid tenant_id: %w", err)}
		}
		a.TenantID = parsed
	}

	if s, ok := gc.Get("session"); ok {
		a.Session, _ = s.(*kratos.Session)
	}
	if i, ok := gc.Get("identity"); ok {
		a.Identity, _ = i.(*kratos.Identity)
	}
	return nil
}
