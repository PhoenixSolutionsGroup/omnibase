package v1

import (
	"api/internal/config"
	v1 "api/internal/handlers/v1"
	"api/internal/logger"
	"api/internal/middleware"

	"github.com/gin-gonic/gin"
)

func SetUpRoleRoutes(router *gin.RouterGroup) {
	logger.Logger.Info("Initializing role routes")
	cfg := config.New()

	logger.Logger.Debug("Creating roles handler and auth middleware")
	rolesHandler := v1.NewRolesHandler(cfg)
	authMiddleware := middleware.NewAuthMiddleware(cfg)

	logger.Logger.Debug("Applying session authentication middleware to role routes")
	router.Use(authMiddleware.RequireSession())

	// Namespace definitions (for UI)
	logger.Logger.Info("Registering GET /definitions route for namespace definitions")
	router.GET("/definitions", rolesHandler.GetDefinitions)

	// Role management
	logger.Logger.Info("Registering GET /roles route for listing roles")
	router.GET("/roles", rolesHandler.ListRoles)

	logger.Logger.Info("Registering POST /roles route for creating roles")
	router.POST("/roles", rolesHandler.CreateRole)

	logger.Logger.Info("Registering PUT /roles/:role_id route for updating roles")
	router.PUT("/roles/:role_id", rolesHandler.UpdateRole)

	logger.Logger.Info("Registering DELETE /roles/:role_id route for deleting roles")
	router.DELETE("/roles/:role_id", rolesHandler.DeleteRole)

	// Role assignment
	logger.Logger.Info("Registering POST /users/:user_id/roles route for role assignment")
	router.POST("/users/:user_id/roles", rolesHandler.AssignRole)

	logger.Logger.Info("Role routes registration completed")
}
