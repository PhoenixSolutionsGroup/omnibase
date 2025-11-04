package main

import (
	"api/internal/config"
	"api/internal/logger"
	"api/internal/middleware"
	v1_routes "api/internal/routes/v1"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/stripe/stripe-go/v82"
)

func main() {
	logger.Logger.Info("Starting API server")

	logger.Logger.Info("Loading configuration")
	cfg := config.New()

	logger.Logger.Info("Configuring Stripe")
	stripe.Key = cfg.StripeConfig.SecretKey
	logger.Logger.Debug("Stripe configured", "account_id", cfg.StripeConfig.StripeAccountID)

	logger.Logger.Info("Initializing Gin router")
	r := gin.Default()
	r.RedirectTrailingSlash = false
	r.RedirectFixedPath = false

	logger.Logger.Info("Setting up CORS middleware")
	r.Use(middleware.CORS())

	r.GET("/health", func(ctx *gin.Context) {
		logger.Logger.Trace("Health check endpoint called")
		ctx.JSON(http.StatusOK, gin.H{
			"status": "healthy",
		})
	})

	logger.Logger.Info("Initializing v1 API routes")
	v1_group := r.Group("/api/v1")
	v1_routes.InitRoutes(v1_group)

	logger.Logger.Info("Starting HTTP server", "port", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		logger.Logger.Error("Failed to start server", "port", cfg.Port, "error", err)
		panic(err)
	}
}
