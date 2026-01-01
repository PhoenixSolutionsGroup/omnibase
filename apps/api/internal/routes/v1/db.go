package v1

import (
	"api/internal/config"
	v1 "api/internal/handlers/v1"
	"api/internal/logger"
	"api/internal/middleware"

	"github.com/gin-gonic/gin"
)

func SetUpDBRoutes(router *gin.RouterGroup) {
	logger.Logger.Info("Initializing database routes")
	cfg := config.New()

	logger.Logger.Debug("Creating migration handler and auth middleware")
	databaseHandler := v1.NewMigrationHandler(cfg)
	authMiddleware := middleware.NewAuthMiddleware(cfg)

	logger.Logger.Debug("Applying authentication middleware to database routes")
	router.Use(authMiddleware.RequireAuthHeaders())
	router.Use(authMiddleware.RequireServiceKey())

	logger.Logger.Info("Registering POST /migrations route with migration handler")
	router.POST("/migrations", databaseHandler.HandleMigrations)

	logger.Logger.Info("Registering POST /migrations/reset route for database reset")
	router.POST("/migrations/reset", databaseHandler.HandleMigrationsReset)

	logger.Logger.Info("Database routes registration completed")
}
