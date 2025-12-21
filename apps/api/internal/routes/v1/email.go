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
	group.Use(authMiddleware.RequireAuthHeaders())
	group.Use(authMiddleware.RequireSessionOrServiceKey())

	group.POST("/templates", handler.CreateOrUpdateTemplate)
	group.GET("/templates", handler.GetTemplates)
	group.DELETE("/templates/:type", handler.DeleteTemplate)

	group.POST("/send", handler.SendEmail)

	// Public Kratos template serving route (must be after other routes to avoid conflicts)
	logger.Logger.Debug("Registering public template serving route for Kratos")
	group.GET("/templates/:template_name/:type", handler.ServeTemplate)
}
