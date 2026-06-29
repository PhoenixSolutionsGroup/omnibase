package tenants

import (
	"api/internal/config"
	"api/internal/database"
	"api/internal/database/repository"
	"api/internal/logger"
)

type Handler struct {
	repo repository.Querier
}

func New(cfg *config.Config) *Handler {
	logger.Logger.Info("Initializing TenantHandler")
	pool, err := database.GetPool(cfg.Database)
	if err != nil {
		logger.Logger.Error("Failed to get pgx pool", "error", err)
		panic(err)
	}
	return &Handler{repo: repository.New(pool)}
}
