package v1

import (
	"api/internal/config"
	v1 "api/internal/handlers/v1"
	"api/internal/logger"
	"api/internal/middleware"
	services_v1 "api/internal/service/v1"

	"github.com/gin-gonic/gin"
)

func SetUpStorageRoutes(router *gin.RouterGroup) {
	logger.Logger.Info("Initializing storage routes")
	cfg := config.New()

	ketoService := services_v1.NewKetoService(cfg.PermissionsConfig.ReadURL, cfg.PermissionsConfig.WriteURL)
	storageHandler := v1.NewStorageHandler(cfg, ketoService)
	authMiddleware := middleware.NewAuthMiddleware(cfg)

	// Validate auth headers first (406 if missing), then authenticate (401 if invalid)
	router.Use(authMiddleware.RequireAuthHeaders())
	router.Use(authMiddleware.RequireSessionOrServiceKey())

	router.POST("/upload", storageHandler.Upload)

	router.POST("/download", storageHandler.Download)

	router.DELETE("/object", storageHandler.DeleteObject)

	router.POST("/make-public", storageHandler.MakePublic)

}
