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

	router.POST("/migrations", databaseHandler.HandleMigrations)
	router.GET("/migrations/status", databaseHandler.HandleMigrationsStatus)
	router.POST("/migrations/down", databaseHandler.HandleMigrationsDown)
	router.POST("/migrations/reset", databaseHandler.HandleMigrationsReset)
	router.GET("/typegen", databaseHandler.HandleTypegen)

	logger.Logger.Info("Database routes registration completed")
}
