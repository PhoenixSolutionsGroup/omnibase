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

	storageHandler := v1.NewStorageHandler(cfg)
	authMiddleware := middleware.NewAuthMiddleware(cfg)

	postgrestMiddleware := middleware.NewPostgrestMiddleware()

	// Validate auth headers first (406 if missing), then authenticate (401 if invalid)
	router.Use(authMiddleware.RequireAuthHeaders())
	router.Use(authMiddleware.RequireSession())
	router.Use(postgrestMiddleware.PostgRESTJWT())

	router.POST("/upload", storageHandler.Upload)

	router.POST("/download", storageHandler.Download)

	router.DELETE("/object", storageHandler.DeleteObject)

}
