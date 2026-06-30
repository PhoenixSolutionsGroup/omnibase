package v1

import (
	"github.com/gin-gonic/gin"

	"api/internal/config"
	"api/internal/database"
	"api/internal/handlers/v1/db"
	"api/internal/logger"
	"api/internal/middleware"
)

func SetUpDBRoutes(router *gin.RouterGroup) {
	logger.Logger.Info("Initializing database routes")
	cfg := config.New()

	pool, err := database.GetPool(cfg.Database)
	if err != nil {
		logger.Logger.Error("Failed to get pgx pool", "error", err)
		panic(err)
	}

	handler := db.New(db.Deps{
		Pool:         pool,
		DBConfig:     cfg.Database,
		PostgRESTURL: cfg.PostgRESTURL,
		TypegenURL:   cfg.TypegenURL,
	})

	authMiddleware := middleware.NewAuthMiddleware(cfg)
	router.Use(authMiddleware.RequireAuthHeaders())
	router.Use(authMiddleware.RequireServiceKey())

	router.POST("/migrations", handler.ApplyMigrations)
	router.GET("/migrations/status", handler.MigrationsStatus)
	router.POST("/migrations/down", handler.MigrationsDown)
	router.GET("/typegen", handler.Typegen)
}
