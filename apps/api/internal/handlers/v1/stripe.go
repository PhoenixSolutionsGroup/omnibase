package v1

import (
	"api/internal/config"
	"api/internal/database"
	"api/internal/handlers"
	"api/internal/logger"
	"api/internal/models"
	services_v1 "api/internal/service/v1"
	stripe_config "api/internal/service/v1/stripe_config"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/stripe/stripe-go/v82"
	"gorm.io/gorm"

	"github.com/stripe/stripe-go/v82/billing/meter"
	"github.com/stripe/stripe-go/v82/price"
	"github.com/stripe/stripe-go/v82/product"
)

type StripeHandler struct {
	db      *gorm.DB
	service *stripe_config.StripeConfigService
	stripe  *services_v1.StripeService
}

func NewStripeHandler(cfg *config.Config) *StripeHandler {
	db, err := database.GetConnection(cfg.Database)
	if err != nil {
		log.Panicf("Failed to connect to database: %s", err)
	}

	return &StripeHandler{
		db:      db,
		service: stripe_config.NewStripeConfigService(cfg),
		stripe:  services_v1.NewStripeService(cfg, db),
	}
}

// Servers the JSON schema for the stripe config
func (h *StripeHandler) GetSchema(ctx *gin.Context) {
	schemaPath := "./internal/static/stripe-config-schema.json"
	schemaBytes, err := os.ReadFile(schemaPath)
	if err != nil {
		handlers.NewInternalServerErrorResponse(ctx,
			fmt.Errorf("Failed to load schema: %s", err),
		)
		return
	}

	var schema interface{}
	if err := json.Unmarshal(schemaBytes, &schema); err != nil {
		handlers.NewInternalServerErrorResponse(ctx,
			fmt.Errorf("Invalid schema file"),
		)
		return
	}

	ctx.Header("Content-Type", "application/schema+json")
	ctx.JSON(http.StatusOK, schema)
}

func (h *StripeHandler) GetConfig(ctx *gin.Context) {
	var config *models.StripeConfig
	err := h.db.Order("created_at DESC").First(&config).Error
	if err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Error retrieving config: %s", err))
		return
	}

	// Parse the configuration and add Stripe IDs
	parsedConfig, err := h.service.ParseAndValidateConfig(config.Config)
	if err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Error parsing config: %s", err))
		return
	}

	// Convert to response format with Stripe IDs
	configWithIDs := h.addStripeIDsToConfig(*parsedConfig, config.ID)

	response := gin.H{
		"id":         config.ID,
		"config":     configWithIDs,
		"version":    config.Version,
		"created_at": config.CreatedAt,
		"updated_at": config.UpdatedAt,
	}

	handlers.NewSuccessResponse(ctx, response)
}

func (h *StripeHandler) UpdateConfig(ctx *gin.Context) {
	var configData models.StripeConfigData
	fmt.Printf("Here\n\n")
	if err := ctx.ShouldBindJSON(&configData); err != nil {
		handlers.NewBadRequestResponse(ctx,
			"Invalid JSON format",
		)
		return
	}

	if len(configData) == 0 {
		handlers.NewBadRequestResponse(ctx,
			"Configuration data is required",
		)
		return
	}

	response, err := h.service.ProcessConfigUpdate(configData)
	if err != nil {
		handlers.NewBadRequestResponse(ctx,
			&models.StripeConfigResponse{
				Message: "Configuration validation failed",
				Errors:  []string{err.Error()},
			},
		)
	}

	if len(response.Errors) > 0 {
		handlers.NewBadRequestResponse(ctx, response)
		return
	}

	handlers.NewSuccessResponse(ctx, response)
}

func (h *StripeHandler) GetConfigHistory(ctx *gin.Context) {
	limit := 10
	offset := 0
	if limitStr := ctx.Query("limit"); limitStr != "" {
		if parsedLimit, err := parsePositiveInt(limitStr, 100); err == nil {
			limit = parsedLimit
		}
	}

	if offsetStr := ctx.Query("offset"); offsetStr != "" {
		if parsedOffset, err := parsePositiveInt(offsetStr, 0); err == nil {
			offset = parsedOffset
		}
	}

	var configs []models.StripeConfig
	var total int64

	// Get total count
	if err := h.db.Model(&models.StripeConfig{}).Count(&total).Error; err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to count configs: %s", err))
		return
	}

	// Get paginated results
	err := h.db.Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&configs).Error

	if err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to fetch config history: %s", err))
		return
	}

	// Add Stripe IDs to each config
	var configsWithIDs []gin.H
	for _, config := range configs {
		parsedConfig, err := h.service.ParseAndValidateConfig(config.Config)
		if err != nil {
			// If parsing fails, include config without Stripe IDs
			configsWithIDs = append(configsWithIDs, gin.H{
				"id":          config.ID,
				"config":      config.Config,
				"version":     config.Version,
				"created_at":  config.CreatedAt,
				"updated_at":  config.UpdatedAt,
				"parse_error": err.Error(),
			})
			continue
		}

		configWithIDs := h.addStripeIDsToConfig(*parsedConfig, config.ID)
		configsWithIDs = append(configsWithIDs, gin.H{
			"id":         config.ID,
			"config":     configWithIDs,
			"version":    config.Version,
			"created_at": config.CreatedAt,
			"updated_at": config.UpdatedAt,
		})
	}

	totalPages := (int(total) + limit - 1) / limit
	currentPage := (offset / limit) + 1

	response := gin.H{
		"configs": configsWithIDs,
		"pagination": gin.H{
			"total":       total,
			"page":        currentPage,
			"per_page":    limit,
			"total_pages": totalPages,
			"has_next":    currentPage < totalPages,
			"has_prev":    currentPage > 1,
		},
	}

	handlers.NewSuccessResponse(ctx, response)
}

func parsePositiveInt(str string, maxValue int) (int, error) {
	// Simple parsing with bounds checking
	var result int
	for _, r := range str {
		if r < '0' || r > '9' {
			return 0, gin.Error{}
		}
		result = result*10 + int(r-'0')
		if result > maxValue {
			return maxValue, nil
		}
	}
	return result, nil
}

func (h *StripeHandler) ValidateConfig(ctx *gin.Context) {
	var configData models.StripeConfigData
	if err := ctx.ShouldBindJSON(&configData); err != nil {
		handlers.NewBadRequestResponse(ctx, "Invalid JSON format")
		return
	}

	_, err := h.service.ParseAndValidateConfig(configData)
	if err != nil {
		handlers.NewBadRequestResponse(ctx, []string{err.Error()})
		return
	}

	handlers.NewSuccessResponse(ctx, "")
}

func (h *StripeHandler) PullConfig(ctx *gin.Context) {
	// Fetch meters from Stripe
	meterParams := &stripe.BillingMeterListParams{}
	meterParams.Filters.AddFilter("status", "", "active")

	var stripeMeters []*stripe.BillingMeter
	meterIter := meter.List(meterParams)
	for meterIter.Next() {
		stripeMeters = append(stripeMeters, meterIter.BillingMeter())
	}
	if err := meterIter.Err(); err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to fetch meters: %s", err))
		return
	}

	productParams := &stripe.ProductListParams{}
	productParams.Filters.AddFilter("active", "", "true")

	var stripeProducts []*stripe.Product
	productIter := product.List(productParams)
	for productIter.Next() {
		stripeProducts = append(stripeProducts, productIter.Product())
	}
	if err := productIter.Err(); err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to fetch products: %s", err))
		return
	}

	priceParams := &stripe.PriceListParams{}
	priceParams.Filters.AddFilter("active", "", "true")
	priceParams.Expand = []*string{stripe.String("data.tiers")}

	var stripePrices []*stripe.Price
	priceIter := price.List(priceParams)
	for priceIter.Next() {
		stripePrices = append(stripePrices, priceIter.Price())
	}
	if err := priceIter.Err(); err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to fetch prices: %w", err))
		return
	}

	// Convert meters to config format
	var configMeters []models.Meter
	for _, stripeMeter := range stripeMeters {
		configMeter := h.convertStripeMeterToConfig(stripeMeter)
		configMeters = append(configMeters, configMeter)
	}

	pricesByProduct := make(map[string][]*stripe.Price)
	for _, stripePrice := range stripePrices {
		if stripePrice.Product != nil {
			productID := stripePrice.Product.ID
			pricesByProduct[productID] = append(pricesByProduct[productID], stripePrice)
		}
	}

	var configProducts []models.Product
	for _, stripeProduct := range stripeProducts {
		configProduct := models.Product{
			ID:          h.convertStripeIDToConfigID(stripeProduct.ID, "product"),
			Name:        stripeProduct.Name,
			Description: "",
			Type:        "service", // default
		}

		if stripeProduct.Description != "" {
			configProduct.Description = stripeProduct.Description
		}

		if stripeProduct.Type != "" {
			configProduct.Type = string(stripeProduct.Type)
		}

		// Convert associated prices
		if productPrices, exists := pricesByProduct[stripeProduct.ID]; exists {
			for _, stripePrice := range productPrices {
				configPrice := h.convertStripePriceToConfig(stripePrice)
				configProduct.Prices = append(configProduct.Prices, configPrice)
			}
		}

		if len(configProduct.Prices) > 0 { // Only include products with prices
			configProducts = append(configProducts, configProduct)
		}
	}

	// Get the latest config version from database if available
	version := "1.0.0" // default
	var latestConfig models.StripeConfig
	if err := h.db.Order("created_at DESC").First(&latestConfig).Error; err == nil {
		if parsedConfig, err := h.service.ParseAndValidateConfig(latestConfig.Config); err == nil {
			version = parsedConfig.Version
		}
	}

	handlers.NewSuccessResponse(ctx, models.StripeConfiguration{
		Version:  version,
		Meters:   configMeters,
		Products: configProducts,
	})

}

func (h *StripeHandler) ArchiveAllConfig(ctx *gin.Context) {
	// First, fetch all active meters, products, and prices from Stripe (similar to PullConfig)

	// Fetch meters from Stripe
	meterParams := &stripe.BillingMeterListParams{}
	meterParams.Filters.AddFilter("status", "", "active")

	var stripeMeters []*stripe.BillingMeter
	meterIter := meter.List(meterParams)
	for meterIter.Next() {
		stripeMeters = append(stripeMeters, meterIter.BillingMeter())
	}
	if err := meterIter.Err(); err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to fetch meters: %s", err))
		return
	}

	// Fetch products from Stripe
	productParams := &stripe.ProductListParams{}
	productParams.Filters.AddFilter("active", "", "true")

	var stripeProducts []*stripe.Product
	productIter := product.List(productParams)
	for productIter.Next() {
		stripeProducts = append(stripeProducts, productIter.Product())
	}
	if err := productIter.Err(); err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to fetch products: %s", err))
		return
	}

	// Fetch prices from Stripe
	priceParams := &stripe.PriceListParams{}
	priceParams.Filters.AddFilter("active", "", "true")

	var stripePrices []*stripe.Price
	priceIter := price.List(priceParams)
	for priceIter.Next() {
		stripePrices = append(stripePrices, priceIter.Price())
	}
	if err := priceIter.Err(); err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to fetch prices: %w", err))
		return
	}

	// Archive all fetched resources
	var archivedItems []string
	var archiveErrors []string

	// Archive meters
	for _, stripeMeter := range stripeMeters {
		if err := h.stripe.ArchiveStripeMeter(stripeMeter.ID); err != nil {
			archiveErrors = append(archiveErrors, fmt.Sprintf("meter %s: %v", stripeMeter.ID, err))
		} else {
			archivedItems = append(archivedItems, fmt.Sprintf("meter: %s (%s)", stripeMeter.ID, stripeMeter.DisplayName))
		}
	}

	// Archive prices (before products since prices depend on products)
	for _, stripePrice := range stripePrices {
		if err := h.stripe.ArchiveStripePrice(stripePrice.ID); err != nil {
			archiveErrors = append(archiveErrors, fmt.Sprintf("price %s: %v", stripePrice.ID, err))
		} else {
			archivedItems = append(archivedItems, fmt.Sprintf("price: %s", stripePrice.ID))
		}
	}

	// Archive products
	for _, stripeProduct := range stripeProducts {
		if err := h.stripe.ArchiveStripeProduct(stripeProduct.ID); err != nil {
			archiveErrors = append(archiveErrors, fmt.Sprintf("product %s: %v", stripeProduct.ID, err))
		} else {
			archivedItems = append(archivedItems, fmt.Sprintf("product: %s (%s)", stripeProduct.ID, stripeProduct.Name))
		}
	}

	// Get the latest config version from database to maintain version
	version := "1.0.0" // default
	var latestConfig models.StripeConfig
	if err := h.db.Order("created_at DESC").First(&latestConfig).Error; err == nil {
		if parsedConfig, err := h.service.ParseAndValidateConfig(latestConfig.Config); err == nil {
			version = parsedConfig.Version
		}
	}

	// Create empty config data and save to database
	emptyConfigData := models.StripeConfigData{
		"version":  version,
		"meters":   []interface{}{},
		"products": []interface{}{},
	}

	// Process the empty config to store it in the database
	_, err := h.service.ProcessConfigUpdate(emptyConfigData)
	if err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to update local config: %s", err))
		return
	}

	// Prepare response
	response := gin.H{
		"message":        "Successfully archived all Stripe resources and cleared local config",
		"archived_items": archivedItems,
		"archive_errors": archiveErrors,
		"total_archived": len(archivedItems),
		"total_errors":   len(archiveErrors),
	}

	if len(archiveErrors) > 0 {
		response["warning"] = "Some items failed to archive - see archive_errors for details"
	}

	handlers.NewSuccessResponse(ctx, response)
}

func (h *StripeHandler) convertStripeMeterToConfig(stripeMeter *stripe.BillingMeter) models.Meter {
	configMeter := models.Meter{
		ID:          h.convertStripeIDToConfigID(stripeMeter.ID, "meter"),
		DisplayName: stripeMeter.DisplayName,
		EventName:   stripeMeter.EventName,
		DefaultAggregation: models.MeterDefaultAggregation{
			Formula: string(stripeMeter.DefaultAggregation.Formula),
		},
	}

	// Convert customer mapping if present
	if stripeMeter.CustomerMapping != nil {
		configMeter.CustomerMapping = &models.MeterCustomerMapping{
			EventPayloadKey: stripeMeter.CustomerMapping.EventPayloadKey,
			Type:            string(stripeMeter.CustomerMapping.Type),
		}
	}

	// Convert value settings if present
	if stripeMeter.ValueSettings != nil {
		configMeter.ValueSettings = &models.MeterValueSettings{
			EventPayloadKey: stripeMeter.ValueSettings.EventPayloadKey,
		}
	}

	return configMeter
}

func (h *StripeHandler) convertStripeIDToConfigID(stripeId string, itemType string) string {
	var mapping models.StripeIDMapping
	err := h.db.Where("stripe_id = ? AND item_type = ?", stripeId, itemType).
		Order("created_at DESC").
		First(&mapping).Error

	if err != nil {
		return stripeId
	}
	return mapping.ConfigItemID
}

func (h *StripeHandler) convertStripePriceToConfig(stripePrice *stripe.Price) models.Price {
	logger.Logger.Debug("Converting stripe price to config",
		"price_id", stripePrice.ID,
		"billing_scheme", stripePrice.BillingScheme,
		"tiers_mode", stripePrice.TiersMode,
		"tiers_count", len(stripePrice.Tiers))

	configPrice := models.Price{
		ID:       h.convertStripeIDToConfigID(stripePrice.ID, "price"),
		Amount:   stripePrice.UnitAmount,
		Currency: string(stripePrice.Currency),
	}

	if stripePrice.Recurring != nil {
		configPrice.Interval = string(stripePrice.Recurring.Interval)
		configPrice.IntervalCount = int(stripePrice.Recurring.IntervalCount)

		if stripePrice.Recurring.UsageType != "" {
			configPrice.UsageType = string(stripePrice.Recurring.UsageType)
		}

		// Handle meter reference for metered pricing
		if stripePrice.Recurring.Meter != "" {
			configPrice.Meter = h.convertStripeIDToConfigID(stripePrice.Recurring.Meter, "meter")
		}
	}

	if stripePrice.BillingScheme != "" {
		logger.Logger.Debug("Setting billing scheme", "scheme", stripePrice.BillingScheme)
		configPrice.BillingScheme = string(stripePrice.BillingScheme)
	}

	// Add tiers_mode for tiered pricing
	if len(stripePrice.Tiers) > 0 {
		logger.Logger.Debug("Processing tiers", "count", len(stripePrice.Tiers))

		// Determine tiers_mode based on Stripe's TiersMode
		if stripePrice.TiersMode != "" {
			logger.Logger.Debug("Setting tiers_mode", "mode", stripePrice.TiersMode)
			configPrice.TiersMode = string(stripePrice.TiersMode)
		} else {
			logger.Logger.Debug("TiersMode empty, defaulting to graduated")
			// Default to "graduated" if not specified
			configPrice.TiersMode = "graduated"
		}

		for i, stripeTier := range stripePrice.Tiers {
			logger.Logger.Debug("Processing tier",
				"tier_index", i,
				"up_to", stripeTier.UpTo,
				"unit_amount", stripeTier.UnitAmount,
				"flat_amount", stripeTier.FlatAmount)

			configTier := models.Tier{}

			// Handle UpTo - Stripe uses 0 for infinite tiers
			if stripeTier.UpTo == 0 {
				configTier.UpTo = "inf"
				logger.Logger.Debug("Set tier UpTo to inf", "tier_index", i)
			} else {
				configTier.UpTo = stripeTier.UpTo
				logger.Logger.Debug("Set tier UpTo", "tier_index", i, "up_to", stripeTier.UpTo)
			}

			// Always set flat_amount and unit_amount (even if zero, to match expected format)
			if stripeTier.FlatAmount > 0 {
				configTier.FlatAmount = &stripeTier.FlatAmount
				logger.Logger.Debug("Set tier FlatAmount", "tier_index", i, "amount", stripeTier.FlatAmount)
			} else {
				configTier.FlatAmount = nil
				logger.Logger.Debug("Set tier FlatAmount to nil", "tier_index", i)
			}

			if stripeTier.UnitAmount > 0 {
				configTier.UnitAmount = &stripeTier.UnitAmount
				logger.Logger.Debug("Set tier UnitAmount", "tier_index", i, "amount", stripeTier.UnitAmount)
			} else {
				configTier.UnitAmount = nil
				logger.Logger.Debug("Set tier UnitAmount to nil", "tier_index", i)
			}

			configPrice.Tiers = append(configPrice.Tiers, configTier)
		}

		logger.Logger.Debug("Completed tier processing", "final_tiers_count", len(configPrice.Tiers))
	} else {
		logger.Logger.Debug("No tiers found in Stripe price")
	}

	logger.Logger.Debug("Final config conversion result",
		"billing_scheme", configPrice.BillingScheme,
		"tiers_mode", configPrice.TiersMode,
		"tiers_count", len(configPrice.Tiers))

	return configPrice
}

// addStripeIDsToConfig adds Stripe IDs to a configuration by looking up ID mappings
func (h *StripeHandler) addStripeIDsToConfig(config models.StripeConfiguration, configID uuid.UUID) models.StripeConfigurationWithIDs {
	// Process meters
	var metersWithIDs []models.MeterWithStripeID
	for _, meter := range config.Meters {
		meterWithIDs := models.MeterWithStripeID{
			Meter: meter,
		}

		// Get Stripe meter ID
		if meterStripeID, err := h.service.GetStripeIDByConfigItemID(meter.ID, "meter"); err == nil && meterStripeID != "" && meterStripeID != meter.ID {
			meterWithIDs.StripeID = &meterStripeID
		}

		metersWithIDs = append(metersWithIDs, meterWithIDs)
	}

	// Ensure meters is always a valid slice, never null
	if metersWithIDs == nil {
		metersWithIDs = []models.MeterWithStripeID{}
	}

	var productsWithIDs []models.ProductWithStripeIDs

	for _, product := range config.Products {
		productWithIDs := models.ProductWithStripeIDs{
			ID:          product.ID,
			Name:        product.Name,
			Description: product.Description,
			Type:        product.Type,
			UI:          product.UI,
		}

		// Get Stripe product ID
		if productStripeID, err := h.service.GetStripeIDByConfigItemID(product.ID, "product"); err == nil && productStripeID != "" && productStripeID != product.ID {
			productWithIDs.StripeID = &productStripeID
		}

		// Process prices
		var pricesWithIDs []models.PriceWithStripeID
		for _, price := range product.Prices {
			priceWithIDs := models.PriceWithStripeID{
				Price: price,
			}

			// Get Stripe price ID - only if it's not a "free" price
			if price.ID != "free" {
				if priceStripeID, err := h.service.GetStripeIDByConfigItemID(price.ID, "price"); err == nil && priceStripeID != "" && priceStripeID != price.ID {
					priceWithIDs.StripeID = &priceStripeID
				}
			}
			// For "free" prices, StripeID remains nil

			pricesWithIDs = append(pricesWithIDs, priceWithIDs)
		}

		productWithIDs.Prices = pricesWithIDs
		productsWithIDs = append(productsWithIDs, productWithIDs)
	}

	// Ensure products is always a valid slice, never null
	if productsWithIDs == nil {
		productsWithIDs = []models.ProductWithStripeIDs{}
	}

	return models.StripeConfigurationWithIDs{
		Version:  config.Version,
		Meters:   metersWithIDs,
		Products: productsWithIDs,
	}
}
