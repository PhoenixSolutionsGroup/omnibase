package stripe_config

import (
	"api/internal/config"
	"api/internal/database"
	"api/internal/logger"
	"api/internal/models"
	"api/internal/service/v1/stripe_config/handlers"
	"api/internal/services"
	"context"

	"github.com/google/uuid"
	"github.com/stripe/stripe-go/v82"
	"gorm.io/gorm"
)

type StripeConfigService struct {
	db                *gorm.DB
	validator         *Validator
	differ            *Differ
	idMapper          *IDMapper
	configHandler     *handlers.ConfigHandler
	webhookHandler    *handlers.WebhookHandler
	accountID         string
	encryptionService *services.EncryptionService
	managedClient     *ManagedHostingClient
	isManaged         bool
}

func NewStripeConfigService(cfg *config.Config) *StripeConfigService {
	logger.Logger.Info("Initializing Stripe configuration service",
		"accountID", cfg.StripeConfig.StripeAccountID,
		"isManaged", cfg.ManagedHostingConfig.IsManaged)

	db, err := database.GetConnection(cfg.Database)
	if err != nil {
		logger.Logger.Error("Failed to get database connection", "error", err)
		panic(err)
	}

	// Initialize Stripe client properly for v82
	stripe.Key = cfg.StripeConfig.SecretKey // Set global Stripe key
	stripeClient := &stripe.Client{}        // Empty client, we'll use global methods
	logger.Logger.Debug("Stripe client initialized")

	// Initialize encryption service if master key is provided
	var encryptionService *services.EncryptionService
	if cfg.EncryptionMasterKey != "" {
		encryptionService, err = services.NewEncryptionService(cfg.EncryptionMasterKey)
		if err != nil {
			logger.Logger.Error("Failed to initialize encryption service", "error", err)
			panic(err)
		}
		logger.Logger.Debug("Encryption service initialized")
	} else {
		logger.Logger.Warn("Encryption master key not set, webhook secrets will be stored unencrypted")
	}

	// Initialize managed hosting client if in managed mode
	var managedClient *ManagedHostingClient
	if cfg.ManagedHostingConfig.IsManaged {
		managedClient = NewManagedHostingClient(&cfg.ManagedHostingConfig)
		logger.Logger.Debug("Managed hosting client initialized", "apiURL", cfg.ManagedHostingConfig.ManagedHostingAPIURL)
	}

	// Initialize components
	validator := NewValidator()
	differ := NewDiffer()
	idMapper := NewIDMapper(db)
	productHandler := handlers.NewProductHandler(idMapper, cfg.StripeConfig.StripeAccountID)
	priceHandler := handlers.NewPriceHandler(idMapper, cfg.StripeConfig.StripeAccountID)
	meterHandler := handlers.NewMeterHandler(stripeClient, idMapper, cfg.StripeConfig.StripeAccountID)
	couponHandler := handlers.NewCouponHandler(idMapper, cfg.StripeConfig.StripeAccountID)
	promoHandler := handlers.NewPromoHandler(idMapper, cfg.StripeConfig.StripeAccountID)

	webhookHandler := handlers.NewWebhookHandler(stripeClient, db, cfg.StripeConfig.StripeAccountID, encryptionService)

	configHandler := handlers.NewConfigHandler(
		db,
		validator,
		differ,
		productHandler,
		priceHandler,
		meterHandler,
		webhookHandler,
		couponHandler,
		promoHandler,
	)

	logger.Logger.Info("Stripe configuration service initialized successfully")
	return &StripeConfigService{
		db:                db,
		validator:         validator,
		differ:            differ,
		idMapper:          idMapper,
		configHandler:     configHandler,
		webhookHandler:    webhookHandler,
		accountID:         cfg.StripeConfig.StripeAccountID,
		encryptionService: encryptionService,
		managedClient:     managedClient,
		isManaged:         cfg.ManagedHostingConfig.IsManaged,
	}
}

// Public API methods that delegate to the appropriate components

func (s *StripeConfigService) ParseAndValidateConfig(configData models.StripeConfigData) (*models.StripeConfiguration, error) {
	logger.Logger.Info("Parsing and validating Stripe configuration")
	result, err := s.validator.ParseAndValidateConfig(configData)
	if err != nil {
		logger.Logger.Error("Configuration validation failed", "error", err)
	} else {
		logger.Logger.Info("Configuration validated successfully")
	}
	return result, err
}

func (s *StripeConfigService) ProcessConfigUpdate(configData models.StripeConfigData) (*models.StripeConfigResponse, error) {
	logger.Logger.Info("Processing Stripe configuration update")
	result, err := s.configHandler.ProcessConfigUpdate(configData)
	if err != nil {
		logger.Logger.Error("Configuration update failed", "error", err)
	} else {
		logger.Logger.Info("Configuration update completed successfully")
	}
	return result, err
}

func (s *StripeConfigService) GetStripeIDByConfigItemID(configItemID string, itemType string) (string, error) {
	return s.idMapper.GetStripeIDByConfigItemID(configItemID, itemType)
}

func (s *StripeConfigService) UpdateIDMapping(configItemID string, newStripeID string, itemType string) error {
	return s.idMapper.UpdateIDMapping(configItemID, newStripeID, itemType)
}

// Additional utility methods if needed by external packages
func (s *StripeConfigService) GetDatabase() *gorm.DB {
	return s.db
}

// Webhook-related methods

// ProcessWebhooksConfig processes multiple webhook configurations
func (s *StripeConfigService) ProcessWebhooksConfig(webhooks []models.WebhookEndpointConfig) ([]handlers.WebhookResult, error) {
	logger.Logger.Info("Processing webhooks configuration",
		"webhookCount", len(webhooks),
		"isManaged", s.isManaged)

	ctx := context.Background()

	// Get the latest config ID to link the webhooks
	var latestConfig models.StripeConfig
	var configID uuid.UUID
	err := s.db.Order("created_at DESC").First(&latestConfig).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			logger.Logger.Warn("No config found, creating webhooks without config link")
			configID = uuid.Nil
		} else {
			return nil, err
		}
	} else {
		configID = latestConfig.ID
	}

	// If in managed mode, forward each webhook to managed hosting API
	if s.isManaged && s.managedClient != nil {
		return s.processWebhooksManaged(ctx, configID, webhooks)
	}

	// Self-hosted mode: create webhooks directly on Stripe
	return s.webhookHandler.ProcessWebhooks(ctx, configID, webhooks)
}

// processWebhookManaged forwards a single webhook to the managed hosting API
func (s *StripeConfigService) processWebhookManaged(ctx context.Context, configID uuid.UUID, webhookID string, url string, events []string, connect bool) (*handlers.WebhookResult, error) {
	logger.Logger.Debug("Forwarding webhook to managed hosting", "url", url, "connect", connect)

	req := RegisterWebhookRequest{
		ConfigID:  configID.String(),
		WebhookID: webhookID,
		URL:       url,
		Events:    events,
		Connect:   connect,
	}

	resp, err := s.managedClient.RegisterWebhook(ctx, req)
	if err != nil {
		return nil, err
	}

	// Encrypt the secret before storing locally
	encryptedSecret := resp.Secret
	if s.encryptionService != nil {
		encrypted, err := s.encryptionService.Encrypt(resp.Secret)
		if err != nil {
			logger.Logger.Error("Failed to encrypt webhook secret", "error", err)
			return nil, err
		}
		encryptedSecret = encrypted
	}

	// Store in local database for consistency
	// Use the managed-hosting registration UUID as the StripeID (unique identifier)
	webhook := models.StripeWebhook{
		StripeID: resp.ID,
		URL:      url,
		Secret:   encryptedSecret,
		Events:   events,
		Connect:  connect,
		ConfigID: &configID,
	}

	if err := s.db.Save(&webhook).Error; err != nil {
		logger.Logger.Error("Failed to save managed webhook to local database", "error", err)
		return nil, err
	}

	return &handlers.WebhookResult{
		ID:       webhook.ID.String(),
		StripeID: resp.ID,
		URL:      url,
		Events:   events,
		Connect:  connect,
		Secret:   resp.Secret, // Return unencrypted secret to caller
		Action:   resp.Action,
	}, nil
}

// processWebhooksManaged forwards multiple webhooks to the managed hosting API
func (s *StripeConfigService) processWebhooksManaged(ctx context.Context, configID uuid.UUID, webhooks []models.WebhookEndpointConfig) ([]handlers.WebhookResult, error) {
	var results []handlers.WebhookResult

	for _, webhookConfig := range webhooks {
		result, err := s.processWebhookManaged(ctx, configID, webhookConfig.ID, webhookConfig.URL, webhookConfig.Events, webhookConfig.Connect)
		if err != nil {
			return nil, err
		}
		results = append(results, *result)
	}

	return results, nil
}

// ListWebhooks retrieves all webhooks with decrypted secrets
func (s *StripeConfigService) ListWebhooks() ([]models.StripeWebhook, error) {
	ctx := context.Background()
	return s.webhookHandler.ListAllWebhooks(ctx)
}

// GetWebhooksForConfig retrieves all webhooks for a given config
func (s *StripeConfigService) GetWebhooksForConfig(configID uuid.UUID) ([]models.StripeWebhook, error) {
	ctx := context.Background()
	return s.webhookHandler.GetWebhooksForConfig(ctx, configID)
}
