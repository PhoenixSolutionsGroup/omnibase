package stripe_config

import (
	"api/internal/config"
	"api/internal/database"
	"api/internal/logger"
	"api/internal/models"
	"api/internal/service/v1/stripe_config/handlers"

	"github.com/stripe/stripe-go/v82"
	"gorm.io/gorm"
)

type StripeConfigService struct {
	db            *gorm.DB
	validator     *Validator
	differ        *Differ
	idMapper      *IDMapper
	configHandler *handlers.ConfigHandler
	accountID     string
}

func NewStripeConfigService(cfg *config.Config) *StripeConfigService {
	logger.Logger.Info("Initializing Stripe configuration service", "accountID", cfg.StripeConfig.StripeAccountID)

	db, err := database.GetConnection(cfg.Database)
	if err != nil {
		logger.Logger.Error("Failed to get database connection", "error", err)
		panic(err)
	}

	// Initialize Stripe client properly for v82
	stripe.Key = cfg.StripeConfig.SecretKey // Set global Stripe key
	stripeClient := &stripe.Client{}        // Empty client, we'll use global methods
	logger.Logger.Debug("Stripe client initialized")

	// Initialize components
	validator := NewValidator()
	differ := NewDiffer()
	idMapper := NewIDMapper(db)
	productHandler := handlers.NewProductHandler(idMapper, cfg.StripeConfig.StripeAccountID)
	priceHandler := handlers.NewPriceHandler(idMapper, cfg.StripeConfig.StripeAccountID)
	meterHandler := handlers.NewMeterHandler(stripeClient, idMapper, cfg.StripeConfig.StripeAccountID)

	configHandler := handlers.NewConfigHandler(
		db,
		validator,
		differ,
		productHandler,
		priceHandler,
		meterHandler,
	)

	logger.Logger.Info("Stripe configuration service initialized successfully")
	return &StripeConfigService{
		db:            db,
		validator:     validator,
		differ:        differ,
		idMapper:      idMapper,
		configHandler: configHandler,
		accountID:     cfg.StripeConfig.StripeAccountID,
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
