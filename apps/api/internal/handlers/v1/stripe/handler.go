package stripe

import (
	"api/internal/database/repository"
	"api/internal/services/billing"
	"api/internal/services/stripe_client"
	"api/internal/services/stripe_config"
)

type Handler struct {
	repo         repository.Querier
	stripeConfig *stripe_config.Service
	billing      *billing.Service
	stripe       *stripe_client.Client
}

type Deps struct {
	Repo         repository.Querier
	StripeConfig *stripe_config.Service
	Billing      *billing.Service
	Stripe       *stripe_client.Client
}

func New(deps Deps) *Handler {
	return &Handler{
		repo:         deps.Repo,
		stripeConfig: deps.StripeConfig,
		billing:      deps.Billing,
		stripe:       deps.Stripe,
	}
}
