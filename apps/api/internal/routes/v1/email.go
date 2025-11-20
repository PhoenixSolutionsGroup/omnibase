package v1

import (
	"api/internal/config"
	v1 "api/internal/handlers/v1"
	"api/internal/logger"
	"api/internal/middleware"

	"github.com/gin-gonic/gin"
)

func SetUpEmailRoutes(group *gin.RouterGroup) {
	logger.Logger.Info("Initializing email routes")
	cfg := config.New()
	handler := v1.NewEmailHandler(cfg)
	authMiddleware := middleware.NewAuthMiddleware(cfg)

	// Authenticated routes for template management
	logger.Logger.Debug("Applying session authentication middleware to email template management routes")

	// Create authenticated group with middleware
	authGroup := group.Group("")
	authGroup.Use(authMiddleware.RequireAuthHeaders())
	authGroup.Use(authMiddleware.RequireSession())

	authGroup.POST("/templates", handler.CreateOrUpdateTemplate)
	authGroup.GET("/templates", handler.GetTemplates)
	authGroup.DELETE("/templates/:type", handler.DeleteTemplate)

	// Public Kratos template serving route (must be after other routes to avoid conflicts)
	logger.Logger.Debug("Registering public template serving route for Kratos")
	group.GET("/templates/:template_name/:type", handler.ServeTemplate)
}
