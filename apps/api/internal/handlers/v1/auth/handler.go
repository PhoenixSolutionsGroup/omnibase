package auth

import (
	"api/internal/database/repository"

	kratos "github.com/ory/kratos-client-go"
)

type Handler struct {
	repo        repository.Querier
	kratosPub   *kratos.APIClient
	kratosAdmin *kratos.APIClient
}

type Deps struct {
	Repo        repository.Querier
	KratosPub   *kratos.APIClient
	KratosAdmin *kratos.APIClient
}

func New(deps Deps) *Handler {
	return &Handler{
		repo:        deps.Repo,
		kratosPub:   deps.KratosPub,
		kratosAdmin: deps.KratosAdmin,
	}
}
