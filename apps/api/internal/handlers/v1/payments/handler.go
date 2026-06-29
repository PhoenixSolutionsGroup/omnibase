package payments

import (
	"api/internal/services/billing"
)

type Handler struct {
	billing *billing.Service
}

type Deps struct {
	Billing *billing.Service
}

func New(deps Deps) *Handler {
	return &Handler{billing: deps.Billing}
}
