package main

// @title           Omnibase REST API
// @version         0.9.15
// @description     Self-hostable Backend-as-a-Service providing database management, authentication, payments, storage, and email services.
// @description
// @description     ## Features
// @description     - **Database**: PostgreSQL with RLS and migrations
// @description     - **Authentication**: Ory Kratos integration with session management
// @description     - **Payments**: Stripe integration with version-controlled billing configs
// @description     - **Storage**: S3-compatible object storage with RLS
// @description     - **Email**: Transactional email service
// @description     - **Permissions**: Fine-grained access control via Ory Keto
// @description
// @description     ## Authentication
// @description     Most endpoints require authentication via session cookies or JWT tokens.
// @description     Use the appropriate security scheme based on the endpoint requirements.

// @termsOfService  https://omnibase.dev/terms

// @contact.name   Omnibase Support
// @contact.url    https://omnibase.dev/support
// @contact.email  support@omnibase.dev

// @license.name  MIT
// @license.url   https://opensource.org/licenses/MIT

// @host      api.omnibase.tech

// @securityDefinitions.apikey CookieAuth
// @in header
// @name Cookie
// @description Session cookie authentication. Cookie name: `ory_kratos_session`. Automatically set by browser after Kratos login.

// @securityDefinitions.apikey SessionTokenAuth
// @in header
// @name X-Session-Token
// @description Kratos session JWT token. Alternative to cookie authentication for non-browser clients. Obtain from Kratos after login.

// @securityDefinitions.apikey ServiceKeyAuth
// @in header
// @name X-Service-Key
// @description Service-to-service authentication key for backend operations. When used with tenant endpoints, must include X-Tenant-ID header.

// @externalDocs.description  OpenAPI Specification
// @externalDocs.url          https://swagger.io/specification/

import (
	"api/internal/config"
	"api/internal/handlers"
	"api/internal/logger"
	"api/internal/middleware"
	v1_routes "api/internal/routes/v1"
	"fmt"
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
	r := gin.New()
	r.RedirectTrailingSlash = false
	r.RedirectFixedPath = false
	r.HandleMethodNotAllowed = true

	// Add custom recovery middleware that returns JSON instead of plain text
	r.Use(gin.CustomRecovery(func(c *gin.Context, err any) {
		logger.Logger.Error("Panic recovered", "error", err)
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%v", err))
	}))

	// Add Gin's logger middleware
	r.Use(gin.Logger())

	logger.Logger.Info("Setting up CORS middleware")
	r.Use(middleware.CORS())

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
