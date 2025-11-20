package v1

import (
	"api/internal/config"
	v1 "api/internal/handlers/v1"
	"api/internal/logger"
	"api/internal/middleware"

	"github.com/gin-gonic/gin"
)

func SetUpPermissionRoutes(router *gin.RouterGroup) {
	logger.Logger.Info("Initializing permission routes")
	cfg := config.New()

	permissionsHandler := v1.NewPermissionsHandler(cfg)
	authMiddleware := middleware.NewAuthMiddleware(cfg)

	namespacesHandler, err := v1.NewKetoNamespacesHandler(cfg)
	if err != nil {
		logger.Logger.Error("Failed to initialize Keto namespaces handler", "error", err)
		panic(err)
	}

	logger.Logger.Info("Registering POST /check and /relationships routes with session or service key auth")

	// Create group for endpoints that support both session and service key auth
	sessionOrServiceGroup := router.Group("")
	sessionOrServiceGroup.Use(authMiddleware.RequireAuthHeaders())
	sessionOrServiceGroup.Use(authMiddleware.RequireSessionOrServiceKey())

	sessionOrServiceGroup.POST("/check", permissionsHandler.CheckPermission)
	sessionOrServiceGroup.POST("/relationships", permissionsHandler.CreateRelationship)

	// Namespace deployment endpoint - only register if handler initialized successfully
	logger.Logger.Info("Registering POST /deploy route for namespace deployment (with service key auth)")
	router.POST("/namespaces", authMiddleware.RequireAuthHeaders(), authMiddleware.RequireServiceKey(), namespacesHandler.DeployNamespaces)

	logger.Logger.Info("Permission routes registration completed")
}
