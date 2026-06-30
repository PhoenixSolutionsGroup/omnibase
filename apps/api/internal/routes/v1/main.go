package v1

import (
	"api/internal/logger"

	"github.com/danielgtaylor/huma/v2"
	"github.com/gin-gonic/gin"
)

func InitRoutes(group *gin.RouterGroup, api huma.API) {
	logger.Logger.Info("Initializing v1 API routes")

	logger.Logger.Debug("Setting up auth routes at /auth")
	SetUpAuthRoutes(group.Group("/auth"), api)

	logger.Logger.Debug("Setting up storage routes at /storage")
	SetUpStorageRoutes(group.Group("/storage"), api)

	logger.Logger.Debug("Setting up stripe routes at /stripe")
	SetUpStripeRoutes(group.Group("/stripe"), api)

	logger.Logger.Debug("Setting up database routes at /database")
	SetUpDBRoutes(group.Group("/database"), api)

	logger.Logger.Debug("Setting up tenant routes at /tenants")
	SetUpTenantRoutes(group.Group("/tenants"))

	logger.Logger.Debug("Setting up permission routes at /permissions")
	SetUpPermissionRoutes(group.Group("/permissions"), api)

	logger.Logger.Debug("Setting up payment routes at /payments")
	SetUpPaymentRoutes(group.Group("/payments"), api)

	logger.Logger.Debug("Setting up email routes at /email")
	SetUpEmailRoutes(group.Group("/email"), api)

	logger.Logger.Info("All v1 API routes initialized successfully")
}
