package roles

import (
	"api/internal/database/repository"
	"api/internal/services/permissions"
)

type Handler struct {
	repo  repository.Querier
	perms *permissions.Service
}

type Deps struct {
	Repo  repository.Querier
	Perms *permissions.Service
}

func New(deps Deps) *Handler {
	return &Handler{repo: deps.Repo, perms: deps.Perms}
}
