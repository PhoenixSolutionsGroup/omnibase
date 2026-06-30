package v1

import (
	"net/http"

	"github.com/danielgtaylor/huma/v2"
	"github.com/gin-gonic/gin"

	"api/internal/database/repository"
	"api/internal/handlers/v1/payments"
	"api/internal/handlers/v1/payments/invoices"
	"api/internal/logger"
	"api/internal/middleware"
	"api/internal/services/billing"
	"api/internal/services/stripe_client"
)

func SetUpPaymentRoutes(router *gin.RouterGroup, api huma.API, d Deps) {
	logger.Logger.Info("Initializing payment routes")
	cfg := d.Cfg
	repo := repository.New(d.Pool)
	stripeClient := stripe_client.New(cfg.StripeConfig)
	billingSvc := billing.New(billing.Deps{
		Repo:   repo,
		Stripe: stripeClient,
		FeePct: cfg.StripeConfig.PlatformFeePercent,
	})

	paymentHandler := payments.New(payments.Deps{Billing: billingSvc})
	invoiceHandler := invoices.New(invoices.Deps{Billing: billingSvc})
	paymentsMiddleware := middleware.NewPaymentsMiddleware(cfg, d.DB)
	authMiddleware := middleware.NewAuthMiddleware(cfg, d.DB)

	sessionOrServiceMW := huma.Middlewares{
		middleware.GinToHuma(
			authMiddleware.RequireAuthHeaders(),
			authMiddleware.RequireSessionOrServiceKey(),
			paymentsMiddleware.GetCustomerIDFromAuthSession(),
			paymentsMiddleware.GetCustomerIDFromTenant(),
			paymentsMiddleware.GetCustomerIDFromHeader(),
		),
	}
	serviceMW := huma.Middlewares{
		middleware.GinToHuma(
			authMiddleware.RequireAuthHeaders(),
			authMiddleware.RequireServiceKey(),
			paymentsMiddleware.GetCustomerIDFromTenant(),
			paymentsMiddleware.GetCustomerIDFromHeader(),
		),
	}
	sessionOrServiceSec := []map[string][]string{
		{"SessionTokenAuth": {}},
		{"CookieAuth": {}},
		{"ServiceKeyAuth": {}},
	}
	serviceSec := []map[string][]string{{"ServiceKeyAuth": {}}}

	huma.Register(api, huma.Operation{
		OperationID: "createCheckout",
		Method:      http.MethodPost,
		Path:        "/api/v1/payments/checkout",
		Summary:     "Create a Stripe checkout session",
		Tags:        []string{"V1Payments"},
		Security:    sessionOrServiceSec,
		Middlewares: sessionOrServiceMW,
	}, paymentHandler.CreateCheckout)

	huma.Register(api, huma.Operation{
		OperationID: "recordUsage",
		Method:      http.MethodPost,
		Path:        "/api/v1/payments/usage",
		Summary:     "Record a Stripe meter usage event",
		Tags:        []string{"V1Payments"},
		Security:    sessionOrServiceSec,
		Middlewares: sessionOrServiceMW,
	}, paymentHandler.RecordUsage)

	huma.Register(api, huma.Operation{
		OperationID: "createCustomerPortal",
		Method:      http.MethodPost,
		Path:        "/api/v1/payments/portal",
		Summary:     "Create a Stripe customer portal session",
		Tags:        []string{"V1Payments"},
		Security:    sessionOrServiceSec,
		Middlewares: sessionOrServiceMW,
	}, paymentHandler.CreateCustomerPortal)

	huma.Register(api, huma.Operation{
		OperationID: "createInvoice",
		Method:      http.MethodPost,
		Path:        "/api/v1/payments/invoices",
		Summary:     "Create a Stripe invoice",
		Tags:        []string{"V1Payments"},
		Security:    serviceSec,
		Middlewares: serviceMW,
	}, invoiceHandler.Create)

	huma.Register(api, huma.Operation{
		OperationID: "getInvoice",
		Method:      http.MethodGet,
		Path:        "/api/v1/payments/invoices/{invoice_id}",
		Summary:     "Get a Stripe invoice",
		Tags:        []string{"V1Payments"},
		Security:    serviceSec,
		Middlewares: serviceMW,
	}, invoiceHandler.Get)

	huma.Register(api, huma.Operation{
		OperationID: "updateInvoice",
		Method:      http.MethodPatch,
		Path:        "/api/v1/payments/invoices/{invoice_id}",
		Summary:     "Update a Stripe invoice",
		Tags:        []string{"V1Payments"},
		Security:    serviceSec,
		Middlewares: serviceMW,
	}, invoiceHandler.Update)

	huma.Register(api, huma.Operation{
		OperationID: "addInvoiceLineItem",
		Method:      http.MethodPost,
		Path:        "/api/v1/payments/invoices/{invoice_id}/items",
		Summary:     "Add a line item to a Stripe invoice",
		Tags:        []string{"V1Payments"},
		Security:    serviceSec,
		Middlewares: serviceMW,
	}, invoiceHandler.AddLineItem)

	huma.Register(api, huma.Operation{
		OperationID: "addInvoiceLineItemWithPriceId",
		Method:      http.MethodPost,
		Path:        "/api/v1/payments/invoices/{invoice_id}/items/price",
		Summary:     "Add a line item to a Stripe invoice using a price ID",
		Tags:        []string{"V1Payments"},
		Security:    serviceSec,
		Middlewares: serviceMW,
	}, invoiceHandler.AddLineItemByPrice)

	huma.Register(api, huma.Operation{
		OperationID: "finalizeInvoice",
		Method:      http.MethodPost,
		Path:        "/api/v1/payments/invoices/{invoice_id}/finalize",
		Summary:     "Finalize a Stripe invoice",
		Tags:        []string{"V1Payments"},
		Security:    serviceSec,
		Middlewares: serviceMW,
	}, invoiceHandler.Finalize)

	logger.Logger.Info("Payment routes registration completed")
}
