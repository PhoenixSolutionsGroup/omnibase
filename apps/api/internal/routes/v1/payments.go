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

	router.Use(paymentsMiddleware.GetCustomerIDFromAuthSession())

	router.POST("/checkout", paymentHandler.CreateCheckout)
	router.POST("/usage", paymentHandler.RecordUsage)
	router.POST("/portal", paymentHandler.CreateCustomerPortal)
}
