package v1

import (
	"net/http"

	"github.com/danielgtaylor/huma/v2"
	"github.com/gin-gonic/gin"

	"api/internal/authn"
	"api/internal/database/repository"
	stripeHandlers "api/internal/handlers/v1/stripe"
	stripeProxyHandlers "api/internal/handlers/v1/stripeproxy"
	"api/internal/logger"
	"api/internal/services"
	"api/internal/services/billing"
	"api/internal/services/stripe_client"
	"api/internal/services/stripe_config"
	"api/internal/services/stripe_proxy"
)

func SetUpStripeRoutes(group *gin.RouterGroup, root *gin.RouterGroup, api huma.API, d Deps) {
	logger.Logger.Info("Initializing stripe routes")
	cfg := d.Cfg
	repo := repository.New(d.Pool)

	var encryptionSvc *services.EncryptionService
	if cfg.EncryptionMasterKey != "" {
		svc, err := services.NewEncryptionService(cfg.EncryptionMasterKey)
		if err != nil {
			logger.Logger.Error("Failed to initialize encryption service", "error", err)
			panic(err)
		}
		encryptionSvc = svc
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
	})

	stripeHandler := stripeHandlers.New(stripeHandlers.Deps{
		Repo:         repo,
		StripeConfig: stripeConfigSvc,
		Stripe:       stripeClient,
	})

	if d.Auth != nil {
		proxyService := stripe_proxy.New(stripe_proxy.Deps{
			Config:        cfg,
			Repo:          repo,
			ConfigService: stripeConfigSvc,
			Tenants:       stripe_proxy.NewTenantStore(d.DB),
			Billing:       billingSvc,
		})
		proxyHandler := stripeProxyHandlers.New(proxyService)
		root.Any("/stripe/*path", d.Auth.RequireAuth(authn.AuthServiceKey), proxyHandler.Proxy)
	}

	register(api, d.Auth, huma.Operation{
		OperationID: "getStripeConfigSchema",
		Errors:      []int{500},
		Method:      http.MethodGet,
		Path:        "/api/v1/stripe/schema",
		Summary:     "Get Stripe config schema",
		Tags:        []string{"V1Configuration"},
	}, authn.AuthNone, nil, stripeHandler.GetSchema)

	register(api, d.Auth, huma.Operation{
		OperationID: "getStripeConfig",
		Errors:      []int{500},
		Method:      http.MethodGet,
		Path:        "/api/v1/stripe/config",
		Summary:     "Get public Stripe config",
		Tags:        []string{"V1Stripe"},
	}, authn.AuthNone, nil, stripeHandler.GetConfig)

	register(api, d.Auth, huma.Operation{
		OperationID: "getPriceByID",
		Errors:      []int{400, 404},
		Method:      http.MethodGet,
		Path:        "/api/v1/stripe/config/prices/{price_id}",
		Summary:     "Get price by ID",
		Tags:        []string{"V1Stripe"},
	}, authn.AuthNone, nil, stripeHandler.GetPriceByID)

	register(api, d.Auth, huma.Operation{
		OperationID: "calculatePriceCost",
		Errors:      []int{400, 404},
		Method:      http.MethodPost,
		Path:        "/api/v1/stripe/config/prices/{price_id}/calculate",
		Summary:     "Calculate cost for a price",
		Tags:        []string{"V1Stripe"},
	}, authn.AuthNone, nil, stripeHandler.CalculatePriceCost)

	register(api, d.Auth, huma.Operation{
		OperationID: "getProductByID",
		Errors:      []int{400, 404},
		Method:      http.MethodGet,
		Path:        "/api/v1/stripe/config/products/{product_id}",
		Summary:     "Get product by ID",
		Tags:        []string{"V1Stripe"},
	}, authn.AuthNone, nil, stripeHandler.GetProductByID)

	register(api, d.Auth, huma.Operation{
		OperationID: "getMeterByID",
		Errors:      []int{400, 404},
		Method:      http.MethodGet,
		Path:        "/api/v1/stripe/config/meters/{meter_id}",
		Summary:     "Get meter by ID",
		Tags:        []string{"V1Stripe"},
	}, authn.AuthNone, nil, stripeHandler.GetMeterByID)

	register(api, d.Auth, huma.Operation{
		OperationID: "getStripeConfigAdmin",
		Errors:      []int{400, 401},
		Method:      http.MethodGet,
		Path:        "/api/v1/stripe/admin/config",
		Summary:     "Get full Stripe config (admin)",
		Tags:        []string{"V1Stripe"},
	}, authn.AuthServiceKey, nil, stripeHandler.GetConfigAdmin)

	register(api, d.Auth, huma.Operation{
		OperationID: "getStripeConfigHistory",
		Errors:      []int{400, 401},
		Method:      http.MethodGet,
		Path:        "/api/v1/stripe/admin/config/history",
		Summary:     "Get config history",
		Tags:        []string{"V1Configuration"},
	}, authn.AuthServiceKey, nil, stripeHandler.GetConfigHistory)

	register(api, d.Auth, huma.Operation{
		OperationID: "pullStripeConfig",
		Errors:      []int{400, 401},
		Method:      http.MethodGet,
		Path:        "/api/v1/stripe/admin/config/pull",
		Summary:     "Pull config from Stripe",
		Tags:        []string{"V1Configuration"},
	}, authn.AuthServiceKey, nil, stripeHandler.PullConfig)

	register(api, d.Auth, huma.Operation{
		OperationID: "updateStripeConfig",
		Errors:      []int{400, 401},
		Method:      http.MethodPost,
		Path:        "/api/v1/stripe/admin/config",
		Summary:     "Update Stripe config",
		Tags:        []string{"V1Configuration"},
	}, authn.AuthServiceKey, nil, stripeHandler.UpdateConfig)

	register(api, d.Auth, huma.Operation{
		OperationID: "validateStripeConfig",
		Errors:      []int{400, 401},
		Method:      http.MethodPost,
		Path:        "/api/v1/stripe/admin/config/validate",
		Summary:     "Validate Stripe config",
		Tags:        []string{"V1Configuration"},
	}, authn.AuthServiceKey, nil, stripeHandler.ValidateConfig)

	register(api, d.Auth, huma.Operation{
		OperationID: "getStripeConfigStatus",
		Errors:      []int{400, 401},
		Method:      http.MethodPost,
		Path:        "/api/v1/stripe/admin/config/status",
		Summary:     "Get Stripe config status",
		Tags:        []string{"V1Configuration"},
	}, authn.AuthServiceKey, nil, stripeHandler.GetConfigStatus)

	register(api, d.Auth, huma.Operation{
		OperationID: "archiveAllStripeConfig",
		Errors:      []int{400, 401},
		Method:      http.MethodPost,
		Path:        "/api/v1/stripe/admin/config/archive-all",
		Summary:     "Archive all Stripe config",
		Tags:        []string{"V1Configuration"},
	}, authn.AuthServiceKey, nil, stripeHandler.ArchiveAllConfig)

	register(api, d.Auth, huma.Operation{
		OperationID: "listWebhooks",
		Errors:      []int{400, 401},
		Method:      http.MethodGet,
		Path:        "/api/v1/stripe/admin/webhooks",
		Summary:     "List all webhooks",
		Tags:        []string{"V1Stripe"},
	}, authn.AuthServiceKey, nil, stripeHandler.ListWebhooks)

	logger.Logger.Info("Stripe routes registration completed")
}
