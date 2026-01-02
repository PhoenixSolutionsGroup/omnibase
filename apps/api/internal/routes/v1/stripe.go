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

	stripeHandler := v1.NewStripeHandler(cfg)
	authMiddleware := middleware.NewAuthMiddleware(cfg)

	router.GET("/schema", stripeHandler.GetSchema)

	router.GET("/config", stripeHandler.GetConfig)

	router.GET("/convert/stripe-id/:stripe_id", stripeHandler.ConvertStripeIDToConfigID)

	adminGroup := router.Group("/admin")
	adminGroup.Use(authMiddleware.RequireAuthHeaders())
	adminGroup.Use(authMiddleware.RequireServiceKey())

	adminGroup.GET("/config", stripeHandler.GetConfigAdmin)

	adminGroup.GET("/config/history", stripeHandler.GetConfigHistory)

	adminGroup.GET("/config/pull", stripeHandler.PullConfig)

	adminGroup.POST("/config", stripeHandler.UpdateConfig)

	adminGroup.POST("/config/validate", stripeHandler.ValidateConfig)

	adminGroup.POST("/config/archive-all", stripeHandler.ArchiveAllConfig)

	// Webhook endpoints (under /config, requires service key auth)
	configGroup := router.Group("/config")
	configGroup.Use(authMiddleware.RequireAuthHeaders())
	configGroup.Use(authMiddleware.RequireServiceKey())

	configGroup.GET("/webhook", stripeHandler.GetWebhookSecret)
	configGroup.POST("/webhooks", stripeHandler.ConfigureWebhooks)
}
