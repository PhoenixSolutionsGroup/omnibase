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
	router.GET("/config/prices/:price_id", stripeHandler.GetPriceByID)
	router.POST("/config/prices/:price_id/calculate", stripeHandler.CalculatePriceCost)
	router.GET("/config/products/:product_id", stripeHandler.GetProductByID)
	router.GET("/config/meters/:meter_id", stripeHandler.GetMeterByID)

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

	adminGroup.GET("/webhooks", stripeHandler.ListWebhooks)

	// Enterprise pricing endpoints
	enterpriseGroup := adminGroup.Group("/enterprise")
	enterpriseGroup.POST("/apply-template", stripeHandler.ApplyEnterpriseTemplate)
	enterpriseGroup.POST("/apply-custom", stripeHandler.ApplyEnterpriseCustom)
	enterpriseGroup.GET("/prices/by-template/:template", stripeHandler.GetPricesByTemplate)
	enterpriseGroup.GET("/prices/by-id/:enterprise_id", stripeHandler.GetPricesByEnterpriseID)

	// Webhook management endpoints
}
