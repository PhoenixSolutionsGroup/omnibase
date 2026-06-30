package tenants

import (
	"api/internal/database/repository"
)

type Handler struct {
	repo repository.Querier
}

func New(repo repository.Querier) *Handler {
	return &Handler{repo: repo}
}
