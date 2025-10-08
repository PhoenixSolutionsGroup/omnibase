package v1

import (
	"api/internal/config"
	v1 "api/internal/handlers/v1"
	"api/internal/middleware"

	"github.com/gin-gonic/gin"
)

func SetUpDBRoutes(router *gin.RouterGroup) {
	cfg := config.New()

	databaseHandler := v1.NewMigrationHandler(cfg)
	authMiddleware := middleware.NewAuthMiddleware(cfg)

	router.Use(authMiddleware.RequireJWT())

	router.POST("/migrations", databaseHandler.HandleMigrations)
}
