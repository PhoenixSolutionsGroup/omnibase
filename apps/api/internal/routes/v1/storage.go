package v1

import (
	"api/internal/config"
	v1 "api/internal/handlers/v1"
	"api/internal/logger"
	"api/internal/middleware"

	"github.com/gin-gonic/gin"
)

func SetUpStorageRoutes(router *gin.RouterGroup) {
	logger.Logger.Info("Initializing storage routes")
	cfg := config.New()

	logger.Logger.Debug("Creating storage handler and auth middleware")
	storageHandler := v1.NewStorageHandler(cfg)
	authMiddleware := middleware.NewAuthMiddleware(cfg)

	logger.Logger.Debug("Applying session authentication middleware to storage routes")
	router.Use(authMiddleware.RequireSession())

	logger.Logger.Info("Registering POST /upload route with upload handler")
	router.POST("/upload", storageHandler.Upload)

	logger.Logger.Info("Registering POST /download route with download handler")
	router.POST("/download", storageHandler.Download)

	logger.Logger.Info("Registering DELETE /object route with delete handler")
	router.DELETE("/object", storageHandler.DeleteObject)

	logger.Logger.Info("Storage routes registration completed")
}
