package lifecycle

import (
	"github.com/google/uuid"

	"api/internal/database/repository"
	"api/internal/services/auth"
	"api/internal/services/billing"
	"api/internal/services/permissions"
	"api/internal/services/permissions/rbac"
	"api/internal/services/tenants"
)

type Handler struct {
	repo    repository.Querier
	tenants *tenants.Service
	billing *billing.Service
	rbac    *rbac.Service
	perms   *permissions.Service
	auth    *auth.Service
}

type Deps struct {
	Repo    repository.Querier
	Tenants *tenants.Service
	Billing *billing.Service
	RBAC    *rbac.Service
	Perms   *permissions.Service
	Auth    *auth.Service
}

func New(deps Deps) *Handler {
	return &Handler{
		repo:    deps.Repo,
		tenants: deps.Tenants,
		billing: deps.Billing,
		rbac:    deps.RBAC,
		perms:   deps.Perms,
		auth:    deps.Auth,
	}
}

func parseUUID(s string) (uuid.UUID, error) {
	return uuid.Parse(s)
}
