package v1

import (
	"api/internal/config"
	v1 "api/internal/handlers/v1"
	tenants "api/internal/handlers/v1/tenants"
	"api/internal/logger"
	"api/internal/middleware"

	"github.com/gin-gonic/gin"
)

func SetUpTenantRoutes(router *gin.RouterGroup) {
	logger.Logger.Info("Initializing tenant routes")
	cfg := config.New()

	tenantHandler := v1.NewTenantHandler(cfg)
	rolesHandler := tenants.NewRolesHandler(cfg)
	authMiddleware := middleware.NewAuthMiddleware(cfg)

	// Validate auth headers first (406 if missing), then authenticate (401 if invalid)
	router.Use(authMiddleware.RequireAuthHeaders())
	router.Use(authMiddleware.RequireSessionOrServiceKey())

	router.GET("/jwt", tenantHandler.GetPostgRESTJWTToken)

	router.GET("/users", tenantHandler.GetTenantUsers)

	router.GET("/subscriptions", tenantHandler.ListTenantSubscriptions)

	router.GET("/subscriptions/:config_price_id", tenantHandler.GetTenantSubscription)

	router.DELETE("/subscriptions", tenantHandler.RemoveSubscription)

	router.POST("/subscriptions", tenantHandler.AddSubscription)

	router.GET("/billing-status", tenantHandler.GetBillingStatus)

	router.POST("", tenantHandler.CreateTenant)

	router.POST("/invites", tenantHandler.CreateTenantUserInvite)

	router.PUT("/users", tenantHandler.UpdateTenantUserRole)

	router.PUT("/invites/accept", tenantHandler.AcceptInvite)

	router.PUT("/switch-active", tenantHandler.UpdateUsersActiveTenant)

	router.DELETE("", tenantHandler.DeleteTenant)

	router.DELETE("/users", tenantHandler.DeleteTenantUser)

	router.GET("/roles", rolesHandler.ListRoles)

	router.GET("/roles/definitions", rolesHandler.GetDefinitions)

	router.POST("/roles", rolesHandler.CreateRole)

	router.PUT("/roles/:role_id", rolesHandler.UpdateRole)

	router.DELETE("/roles/:role_id", rolesHandler.DeleteRole)

	router.GET("/by-id/:tenant_id", tenantHandler.GetTenantByID)

	router.GET("/by-stripe-customer/:stripe_customer_id", tenantHandler.GetTenantByStripeCustomerID)
}
