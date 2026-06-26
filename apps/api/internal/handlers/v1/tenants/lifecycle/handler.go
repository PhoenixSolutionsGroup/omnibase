package lifecycle

import (
	"api/internal/database/repository"
	"api/internal/services/tenants"
)

type Handler struct {
	repo    repository.Querier
	tenants *tenants.Service
}

type Deps struct {
	Repo    repository.Querier
	Tenants *tenants.Service
}

func New(deps Deps) *Handler {
	return &Handler{
		repo:    deps.Repo,
		tenants: deps.Tenants,
	}
}
