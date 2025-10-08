package v1

import (
	"api/internal/config"
	v1 "api/internal/handlers/v1"
	"api/internal/middleware"

	// "api/internal/middleware"

	"github.com/gin-gonic/gin"
)

func SetUpPermissionRoutes(router *gin.RouterGroup) {
	cfg := config.New()
	// authMiddleware := middleware.NewAuthMiddleware(cfg)
	permissionsHandler := v1.NewPermissionsHandler(cfg)
	authMiddleware := middleware.NewAuthMiddleware(cfg)

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
}
