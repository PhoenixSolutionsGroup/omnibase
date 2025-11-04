package v1

import (
	"api/internal/config"
	v1 "api/internal/handlers/v1"
	"api/internal/logger"
	"api/internal/middleware"

	"github.com/gin-gonic/gin"
)

func SetUpPaymentRoutes(router *gin.RouterGroup) {
	logger.Logger.Info("Initializing payment routes")
	cfg := config.New()

	logger.Logger.Debug("Creating payment handler and payments middleware")
	paymentHandler := v1.NewPaymentsHandler(cfg)
	paymentsMiddleware := middleware.NewPaymentsMiddleware(cfg)

	logger.Logger.Debug("Applying customer ID extraction middleware to payment routes")
	router.Use(paymentsMiddleware.GetCustomerIDFromAuthSession())

	logger.Logger.Info("Registering POST /checkout route with checkout handler")
	router.POST("/checkout", paymentHandler.CreateCheckout)

	logger.Logger.Info("Registering POST /usage route with usage recording handler")
	router.POST("/usage", paymentHandler.RecordUsage)

	logger.Logger.Info("Registering POST /portal route with customer portal handler")
	router.POST("/portal", paymentHandler.CreateCustomerPortal)

	logger.Logger.Info("Payment routes registration completed")
}
