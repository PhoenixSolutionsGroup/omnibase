package v1

import (
	"github.com/gin-gonic/gin"

	"api/internal/config"
	"api/internal/database"
	"api/internal/database/repository"
	"api/internal/handlers/v1/auth"
	"api/internal/handlers/v1/auth/proxy"
	"api/internal/logger"
	"api/internal/middleware"
)

func SetUpAuthRoutes(router *gin.RouterGroup) {
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

	router.Use(authMiddleware.RequireAuthHeaders())

	router.POST("/users", authMiddleware.RequireServiceKey(), authHandler.CreateUser)

	router.GET("/active-tenant", authMiddleware.RequireSessionOrServiceKey(), authHandler.GetActiveTenant)
	router.GET("/tenants", authMiddleware.RequireSessionOrServiceKey(), authHandler.ListTenants)

	router.Use(authMiddleware.RequireSession())

	router.GET("/session", authHandler.GetSession)
	router.GET("/identity", authHandler.GetIdentity)
	router.GET("/whoami", authHandler.WhoAmI)
	router.POST("/logout", authHandler.Logout)

	logger.Logger.Info("Auth routes registration completed")
}
