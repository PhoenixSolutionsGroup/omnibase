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

	logger.Logger.Debug("Creating permissions handler and auth middleware")
	permissionsHandler := v1.NewPermissionsHandler(cfg)
	authMiddleware := middleware.NewAuthMiddleware(cfg)

	// Initialize namespace deployment handler
	logger.Logger.Debug("Initializing Keto namespaces handler")
	namespacesHandler, err := v1.NewKetoNamespacesHandler(cfg)
	if err != nil {
		logger.Logger.Error("Failed to initialize Keto namespaces handler", "error", err)
	} else {
		logger.Logger.Debug("Keto namespaces handler initialized successfully")
	}

	// Read API routes - forward all requests to Keto read API
	// Examples:
	// GET /api/v1/permissions/read/relation-tuples -> http://keto:4466/relation-tuples
	// POST /api/v1/permissions/read/check -> http://keto:4466/check
	logger.Logger.Info("Registering ANY /read/*path route for Keto read API proxy")
	router.Any("/read/*path", permissionsHandler.ProxyRead)

	// Write API routes - forward all requests to Keto write API
	// Examples:
	// PUT /api/v1/permissions/write/relation-tuples -> http://keto:4467/relation-tuples
	// DELETE /api/v1/permissions/write/relation-tuples -> http://keto:4467/relation-tuples
	logger.Logger.Info("Registering ANY /write/*path route for Keto write API proxy (with session auth)")
	router.Any("/write/*path", authMiddleware.RequireSession(), permissionsHandler.ProxyWrite)

	// Namespace deployment endpoint - only register if handler initialized successfully
	logger.Logger.Info("Registering POST /deploy route for namespace deployment (with JWT auth)")
	router.POST("/deploy", authMiddleware.RequireJWT(), namespacesHandler.DeployNamespaces)

	// Role management routes
	logger.Logger.Debug("Setting up role management routes")
	SetUpRoleRoutes(router.Group(""))

	logger.Logger.Info("Permission routes registration completed")
}
