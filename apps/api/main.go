package main

import (
	"api/internal/config"
	"api/internal/database"
	"api/internal/handlers"
	v1 "api/internal/handlers/v1"
	"api/internal/logger"
	"api/internal/middleware"
	v1_routes "api/internal/routes/v1"
	"fmt"
	"net/http"
	_ "net/http/pprof"

	"github.com/gin-contrib/pprof"
	"github.com/gin-gonic/gin"
	"github.com/stripe/stripe-go/v82"
)

func main() {
	logger.Logger.Info("Starting API server")

	logger.Logger.Info("Loading configuration")
	cfg := config.New()

	logger.Logger.Info("Configuring Stripe")
	stripe.Key = cfg.StripeConfig.SecretKey
	if cfg.StripeConfig.APIBaseURL != "" {
		mockBackend := stripe.GetBackendWithConfig(stripe.APIBackend, &stripe.BackendConfig{
			URL: stripe.String(cfg.StripeConfig.APIBaseURL),
		})
		stripe.SetBackend(stripe.APIBackend, mockBackend)
		logger.Logger.Info("Using custom Stripe API URL", "url", cfg.StripeConfig.APIBaseURL)
	}
	logger.Logger.Debug("Stripe configured", "account_id", cfg.StripeConfig.StripeAccountID)

	logger.Logger.Info("Initializing Gin router")
	r := gin.New()
	r.RedirectTrailingSlash = false
	r.RedirectFixedPath = false
	r.HandleMethodNotAllowed = true

	if cfg.EnablePprof {
		logger.Logger.Warn("pprof endpoints enabled at /debug/pprof - do not expose in production")
		pprof.Register(r)
	}

	// Add custom recovery middleware that returns JSON instead of plain text
	r.Use(gin.CustomRecovery(func(c *gin.Context, err any) {
		logger.Logger.Error("Panic recovered", "error", err)
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%v", err))
	}))

	// Add Gin's logger middleware
	r.Use(middleware.GinLogger())

	logger.Logger.Info("Setting up CORS middleware")
	r.Use(middleware.CORS(cfg.CORSAllowedOrigins))

	// Custom handler for 404 Not Found
	r.NoRoute(func(ctx *gin.Context) {
		handlers.NewNotFoundResponse(ctx, "Endpoint not found")
	})

	// Custom handler for 405 Method Not Allowed
	r.NoMethod(func(ctx *gin.Context) {
		ctx.JSON(http.StatusMethodNotAllowed, gin.H{
			"status": http.StatusMethodNotAllowed,
			"error":  "Method Not Allowed",
		})
	})

	// Global error handler for Gin binding/parsing errors
	r.Use(func(ctx *gin.Context) {
		ctx.Next()

		// If there are errors and no response was sent yet
		if len(ctx.Errors) > 0 && !ctx.Writer.Written() {
			err := ctx.Errors.Last()

			// Check if it's a binding error (400 Bad Request from Gin)
			if err.Type == gin.ErrorTypeBind {
				handlers.NewBadRequestResponse(ctx, "Bad Request")
				return
			}

			handlers.NewInternalServerErrorResponse(ctx, err)
		}
	})

	// Initialize database connection for health checks
	db, err := database.GetConnection(cfg.Database)
	if err != nil {
		logger.Logger.Error("Failed to get database connection for health handler", "error", err)
		panic(err)
	}

	healthHandler := handlers.NewHealthHandler(cfg, db)
	r.GET("/health", healthHandler.HealthLive)
	r.GET("/health/ready", healthHandler.HealthReady)

	logger.Logger.Info("Initializing v1 API routes")
	v1_group := r.Group("/api/v1")
	v1_routes.InitRoutes(v1_group)

	logger.Logger.Info("Setting up auth proxy fallback routes")
	authProxyHandler := v1.NewAuthProxyHandler(cfg)
	r.Any("/self-service/*path", authProxyHandler.ProxyPublicWithPrefix("/self-service"))

	logger.Logger.Info("Starting HTTP server", "port", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		logger.Logger.Error("Failed to start server", "port", cfg.Port, "error", err)
		panic(err)
	}
}
