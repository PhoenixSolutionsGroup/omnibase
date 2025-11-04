package v1

import (
	"api/internal/config"
	v1 "api/internal/handlers/v1"
	"api/internal/middleware"

	"github.com/gin-gonic/gin"
)

func SetUpRoleRoutes(router *gin.RouterGroup) {
	cfg := config.New()
	rolesHandler := v1.NewRolesHandler(cfg)
	authMiddleware := middleware.NewAuthMiddleware(cfg)

	router.Use(authMiddleware.RequireSession())

	// Namespace definitions (for UI)
	router.GET("/definitions", rolesHandler.GetDefinitions)

	// Role management
	router.GET("/roles", rolesHandler.ListRoles)
	router.POST("/roles", rolesHandler.CreateRole)
	router.PUT("/roles/:role_id", rolesHandler.UpdateRole)
	router.DELETE("/roles/:role_id", rolesHandler.DeleteRole)

	// Role assignment
	router.POST("/users/:user_id/roles", rolesHandler.AssignRole)
}
