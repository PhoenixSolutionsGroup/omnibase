package handlers

import (
	"api/internal/models"
	"context"
	"fmt"
	"reflect"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ConfigHandler struct {
	db             *gorm.DB
	validator      ValidatorInterface
	differ         DifferInterface
	productHandler ProductHandlerInterface
	priceHandler   PriceHandlerInterface
	meterHandler   MeterHandlerInterface
}

type ValidatorInterface interface {
	ParseAndValidateConfig(configData models.StripeConfigData) (*models.StripeConfiguration, error)
}

type DifferInterface interface {
	CalculateConfigDiff(oldConfig, newConfig *models.StripeConfiguration) *models.ConfigDiff
}

type ProductHandlerInterface interface {
	CreateProduct(productConfig models.Product, configID uuid.UUID) (*models.ProductChange, error)
	UpdateProduct(update models.ProductUpdate, configID uuid.UUID) (*models.ProductChange, error)
	ArchiveProduct(productID string) (*models.ProductChange, error)
}

type PriceHandlerInterface interface {
	CreatePricesForProduct(productConfig models.Product, stripeProductID string, configID uuid.UUID) ([]string, error)
	CreatePrice(priceConfig models.Price, productID string, configID uuid.UUID) (string, error)
	ArchivePrice(priceConfigID string) error
}

type MeterHandlerInterface interface {
	CreateMeter(ctx context.Context, configID uuid.UUID, meterConfig models.Meter) (string, error)
	DeactivateMeter(ctx context.Context, stripeID string) (*models.MeterChange, error)
	ValidateMetersExist(ctx context.Context, config models.StripeConfiguration) error
}

func NewConfigHandler(
	db *gorm.DB,
	validator ValidatorInterface,
	differ DifferInterface,
	productHandler ProductHandlerInterface,
	priceHandler PriceHandlerInterface,
	meterHandler MeterHandlerInterface,
) *ConfigHandler {
	return &ConfigHandler{
		db:             db,
		validator:      validator,
		differ:         differ,
		productHandler: productHandler,
		priceHandler:   priceHandler,
		meterHandler:   meterHandler,
	}
}

func (h *ConfigHandler) ProcessConfigUpdate(configData models.StripeConfigData) (*models.StripeConfigResponse, error) {
	fmt.Printf("🔥 METER DEBUG: ProcessConfigUpdate started\n")

	// Parse and validate the incoming configuration
	config, err := h.validator.ParseAndValidateConfig(configData)
	if err != nil {
		fmt.Printf("🔥 METER DEBUG: Config validation failed: %v\n", err)
		return &models.StripeConfigResponse{
			Message: "Configuration validation failed",
			Errors:  []string{err.Error()},
		}, nil
	}

	fmt.Printf("�� METER DEBUG: Config parsed successfully, found %d meters\n", len(config.Meters))
	for i, meter := range config.Meters {
		fmt.Printf("🔥 METER DEBUG: Meter %d: ID=%s, DisplayName=%s\n", i, meter.ID, meter.DisplayName)
	}

	var latestConfig models.StripeConfig

	err = h.db.Order("created_at DESC").First(&latestConfig).Error
	if err != nil && err != gorm.ErrRecordNotFound {
		return nil, fmt.Errorf("Failed to fetch latest config: %s", err)
	}

	// If no previous config exists, this is a fresh setup
	if err == gorm.ErrRecordNotFound {
		return h.handleFirstTimeSetup(config, configData)
	}

	// Parse the previous configuration for comparison
	previousConfig, err := h.validator.ParseAndValidateConfig(latestConfig.Config)
	if err != nil {
		return nil, fmt.Errorf("failed to parse previous config: %w", err)
	}

	// Validate that all meter references in prices exist
	if h.meterHandler != nil {
		err := h.meterHandler.ValidateMetersExist(context.Background(), *config)
		if err != nil {
			return &models.StripeConfigResponse{
				Message: "Configuration validation failed",
				Errors:  []string{err.Error()},
			}, nil
		}
	}

	// Check if configurations are identical
	if reflect.DeepEqual(config, previousConfig) {
		return &models.StripeConfigResponse{
			Message: "no change was made",
			Config:  config,
		}, nil
	}

	// Calculate differences between configurations
	diff := h.differ.CalculateConfigDiff(previousConfig, config)

	// Save the new configuration to database first to get the config ID
	newStripeConfig := &models.StripeConfig{
		Config:  configData,
		Version: config.Version,
	}

	if err := h.db.Create(newStripeConfig).Error; err != nil {
		return nil, fmt.Errorf("failed to save new config: %w", err)
	}

	// Apply changes to Stripe with the new config ID for proper ID mapping
	changes, err := h.applyChangesToStripeWithMapping(diff, config, newStripeConfig.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to apply changes to Stripe: %w", err)
	}

	return &models.StripeConfigResponse{
		Message: "Configuration updated successfully",
		Changes: changes,
		Config:  config,
	}, nil
}

func (h *ConfigHandler) handleFirstTimeSetup(config *models.StripeConfiguration, configData models.StripeConfigData) (*models.StripeConfigResponse, error) {
	changes := &models.StripeConfigChanges{
		Created: []models.ProductChange{},
	}

	// Initialize meter changes if we have meters
	if len(config.Meters) > 0 {
		changes.Meters = &models.MeterChanges{
			Created: []models.MeterChange{},
		}
	}

	// Validate that all meter references in prices exist
	if h.meterHandler != nil {
		err := h.meterHandler.ValidateMetersExist(context.Background(), *config)
		if err != nil {
			return &models.StripeConfigResponse{
				Message: "Configuration validation failed",
				Errors:  []string{err.Error()},
			}, nil
		}
	}

	// Save the configuration to database first to get the config ID
	newStripeConfig := &models.StripeConfig{
		Config:  configData,
		Version: config.Version,
	}

	err := h.db.Create(newStripeConfig).Error
	if err != nil {
		return nil, fmt.Errorf("Failed to save stripe config: %s", err)
	}

	// Create all meters in Stripe with ID mapping first (meters must exist before prices that reference them)
	if len(config.Meters) > 0 {
		meterChanges, err := h.createMetersWithMapping(config.Meters, newStripeConfig.ID)
		if err != nil {
			return nil, fmt.Errorf("failed to create meters: %w", err)
		}
		if changes.Meters != nil {
			changes.Meters.Created = meterChanges
		}
	}

	// Create all products in Stripe with ID mapping
	for _, product := range config.Products {
		productChange, err := h.createStripeProductWithMapping(product, newStripeConfig.ID)
		if err != nil {
			return nil, fmt.Errorf("failed to create product %s: %w", product.ID, err)
		}
		changes.Created = append(changes.Created, *productChange)
	}

	return &models.StripeConfigResponse{
		Message: "Initial Stripe configuration created successfully",
		Changes: changes,
		Config:  config,
	}, nil
}

func (h *ConfigHandler) createStripeProductWithMapping(productConfig models.Product, configID uuid.UUID) (*models.ProductChange, error) {
	// Create the product using the product handler
	productChange, err := h.productHandler.CreateProduct(productConfig, configID)
	if err != nil {
		return nil, err
	}

	// Create prices for the product using the price handler
	priceDetails, err := h.priceHandler.CreatePricesForProduct(productConfig, productConfig.ID, configID)
	if err != nil {
		return nil, err
	}

	// Combine the details
	productChange.Details = append(productChange.Details, priceDetails...)

	return productChange, nil
}

func (h *ConfigHandler) applyChangesToStripeWithMapping(diff *models.ConfigDiff, config *models.StripeConfiguration, configID uuid.UUID) (*models.StripeConfigChanges, error) {
	changes := &models.StripeConfigChanges{
		Created:  []models.ProductChange{},
		Updated:  []models.ProductChange{},
		Archived: []models.ProductChange{},
	}

	// Initialize meter changes if we have any meter operations
	if len(diff.NewMeters) > 0 || len(diff.ArchivedMeters) > 0 {
		changes.Meters = &models.MeterChanges{
			Created:  []models.MeterChange{},
			Archived: []models.MeterChange{},
		}
	}

	// Deactivate archived meters first
	if len(diff.ArchivedMeters) > 0 {
		for _, meterID := range diff.ArchivedMeters {
			// Find the Stripe ID for this meter
			stripeID, err := h.getStripeIDForMeter(meterID, configID)
			if err != nil {
				return nil, fmt.Errorf("failed to find Stripe ID for meter %s: %w", meterID, err)
			}

			meterChange, err := h.meterHandler.DeactivateMeter(context.Background(), stripeID)
			if err != nil {
				return nil, fmt.Errorf("failed to deactivate meter %s: %w", meterID, err)
			}
			if changes.Meters != nil {
				changes.Meters.Archived = append(changes.Meters.Archived, *meterChange)
			}
		}
	}

	// Create new meters (meters must exist before prices that reference them)
	if len(diff.NewMeters) > 0 {
		meterChanges, err := h.createMetersWithMapping(diff.NewMeters, configID)
		if err != nil {
			return nil, fmt.Errorf("failed to create meters: %w", err)
		}
		if changes.Meters != nil {
			changes.Meters.Created = meterChanges
		}
	}

	// Create new products with proper config ID mapping
	for _, product := range diff.NewProducts {
		productChange, err := h.createStripeProductWithMapping(product, configID)
		if err != nil {
			return nil, fmt.Errorf("failed to create product %s: %w", product.ID, err)
		}
		changes.Created = append(changes.Created, *productChange)
	}

	// Update existing products
	for _, update := range diff.UpdatedProducts {
		productChange, err := h.updateStripeProductWithMapping(update, configID)
		if err != nil {
			return nil, fmt.Errorf("failed to update product %s: %w", update.ID, err)
		}
		changes.Updated = append(changes.Updated, *productChange)
	}

	// Archive removed products
	for _, productID := range diff.ArchivedProducts {
		productChange, err := h.productHandler.ArchiveProduct(productID)
		if err != nil {
			return nil, fmt.Errorf("failed to archive product %s: %w", productID, err)
		}
		changes.Archived = append(changes.Archived, *productChange)
	}

	return changes, nil
}

func (h *ConfigHandler) updateStripeProductWithMapping(update models.ProductUpdate, configID uuid.UUID) (*models.ProductChange, error) {
	// Update the product using the product handler
	productChange, err := h.productHandler.UpdateProduct(update, configID)
	if err != nil {
		return nil, err
	}

	var details []string
	details = append(details, productChange.Details...)

	// Handle price changes
	for _, priceConfigID := range update.ArchivedPrices {
		err := h.priceHandler.ArchivePrice(priceConfigID)
		if err != nil {
			// Log the error but don't fail the entire operation
			details = append(details, fmt.Sprintf("Note: Could not archive price %s", priceConfigID))
		} else {
			details = append(details, fmt.Sprintf("Archived price: %s (config: %s)", priceConfigID, priceConfigID))
		}
	}

	// Create new prices
	for _, priceConfig := range update.NewPrices {
		stripeID, err := h.priceHandler.CreatePrice(priceConfig, update.ID, configID)
		if err != nil {
			return nil, fmt.Errorf("failed to create new price: %w", err)
		}
		details = append(details, fmt.Sprintf("Created new price: %s (Stripe ID: %s)", priceConfig.ID, stripeID))
	}

	productChange.Details = details
	return productChange, nil
}

func (h *ConfigHandler) createMetersWithMapping(meters []models.Meter, configID uuid.UUID) ([]models.MeterChange, error) {
	ctx := context.Background()
	var meterChanges []models.MeterChange

	if h.meterHandler == nil {
		return nil, fmt.Errorf("meterHandler is nil")
	}

	for _, meter := range meters {
		stripeID, err := h.meterHandler.CreateMeter(ctx, configID, meter)
		if err != nil {
			return nil, fmt.Errorf("failed to create meter %s: %w", meter.ID, err)
		}

		meterChanges = append(meterChanges, models.MeterChange{
			MeterID:     meter.ID,
			DisplayName: meter.DisplayName,
			Action:      "created",
			StripeID:    stripeID,
		})
	}

	return meterChanges, nil
}

// getStripeIDForMeter finds the Stripe ID for a given meter config ID from any config
func (h *ConfigHandler) getStripeIDForMeter(meterID string, configID uuid.UUID) (string, error) {
	var mapping models.StripeIDMapping
	// Find the most recent mapping for this meter (could be from previous configs)
	err := h.db.Where("config_item_id = ? AND item_type = ?", meterID, "meter").Order("created_at DESC").First(&mapping).Error
	if err != nil {
		return "", fmt.Errorf("meter ID mapping not found for %s: %w", meterID, err)
	}
	return mapping.StripeID, nil
}
