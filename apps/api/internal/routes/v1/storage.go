package v1

import (
	"api/internal/config"
	v1 "api/internal/handlers/v1"
	"api/internal/middleware"

	"github.com/gin-gonic/gin"
)

func SetUpStorageRoutes(router *gin.RouterGroup) {
	cfg := config.New()

	storageHandler := v1.NewStorageHandler(cfg)
	authMiddleware := middleware.NewAuthMiddleware(cfg)

	router.Use(authMiddleware.RequireSession())

	router.POST("/upload", storageHandler.Upload)
	router.POST("/download", storageHandler.Download)
	router.DELETE("/object", storageHandler.DeleteObject)
}
