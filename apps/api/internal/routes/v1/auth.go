package v1

import (
	"api/internal/config"
	v1 "api/internal/handlers/v1"
	"api/internal/logger"
	"api/internal/middleware"

	"github.com/gin-gonic/gin"
)

func SetUpAuthRoutes(router *gin.RouterGroup) {
	logger.Logger.Info("Initializing auth routes")
	cfg := config.New()

	authHandler := v1.NewAuthHandler(cfg)
	authMiddleware := middleware.NewAuthMiddleware(cfg)

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
