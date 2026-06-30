package subscriptions

import (
	"api/internal/database/repository"
	"api/internal/services/billing"
)

type Handler struct {
	repo    repository.Querier
	billing *billing.Service
}

type Deps struct {
	Repo    repository.Querier
	Billing *billing.Service
}

func New(deps Deps) *Handler {
	return &Handler{
		repo:    deps.Repo,
		billing: deps.Billing,
	}
}
