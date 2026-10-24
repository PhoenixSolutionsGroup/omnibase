package v1

import (
	"context"

	"api/internal/authn"
	"api/internal/middleware"

	"github.com/danielgtaylor/huma/v2"
)

func register[I, O any](
	api huma.API,
	authMw *middleware.AuthMiddleware,
	op huma.Operation,
	methods authn.AuthMethod,
	extra huma.Middlewares,
	handler func(context.Context, *I) (*O, error),
) {
	op.Security = securityFor(methods)

	middlewares := huma.Middlewares{}
	if methods != authn.AuthNone {
		middlewares = append(middlewares, middleware.GinToHuma(authMw.RequireAuth(methods)))
	}
	middlewares = append(middlewares, extra...)
	op.Middlewares = middlewares

	huma.Register(api, op, handler)
}

func securityFor(methods authn.AuthMethod) []map[string][]string {
	var security []map[string][]string
	if methods&authn.AuthSession != 0 {
		security = append(security,
			map[string][]string{"SessionTokenAuth": {}},
			map[string][]string{"CookieAuth": {}},
		)
	}
	if methods&authn.AuthServiceKey != 0 {
		security = append(security, map[string][]string{"ServiceKeyAuth": {}})
	}
	if methods&authn.AuthAppKey != 0 {
		security = append(security, map[string][]string{"AppKeyAuth": {}})
	}
	return security
}
