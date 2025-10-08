package stripe_config

import (
	"api/internal/config"
	"api/internal/database"
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
	db, err := database.NewConnection(cfg.Database)
	if err != nil {
		panic(err)
	}

	// Initialize Stripe client properly for v82
	stripe.Key = cfg.StripeConfig.SecretKey // Set global Stripe key
	stripeClient := &stripe.Client{}        // Empty client, we'll use global methods

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
	return s.validator.ParseAndValidateConfig(configData)
}

func (s *StripeConfigService) ProcessConfigUpdate(configData models.StripeConfigData) (*models.StripeConfigResponse, error) {
	return s.configHandler.ProcessConfigUpdate(configData)
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
