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

	// Service-key only routes (lookup endpoints for service-to-service calls)
	serviceKeyOnly := router.Group("")
	serviceKeyOnly.Use(authMiddleware.RequireServiceKey())
	serviceKeyOnly.GET("/by-id/:tenant_id", tenantHandler.GetTenantByID)
	serviceKeyOnly.GET("/by-stripe-customer/:stripe_customer_id", tenantHandler.GetTenantByStripeCustomerID)

	// Routes that accept session OR service key auth
	authenticated := router.Group("")
	authenticated.Use(authMiddleware.RequireAuthHeaders())
	authenticated.Use(authMiddleware.RequireSessionOrServiceKey())

	authenticated.GET("/jwt", tenantHandler.GetPostgRESTJWTToken)

	authenticated.GET("/users", tenantHandler.GetTenantUsers)

	authenticated.GET("/subscriptions", tenantHandler.ListTenantSubscriptions)

	authenticated.GET("/subscriptions/:config_price_id", tenantHandler.GetTenantSubscription)

	authenticated.DELETE("/subscriptions", tenantHandler.RemoveSubscription)

	authenticated.POST("/subscriptions", tenantHandler.AddSubscription)

	authenticated.GET("/billing-status", tenantHandler.GetBillingStatus)

	authenticated.POST("", tenantHandler.CreateTenant)

	authenticated.POST("/invites", tenantHandler.CreateTenantUserInvite)

	authenticated.PUT("/users", tenantHandler.UpdateTenantUserRole)

	authenticated.PUT("/invites/accept", tenantHandler.AcceptInvite)

	authenticated.PUT("/switch-active", tenantHandler.UpdateUsersActiveTenant)

	authenticated.DELETE("", tenantHandler.DeleteTenant)

	authenticated.DELETE("/users", tenantHandler.DeleteTenantUser)

	authenticated.GET("/roles", rolesHandler.ListRoles)

	authenticated.GET("/roles/definitions", rolesHandler.GetDefinitions)

	authenticated.POST("/roles", rolesHandler.CreateRole)

	authenticated.PUT("/roles/:role_id", rolesHandler.UpdateRole)

	authenticated.DELETE("/roles/:role_id", rolesHandler.DeleteRole)
}
