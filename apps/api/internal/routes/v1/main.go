package v1

import "github.com/gin-gonic/gin"

func InitRoutes(group *gin.RouterGroup) {
	SetUpAuthRoutes(group.Group("/auth"))
	SetUpStorageRoutes(group.Group("/storage"))
	SetUpStripeRoutes(group.Group("/stripe"))
	SetUpDBRoutes(group.Group("/database"))
	SetUpTenantRoutes(group.Group("/tenants"))
	SetUpPermissionRoutes(group.Group("/permissions"))
	SetUpPaymentRoutes(group.Group("/payments"))
	SetUpEmailRoutes(group.Group("/email"))
}
