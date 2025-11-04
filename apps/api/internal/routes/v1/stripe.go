package v1

import (
	"api/internal/config"
	v1 "api/internal/handlers/v1"
	"api/internal/logger"
	"api/internal/middleware"

	"github.com/gin-gonic/gin"
)

func SetUpStripeRoutes(router *gin.RouterGroup) {
	logger.Logger.Info("Initializing stripe routes")
	cfg := config.New()

	logger.Logger.Debug("Creating stripe handler and auth middleware")
	stripeHandler := v1.NewStripeHandler(cfg)
	authMiddleware := middleware.NewAuthMiddleware(cfg)

	logger.Logger.Info("Registering GET /schema route for stripe schema")
	router.GET("/schema", stripeHandler.GetSchema)

	logger.Logger.Info("Registering GET /config route for stripe config")
	router.GET("/config", stripeHandler.GetConfig)

	logger.Logger.Debug("Creating admin group at /admin with JWT authentication")
	adminGroup := router.Group("/admin")
	adminGroup.Use(authMiddleware.RequireJWT())

	logger.Logger.Info("Registering GET /admin/config route for admin config retrieval")
	adminGroup.GET("/config", stripeHandler.GetConfigAdmin)

	logger.Logger.Info("Registering GET /admin/config/history route for config history")
	adminGroup.GET("/config/history", stripeHandler.GetConfigHistory)

	logger.Logger.Info("Registering GET /admin/config/pull route for config pull")
	adminGroup.GET("/config/pull", stripeHandler.PullConfig)

	logger.Logger.Info("Registering POST /admin/config route for config updates")
	adminGroup.POST("/config", stripeHandler.UpdateConfig)

	logger.Logger.Info("Registering POST /admin/config/validate route for config validation")
	adminGroup.POST("/config/validate", stripeHandler.ValidateConfig)

	logger.Logger.Info("Registering POST /admin/config/archive-all route for archiving all configs")
	adminGroup.POST("/config/archive-all", stripeHandler.ArchiveAllConfig)

	logger.Logger.Info("Stripe routes registration completed")
}
