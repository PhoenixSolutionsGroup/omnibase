package server

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"runtime/debug"

	"api/internal/config"
	"api/internal/database"
	"api/internal/handlers"
	"api/internal/handlers/v1/auth/proxy"
	"api/internal/logger"
	"api/internal/middleware"
	v1_routes "api/internal/routes/v1"
	"api/internal/services/sessioncache"
	storagesvc "api/internal/services/storage"
	storage_credentials "api/internal/services/storage/credentials"
	namespaces "api/permissions"

	"github.com/danielgtaylor/huma/v2"
	"github.com/danielgtaylor/huma/v2/adapters/humagin"
	"github.com/gin-contrib/pprof"
	"github.com/gin-gonic/gin"
)

func New(cfg *config.Config) *gin.Engine {
	requirements, err := namespaces.Load()
	if err != nil {
		logger.Logger.Error("Failed to load permission namespace requirements", "error", err)
		panic(err)
	}
	logger.Logger.Info("Loaded permission namespace requirements", "files", len(requirements.Files), "namespaces", len(requirements.Namespaces))

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
		logger.Logger.Error("Panic recovered", "error", err, "stack", string(debug.Stack()), "path", c.Request.URL.Path)
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

	pool, err := database.GetPool(cfg.Database)
	if err != nil {
		logger.Logger.Error("Failed to get pgx pool", "error", err)
		panic(err)
	}

	credentialsSvc, err := storage_credentials.New(cfg)
	if err != nil {
		logger.Logger.Error("Failed to initialize storage credentials", "error", err)
		panic(err)
	}

	s3Clients, err := storagesvc.NewClients(context.Background(), cfg, credentialsSvc)
	if err != nil {
		logger.Logger.Error("Failed to initialize S3 clients", "error", err)
		panic(err)
	}

	healthHandler := handlers.NewHealthHandler(cfg, db, s3Clients.Internal)
	r.GET("/health", healthHandler.HealthLive)
	r.GET("/health/ready", healthHandler.HealthReady)

	sessionCache := sessioncache.New(sessioncache.Deps{
		TTL:        cfg.SessionCacheConfig.TTL,
		MaxEntries: cfg.SessionCacheConfig.MaxEntries,
	})

	BuildAPI(r, v1_routes.Deps{
		Cfg:         cfg,
		Pool:        pool,
		DB:          db,
		Auth:        middleware.NewAuthMiddleware(cfg, db, sessionCache),
		S3:          s3Clients.Internal,
		S3Public:    s3Clients.Public,
		Credentials: credentialsSvc,
	})

	logger.Logger.Debug("Setting up auth proxy fallback routes")
	authProxyHandler := proxy.New(proxy.Deps{
		PublicURL: cfg.AuthConfig.AuthURL,
		AdminURL:  cfg.AuthConfig.AuthAdminURL,
	})
	r.Any("/self-service/*path", authProxyHandler.ProxyPublicWithPrefix("/self-service"))

	return r
}

func BuildAPI(r *gin.Engine, d v1_routes.Deps) huma.API {
	logger.Logger.Debug("Initializing huma API")
	apiVersion := os.Getenv("API_VERSION")
	if apiVersion == "" {
		apiVersion = "local"
	}
	humaCfg := huma.DefaultConfig("Omnibase REST API", apiVersion)
	humaCfg.CreateHooks = nil
	humaCfg.Info.Description = "Self-hostable Backend-as-a-Service providing database management, authentication, payments, storage, and email services."
	humaCfg.Info.Contact = &huma.Contact{Name: "Omnibase Support", URL: "https://omnibase.dev/support", Email: "support@omnibase.dev"}
	humaCfg.Info.License = &huma.License{Name: "MIT", URL: "https://opensource.org/licenses/MIT"}
	humaCfg.Info.TermsOfService = "https://omnibase.dev/terms"
	humaCfg.Servers = []*huma.Server{{URL: "https://api.omnibase.tech", Description: "Production server"}}
	humaCfg.Components.SecuritySchemes = map[string]*huma.SecurityScheme{
		"SessionTokenAuth": {Type: "apiKey", In: "header", Name: "X-Session-Token", Description: "OmniBase session token. Also accepted via the omnibase_session_token cookie."},
		"ServiceKeyAuth":   {Type: "apiKey", In: "header", Name: "X-Service-Key", Description: "Admin service-to-service key. Trusted for all routes and skips permission checks."},
		"AppKeyAuth":       {Type: "apiKey", In: "header", Name: "X-App-Key", Description: "Customer app backend key. Requires X-User-Id and X-Tenant-Id and is authorized as that user."},
		"CookieAuth":       {Type: "apiKey", In: "cookie", Name: "omnibase_session_token", Description: "OmniBase session token cookie set after login."},
	}
	huma.NewErrorWithContext = func(ctx huma.Context, status int, msg string, errs ...error) huma.StatusError {
		if status >= http.StatusInternalServerError {
			path := ""
			if ctx != nil {
				u := ctx.URL()
				path = u.Path
			}
			logger.Logger.Error("Internal server error", "status", status, "path", path, "message", msg, "errs", errs)
		}
		return huma.NewError(status, msg, errs...)
	}
	api := humagin.New(r, humaCfg)

	logger.Logger.Debug("Initializing v1 API routes")
	v1_routes.InitRoutes(r.Group("/api/v1"), api, d)

	relaxAdditionalPropertiesRequired(api)

	return api
}

func relaxAdditionalPropertiesRequired(api huma.API) {
	schemas := api.OpenAPI().Components.Schemas.Map()
	for _, s := range schemas {
		if len(s.Required) == 0 {
			continue
		}
		filtered := s.Required[:0]
		for _, name := range s.Required {
			if name == "AdditionalProperties" {
				continue
			}
			filtered = append(filtered, name)
		}
		s.Required = filtered
	}
}
