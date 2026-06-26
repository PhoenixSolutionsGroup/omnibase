package rbac

import (
	"api/internal/database/repository"
	"api/internal/services/permissions"
)

type Service struct {
	repo  repository.Querier
	perms *permissions.Service
}

type Deps struct {
	Repo  repository.Querier
	Perms *permissions.Service
}

func New(deps Deps) *Service {
	return &Service{repo: deps.Repo, perms: deps.Perms}
}
