package billing

import (
	"api/internal/database/repository"
	"api/internal/services/stripe_client"
)

type Service struct {
	repo   repository.Querier
	stripe *stripe_client.Client
}

type Deps struct {
	Repo   repository.Querier
	Stripe *stripe_client.Client
}

func New(deps Deps) *Service {
	return &Service{
		repo:   deps.Repo,
		stripe: deps.Stripe,
	}
}
