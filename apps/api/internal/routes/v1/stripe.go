package v1

import (
	"net/http"

	"github.com/danielgtaylor/huma/v2"
	"github.com/gin-gonic/gin"

	"api/internal/config"
	"api/internal/database"
	"api/internal/database/repository"
	stripeHandlers "api/internal/handlers/v1/stripe"
	"api/internal/logger"
	"api/internal/middleware"
	"api/internal/services"
	"api/internal/services/billing"
	"api/internal/services/stripe_client"
	"api/internal/services/stripe_config"
)

func SetUpStripeRoutes(group *gin.RouterGroup, api huma.API) {
	logger.Logger.Info("Initializing stripe routes")
	cfg := config.New()

	pool, err := database.GetPool(cfg.Database)
	if err != nil {
		logger.Logger.Error("Failed to get pgx pool", "error", err)
		panic(err)
	}
	repo := repository.New(pool)

	var encryptionSvc *services.EncryptionService
	if cfg.EncryptionMasterKey != "" {
		encryptionSvc, err = services.NewEncryptionService(cfg.EncryptionMasterKey)
		if err != nil {
			logger.Logger.Error("Failed to initialize encryption service", "error", err)
			panic(err)
		}
	}
	var managedClient *stripe_config.ManagedHostingClient
	if cfg.ManagedHostingConfig.IsManaged {
		managedClient = stripe_config.NewManagedHostingClient(&cfg.ManagedHostingConfig)
	}

	stripeClient := stripe_client.New(cfg.StripeConfig)
	stripeConfigSvc := stripe_config.New(stripe_config.Deps{
		Repo:       repo,
		Stripe:     stripeClient,
		Encryption: encryptionSvc,
		Managed:    managedClient,
	})
	billingSvc := billing.New(billing.Deps{
		Repo:   repo,
		Stripe: stripeClient,
		FeePct: cfg.StripeConfig.PlatformFeePercent,
	})

	stripeHandler := stripeHandlers.New(stripeHandlers.Deps{
		Repo:         repo,
		StripeConfig: stripeConfigSvc,
		Billing:      billingSvc,
		Stripe:       stripeClient,
	})

	authMiddleware := middleware.NewAuthMiddleware(cfg)
	serviceMW := huma.Middlewares{
		middleware.GinToHuma(authMiddleware.RequireAuthHeaders(), authMiddleware.RequireServiceKey()),
	}
	serviceSec := []map[string][]string{{"ServiceKeyAuth": {}}}

	huma.Register(api, huma.Operation{
		OperationID: "getStripeConfigSchema",
		Method:      http.MethodGet,
		Path:        "/api/v1/stripe/schema",
		Summary:     "Get Stripe config schema",
		Tags:        []string{"V1Configuration"},
	}, stripeHandler.GetSchema)

	huma.Register(api, huma.Operation{
		OperationID: "getStripeConfig",
		Method:      http.MethodGet,
		Path:        "/api/v1/stripe/config",
		Summary:     "Get public Stripe config",
		Tags:        []string{"V1Stripe"},
	}, stripeHandler.GetConfig)

	huma.Register(api, huma.Operation{
		OperationID: "getPriceByID",
		Method:      http.MethodGet,
		Path:        "/api/v1/stripe/config/prices/{price_id}",
		Summary:     "Get price by ID",
		Tags:        []string{"V1Stripe"},
	}, stripeHandler.GetPriceByID)

	huma.Register(api, huma.Operation{
		OperationID: "calculatePriceCost",
		Method:      http.MethodPost,
		Path:        "/api/v1/stripe/config/prices/{price_id}/calculate",
		Summary:     "Calculate cost for a price",
		Tags:        []string{"V1Stripe"},
	}, stripeHandler.CalculatePriceCost)

	huma.Register(api, huma.Operation{
		OperationID: "getProductByID",
		Method:      http.MethodGet,
		Path:        "/api/v1/stripe/config/products/{product_id}",
		Summary:     "Get product by ID",
		Tags:        []string{"V1Stripe"},
	}, stripeHandler.GetProductByID)

	huma.Register(api, huma.Operation{
		OperationID: "getMeterByID",
		Method:      http.MethodGet,
		Path:        "/api/v1/stripe/config/meters/{meter_id}",
		Summary:     "Get meter by ID",
		Tags:        []string{"V1Stripe"},
	}, stripeHandler.GetMeterByID)

	huma.Register(api, huma.Operation{
		OperationID: "convertStripeIDToConfigID",
		Method:      http.MethodGet,
		Path:        "/api/v1/stripe/convert/stripe-id/{stripe_id}",
		Summary:     "Convert Stripe ID to config ID",
		Tags:        []string{"V1Stripe"},
	}, stripeHandler.ConvertStripeIDToConfigID)

	huma.Register(api, huma.Operation{
		OperationID: "getStripeConfigAdmin",
		Method:      http.MethodGet,
		Path:        "/api/v1/stripe/admin/config",
		Summary:     "Get full Stripe config (admin)",
		Tags:        []string{"V1Stripe"},
		Security:    serviceSec,
		Middlewares: serviceMW,
	}, stripeHandler.GetConfigAdmin)

	huma.Register(api, huma.Operation{
		OperationID: "getStripeConfigHistory",
		Method:      http.MethodGet,
		Path:        "/api/v1/stripe/admin/config/history",
		Summary:     "Get config history",
		Tags:        []string{"V1Configuration"},
		Security:    serviceSec,
		Middlewares: serviceMW,
	}, stripeHandler.GetConfigHistory)

	huma.Register(api, huma.Operation{
		OperationID: "pullStripeConfig",
		Method:      http.MethodGet,
		Path:        "/api/v1/stripe/admin/config/pull",
		Summary:     "Pull config from Stripe",
		Tags:        []string{"V1Configuration"},
		Security:    serviceSec,
		Middlewares: serviceMW,
	}, stripeHandler.PullConfig)

	huma.Register(api, huma.Operation{
		OperationID: "updateStripeConfig",
		Method:      http.MethodPost,
		Path:        "/api/v1/stripe/admin/config",
		Summary:     "Update Stripe config",
		Tags:        []string{"V1Configuration"},
		Security:    serviceSec,
		Middlewares: serviceMW,
	}, stripeHandler.UpdateConfig)

	huma.Register(api, huma.Operation{
		OperationID: "validateStripeConfig",
		Method:      http.MethodPost,
		Path:        "/api/v1/stripe/admin/config/validate",
		Summary:     "Validate Stripe config",
		Tags:        []string{"V1Configuration"},
		Security:    serviceSec,
		Middlewares: serviceMW,
	}, stripeHandler.ValidateConfig)

	huma.Register(api, huma.Operation{
		OperationID: "archiveAllStripeConfig",
		Method:      http.MethodPost,
		Path:        "/api/v1/stripe/admin/config/archive-all",
		Summary:     "Archive all Stripe config",
		Tags:        []string{"V1Configuration"},
		Security:    serviceSec,
		Middlewares: serviceMW,
	}, stripeHandler.ArchiveAllConfig)

	huma.Register(api, huma.Operation{
		OperationID: "listWebhooks",
		Method:      http.MethodGet,
		Path:        "/api/v1/stripe/admin/webhooks",
		Summary:     "List all webhooks",
		Tags:        []string{"V1Stripe"},
		Security:    serviceSec,
		Middlewares: serviceMW,
	}, stripeHandler.ListWebhooks)

	huma.Register(api, huma.Operation{
		OperationID: "applyEnterpriseTemplate",
		Method:      http.MethodPost,
		Path:        "/api/v1/stripe/admin/enterprise/apply-template",
		Summary:     "Apply enterprise template pricing",
		Tags:        []string{"V1Stripe"},
		Security:    serviceSec,
		Middlewares: serviceMW,
	}, stripeHandler.ApplyEnterpriseTemplate)

	huma.Register(api, huma.Operation{
		OperationID: "applyEnterpriseCustom",
		Method:      http.MethodPost,
		Path:        "/api/v1/stripe/admin/enterprise/apply-custom",
		Summary:     "Apply custom enterprise pricing",
		Tags:        []string{"V1Stripe"},
		Security:    serviceSec,
		Middlewares: serviceMW,
	}, stripeHandler.ApplyEnterpriseCustom)

	huma.Register(api, huma.Operation{
		OperationID: "getEnterprisePricesByTemplate",
		Method:      http.MethodGet,
		Path:        "/api/v1/stripe/admin/enterprise/prices/by-template/{template}",
		Summary:     "Get enterprise prices by template",
		Tags:        []string{"V1Stripe"},
		Security:    serviceSec,
		Middlewares: serviceMW,
	}, stripeHandler.GetPricesByTemplate)

	huma.Register(api, huma.Operation{
		OperationID: "getEnterprisePricesByID",
		Method:      http.MethodGet,
		Path:        "/api/v1/stripe/admin/enterprise/prices/by-id/{enterprise_id}",
		Summary:     "Get enterprise prices by ID",
		Tags:        []string{"V1Stripe"},
		Security:    serviceSec,
		Middlewares: serviceMW,
	}, stripeHandler.GetPricesByEnterpriseID)

	logger.Logger.Info("Stripe routes registration completed")
}
