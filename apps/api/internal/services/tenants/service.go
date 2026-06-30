package tenants

import (
	"api/internal/database/repository"
	"api/internal/services/auth"
)

type Service struct {
	repo       repository.Querier
	auth       *auth.Service
	signingKey string
}

type Deps struct {
	Repo       repository.Querier
	Auth       *auth.Service
	SigningKey string
}

func New(deps Deps) *Service {
	return &Service{
		repo:       deps.Repo,
		auth:       deps.Auth,
		signingKey: deps.SigningKey,
	}
}
