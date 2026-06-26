package invites

import (
	"api/internal/database/repository"
	"api/internal/services/auth"
	"api/internal/services/email"
	"api/internal/services/permissions"
	"api/internal/services/permissions/rbac"
	"api/internal/services/tenants"
)

type Handler struct {
	repo    repository.Querier
	perms   *permissions.Service
	auth    *auth.Service
	rbac    *rbac.Service
	tenants *tenants.Service
	email   *email.Service
}

type Deps struct {
	Repo    repository.Querier
	Perms   *permissions.Service
	Auth    *auth.Service
	RBAC    *rbac.Service
	Tenants *tenants.Service
	Email   *email.Service
}

func New(deps Deps) *Handler {
	return &Handler{
		repo:    deps.Repo,
		perms:   deps.Perms,
		auth:    deps.Auth,
		rbac:    deps.RBAC,
		tenants: deps.Tenants,
		email:   deps.Email,
	}
}
