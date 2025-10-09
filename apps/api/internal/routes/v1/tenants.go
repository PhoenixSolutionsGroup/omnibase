package v1

import (
	"api/internal/config"
	v1 "api/internal/handlers/v1"
	"api/internal/middleware"
	"fmt"

	"github.com/gin-gonic/gin"
)

func SetUpTenantRoutes(router *gin.RouterGroup) {
	cfg := config.New()
	tenantHandler := v1.NewTenantHandler(cfg)

	authMiddleware := middleware.NewAuthMiddleware(cfg)

	router.Use(func(ctx *gin.Context) {
		fmt.Printf("%s\n\n", ctx.Request.URL)
		ctx.Next()
	})
	router.Use(authMiddleware.RequireSession())

	router.POST("", tenantHandler.CreateTenant)
	router.POST("/invites", tenantHandler.CreateTenantUserInvite)
	router.PUT("/invites/accept", tenantHandler.AcceptInvite)
	router.PUT("/switch-active", tenantHandler.UpdateUsersActiveTenant)
	router.DELETE("/:id", tenantHandler.DeleteTenant)
}
