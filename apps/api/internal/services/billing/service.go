package billing

import (
	"api/internal/database/repository"
	"api/internal/services/stripe_client"
)

type Service struct {
	repo   repository.Querier
	stripe *stripe_client.Client
	feePct float64
}

type Deps struct {
	Repo   repository.Querier
	Stripe *stripe_client.Client
	FeePct float64
}

func New(deps Deps) *Service {
	return &Service{
		repo:   deps.Repo,
		stripe: deps.Stripe,
		feePct: deps.FeePct,
	}
}
