package server

import (
	"fmt"
	"net/http"

	"api/internal/config"
	"api/internal/database"
	"api/internal/handlers"
	"api/internal/handlers/v1/auth/proxy"
	"api/internal/logger"
	"api/internal/middleware"
	v1_routes "api/internal/routes/v1"

	"github.com/gin-contrib/pprof"
	"github.com/gin-gonic/gin"
)

func New(cfg *config.Config) *gin.Engine {
	logger.Logger.Debug("Initializing Gin router")
	r := gin.New()
	r.RedirectTrailingSlash = false
	r.RedirectFixedPath = false
	r.HandleMethodNotAllowed = true

	if cfg.EnablePprof {
		logger.Logger.Warn("pprof endpoints enabled at /debug/pprof - do not expose in production")
		pprof.Register(r)
	}

	r.Use(gin.CustomRecovery(func(c *gin.Context, err any) {
		logger.Logger.Error("Panic recovered", "error", err)
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%v", err))
	}))

	r.Use(middleware.GinLogger())

	logger.Logger.Debug("Setting up CORS middleware")
	r.Use(middleware.CORS(cfg.CORSAllowedOrigins))

	r.NoRoute(func(ctx *gin.Context) {
		handlers.NewNotFoundResponse(ctx, "Endpoint not found")
	})

	r.NoMethod(func(ctx *gin.Context) {
		ctx.JSON(http.StatusMethodNotAllowed, gin.H{
			"status": http.StatusMethodNotAllowed,
			"error":  "Method Not Allowed",
		})
	})

	r.Use(func(ctx *gin.Context) {
		ctx.Next()

		if len(ctx.Errors) > 0 && !ctx.Writer.Written() {
			err := ctx.Errors.Last()

			if err.Type == gin.ErrorTypeBind {
				handlers.NewBadRequestResponse(ctx, "Bad Request")
				return
			}

			handlers.NewInternalServerErrorResponse(ctx, err)
		}
	})

	db, err := database.GetConnection(cfg.Database)
	if err != nil {
		logger.Logger.Error("Failed to get database connection for health handler", "error", err)
		panic(err)
	}

	healthHandler := handlers.NewHealthHandler(cfg, db)
	r.GET("/health", healthHandler.HealthLive)
	r.GET("/health/ready", healthHandler.HealthReady)

	logger.Logger.Debug("Initializing v1 API routes")
	v1_group := r.Group("/api/v1")
	v1_routes.InitRoutes(v1_group)

	logger.Logger.Debug("Setting up auth proxy fallback routes")
	authProxyHandler := proxy.New(proxy.Deps{
		PublicURL: cfg.AuthConfig.AuthURL,
		AdminURL:  cfg.AuthConfig.AuthAdminURL,
	})
	r.Any("/self-service/*path", authProxyHandler.ProxyPublicWithPrefix("/self-service"))

	return r
}
