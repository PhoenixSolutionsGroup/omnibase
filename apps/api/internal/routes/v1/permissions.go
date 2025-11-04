package v1

import (
	"api/internal/config"
	v1 "api/internal/handlers/v1"
	"api/internal/middleware"
	"log"

	"github.com/gin-gonic/gin"
)

func SetUpPermissionRoutes(router *gin.RouterGroup) {
	cfg := config.New()
	permissionsHandler := v1.NewPermissionsHandler(cfg)
	authMiddleware := middleware.NewAuthMiddleware(cfg)

	// Initialize namespace deployment handler
	namespacesHandler, err := v1.NewKetoNamespacesHandler(cfg)
	if err != nil {
		log.Printf("Warning: Failed to initialize Keto namespaces handler: %v", err)
	}

	// Read API routes - forward all requests to Keto read API
	// Examples:
	// GET /api/v1/permissions/read/relation-tuples -> http://keto:4466/relation-tuples
	// POST /api/v1/permissions/read/check -> http://keto:4466/check
	router.Any("/read/*path", permissionsHandler.ProxyRead)

	// Write API routes - forward all requests to Keto write API
	// Examples:
	// PUT /api/v1/permissions/write/relation-tuples -> http://keto:4467/relation-tuples
	// DELETE /api/v1/permissions/write/relation-tuples -> http://keto:4467/relation-tuples
	router.Any("/write/*path", authMiddleware.RequireSession(), permissionsHandler.ProxyWrite)

	// Namespace deployment endpoint - only register if handler initialized successfully
	router.POST("/deploy", authMiddleware.RequireJWT(), namespacesHandler.DeployNamespaces)

	// Role management routes
	SetUpRoleRoutes(router.Group(""))
}
