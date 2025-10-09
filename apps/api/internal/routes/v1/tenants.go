package v1

import (
	"api/internal/config"
	v1 "api/internal/handlers/v1"
	"api/internal/middleware"

	"github.com/gin-gonic/gin"
)

func SetUpTenantRoutes(router *gin.RouterGroup) {
	cfg := config.New()
	tenantHandler := v1.NewTenantHandler(cfg)

	authMiddleware := middleware.NewAuthMiddleware(cfg)

	router.Use(authMiddleware.RequireSession())

	router.GET("/jwt", tenantHandler.GetPostgRESTJWTToken)

	router.POST("", tenantHandler.CreateTenant)
	router.POST("/invites", tenantHandler.CreateTenantUserInvite)

	router.PUT("/invites/accept", tenantHandler.AcceptInvite)
	router.PUT("/switch-active", tenantHandler.UpdateUsersActiveTenant)

	router.DELETE("/users", tenantHandler.DeleteTenantUser)
	router.DELETE("/:id", tenantHandler.DeleteTenant)
}
