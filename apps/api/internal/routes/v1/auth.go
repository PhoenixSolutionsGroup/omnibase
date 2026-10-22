package v1

import (
	"net/http"

	"github.com/danielgtaylor/huma/v2"
	"github.com/gin-gonic/gin"

	"api/internal/authn"
	"api/internal/database/repository"
	"api/internal/handlers/v1/auth"
	"api/internal/handlers/v1/auth/proxy"
	"api/internal/logger"
)

func SetUpAuthRoutes(router *gin.RouterGroup, api huma.API, d Deps) {
	logger.Logger.Info("Initializing auth routes")
	cfg := d.Cfg
	repo := repository.New(d.Pool)

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

	router.Any("/proxy/*path", proxyHandler.ProxyPublic)

	adminProxyGroup := router.Group("/admin/proxy")
	adminProxyGroup.Use(d.Auth.RequireAuth(authn.AuthServiceKey))
	adminProxyGroup.Any("/*path", proxyHandler.ProxyAdmin)

	register(api, d.Auth, huma.Operation{
		OperationID: "createUser",
		Method:      http.MethodPost,
		Path:        "/api/v1/auth/users",
		Summary:     "Create a new user identity",
		Tags:        []string{"V1Auth"},
	}, authn.AuthServiceKey, nil, authHandler.CreateUser)

	register(api, d.Auth, huma.Operation{
		OperationID: "getActiveTenant",
		Method:      http.MethodGet,
		Path:        "/api/v1/auth/active-tenant",
		Summary:     "Get the active tenant for the authenticated user",
		Tags:        []string{"V1Auth"},
	}, authn.AuthSessionOrServiceKey, nil, authHandler.GetActiveTenant)

	register(api, d.Auth, huma.Operation{
		OperationID: "listTenants",
		Method:      http.MethodGet,
		Path:        "/api/v1/auth/tenants",
		Summary:     "List tenants the authenticated user belongs to",
		Tags:        []string{"V1Auth"},
	}, authn.AuthSessionOrServiceKey, nil, authHandler.ListTenants)

	register(api, d.Auth, huma.Operation{
		OperationID: "getSession",
		Method:      http.MethodGet,
		Path:        "/api/v1/auth/session",
		Summary:     "Get current session",
		Tags:        []string{"V1Auth"},
	}, authn.AuthSession, nil, authHandler.GetSession)

	register(api, d.Auth, huma.Operation{
		OperationID: "getIdentity",
		Method:      http.MethodGet,
		Path:        "/api/v1/auth/identity",
		Summary:     "Get current identity",
		Tags:        []string{"V1Auth"},
	}, authn.AuthSession, nil, authHandler.GetIdentity)

	register(api, d.Auth, huma.Operation{
		OperationID: "logout",
		Method:      http.MethodPost,
		Path:        "/api/v1/auth/logout",
		Summary:     "Logout user",
		Tags:        []string{"V1Auth"},
	}, authn.AuthSession, nil, authHandler.Logout)

	register(api, d.Auth, huma.Operation{
		OperationID: "whoAmI",
		Method:      http.MethodGet,
		Path:        "/api/v1/auth/whoami",
		Summary:     "Get authenticated user identity",
		Tags:        []string{"V1Auth"},
	}, authn.AuthSession, nil, authHandler.WhoAmI)

	logger.Logger.Info("Auth routes registration completed")
}
