package v1

import (
	"net/http"

	"github.com/danielgtaylor/huma/v2"
	"github.com/gin-gonic/gin"

	"api/internal/config"
	"api/internal/database"
	"api/internal/database/repository"
	"api/internal/handlers/v1/auth"
	"api/internal/handlers/v1/auth/proxy"
	"api/internal/logger"
	"api/internal/middleware"
)

func SetUpAuthRoutes(router *gin.RouterGroup, api huma.API) {
	logger.Logger.Info("Initializing auth routes")
	cfg := config.New()

	pool, err := database.GetPool(cfg.Database)
	if err != nil {
		logger.Logger.Error("Failed to get pgx pool", "error", err)
		panic(err)
	}
	repo := repository.New(pool)

	kratosPub := auth.NewKratosClient(cfg.AuthConfig.AuthURL, "public")
	kratosAdmin := auth.NewKratosClient(cfg.AuthConfig.AuthAdminURL, "admin")

	authHandler := auth.New(auth.Deps{
		Repo:        repo,
		KratosPub:   kratosPub,
		KratosAdmin: kratosAdmin,
	})
	proxyHandler := proxy.New(proxy.Deps{
		PublicURL: cfg.AuthConfig.AuthURL,
		AdminURL:  cfg.AuthConfig.AuthAdminURL,
	})
	authMiddleware := middleware.NewAuthMiddleware(cfg)

	router.Any("/proxy/*path", proxyHandler.ProxyPublic)

	adminProxyGroup := router.Group("/admin/proxy")
	adminProxyGroup.Use(authMiddleware.RequireAuthHeaders())
	adminProxyGroup.Use(authMiddleware.RequireServiceKey())
	adminProxyGroup.Any("/*path", proxyHandler.ProxyAdmin)

	sessionMW := huma.Middlewares{
		middleware.GinToHuma(authMiddleware.RequireAuthHeaders(), authMiddleware.RequireSession()),
	}
	sessionOrServiceMW := huma.Middlewares{
		middleware.GinToHuma(authMiddleware.RequireAuthHeaders(), authMiddleware.RequireSessionOrServiceKey()),
	}
	serviceMW := huma.Middlewares{
		middleware.GinToHuma(authMiddleware.RequireAuthHeaders(), authMiddleware.RequireServiceKey()),
	}
	sessionSec := []map[string][]string{{"SessionTokenAuth": {}}, {"CookieAuth": {}}}
	sessionOrServiceSec := []map[string][]string{{"SessionTokenAuth": {}}, {"CookieAuth": {}}, {"ServiceKeyAuth": {}}}
	serviceSec := []map[string][]string{{"ServiceKeyAuth": {}}}

	huma.Register(api, huma.Operation{
		OperationID: "createUser",
		Method:      http.MethodPost,
		Path:        "/api/v1/auth/users",
		Summary:     "Create a new user identity",
		Tags:        []string{"V1Auth"},
		Security:    serviceSec,
		Middlewares: serviceMW,
	}, authHandler.CreateUser)

	huma.Register(api, huma.Operation{
		OperationID: "getActiveTenant",
		Method:      http.MethodGet,
		Path:        "/api/v1/auth/active-tenant",
		Summary:     "Get the active tenant for the authenticated user",
		Tags:        []string{"V1Auth"},
		Security:    sessionOrServiceSec,
		Middlewares: sessionOrServiceMW,
	}, authHandler.GetActiveTenant)

	huma.Register(api, huma.Operation{
		OperationID: "listTenants",
		Method:      http.MethodGet,
		Path:        "/api/v1/auth/tenants",
		Summary:     "List tenants the authenticated user belongs to",
		Tags:        []string{"V1Auth"},
		Security:    sessionOrServiceSec,
		Middlewares: sessionOrServiceMW,
	}, authHandler.ListTenants)

	huma.Register(api, huma.Operation{
		OperationID: "getSession",
		Method:      http.MethodGet,
		Path:        "/api/v1/auth/session",
		Summary:     "Get current session",
		Tags:        []string{"V1Auth"},
		Security:    sessionSec,
		Middlewares: sessionMW,
	}, authHandler.GetSession)

	huma.Register(api, huma.Operation{
		OperationID: "getIdentity",
		Method:      http.MethodGet,
		Path:        "/api/v1/auth/identity",
		Summary:     "Get current identity",
		Tags:        []string{"V1Auth"},
		Security:    sessionSec,
		Middlewares: sessionMW,
	}, authHandler.GetIdentity)

	huma.Register(api, huma.Operation{
		OperationID: "logout",
		Method:      http.MethodPost,
		Path:        "/api/v1/auth/logout",
		Summary:     "Logout user",
		Tags:        []string{"V1Auth"},
		Security:    sessionSec,
		Middlewares: sessionMW,
	}, authHandler.Logout)

	huma.Register(api, huma.Operation{
		OperationID: "whoAmI",
		Method:      http.MethodGet,
		Path:        "/api/v1/auth/whoami",
		Summary:     "Get authenticated user identity",
		Tags:        []string{"V1Auth"},
		Security:    sessionSec,
		Middlewares: sessionMW,
	}, authHandler.WhoAmI)

	logger.Logger.Info("Auth routes registration completed")
}
