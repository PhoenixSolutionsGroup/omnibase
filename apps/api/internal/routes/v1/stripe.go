package v1

import (
	"api/internal/config"
	v1 "api/internal/handlers/v1"
	"api/internal/middleware"

	"github.com/gin-gonic/gin"
)

func SetUpStripeRoutes(router *gin.RouterGroup) {
	cfg := config.New()

	stripeHandler := v1.NewStripeHandler(cfg)
	authMiddleware := middleware.NewAuthMiddleware(cfg)

	router.GET("/schema", stripeHandler.GetSchema)

	router.GET("/config", stripeHandler.GetConfig)

	adminGroup := router.Group("/admin")
	adminGroup.Use(authMiddleware.RequireJWT())

	adminGroup.GET("/config", stripeHandler.GetConfigAdmin)
	adminGroup.GET("/config/history", stripeHandler.GetConfigHistory)
	adminGroup.GET("/config/pull", stripeHandler.PullConfig)

	adminGroup.POST("/config", stripeHandler.UpdateConfig)
	adminGroup.POST("/config/validate", stripeHandler.ValidateConfig)
	adminGroup.POST("/config/archive-all", stripeHandler.ArchiveAllConfig)
}
