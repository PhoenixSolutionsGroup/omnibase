package v1

import (
	"api/internal/config"
	v1 "api/internal/handlers/v1"
	"api/internal/middleware"

	"github.com/gin-gonic/gin"
)

func SetUpPaymentRoutes(router *gin.RouterGroup) {
	cfg := config.New()

	paymentHandler := v1.NewPaymentsHandler(cfg)
	paymentsMiddleware := middleware.NewPaymentsMiddleware(cfg)
	authMiddleware := middleware.NewAuthMiddleware(cfg)

	// Apply authentication middleware (session or service key + tenant ID)
	router.Use(authMiddleware.RequireSessionOrServiceKey())

	// Apply payment-specific middleware to set stripe_customer_id
	router.Use(
		paymentsMiddleware.GetCustomerIDFromAuthSession(),
		paymentsMiddleware.GetCustomerIDFromTenant(),
		paymentsMiddleware.GetCustomerIDFromHeader(),
	)

	router.POST("/checkout", paymentHandler.CreateCheckout)

	router.POST("/usage", paymentHandler.RecordUsage)

	router.POST("/portal", paymentHandler.CreateCustomerPortal)

}
