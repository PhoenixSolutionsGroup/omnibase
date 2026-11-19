package tenants

import (
	"api/internal/database/repository"
	"api/internal/services/auth"
)

type Service struct {
	repo repository.Querier
	auth *auth.Service
}

type Deps struct {
	Repo repository.Querier
	Auth *auth.Service
}

func New(deps Deps) *Service {
	return &Service{
		repo: deps.Repo,
		auth: deps.Auth,
	}
}
