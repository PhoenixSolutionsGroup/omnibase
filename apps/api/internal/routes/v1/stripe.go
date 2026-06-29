package v1

import (
	"api/internal/config"
	"api/internal/database"
	"api/internal/database/repository"
	v1 "api/internal/handlers/v1"
	stripeHandlers "api/internal/handlers/v1/stripe"
	"api/internal/logger"
	"api/internal/middleware"
	"api/internal/services"
	"api/internal/services/billing"
	"api/internal/services/stripe_client"
	"api/internal/services/stripe_config"

	"github.com/gin-gonic/gin"
)

func SetUpStripeRoutes(router *gin.RouterGroup) {
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
	legacyStripeHandler := v1.NewStripeHandler(cfg)
	authMiddleware := middleware.NewAuthMiddleware(cfg)

	router.GET("/schema", stripeHandler.GetSchema)

	router.GET("/config", stripeHandler.GetConfig)
	router.GET("/config/prices/:price_id", stripeHandler.GetPriceByID)
	router.POST("/config/prices/:price_id/calculate", legacyStripeHandler.CalculatePriceCost)
	router.GET("/config/products/:product_id", stripeHandler.GetProductByID)
	router.GET("/config/meters/:meter_id", stripeHandler.GetMeterByID)

	router.GET("/convert/stripe-id/:stripe_id", stripeHandler.ConvertStripeIDToConfigID)

	adminGroup := router.Group("/admin")
	adminGroup.Use(authMiddleware.RequireAuthHeaders())
	adminGroup.Use(authMiddleware.RequireServiceKey())

	adminGroup.GET("/config", stripeHandler.GetConfigAdmin)
	adminGroup.GET("/config/history", legacyStripeHandler.GetConfigHistory)
	adminGroup.GET("/config/pull", legacyStripeHandler.PullConfig)
	adminGroup.POST("/config", stripeHandler.UpdateConfig)
	adminGroup.POST("/config/validate", stripeHandler.ValidateConfig)
	adminGroup.POST("/config/archive-all", legacyStripeHandler.ArchiveAllConfig)
	adminGroup.GET("/webhooks", stripeHandler.ListWebhooks)

	enterpriseGroup := adminGroup.Group("/enterprise")
	enterpriseGroup.POST("/apply-template", stripeHandler.ApplyEnterpriseTemplate)
	enterpriseGroup.POST("/apply-custom", stripeHandler.ApplyEnterpriseCustom)
	enterpriseGroup.GET("/prices/by-template/:template", stripeHandler.GetPricesByTemplate)
	enterpriseGroup.GET("/prices/by-id/:enterprise_id", stripeHandler.GetPricesByEnterpriseID)
}
