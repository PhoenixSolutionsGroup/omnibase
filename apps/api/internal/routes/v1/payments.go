package v1

import (
	"api/internal/config"
	"api/internal/database"
	"api/internal/database/repository"
	"api/internal/handlers/v1/payments"
	"api/internal/handlers/v1/payments/invoices"
	"api/internal/logger"
	"api/internal/middleware"
	"api/internal/services/billing"
	"api/internal/services/stripe_client"

	"github.com/gin-gonic/gin"
)

func SetUpPaymentRoutes(router *gin.RouterGroup) {
	cfg := config.New()

	pool, err := database.GetPool(cfg.Database)
	if err != nil {
		logger.Logger.Error("Failed to get pgx pool", "error", err)
		panic(err)
	}
	repo := repository.New(pool)
	stripeClient := stripe_client.New(cfg.StripeConfig)
	billingSvc := billing.New(billing.Deps{
		Repo:   repo,
		Stripe: stripeClient,
		FeePct: cfg.StripeConfig.PlatformFeePercent,
	})

	paymentHandler := payments.New(payments.Deps{Billing: billingSvc})
	invoiceHandler := invoices.New(invoices.Deps{Billing: billingSvc})
	paymentsMiddleware := middleware.NewPaymentsMiddleware(cfg)
	authMiddleware := middleware.NewAuthMiddleware(cfg)

	invoicesRouter := router.Group("invoices")

	router.Use(authMiddleware.RequireSessionOrServiceKey())
	router.Use(
		paymentsMiddleware.GetCustomerIDFromAuthSession(),
		paymentsMiddleware.GetCustomerIDFromTenant(),
		paymentsMiddleware.GetCustomerIDFromHeader(),
	)

	router.POST("/checkout", paymentHandler.CreateCheckout)
	router.POST("/usage", paymentHandler.RecordUsage)
	router.POST("/portal", paymentHandler.CreateCustomerPortal)

	invoicesRouter.Use(authMiddleware.RequireServiceKey())
	invoicesRouter.Use(
		paymentsMiddleware.GetCustomerIDFromTenant(),
		paymentsMiddleware.GetCustomerIDFromHeader(),
	)

	invoicesRouter.POST("", invoiceHandler.Create)
	invoicesRouter.GET("/:invoice_id", invoiceHandler.Get)
	invoicesRouter.PATCH("/:invoice_id", invoiceHandler.Update)
	invoicesRouter.POST("/:invoice_id/items", invoiceHandler.AddLineItem)
	invoicesRouter.POST("/:invoice_id/items/price", invoiceHandler.AddLineItemByPrice)
	invoicesRouter.POST("/:invoice_id/finalize", invoiceHandler.Finalize)
}
