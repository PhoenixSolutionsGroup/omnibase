package v1

import (
	"api/internal/config"
	v1 "api/internal/handlers/v1"
	"api/internal/logger"
	"api/internal/middleware"

	"github.com/gin-gonic/gin"
)

func SetUpTenantRoutes(router *gin.RouterGroup) {
	logger.Logger.Info("Initializing tenant routes")
	cfg := config.New()

	logger.Logger.Debug("Creating tenant handler and auth middleware")
	tenantHandler := v1.NewTenantHandler(cfg)
	authMiddleware := middleware.NewAuthMiddleware(cfg)

	logger.Logger.Debug("Applying session authentication middleware to tenant routes")
	router.Use(authMiddleware.RequireSession())

	logger.Logger.Info("Registering GET /jwt route for PostgREST JWT token")
	router.GET("/jwt", tenantHandler.GetPostgRESTJWTToken)

	logger.Logger.Info("Registering GET /users route for tenant users")
	router.GET("/users", tenantHandler.GetTenantUsers)

	logger.Logger.Info("Registering GET /subscriptions route for tenant subscriptions")
	router.GET("/subscriptions", tenantHandler.GetTenantSubscriptions)

	logger.Logger.Info("Registering GET /billing-status route for billing status")
	router.GET("/billing-status", tenantHandler.GetBillingStatus)

	logger.Logger.Info("Registering POST / route for tenant creation")
	router.POST("", tenantHandler.CreateTenant)

	logger.Logger.Info("Registering POST /invites route for tenant user invites")
	router.POST("/invites", tenantHandler.CreateTenantUserInvite)

	logger.Logger.Info("Registering PUT /users route for updating tenant user roles")
	router.PUT("/users", tenantHandler.UpdateTenantUserRole)

	logger.Logger.Info("Registering PUT /invites/accept route for accepting invites")
	router.PUT("/invites/accept", tenantHandler.AcceptInvite)

	logger.Logger.Info("Registering PUT /switch-active route for switching active tenant")
	router.PUT("/switch-active", tenantHandler.UpdateUsersActiveTenant)

	logger.Logger.Info("Registering DELETE / route for tenant deletion")
	router.DELETE("", tenantHandler.DeleteTenant)

	logger.Logger.Info("Registering DELETE /users route for deleting tenant users")
	router.DELETE("/users", tenantHandler.DeleteTenantUser)

	logger.Logger.Info("Tenant routes registration completed")
}
