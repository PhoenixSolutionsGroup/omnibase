package handlers

import (
	"api/internal/logger"
	"api/internal/models"
	"context"
	"fmt"

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
	webhookHandler WebhookHandlerInterface
	couponHandler  CouponHandlerInterface
	promoHandler   PromoHandlerInterface
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

type WebhookHandlerInterface interface {
	ProcessWebhooks(ctx context.Context, configID uuid.UUID, webhooks []models.WebhookEndpointConfig) ([]WebhookResult, error)
}

type CouponHandlerInterface interface {
	CreateCoupon(couponConfig models.Coupon, configID uuid.UUID) (*models.CouponChange, error)
	UpdateCoupon(update models.CouponUpdate) (*models.CouponChange, error)
	DeleteCoupon(couponID string) (*models.CouponChange, error)
	RecreateCoupon(couponConfig models.Coupon, configID uuid.UUID) (*models.CouponChange, string, error)
}

type PromoHandlerInterface interface {
	CreatePromotionCode(promoConfig models.PromotionCode, configID uuid.UUID) (*models.PromotionCodeChange, error)
	UpdatePromotionCode(update models.PromoCodeUpdate) (*models.PromotionCodeChange, error)
	DeactivatePromotionCode(promoID string) (*models.PromotionCodeChange, error)
	RecreatePromotionCode(promoConfig models.PromotionCode, configID uuid.UUID) (*models.PromotionCodeChange, error)
	CreatePromotionCodeWithNewCoupon(promoConfig models.PromotionCode, newCouponStripeID string, configID uuid.UUID) (*models.PromotionCodeChange, error)
}

func NewConfigHandler(
	db *gorm.DB,
	validator ValidatorInterface,
	differ DifferInterface,
	productHandler ProductHandlerInterface,
	priceHandler PriceHandlerInterface,
	meterHandler MeterHandlerInterface,
	webhookHandler WebhookHandlerInterface,
	couponHandler CouponHandlerInterface,
	promoHandler PromoHandlerInterface,
) *ConfigHandler {
	return &ConfigHandler{
		db:             db,
		validator:      validator,
		differ:         differ,
		productHandler: productHandler,
		priceHandler:   priceHandler,
		meterHandler:   meterHandler,
		webhookHandler: webhookHandler,
		couponHandler:  couponHandler,
		promoHandler:   promoHandler,
	}
}

func (h *ConfigHandler) ProcessConfigUpdate(configData models.StripeConfigData) (*models.StripeConfigResponse, error) {
	logger.Logger.Info("ProcessConfigUpdate started")

	// Parse and validate the incoming configuration
	config, err := h.validator.ParseAndValidateConfig(configData)
	if err != nil {
		logger.Logger.Warn("Config validation failed", "error", err)
		return &models.StripeConfigResponse{
			Message: "Configuration validation failed",
			Errors:  []string{err.Error()},
		}, nil
	}

	logger.Logger.Info("Config parsed successfully", "meters_count", len(config.Meters))
	for i, meter := range config.Meters {
		logger.Logger.Debug("Meter found in config", "index", i, "id", meter.ID, "display_name", meter.DisplayName)
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

	// Calculate differences between configurations
	diff := h.differ.CalculateConfigDiff(previousConfig, config)

	// Check if there are any actual changes (ignore version-only changes)
	hasChanges := len(diff.NewProducts) > 0 ||
		len(diff.UpdatedProducts) > 0 ||
		len(diff.ArchivedProducts) > 0 ||
		len(diff.NewMeters) > 0 ||
		len(diff.ArchivedMeters) > 0 ||
		len(diff.NewCoupons) > 0 ||
		len(diff.UpdatedCoupons) > 0 ||
		len(diff.ArchivedCoupons) > 0 ||
		len(diff.NewPromotionCodes) > 0 ||
		len(diff.UpdatedPromotionCodes) > 0 ||
		len(diff.DeactivatedPromoCodes) > 0

	if !hasChanges {
		return &models.StripeConfigResponse{
			Message: "no change was made",
			Config:  config,
		}, nil
	}

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

	// Process webhooks if present in config
	if len(config.Webhooks) > 0 && h.webhookHandler != nil {
		webhookResults, err := h.webhookHandler.ProcessWebhooks(context.Background(), newStripeConfig.ID, config.Webhooks)
		if err != nil {
			return nil, fmt.Errorf("failed to process webhooks: %w", err)
		}
		changes.Webhooks = convertWebhookResultsToChanges(webhookResults)
	}

	return &models.StripeConfigResponse{
		Message: "Configuration updated successfully",
		Changes: changes,
		Config:  config,
	}, nil
}

func (h *ConfigHandler) handleFirstTimeSetup(config *models.StripeConfiguration, configData models.StripeConfigData) (*models.StripeConfigResponse, error) {
	changes := &models.StripeConfigChanges{
		Products: &models.ProductChanges{
			Created: []models.ProductChange{},
		},
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
		changes.Products.Created = append(changes.Products.Created, *productChange)
	}

	// Create all coupons in Stripe (after products, since coupons may reference products via applies_to)
	if len(config.Coupons) > 0 && h.couponHandler != nil {
		changes.Coupons = &models.CouponChanges{
			Created: []models.CouponChange{},
		}
		for _, couponConfig := range config.Coupons {
			couponChange, err := h.couponHandler.CreateCoupon(couponConfig, newStripeConfig.ID)
			if err != nil {
				return nil, fmt.Errorf("failed to create coupon %s: %w", couponConfig.ID, err)
			}
			changes.Coupons.Created = append(changes.Coupons.Created, *couponChange)
		}
	}

	// Create all promotion codes in Stripe (after coupons, since promo codes reference coupons)
	if len(config.PromotionCodes) > 0 && h.promoHandler != nil {
		changes.PromotionCodes = &models.PromotionCodeChanges{
			Created: []models.PromotionCodeChange{},
		}
		for _, promoConfig := range config.PromotionCodes {
			promoChange, err := h.promoHandler.CreatePromotionCode(promoConfig, newStripeConfig.ID)
			if err != nil {
				return nil, fmt.Errorf("failed to create promotion code %s: %w", promoConfig.ID, err)
			}
			changes.PromotionCodes.Created = append(changes.PromotionCodes.Created, *promoChange)
		}
	}

	// Process webhooks if present in config
	if len(config.Webhooks) > 0 && h.webhookHandler != nil {
		webhookResults, err := h.webhookHandler.ProcessWebhooks(context.Background(), newStripeConfig.ID, config.Webhooks)
		if err != nil {
			return nil, fmt.Errorf("failed to process webhooks: %w", err)
		}
		changes.Webhooks = convertWebhookResultsToChanges(webhookResults)
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
		Products: &models.ProductChanges{
			Created:  []models.ProductChange{},
			Updated:  []models.ProductChange{},
			Archived: []models.ProductChange{},
		},
	}

	// Initialize meter changes if we have any meter operations
	if len(diff.NewMeters) > 0 || len(diff.ArchivedMeters) > 0 {
		changes.Meters = &models.MeterChanges{
			Created:  []models.MeterChange{},
			Archived: []models.MeterChange{},
		}
	}

	// Initialize coupon changes if we have any coupon operations
	if len(diff.NewCoupons) > 0 || len(diff.UpdatedCoupons) > 0 || len(diff.ArchivedCoupons) > 0 {
		changes.Coupons = &models.CouponChanges{
			Created:  []models.CouponChange{},
			Updated:  []models.CouponChange{},
			Archived: []models.CouponChange{},
		}
	}

	// Initialize promotion code changes if we have any promo operations
	if len(diff.NewPromotionCodes) > 0 || len(diff.UpdatedPromotionCodes) > 0 || len(diff.DeactivatedPromoCodes) > 0 {
		changes.PromotionCodes = &models.PromotionCodeChanges{
			Created:     []models.PromotionCodeChange{},
			Updated:     []models.PromotionCodeChange{},
			Deactivated: []models.PromotionCodeChange{},
		}
	}

	// ============================================
	// PHASE 1: Archives (reverse dependency order)
	// Order: Promo Codes -> Coupons -> Products -> Meters
	// ============================================

	// 1. Deactivate promotion codes first (they depend on coupons)
	if len(diff.DeactivatedPromoCodes) > 0 && h.promoHandler != nil {
		for _, promoID := range diff.DeactivatedPromoCodes {
			promoChange, err := h.promoHandler.DeactivatePromotionCode(promoID)
			if err != nil {
				return nil, fmt.Errorf("failed to deactivate promotion code %s: %w", promoID, err)
			}
			if changes.PromotionCodes != nil {
				changes.PromotionCodes.Deactivated = append(changes.PromotionCodes.Deactivated, *promoChange)
			}
		}
	}

	// 2. Delete archived coupons (they depend on products via applies_to)
	if len(diff.ArchivedCoupons) > 0 && h.couponHandler != nil {
		for _, couponID := range diff.ArchivedCoupons {
			couponChange, err := h.couponHandler.DeleteCoupon(couponID)
			if err != nil {
				return nil, fmt.Errorf("failed to delete coupon %s: %w", couponID, err)
			}
			if changes.Coupons != nil {
				changes.Coupons.Archived = append(changes.Coupons.Archived, *couponChange)
			}
		}
	}

	// 3. Archive removed products
	for _, productID := range diff.ArchivedProducts {
		productChange, err := h.productHandler.ArchiveProduct(productID)
		if err != nil {
			return nil, fmt.Errorf("failed to archive product %s: %w", productID, err)
		}
		changes.Products.Archived = append(changes.Products.Archived, *productChange)
	}

	// 4. Deactivate archived meters
	if len(diff.ArchivedMeters) > 0 {
		for _, meterID := range diff.ArchivedMeters {
			stripeID, err := h.getStripeIDForMeter(meterID, configID)
			if err != nil {
				return nil, fmt.Errorf("failed to find Stripe ID for meter %s: %w", meterID, err)
			}

			meterChange, err := h.meterHandler.DeactivateMeter(context.Background(), stripeID)
			if err != nil {
				return nil, fmt.Errorf("failed to deactivate meter %s: %w", meterID, err)
			}
			meterChange.MeterID = meterID
			if changes.Meters != nil {
				changes.Meters.Archived = append(changes.Meters.Archived, *meterChange)
			}
		}
	}

	// ============================================
	// PHASE 2: Creates/Updates (dependency order)
	// Order: Meters -> Products -> Coupons -> Promo Codes
	// ============================================

	// 1. Create new meters (meters must exist before prices that reference them)
	if len(diff.NewMeters) > 0 {
		meterChanges, err := h.createMetersWithMapping(diff.NewMeters, configID)
		if err != nil {
			return nil, fmt.Errorf("failed to create meters: %w", err)
		}
		if changes.Meters != nil {
			changes.Meters.Created = meterChanges
		}
	}

	// 2. Create new products with proper config ID mapping
	for _, product := range diff.NewProducts {
		productChange, err := h.createStripeProductWithMapping(product, configID)
		if err != nil {
			return nil, fmt.Errorf("failed to create product %s: %w", product.ID, err)
		}
		changes.Products.Created = append(changes.Products.Created, *productChange)
	}

	// 3. Update existing products
	for _, update := range diff.UpdatedProducts {
		productChange, err := h.updateStripeProductWithMapping(update, configID)
		if err != nil {
			return nil, fmt.Errorf("failed to update product %s: %w", update.ID, err)
		}
		changes.Products.Updated = append(changes.Products.Updated, *productChange)
	}

	// 4. Handle coupon updates and creates
	if h.couponHandler != nil {
		// Handle coupon updates (check for immutable field changes requiring recreation)
		for _, update := range diff.UpdatedCoupons {
			requiresRecreate, _ := update.FieldChanges["requires_recreate"].(bool)

			if requiresRecreate {
				// Find the coupon config from the new config
				var couponConfig *models.Coupon
				for i := range config.Coupons {
					if config.Coupons[i].ID == update.ID {
						couponConfig = &config.Coupons[i]
						break
					}
				}
				if couponConfig == nil {
					return nil, fmt.Errorf("coupon config not found for update: %s", update.ID)
				}

				// Recreate the coupon and handle cascade to promo codes
				couponChange, newStripeID, err := h.couponHandler.RecreateCoupon(*couponConfig, configID)
				if err != nil {
					return nil, fmt.Errorf("failed to recreate coupon %s: %w", update.ID, err)
				}
				if changes.Coupons != nil {
					changes.Coupons.Updated = append(changes.Coupons.Updated, *couponChange)
				}

				// Cascade: recreate all promo codes that reference this coupon
				if h.promoHandler != nil {
					for _, promo := range config.PromotionCodes {
						if promo.Coupon == update.ID {
							// Deactivate old promo code
							h.promoHandler.DeactivatePromotionCode(promo.ID)
							// Create new promo code with new coupon
							promoChange, err := h.promoHandler.CreatePromotionCodeWithNewCoupon(promo, newStripeID, configID)
							if err != nil {
								return nil, fmt.Errorf("failed to recreate promotion code %s after coupon recreation: %w", promo.ID, err)
							}
							if changes.PromotionCodes == nil {
								changes.PromotionCodes = &models.PromotionCodeChanges{
									Updated: []models.PromotionCodeChange{},
								}
							}
							changes.PromotionCodes.Updated = append(changes.PromotionCodes.Updated, *promoChange)
						}
					}
				}
			} else {
				// Simple update (only mutable fields)
				couponChange, err := h.couponHandler.UpdateCoupon(update)
				if err != nil {
					return nil, fmt.Errorf("failed to update coupon %s: %w", update.ID, err)
				}
				if changes.Coupons != nil {
					changes.Coupons.Updated = append(changes.Coupons.Updated, *couponChange)
				}
			}
		}

		// Create new coupons
		for _, coupon := range diff.NewCoupons {
			couponChange, err := h.couponHandler.CreateCoupon(coupon, configID)
			if err != nil {
				return nil, fmt.Errorf("failed to create coupon %s: %w", coupon.ID, err)
			}
			if changes.Coupons != nil {
				changes.Coupons.Created = append(changes.Coupons.Created, *couponChange)
			}
		}
	}

	// 5. Handle promotion code updates and creates
	if h.promoHandler != nil {
		// Handle promo code updates (check for immutable field changes requiring recreation)
		for _, update := range diff.UpdatedPromotionCodes {
			requiresRecreate, _ := update.FieldChanges["requires_recreate"].(bool)

			if requiresRecreate {
				// Find the promo config from the new config
				var promoConfig *models.PromotionCode
				for i := range config.PromotionCodes {
					if config.PromotionCodes[i].ID == update.ID {
						promoConfig = &config.PromotionCodes[i]
						break
					}
				}
				if promoConfig == nil {
					return nil, fmt.Errorf("promotion code config not found for update: %s", update.ID)
				}

				promoChange, err := h.promoHandler.RecreatePromotionCode(*promoConfig, configID)
				if err != nil {
					return nil, fmt.Errorf("failed to recreate promotion code %s: %w", update.ID, err)
				}
				if changes.PromotionCodes != nil {
					changes.PromotionCodes.Updated = append(changes.PromotionCodes.Updated, *promoChange)
				}
			} else {
				// Simple update (only mutable fields)
				promoChange, err := h.promoHandler.UpdatePromotionCode(update)
				if err != nil {
					return nil, fmt.Errorf("failed to update promotion code %s: %w", update.ID, err)
				}
				if changes.PromotionCodes != nil {
					changes.PromotionCodes.Updated = append(changes.PromotionCodes.Updated, *promoChange)
				}
			}
		}

		// Create new promotion codes
		for _, promo := range diff.NewPromotionCodes {
			promoChange, err := h.promoHandler.CreatePromotionCode(promo, configID)
			if err != nil {
				return nil, fmt.Errorf("failed to create promotion code %s: %w", promo.ID, err)
			}
			if changes.PromotionCodes != nil {
				changes.PromotionCodes.Created = append(changes.PromotionCodes.Created, *promoChange)
			}
		}
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

// convertWebhookResultsToChanges converts webhook handler results to model changes
func convertWebhookResultsToChanges(results []WebhookResult) *models.WebhookChanges {
	if len(results) == 0 {
		return nil
	}

	changes := &models.WebhookChanges{
		Created:   []models.WebhookChange{},
		Updated:   []models.WebhookChange{},
		Unchanged: []models.WebhookChange{},
	}

	for _, result := range results {
		change := models.WebhookChange{
			WebhookID: result.ID,
			URL:       result.URL,
			Action:    result.Action,
			StripeID:  result.StripeID,
		}

		switch result.Action {
		case "created":
			changes.Created = append(changes.Created, change)
		case "updated":
			changes.Updated = append(changes.Updated, change)
		case "unchanged":
			changes.Unchanged = append(changes.Unchanged, change)
		}
	}

	return changes
}
