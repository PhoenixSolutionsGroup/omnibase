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
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/stripe/stripe-go/v82"
	"gorm.io/gorm"

	"github.com/stripe/stripe-go/v82/billing/meter"
	"github.com/stripe/stripe-go/v82/coupon"
	"github.com/stripe/stripe-go/v82/price"
	"github.com/stripe/stripe-go/v82/product"
	"github.com/stripe/stripe-go/v82/promotioncode"
	"github.com/stripe/stripe-go/v82/webhookendpoint"
)

type StripeHandler struct {
	db            *gorm.DB
	service       *stripe_config.StripeConfigService
	stripe        *services_v1.StripeService
	webhookSecret string
}

func NewStripeHandler(cfg *config.Config) *StripeHandler {
	logger.Logger.Info("Initializing stripe handler")

	db, err := database.GetConnection(cfg.Database)
	if err != nil {
		logger.Logger.Error("Failed to connect to database in stripe handler", "error", err)
		panic(fmt.Sprintf("Failed to connect to database: %s", err))
	}

	logger.Logger.Info("Stripe handler initialized successfully")
	return &StripeHandler{
		db:            db,
		service:       stripe_config.NewStripeConfigService(cfg),
		stripe:        services_v1.NewStripeService(cfg, db),
		webhookSecret: cfg.StripeConfig.WebhookSecret,
	}
}

func (h *StripeHandler) GetSchema(ctx *gin.Context) {
	logger.Logger.Debug("Fetching stripe config schema")

	schemaPath := "./internal/static/stripe-config-schema.json"
	schemaBytes, err := os.ReadFile(schemaPath)
	if err != nil {
		logger.Logger.Error("Failed to load stripe config schema", "path", schemaPath, "error", err)
		handlers.NewInternalServerErrorResponse(ctx,
			fmt.Errorf("Failed to load schema: %s", err),
		)
		return
	}

	var schema interface{}
	if err := json.Unmarshal(schemaBytes, &schema); err != nil {
		logger.Logger.Error("Failed to unmarshal stripe config schema", "error", err)
		handlers.NewInternalServerErrorResponse(ctx,
			fmt.Errorf("Invalid schema file"),
		)
		return
	}

	logger.Logger.Debug("Successfully loaded stripe config schema")
	ctx.Header("Content-Type", "application/schema+json")
	ctx.JSON(http.StatusOK, schema)
}

// StripeConfigResponse represents the Stripe configuration response
type StripeConfigResponse struct {
	// Configuration ID
	ID uuid.UUID `json:"id" binding:"required" example:"e056fa27-151d-4d25-b237-97e9de8d8dbf"`
	// Configuration data with Stripe IDs
	Config models.StripeConfigurationWithIDs `json:"config" binding:"required"`
	// Configuration version
	Version string `json:"version" binding:"required" example:"1.0.0"`
	// Creation timestamp
	CreatedAt string `json:"created_at" binding:"required" example:"2025-11-10T00:29:19Z"`
	// Last update timestamp
	UpdatedAt string `json:"updated_at" binding:"required" example:"2025-11-10T00:29:19Z"`
}

// StripeIDConversionResponse represents the response for Stripe ID to config ID conversion
type StripeIDConversionResponse struct {
	// Stripe ID
	StripeID string `json:"stripe_id" binding:"required" example:"price_1SRiyyCJIZaBlhY1NpAJFhNU"`
	// Config ID
	ConfigID string `json:"config_id" binding:"required" example:"price_test_basic_monthly"`
	// Item type (product, price, or meter)
	ItemType string `json:"item_type" binding:"required" example:"price"`
	// Configuration UUID that this mapping belongs to
	ConfigUUID uuid.UUID `json:"config_uuid" binding:"required" example:"e056fa27-151d-4d25-b237-97e9de8d8dbf"`
	// Number of historical Stripe IDs for this config item
	HistoryCount int `json:"history_count" binding:"required" example:"1"`
}

func (h *StripeHandler) GetConfig(ctx *gin.Context) {
	logger.Logger.Info("Fetching public stripe config")

	var config *models.StripeConfig
	err := h.db.Order("created_at DESC").First(&config).Error
	if err != nil {
		logger.Logger.Error("Error retrieving stripe config", "error", err)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Error retrieving config: %s", err))
		return
	}

	// Parse the configuration and add Stripe IDs
	parsedConfig, err := h.service.ParseAndValidateConfig(config.Config)
	if err != nil {
		logger.Logger.Error("Error parsing stripe config", "error", err)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Error parsing config: %s", err))
		return
	}

	// Filter public prices only
	publicConfig := h.filterPublicPrices(*parsedConfig)

	// Convert to response format with Stripe IDs
	configWithIDs := h.addStripeIDsToConfig(publicConfig, config.ID)

	logger.Logger.Info("Successfully fetched public stripe config", "version", config.Version)
	response := StripeConfigResponse{
		ID:        config.ID,
		Config:    configWithIDs,
		Version:   config.Version,
		CreatedAt: config.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt: config.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}

	handlers.NewSuccessResponse(ctx, response)
}

func (h *StripeHandler) GetConfigAdmin(ctx *gin.Context) {
	logger.Logger.Info("Fetching full stripe config (admin)")

	var config *models.StripeConfig
	err := h.db.Order("created_at DESC").First(&config).Error
	if err != nil {
		logger.Logger.Error("Error retrieving stripe config", "error", err)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Error retrieving config: %s", err))
		return
	}

	// Parse the configuration and add Stripe IDs
	parsedConfig, err := h.service.ParseAndValidateConfig(config.Config)
	if err != nil {
		logger.Logger.Error("Error parsing stripe config", "error", err)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Error parsing config: %s", err))
		return
	}

	// Convert to response format with Stripe IDs (NO FILTERING)
	configWithIDs := h.addStripeIDsToConfig(*parsedConfig, config.ID)

	logger.Logger.Info("Successfully fetched full stripe config (admin)", "version", config.Version)
	response := StripeConfigResponse{
		ID:        config.ID,
		Config:    configWithIDs,
		Version:   config.Version,
		CreatedAt: config.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt: config.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}

	handlers.NewSuccessResponse(ctx, response)
}

// StripeConfigUpdateRequest represents the request body for updating Stripe config
// See /api/v1/stripe/schema for the full JSON schema with nested validation
type StripeConfigUpdateRequest struct {
	// Configuration version (required, semantic version format)
	Version string `json:"version" binding:"required" example:"1.0.0" pattern:"^\\d+\\.\\d+\\.\\d+$"`
	// List of billing meters (optional array, items must be valid meter objects)
	Meters []interface{} `json:"meters,omitempty"`
	// List of products (required array, items must be valid product objects with id, name, and prices)
	Products []interface{} `json:"products" binding:"required"`
}

// StripeConfigValidateRequest represents the request body for validating Stripe config
// See /api/v1/stripe/schema for the full JSON schema with nested validation
type StripeConfigValidateRequest struct {
	// Configuration version (required, semantic version format)
	Version string `json:"version" binding:"required" example:"1.0.0" pattern:"^\\d+\\.\\d+\\.\\d+$"`
	// List of billing meters (optional array, items must be valid meter objects)
	Meters []interface{} `json:"meters,omitempty"`
	// List of products (required array, items must be valid product objects with id, name, and prices)
	Products []interface{} `json:"products" binding:"required"`
}

func (h *StripeHandler) UpdateConfig(ctx *gin.Context) {
	logger.Logger.Info("Received Stripe config update request")
	var configData models.StripeConfigData
	if err := ctx.ShouldBindJSON(&configData); err != nil {
		logger.Logger.Warn("Invalid JSON format in Stripe config update request", "error", err)
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
		handlers.NewBadRequestResponse(ctx, err.Error())
		return
	}

	if len(response.Errors) > 0 {
		handlers.NewBadRequestResponse(ctx, strings.Join(response.Errors, "\n\n"))
		return
	}

	handlers.NewSuccessResponse(ctx, response)
}

// ConfigHistoryItem represents a single configuration history entry
type ConfigHistoryItem struct {
	// Configuration ID
	ID uuid.UUID `json:"id" binding:"required" example:"e056fa27-151d-4d25-b237-97e9de8d8dbf"`
	// Configuration data with Stripe IDs (products and meters arrays are never null, always [] when empty)
	Config models.StripeConfigurationWithIDs `json:"config" binding:"required"`
	// Configuration version
	Version string `json:"version" binding:"required" example:"1.0.0"`
	// Creation timestamp
	CreatedAt string `json:"created_at" binding:"required" example:"2025-11-10T00:29:19Z"`
	// Update timestamp
	UpdatedAt string `json:"updated_at" binding:"required" example:"2025-11-10T00:29:19Z"`
	// Parse error if configuration is invalid
	ParseError *string `json:"parse_error,omitempty" example:"Invalid product configuration"`
}

// ConfigHistoryPagination represents pagination information
type ConfigHistoryPagination struct {
	// Total number of configurations
	Total int64 `json:"total" binding:"required" example:"2"`
	// Current page number
	Page int `json:"page" binding:"required" example:"1"`
	// Items per page
	PerPage int `json:"per_page" binding:"required" example:"10"`
	// Total pages
	TotalPages int `json:"total_pages" binding:"required" example:"1"`
	// Whether there is a next page
	HasNext bool `json:"has_next" binding:"required" example:"false"`
	// Whether there is a previous page
	HasPrev bool `json:"has_prev" binding:"required" example:"false"`
}

// ConfigHistoryResponse represents the configuration history response
type ConfigHistoryResponse struct {
	// List of configuration entries
	Configs []ConfigHistoryItem `json:"configs" binding:"required"`
	// Pagination information
	Pagination ConfigHistoryPagination `json:"pagination" binding:"required"`
}

func (h *StripeHandler) GetConfigHistory(ctx *gin.Context) {
	logger.Logger.Info("Fetching stripe config history")

	// Validate that only expected query parameters are present
	queryParams := ctx.Request.URL.Query()
	for key := range queryParams {
		if key != "limit" && key != "offset" {
			logger.Logger.Warn("Unknown query parameter in config history request", "param", key)
			handlers.NewBadRequestResponse(ctx, fmt.Sprintf("Unknown query parameter: %s", key))
			return
		}
	}

	limit := 10
	offset := 0

	// Check if limit parameter is present (even if empty)
	if limitParam, exists := queryParams["limit"]; exists {
		if len(limitParam) == 0 || limitParam[0] == "" {
			logger.Logger.Warn("Empty limit parameter")
			handlers.NewBadRequestResponse(ctx, "Limit parameter cannot be empty")
			return
		}
		parsedLimit, err := parsePositiveInt(limitParam[0], 0) // Don't auto-cap, we want to validate
		if err != nil {
			logger.Logger.Warn("Invalid limit parameter", "limit", limitParam[0], "error", err)
			handlers.NewBadRequestResponse(ctx, "Invalid limit parameter")
			return
		}
		// Validate limit range
		if parsedLimit < 1 {
			logger.Logger.Warn("Limit must be at least 1", "limit", parsedLimit)
			handlers.NewBadRequestResponse(ctx, "Limit must be at least 1")
			return
		}
		if parsedLimit > 100 {
			logger.Logger.Warn("Limit exceeds maximum", "limit", parsedLimit, "max", 100)
			handlers.NewBadRequestResponse(ctx, "Limit must not exceed 100")
			return
		}
		limit = parsedLimit
	}

	// Check if offset parameter is present (even if empty)
	if offsetParam, exists := queryParams["offset"]; exists {
		if len(offsetParam) == 0 || offsetParam[0] == "" {
			logger.Logger.Warn("Empty offset parameter")
			handlers.NewBadRequestResponse(ctx, "Offset parameter cannot be empty")
			return
		}
		parsedOffset, err := parsePositiveInt(offsetParam[0], 0)
		if err != nil {
			logger.Logger.Warn("Invalid offset parameter", "offset", offsetParam[0], "error", err)
			handlers.NewBadRequestResponse(ctx, "Invalid offset parameter")
			return
		}
		offset = parsedOffset
	}

	logger.Logger.Debug("Config history pagination", "limit", limit, "offset", offset)

	var configs []models.StripeConfig
	var total int64

	// Get total count
	if err := h.db.Model(&models.StripeConfig{}).Count(&total).Error; err != nil {
		logger.Logger.Error("Failed to count stripe configs", "error", err)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to count configs: %s", err))
		return
	}

	// Get paginated results
	err := h.db.Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&configs).Error

	if err != nil {
		logger.Logger.Error("Failed to fetch stripe config history", "error", err)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to fetch config history: %s", err))
		return
	}

	// Add Stripe IDs to each config
	// Initialize with empty slice to ensure it's never null in JSON response
	configsWithIDs := []ConfigHistoryItem{}
	for _, config := range configs {
		parsedConfig, err := h.service.ParseAndValidateConfig(config.Config)
		if err != nil {
			// If parsing fails, include config with parse error and empty config structure
			parseError := err.Error()
			configsWithIDs = append(configsWithIDs, ConfigHistoryItem{
				ID:      config.ID,
				Version: config.Version,
				Config: models.StripeConfigurationWithIDs{
					Version:  config.Version,
					Meters:   []models.MeterWithStripeID{},
					Products: []models.ProductWithStripeIDs{},
				},
				CreatedAt:  config.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
				UpdatedAt:  config.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
				ParseError: &parseError,
			})
			continue
		}

		configWithIDs := h.addStripeIDsToConfig(*parsedConfig, config.ID)
		configsWithIDs = append(configsWithIDs, ConfigHistoryItem{
			ID:        config.ID,
			Config:    configWithIDs,
			Version:   config.Version,
			CreatedAt: config.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
			UpdatedAt: config.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
		})
	}

	totalPages := (int(total) + limit - 1) / limit
	currentPage := (offset / limit) + 1

	logger.Logger.Info("Successfully fetched stripe config history",
		"total", total,
		"page", currentPage,
		"configs_returned", len(configsWithIDs))

	response := ConfigHistoryResponse{
		Configs: configsWithIDs,
		Pagination: ConfigHistoryPagination{
			Total:      total,
			Page:       currentPage,
			PerPage:    limit,
			TotalPages: totalPages,
			HasNext:    currentPage < totalPages,
			HasPrev:    currentPage > 1,
		},
	}

	handlers.NewSuccessResponse(ctx, response)
}

func parsePositiveInt(str string, maxValue int) (int, error) {
	// Reject empty strings
	if str == "" {
		return 0, fmt.Errorf("empty string")
	}

	// Reject strings that contain non-digit characters (including scientific notation, decimals, etc.)
	for _, r := range str {
		if r < '0' || r > '9' {
			return 0, fmt.Errorf("invalid character: %c", r)
		}
	}

	// Parse the integer with bounds checking
	var result int
	for _, r := range str {
		result = result*10 + int(r-'0')
		if maxValue > 0 && result > maxValue {
			return maxValue, nil
		}
	}

	return result, nil
}

func (h *StripeHandler) ValidateConfig(ctx *gin.Context) {
	logger.Logger.Info("Validating stripe config")

	var configData models.StripeConfigData
	if err := ctx.ShouldBindJSON(&configData); err != nil {
		logger.Logger.Warn("Invalid JSON format in validate config request", "error", err)
		handlers.NewBadRequestResponse(ctx, "Invalid JSON format")
		return
	}

	_, err := h.service.ParseAndValidateConfig(configData)
	if err != nil {
		logger.Logger.Warn("Stripe config validation failed", "error", err)
		handlers.NewBadRequestResponse(ctx, err.Error())
		return
	}

	logger.Logger.Info("Stripe config validation successful")
	handlers.NewSuccessResponse(ctx, "")
}

// api/v1/stripe/admin/config/pull [get]
func (h *StripeHandler) PullConfig(ctx *gin.Context) {
	logger.Logger.Info("Pulling stripe config from Stripe API")

	// Fetch meters from Stripe
	logger.Logger.Debug("Fetching billing meters from Stripe")
	meterParams := &stripe.BillingMeterListParams{}
	meterParams.Filters.AddFilter("status", "", "active")

	var stripeMeters []*stripe.BillingMeter
	meterIter := meter.List(meterParams)
	for meterIter.Next() {
		stripeMeters = append(stripeMeters, meterIter.BillingMeter())
	}
	if err := meterIter.Err(); err != nil {
		logger.Logger.Error("Failed to fetch meters from Stripe", "error", err)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to fetch meters: %s", err))
		return
	}
	logger.Logger.Debug("Fetched meters from Stripe", "count", len(stripeMeters))

	logger.Logger.Debug("Fetching products from Stripe")
	productParams := &stripe.ProductListParams{}
	productParams.Filters.AddFilter("active", "", "true")

	var stripeProducts []*stripe.Product
	productIter := product.List(productParams)
	for productIter.Next() {
		stripeProducts = append(stripeProducts, productIter.Product())
	}
	if err := productIter.Err(); err != nil {
		logger.Logger.Error("Failed to fetch products from Stripe", "error", err)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to fetch products: %s", err))
		return
	}
	logger.Logger.Debug("Fetched products from Stripe", "count", len(stripeProducts))

	logger.Logger.Debug("Fetching prices from Stripe")
	priceParams := &stripe.PriceListParams{}
	priceParams.Filters.AddFilter("active", "", "true")
	priceParams.Expand = []*string{stripe.String("data.tiers")}

	var stripePrices []*stripe.Price
	priceIter := price.List(priceParams)
	for priceIter.Next() {
		stripePrices = append(stripePrices, priceIter.Price())
	}
	if err := priceIter.Err(); err != nil {
		logger.Logger.Error("Failed to fetch prices from Stripe", "error", err)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to fetch prices: %w", err))
		return
	}
	logger.Logger.Debug("Fetched prices from Stripe", "count", len(stripePrices))

	// Convert meters to config format
	var configMeters []models.Meter
	for _, stripeMeter := range stripeMeters {
		configMeter := h.convertStripeMeterToConfig(stripeMeter)
		// Generate normalized config ID from display name and preserve Stripe ID
		configMeter.ID = normalizeConfigID(stripeMeter.DisplayName)
		configMeter.StripeID = stripeMeter.ID
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
		// Generate normalized config ID from product name
		normalizedID := normalizeConfigID(stripeProduct.Name)

		configProduct := models.Product{
			ID:          normalizedID,
			StripeID:    stripeProduct.ID, // Preserve original Stripe ID
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
				// Generate normalized config ID for price and preserve Stripe ID
				configPrice.ID = generatePriceConfigID(stripePrice, normalizedID)
				configPrice.StripeID = stripePrice.ID
				configProduct.Prices = append(configProduct.Prices, configPrice)
			}
		}

		if len(configProduct.Prices) > 0 { // Only include products with prices
			configProducts = append(configProducts, configProduct)
		}
	}

	// Fetch webhooks from Stripe
	logger.Logger.Debug("Fetching webhook endpoints from Stripe")
	webhookParams := &stripe.WebhookEndpointListParams{}

	var configWebhooks []models.WebhookEndpointConfig
	webhookIter := webhookendpoint.List(webhookParams)
	for webhookIter.Next() {
		endpoint := webhookIter.WebhookEndpoint()

		// Convert enabled events to string slice
		events := make([]string, len(endpoint.EnabledEvents))
		copy(events, endpoint.EnabledEvents)

		// Connect webhooks are identified by having an Application ID
		isConnect := endpoint.Application != ""

		configWebhooks = append(configWebhooks, models.WebhookEndpointConfig{
			ID:      endpoint.ID,
			URL:     endpoint.URL,
			Events:  events,
			Connect: isConnect,
		})
	}
	if err := webhookIter.Err(); err != nil {
		logger.Logger.Error("Failed to fetch webhooks from Stripe", "error", err)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to fetch webhooks: %s", err))
		return
	}
	logger.Logger.Debug("Fetched webhooks from Stripe", "count", len(configWebhooks))

	// Fetch coupons from Stripe
	logger.Logger.Debug("Fetching coupons from Stripe")
	couponParams := &stripe.CouponListParams{}

	var configCoupons []models.Coupon
	couponIter := coupon.List(couponParams)
	for couponIter.Next() {
		stripeCoupon := couponIter.Coupon()
		configCoupon := h.convertStripeCouponToConfig(stripeCoupon)
		configCoupon.ID = normalizeConfigID(stripeCoupon.Name)
		if configCoupon.ID == "" {
			configCoupon.ID = stripeCoupon.ID
		}
		configCoupon.StripeID = stripeCoupon.ID
		configCoupons = append(configCoupons, configCoupon)
	}
	if err := couponIter.Err(); err != nil {
		logger.Logger.Error("Failed to fetch coupons from Stripe", "error", err)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to fetch coupons: %s", err))
		return
	}
	logger.Logger.Debug("Fetched coupons from Stripe", "count", len(configCoupons))

	// Fetch promotion codes from Stripe
	logger.Logger.Debug("Fetching promotion codes from Stripe")
	promoParams := &stripe.PromotionCodeListParams{}
	promoParams.Filters.AddFilter("active", "", "true")

	var configPromoCodes []models.PromotionCode
	promoIter := promotioncode.List(promoParams)
	for promoIter.Next() {
		stripePromo := promoIter.PromotionCode()
		configPromo := h.convertStripePromoCodeToConfig(stripePromo, configCoupons)
		configPromo.ID = normalizeConfigID(stripePromo.Code)
		if configPromo.ID == "" {
			configPromo.ID = stripePromo.ID
		}
		configPromo.StripeID = stripePromo.ID
		configPromoCodes = append(configPromoCodes, configPromo)
	}
	if err := promoIter.Err(); err != nil {
		logger.Logger.Error("Failed to fetch promotion codes from Stripe", "error", err)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to fetch promotion codes: %s", err))
		return
	}
	logger.Logger.Debug("Fetched promotion codes from Stripe", "count", len(configPromoCodes))

	// Get the latest config version from database if available
	version := "1.0.0" // default
	var latestConfig models.StripeConfig
	if err := h.db.Order("created_at DESC").First(&latestConfig).Error; err == nil {
		if parsedConfig, err := h.service.ParseAndValidateConfig(latestConfig.Config); err == nil {
			version = parsedConfig.Version
		}
	}

	logger.Logger.Info("Successfully pulled stripe config from Stripe API",
		"version", version,
		"webhooks_count", len(configWebhooks),
		"meters_count", len(configMeters),
		"products_count", len(configProducts),
		"coupons_count", len(configCoupons),
		"promo_codes_count", len(configPromoCodes))

	// Ensure arrays are never null
	if configWebhooks == nil {
		configWebhooks = []models.WebhookEndpointConfig{}
	}
	if configMeters == nil {
		configMeters = []models.Meter{}
	}
	if configProducts == nil {
		configProducts = []models.Product{}
	}
	if configCoupons == nil {
		configCoupons = []models.Coupon{}
	}
	if configPromoCodes == nil {
		configPromoCodes = []models.PromotionCode{}
	}

	handlers.NewSuccessResponse(ctx, models.StripeConfiguration{
		Version:        version,
		Webhooks:       configWebhooks,
		Meters:         configMeters,
		Products:       configProducts,
		Coupons:        configCoupons,
		PromotionCodes: configPromoCodes,
	})

}

// ArchiveAllResponse represents the archive all operation response
type ArchiveAllResponse struct {
	// Success message
	Message string `json:"message" binding:"required" example:"Successfully archived all Stripe resources and cleared local config"`
	// List of successfully archived items
	ArchivedItems []string `json:"archived_items" binding:"required"`
	// List of items that failed to archive
	ArchiveErrors []string `json:"archive_errors" binding:"required"`
	// Total number of archived items
	TotalArchived int `json:"total_archived" binding:"required" example:"15"`
	// Total number of errors
	TotalErrors int `json:"total_errors" binding:"required" example:"0"`
	// Warning message if there were errors
	Warning *string `json:"warning,omitempty" example:"Some items failed to archive - see archive_errors for details"`
}

func (h *StripeHandler) ArchiveAllConfig(ctx *gin.Context) {
	logger.Logger.Info("Starting archive all stripe config operation")

	// Fetch meters from Stripe
	logger.Logger.Debug("Fetching active billing meters from Stripe for archival")
	meterParams := &stripe.BillingMeterListParams{}
	meterParams.Filters.AddFilter("status", "", "active")

	var stripeMeters []*stripe.BillingMeter
	meterIter := meter.List(meterParams)
	for meterIter.Next() {
		stripeMeters = append(stripeMeters, meterIter.BillingMeter())
	}
	if err := meterIter.Err(); err != nil {
		logger.Logger.Error("Failed to fetch meters for archival", "error", err)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to fetch meters: %s", err))
		return
	}
	logger.Logger.Debug("Fetched meters for archival", "count", len(stripeMeters))

	// Fetch products from Stripe
	logger.Logger.Debug("Fetching active products from Stripe for archival")
	productParams := &stripe.ProductListParams{}
	productParams.Filters.AddFilter("active", "", "true")

	var stripeProducts []*stripe.Product
	productIter := product.List(productParams)
	for productIter.Next() {
		stripeProducts = append(stripeProducts, productIter.Product())
	}
	if err := productIter.Err(); err != nil {
		logger.Logger.Error("Failed to fetch products for archival", "error", err)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to fetch products: %s", err))
		return
	}
	logger.Logger.Debug("Fetched products for archival", "count", len(stripeProducts))

	// Fetch prices from Stripe
	logger.Logger.Debug("Fetching active prices from Stripe for archival")
	priceParams := &stripe.PriceListParams{}
	priceParams.Filters.AddFilter("active", "", "true")

	var stripePrices []*stripe.Price
	priceIter := price.List(priceParams)
	for priceIter.Next() {
		stripePrices = append(stripePrices, priceIter.Price())
	}
	if err := priceIter.Err(); err != nil {
		logger.Logger.Error("Failed to fetch prices for archival", "error", err)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to fetch prices: %w", err))
		return
	}
	logger.Logger.Debug("Fetched prices for archival", "count", len(stripePrices))

	// Fetch active promotion codes from Stripe
	logger.Logger.Debug("Fetching active promotion codes from Stripe for deactivation")
	promoParams := &stripe.PromotionCodeListParams{}
	promoParams.Filters.AddFilter("active", "", "true")

	var stripePromoCodes []*stripe.PromotionCode
	promoIter := promotioncode.List(promoParams)
	for promoIter.Next() {
		stripePromoCodes = append(stripePromoCodes, promoIter.PromotionCode())
	}
	if err := promoIter.Err(); err != nil {
		logger.Logger.Error("Failed to fetch promotion codes for deactivation", "error", err)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to fetch promotion codes: %s", err))
		return
	}
	logger.Logger.Debug("Fetched promotion codes for deactivation", "count", len(stripePromoCodes))

	// Fetch coupons from Stripe
	logger.Logger.Debug("Fetching coupons from Stripe for deletion")
	couponParams := &stripe.CouponListParams{}

	var stripeCoupons []*stripe.Coupon
	couponIter := coupon.List(couponParams)
	for couponIter.Next() {
		stripeCoupons = append(stripeCoupons, couponIter.Coupon())
	}
	if err := couponIter.Err(); err != nil {
		logger.Logger.Error("Failed to fetch coupons for deletion", "error", err)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to fetch coupons: %s", err))
		return
	}
	logger.Logger.Debug("Fetched coupons for deletion", "count", len(stripeCoupons))

	// Archive all fetched resources
	logger.Logger.Info("Beginning archival process",
		"promo_codes_to_deactivate", len(stripePromoCodes),
		"coupons_to_delete", len(stripeCoupons),
		"meters_to_archive", len(stripeMeters),
		"prices_to_archive", len(stripePrices),
		"products_to_archive", len(stripeProducts))

	var archivedItems []string
	var archiveErrors []string

	// Deactivate promotion codes first (reverse dependency order)
	logger.Logger.Debug("Deactivating promotion codes", "count", len(stripePromoCodes))
	for _, stripePromo := range stripePromoCodes {
		updateParams := &stripe.PromotionCodeParams{
			Active: stripe.Bool(false),
		}
		_, err := promotioncode.Update(stripePromo.ID, updateParams)
		if err != nil {
			logger.Logger.Warn("Failed to deactivate promotion code", "promo_id", stripePromo.ID, "error", err)
			archiveErrors = append(archiveErrors, fmt.Sprintf("promo_code %s: %v", stripePromo.ID, err))
		} else {
			logger.Logger.Debug("Deactivated promotion code", "promo_id", stripePromo.ID, "code", stripePromo.Code)
			archivedItems = append(archivedItems, fmt.Sprintf("promo_code: %s (%s)", stripePromo.ID, stripePromo.Code))
		}
	}

	// Delete coupons (before products since coupons may reference products via applies_to)
	logger.Logger.Debug("Deleting coupons", "count", len(stripeCoupons))
	for _, stripeCoupon := range stripeCoupons {
		_, err := coupon.Del(stripeCoupon.ID, nil)
		if err != nil {
			logger.Logger.Warn("Failed to delete coupon", "coupon_id", stripeCoupon.ID, "error", err)
			archiveErrors = append(archiveErrors, fmt.Sprintf("coupon %s: %v", stripeCoupon.ID, err))
		} else {
			logger.Logger.Debug("Deleted coupon", "coupon_id", stripeCoupon.ID, "name", stripeCoupon.Name)
			archivedItems = append(archivedItems, fmt.Sprintf("coupon: %s (%s)", stripeCoupon.ID, stripeCoupon.Name))
		}
	}

	// Archive meters
	logger.Logger.Debug("Archiving meters", "count", len(stripeMeters))
	for _, stripeMeter := range stripeMeters {
		if err := h.stripe.ArchiveStripeMeter(stripeMeter.ID); err != nil {
			logger.Logger.Warn("Failed to archive meter", "meter_id", stripeMeter.ID, "error", err)
			archiveErrors = append(archiveErrors, fmt.Sprintf("meter %s: %v", stripeMeter.ID, err))
		} else {
			logger.Logger.Debug("Archived meter", "meter_id", stripeMeter.ID, "display_name", stripeMeter.DisplayName)
			archivedItems = append(archivedItems, fmt.Sprintf("meter: %s (%s)", stripeMeter.ID, stripeMeter.DisplayName))
		}
	}

	// Archive prices (before products since prices depend on products)
	logger.Logger.Debug("Archiving prices", "count", len(stripePrices))
	for _, stripePrice := range stripePrices {
		if err := h.stripe.ArchiveStripePrice(stripePrice.ID); err != nil {
			logger.Logger.Warn("Failed to archive price", "price_id", stripePrice.ID, "error", err)
			archiveErrors = append(archiveErrors, fmt.Sprintf("price %s: %v", stripePrice.ID, err))
		} else {
			logger.Logger.Debug("Archived price", "price_id", stripePrice.ID)
			archivedItems = append(archivedItems, fmt.Sprintf("price: %s", stripePrice.ID))
		}
	}

	// Archive products
	logger.Logger.Debug("Archiving products", "count", len(stripeProducts))
	for _, stripeProduct := range stripeProducts {
		if err := h.stripe.ArchiveStripeProduct(stripeProduct.ID); err != nil {
			logger.Logger.Warn("Failed to archive product", "product_id", stripeProduct.ID, "error", err)
			archiveErrors = append(archiveErrors, fmt.Sprintf("product %s: %v", stripeProduct.ID, err))
		} else {
			logger.Logger.Debug("Archived product", "product_id", stripeProduct.ID, "name", stripeProduct.Name)
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
		"version":         version,
		"meters":          []interface{}{},
		"products":        []interface{}{},
		"coupons":         []interface{}{},
		"promotion_codes": []interface{}{},
	}

	// Process the empty config to store it in the database
	logger.Logger.Debug("Saving empty config to database after archival")
	_, err := h.service.ProcessConfigUpdate(emptyConfigData)
	if err != nil {
		logger.Logger.Error("Failed to update local config after archival", "error", err)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to update local config: %s", err))
		return
	}

	// Prepare response
	logger.Logger.Info("Archive all operation completed",
		"total_archived", len(archivedItems),
		"total_errors", len(archiveErrors))

	// Ensure arrays are never null
	if archivedItems == nil {
		archivedItems = []string{}
	}
	if archiveErrors == nil {
		archiveErrors = []string{}
	}

	response := ArchiveAllResponse{
		Message:       "Successfully archived all Stripe resources and cleared local config",
		ArchivedItems: archivedItems,
		ArchiveErrors: archiveErrors,
		TotalArchived: len(archivedItems),
		TotalErrors:   len(archiveErrors),
	}

	if len(archiveErrors) > 0 {
		logger.Logger.Warn("Some items failed to archive", "error_count", len(archiveErrors))
		warning := "Some items failed to archive - see archive_errors for details"
		response.Warning = &warning
	}

	handlers.NewSuccessResponse(ctx, response)
}

// normalizeConfigID converts a name to a normalized config ID (e.g., "Pro Plan" -> "pro_plan")
func normalizeConfigID(name string) string {
	normalized := strings.ToLower(name)
	normalized = strings.ReplaceAll(normalized, " ", "_")
	normalized = strings.ReplaceAll(normalized, "-", "_")

	// Remove special characters, keep only alphanumeric and underscore
	result := ""
	for _, char := range normalized {
		if (char >= 'a' && char <= 'z') || (char >= '0' && char <= '9') || char == '_' {
			result += string(char)
		}
	}

	// Remove consecutive underscores
	for strings.Contains(result, "__") {
		result = strings.ReplaceAll(result, "__", "_")
	}

	// Trim underscores from start and end
	result = strings.Trim(result, "_")

	return result
}

// generatePriceConfigID generates a normalized config ID for a price
// Prices don't have names in Stripe, so we generate from nickname or product+interval
func generatePriceConfigID(stripePrice *stripe.Price, productConfigID string) string {
	// Use nickname if available
	if stripePrice.Nickname != "" {
		return normalizeConfigID(stripePrice.Nickname)
	}

	// Fallback: product_id + interval (or "price" for one-time)
	if stripePrice.Recurring != nil {
		interval := string(stripePrice.Recurring.Interval)
		return fmt.Sprintf("%s_%s", productConfigID, interval)
	}

	return fmt.Sprintf("%s_price", productConfigID)
}

func (h *StripeHandler) convertStripeMeterToConfig(stripeMeter *stripe.BillingMeter) models.Meter {
	configMeter := models.Meter{
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
		Amount:   float64(stripePrice.UnitAmount),
		Currency: string(stripePrice.Currency),
	}

	// Convert tax behavior
	if stripePrice.TaxBehavior == "inclusive" {
		inclusive := true
		configPrice.TaxIncludedInPrice = &inclusive
	}
	// If "exclusive" or empty, leave as nil (defaults to false)

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

func (h *StripeHandler) convertStripeCouponToConfig(stripeCoupon *stripe.Coupon) models.Coupon {
	configCoupon := models.Coupon{
		Name:     stripeCoupon.Name,
		Duration: string(stripeCoupon.Duration),
	}

	if stripeCoupon.PercentOff > 0 {
		percentOff := stripeCoupon.PercentOff
		configCoupon.PercentOff = &percentOff
	}

	if stripeCoupon.AmountOff > 0 {
		configCoupon.AmountOff = &stripeCoupon.AmountOff
		configCoupon.Currency = string(stripeCoupon.Currency)
	}

	if stripeCoupon.DurationInMonths > 0 {
		configCoupon.DurationInMonths = &stripeCoupon.DurationInMonths
	}

	if stripeCoupon.MaxRedemptions > 0 {
		configCoupon.MaxRedemptions = &stripeCoupon.MaxRedemptions
	}

	if stripeCoupon.RedeemBy > 0 {
		configCoupon.RedeemBy = &stripeCoupon.RedeemBy
	}

	if stripeCoupon.AppliesTo != nil && len(stripeCoupon.AppliesTo.Products) > 0 {
		configCoupon.AppliesTo = stripeCoupon.AppliesTo.Products
	}

	if len(stripeCoupon.Metadata) > 0 {
		configCoupon.Metadata = stripeCoupon.Metadata
	}

	return configCoupon
}

func (h *StripeHandler) convertStripePromoCodeToConfig(stripePromo *stripe.PromotionCode, configCoupons []models.Coupon) models.PromotionCode {
	configPromo := models.PromotionCode{
		Code: stripePromo.Code,
	}

	// Find the coupon config ID from the Stripe coupon ID
	if stripePromo.Coupon != nil {
		couponStripeID := stripePromo.Coupon.ID
		// Try to find matching config coupon
		for _, c := range configCoupons {
			if c.StripeID == couponStripeID {
				configPromo.Coupon = c.ID
				break
			}
		}
		// Fallback to Stripe ID if no config match found
		if configPromo.Coupon == "" {
			configPromo.Coupon = couponStripeID
		}
	}

	configPromo.Active = &stripePromo.Active

	if stripePromo.MaxRedemptions > 0 {
		configPromo.MaxRedemptions = &stripePromo.MaxRedemptions
	}

	if stripePromo.Restrictions != nil {
		if stripePromo.Restrictions.FirstTimeTransaction {
			firstTime := true
			configPromo.FirstTimeTransaction = &firstTime
		}
		if stripePromo.Restrictions.MinimumAmount > 0 {
			configPromo.MinimumAmount = &stripePromo.Restrictions.MinimumAmount
			configPromo.MinimumAmountCurrency = string(stripePromo.Restrictions.MinimumAmountCurrency)
		}
	}

	if stripePromo.ExpiresAt > 0 {
		configPromo.ExpiresAt = &stripePromo.ExpiresAt
	}

	if len(stripePromo.Metadata) > 0 {
		configPromo.Metadata = stripePromo.Metadata
	}

	return configPromo
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
		if productStripeID, err := h.service.GetStripeIDByConfigItemID(product.ID, "product"); err == nil && productStripeID != "" {
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
				if priceStripeID, err := h.service.GetStripeIDByConfigItemID(price.ID, "price"); err == nil && priceStripeID != "" {
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

	// Process coupons
	var couponsWithIDs []models.CouponWithStripeID
	for _, cpn := range config.Coupons {
		couponWithIDs := models.CouponWithStripeID{
			Coupon: cpn,
		}

		// Get Stripe coupon ID
		if couponStripeID, err := h.service.GetStripeIDByConfigItemID(cpn.ID, "coupon"); err == nil && couponStripeID != "" {
			couponWithIDs.StripeID = &couponStripeID
		}

		couponsWithIDs = append(couponsWithIDs, couponWithIDs)
	}

	// Ensure coupons is always a valid slice, never null
	if couponsWithIDs == nil {
		couponsWithIDs = []models.CouponWithStripeID{}
	}

	// Process promotion codes
	var promosWithIDs []models.PromotionCodeWithStripeID
	for _, promo := range config.PromotionCodes {
		promoWithIDs := models.PromotionCodeWithStripeID{
			PromotionCode: promo,
		}

		// Get Stripe promotion code ID
		if promoStripeID, err := h.service.GetStripeIDByConfigItemID(promo.ID, "promotion_code"); err == nil && promoStripeID != "" {
			promoWithIDs.StripeID = &promoStripeID
		}

		promosWithIDs = append(promosWithIDs, promoWithIDs)
	}

	// Ensure promotion codes is always a valid slice, never null
	if promosWithIDs == nil {
		promosWithIDs = []models.PromotionCodeWithStripeID{}
	}

	return models.StripeConfigurationWithIDs{
		Version:        config.Version,
		Meters:         metersWithIDs,
		Products:       productsWithIDs,
		Coupons:        couponsWithIDs,
		PromotionCodes: promosWithIDs,
	}
}

// filterPublicPrices filters out prices where public == false and removes products with no public prices
func (h *StripeHandler) filterPublicPrices(config models.StripeConfiguration) models.StripeConfiguration {
	filtered := config
	filtered.Products = []models.Product{}

	for _, product := range config.Products {
		publicPrices := []models.Price{}
		for _, price := range product.Prices {
			// Default to true if public is nil
			if price.Public == nil || *price.Public {
				publicPrices = append(publicPrices, price)
			}
		}

		// Only include products with public prices
		if len(publicPrices) > 0 {
			product.Prices = publicPrices
			filtered.Products = append(filtered.Products, product)
		}
	}

	return filtered
}

func (h *StripeHandler) ConvertStripeIDToConfigID(ctx *gin.Context) {
	stripeID := ctx.Param("stripe_id")

	logger.Logger.Debug("Converting Stripe ID to config ID", "stripe_id", stripeID)

	if stripeID == "" {
		logger.Logger.Warn("Missing stripe_id parameter")
		handlers.NewBadRequestResponse(ctx, "stripe_id is required")
		return
	}

	// Query the database for the mapping - Stripe IDs are unique across all types
	var mapping models.StripeIDMapping
	err := h.db.Where("stripe_id = ?", stripeID).
		Order("created_at DESC").
		First(&mapping).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			logger.Logger.Info("No mapping found for Stripe ID", "stripe_id", stripeID)
			handlers.NewNotFoundResponse(ctx, fmt.Sprintf("No config ID found for stripe_id: %s", stripeID))
			return
		}
		logger.Logger.Error("Failed to query ID mapping", "error", err, "stripe_id", stripeID)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to retrieve mapping: %s", err))
		return
	}

	logger.Logger.Info("Successfully converted Stripe ID to config ID",
		"stripe_id", stripeID,
		"config_id", mapping.ConfigItemID,
		"item_type", mapping.ItemType)

	response := StripeIDConversionResponse{
		StripeID:     mapping.StripeID,
		ConfigID:     mapping.ConfigItemID,
		ItemType:     mapping.ItemType,
		ConfigUUID:   mapping.ConfigID,
		HistoryCount: len(mapping.StripeIDHistory),
	}

	handlers.NewSuccessResponse(ctx, response)
}

// PriceResponse represents a single price with its parent product context
type PriceResponse struct {
	// The price with Stripe ID
	Price models.PriceWithStripeID `json:"price" binding:"required"`
	// The parent product with Stripe IDs
	Product models.ProductWithStripeIDs `json:"product" binding:"required"`
}

// ProductResponse represents a single product with Stripe IDs
type ProductResponse struct {
	// The product with Stripe IDs
	Product models.ProductWithStripeIDs `json:"product" binding:"required"`
}

// MeterResponse represents a single meter with Stripe ID
type MeterResponse struct {
	// The meter with Stripe ID
	Meter models.MeterWithStripeID `json:"meter" binding:"required"`
}

func (h *StripeHandler) GetPriceByID(ctx *gin.Context) {
	priceID := ctx.Param("price_id")
	if priceID == "" {
		handlers.NewBadRequestResponse(ctx, "price_id is required")
		return
	}

	logger.Logger.Debug("Fetching price by ID", "price_id", priceID)

	var config *models.StripeConfig
	if err := h.db.Order("created_at DESC").First(&config).Error; err != nil {
		logger.Logger.Error("Error retrieving stripe config", "error", err)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Error retrieving config: %s", err))
		return
	}

	parsedConfig, err := h.service.ParseAndValidateConfig(config.Config)
	if err != nil {
		logger.Logger.Error("Error parsing stripe config", "error", err)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Error parsing config: %s", err))
		return
	}

	configWithIDs := h.addStripeIDsToConfig(*parsedConfig, config.ID)

	for _, product := range configWithIDs.Products {
		for _, price := range product.Prices {
			if price.ID == priceID {
				logger.Logger.Info("Found price", "price_id", priceID, "product_id", product.ID)
				handlers.NewSuccessResponse(ctx, PriceResponse{
					Price:   price,
					Product: product,
				})
				return
			}
		}
	}

	logger.Logger.Warn("Price not found", "price_id", priceID)
	handlers.NewNotFoundResponse(ctx, fmt.Sprintf("Price not found: %s", priceID))
}

func (h *StripeHandler) GetProductByID(ctx *gin.Context) {
	productID := ctx.Param("product_id")
	if productID == "" {
		handlers.NewBadRequestResponse(ctx, "product_id is required")
		return
	}

	logger.Logger.Debug("Fetching product by ID", "product_id", productID)

	var config *models.StripeConfig
	if err := h.db.Order("created_at DESC").First(&config).Error; err != nil {
		logger.Logger.Error("Error retrieving stripe config", "error", err)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Error retrieving config: %s", err))
		return
	}

	parsedConfig, err := h.service.ParseAndValidateConfig(config.Config)
	if err != nil {
		logger.Logger.Error("Error parsing stripe config", "error", err)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Error parsing config: %s", err))
		return
	}

	configWithIDs := h.addStripeIDsToConfig(*parsedConfig, config.ID)

	for _, product := range configWithIDs.Products {
		if product.ID == productID {
			logger.Logger.Info("Found product", "product_id", productID)
			handlers.NewSuccessResponse(ctx, ProductResponse{Product: product})
			return
		}
	}

	logger.Logger.Warn("Product not found", "product_id", productID)
	handlers.NewNotFoundResponse(ctx, fmt.Sprintf("Product not found: %s", productID))
}

func (h *StripeHandler) GetMeterByID(ctx *gin.Context) {
	meterID := ctx.Param("meter_id")
	if meterID == "" {
		handlers.NewBadRequestResponse(ctx, "meter_id is required")
		return
	}

	logger.Logger.Debug("Fetching meter by ID", "meter_id", meterID)

	var config *models.StripeConfig
	if err := h.db.Order("created_at DESC").First(&config).Error; err != nil {
		logger.Logger.Error("Error retrieving stripe config", "error", err)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Error retrieving config: %s", err))
		return
	}

	parsedConfig, err := h.service.ParseAndValidateConfig(config.Config)
	if err != nil {
		logger.Logger.Error("Error parsing stripe config", "error", err)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Error parsing config: %s", err))
		return
	}

	configWithIDs := h.addStripeIDsToConfig(*parsedConfig, config.ID)

	for _, meter := range configWithIDs.Meters {
		if meter.ID == meterID {
			logger.Logger.Info("Found meter", "meter_id", meterID)
			handlers.NewSuccessResponse(ctx, MeterResponse{Meter: meter})
			return
		}
	}

	logger.Logger.Warn("Meter not found", "meter_id", meterID)
	handlers.NewNotFoundResponse(ctx, fmt.Sprintf("Meter not found: %s", meterID))
}

// WebhookEndpointConfig represents a single webhook endpoint configuration
type WebhookEndpointConfig struct {
	ID      string   `json:"id,omitempty"`
	URL     string   `json:"url" binding:"required"`
	Events  []string `json:"events" binding:"required"`
	Connect bool     `json:"connect,omitempty"`
}

// WebhooksConfigRequest represents the request to configure multiple webhook endpoints
type WebhooksConfigRequest struct {
	Webhooks []WebhookEndpointConfig `json:"webhooks" binding:"required"`
}

// WebhookResult represents the result for a single webhook configuration
type WebhookResult struct {
	ID       string   `json:"id,omitempty"`
	StripeID string   `json:"stripe_id"`
	URL      string   `json:"url"`
	Events   []string `json:"events"`
	Connect  bool     `json:"connect"`
	Secret   string   `json:"secret"`
	Action   string   `json:"action"`
}

// WebhooksConfigResponse represents the response for multiple webhook configurations
type WebhooksConfigResponse struct {
	Webhooks []WebhookResult `json:"webhooks"`
}

// WebhookSecretResponse represents the webhook secret response
type WebhookSecretResponse struct {
	ID        string   `json:"id"`
	StripeID  string   `json:"stripe_id"`
	URL       string   `json:"url"`
	Secret    string   `json:"secret"`
	Events    []string `json:"events"`
	Connect   bool     `json:"connect"`
	CreatedAt string   `json:"created_at,omitempty"`
	UpdatedAt string   `json:"updated_at,omitempty"`
}

// ListWebhooksResponse represents the response for listing all webhooks
type ListWebhooksResponse struct {
	Webhooks []WebhookSecretResponse `json:"webhooks"`
}

// ConfigureWebhooks creates or updates multiple webhook endpoints in Stripe
func (h *StripeHandler) ConfigureWebhooks(ctx *gin.Context) {
	logger.Logger.Info("Received webhooks configuration request")

	var req WebhooksConfigRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		logger.Logger.Warn("Invalid webhooks config request", "error", err)
		handlers.NewBadRequestResponse(ctx, "Invalid request format")
		return
	}

	if len(req.Webhooks) == 0 {
		handlers.NewBadRequestResponse(ctx, "At least one webhook is required")
		return
	}

	// Validate each webhook and check for duplicate IDs and URLs
	seenIDs := make(map[string]bool)
	seenURLs := make(map[string]bool)
	var webhookConfigs []models.WebhookEndpointConfig
	for i, webhook := range req.Webhooks {
		if webhook.URL == "" {
			handlers.NewBadRequestResponse(ctx, fmt.Sprintf("Webhook %d: URL is required", i))
			return
		}
		if seenURLs[webhook.URL] {
			handlers.NewConflictResponse(ctx, fmt.Sprintf("Duplicate webhook URL: %s", webhook.URL))
			return
		}
		seenURLs[webhook.URL] = true
		if len(webhook.Events) == 0 {
			handlers.NewBadRequestResponse(ctx, fmt.Sprintf("Webhook %d: At least one event is required", i))
			return
		}
		for j, event := range webhook.Events {
			if event == "" {
				handlers.NewBadRequestResponse(ctx, fmt.Sprintf("Webhook %d: Event %d cannot be empty", i, j))
				return
			}
		}
		if webhook.ID != "" {
			if seenIDs[webhook.ID] {
				handlers.NewBadRequestResponse(ctx, fmt.Sprintf("Duplicate webhook ID: %s", webhook.ID))
				return
			}
			seenIDs[webhook.ID] = true
		}
		webhookConfigs = append(webhookConfigs, models.WebhookEndpointConfig{
			ID:      webhook.ID,
			URL:     webhook.URL,
			Events:  webhook.Events,
			Connect: webhook.Connect,
		})
	}

	// Process all webhooks together
	serviceResults, err := h.service.ProcessWebhooksConfig(webhookConfigs)
	if err != nil {
		logger.Logger.Error("Failed to configure webhooks", "error", err)
		// Check if this is a Stripe validation error (invalid_request_error)
		errStr := err.Error()
		if strings.Contains(errStr, "invalid_request_error") || strings.Contains(errStr, `"status":400`) {
			handlers.NewBadRequestResponse(ctx, fmt.Sprintf("Failed to configure webhooks: %s", err))
			return
		}
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to configure webhooks: %s", err))
		return
	}

	// Convert service results to handler results
	var results []WebhookResult
	for i, result := range serviceResults {
		results = append(results, WebhookResult{
			ID:       req.Webhooks[i].ID,
			StripeID: result.StripeID,
			URL:      result.URL,
			Events:   result.Events,
			Connect:  result.Connect,
			Secret:   result.Secret,
			Action:   result.Action,
		})
	}

	handlers.NewSuccessResponse(ctx, WebhooksConfigResponse{Webhooks: results})
}

// ListWebhooks retrieves all configured webhooks with their secrets
func (h *StripeHandler) ListWebhooks(ctx *gin.Context) {
	logger.Logger.Info("Listing all webhooks")

	webhooks, err := h.service.ListWebhooks()
	if err != nil {
		logger.Logger.Error("Failed to list webhooks", "error", err)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to list webhooks: %s", err))
		return
	}

	var response []WebhookSecretResponse
	for _, webhook := range webhooks {
		response = append(response, WebhookSecretResponse{
			ID:        webhook.ID.String(),
			StripeID:  webhook.StripeID,
			URL:       webhook.URL,
			Secret:    webhook.Secret,
			Events:    webhook.Events,
			Connect:   webhook.Connect,
			CreatedAt: webhook.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
			UpdatedAt: webhook.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
		})
	}

	// Ensure response is never null
	if response == nil {
		response = []WebhookSecretResponse{}
	}

	handlers.NewSuccessResponse(ctx, ListWebhooksResponse{Webhooks: response})
}

// CalculatePriceCostRequest represents the request to calculate cost for a price
type CalculatePriceCostRequest struct {
	// Quantity of units to calculate cost for
	Quantity int64 `json:"quantity" binding:"required,min=0" example:"1500"`
}

// CalculatePriceCostResponse represents the calculated cost for a price
type CalculatePriceCostResponse struct {
	// The config price ID
	PriceID string `json:"price_id" binding:"required" example:"compute_hourly"`
	// The quantity used for calculation
	Quantity int64 `json:"quantity" binding:"required" example:"1500"`
	// The calculated cost in smallest currency unit (e.g., cents)
	CostCents int64 `json:"cost_cents" binding:"required" example:"15000"`
	// The effective unit cost in smallest currency unit (cost_cents / quantity), 0 if quantity is 0
	EffectiveUnitCostCents float64 `json:"effective_unit_cost_cents" binding:"required" example:"10"`
	// The currency code
	Currency string `json:"currency" binding:"required" example:"usd"`
	// The billing scheme used (per_unit or tiered)
	BillingScheme string `json:"billing_scheme" binding:"required" example:"per_unit"`
	// The tiers mode if tiered pricing (graduated or volume), empty for per_unit
	TiersMode string `json:"tiers_mode,omitempty" example:"graduated"`
}

// CalculatePriceCost calculates the cost for a given quantity of a price
func (h *StripeHandler) CalculatePriceCost(ctx *gin.Context) {
	priceID := ctx.Param("price_id")
	if priceID == "" {
		handlers.NewBadRequestResponse(ctx, "price_id is required")
		return
	}

	var req CalculatePriceCostRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		handlers.NewBadRequestResponse(ctx, "Invalid request: quantity is required and must be >= 0")
		return
	}

	logger.Logger.Debug("Calculating price cost", "price_id", priceID, "quantity", req.Quantity)

	// Get latest config
	var config *models.StripeConfig
	if err := h.db.Order("created_at DESC").First(&config).Error; err != nil {
		logger.Logger.Error("Error retrieving stripe config", "error", err)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Error retrieving config: %s", err))
		return
	}

	parsedConfig, err := h.service.ParseAndValidateConfig(config.Config)
	if err != nil {
		logger.Logger.Error("Error parsing stripe config", "error", err)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Error parsing config: %s", err))
		return
	}

	// Find the price
	var foundPrice *models.Price
	for _, product := range parsedConfig.Products {
		for _, price := range product.Prices {
			if price.ID == priceID {
				foundPrice = &price
				break
			}
		}
		if foundPrice != nil {
			break
		}
	}

	if foundPrice == nil {
		logger.Logger.Warn("Price not found for calculation", "price_id", priceID)
		handlers.NewNotFoundResponse(ctx, fmt.Sprintf("Price not found: %s", priceID))
		return
	}

	// Calculate cost
	costCents := calculatePriceCost(foundPrice, req.Quantity)

	// Calculate effective unit cost
	var effectiveUnitCost float64
	if req.Quantity > 0 {
		effectiveUnitCost = float64(costCents) / float64(req.Quantity)
	}

	billingScheme := foundPrice.BillingScheme
	if billingScheme == "" {
		billingScheme = "per_unit"
	}

	logger.Logger.Info("Calculated price cost",
		"price_id", priceID,
		"quantity", req.Quantity,
		"cost_cents", costCents,
		"billing_scheme", billingScheme)

	handlers.NewSuccessResponse(ctx, CalculatePriceCostResponse{
		PriceID:                priceID,
		Quantity:               req.Quantity,
		CostCents:              costCents,
		EffectiveUnitCostCents: effectiveUnitCost,
		Currency:               foundPrice.Currency,
		BillingScheme:          billingScheme,
		TiersMode:              foundPrice.TiersMode,
	})
}

// calculatePriceCost calculates the cost in cents for a given quantity
func calculatePriceCost(price *models.Price, quantity int64) int64 {
	if quantity <= 0 {
		return 0
	}

	// Check if tiered pricing
	if price.BillingScheme == "tiered" && len(price.Tiers) > 0 {
		return calculateTieredCost(price, quantity)
	}

	// Flat per-unit pricing
	// price.Amount is stored as float64 (already in cents based on the conversion code)
	return int64(price.Amount) * quantity
}

// calculateTieredCost calculates cost for tiered pricing
func calculateTieredCost(price *models.Price, quantity int64) int64 {
	if len(price.Tiers) == 0 {
		return 0
	}

	// Volume pricing: the tier you land in applies to ALL units
	if price.TiersMode == "volume" {
		for _, tier := range price.Tiers {
			upTo := getTierUpTo(tier.UpTo)
			if upTo == -1 || quantity <= upTo {
				// Found the applicable tier
				var cost int64
				if tier.FlatAmount != nil {
					cost += *tier.FlatAmount
				}
				if tier.UnitAmount != nil {
					cost += *tier.UnitAmount * quantity
				}
				return cost
			}
		}
		// Shouldn't reach here if tiers are configured correctly
		return 0
	}

	// Graduated pricing (default): each tier's price applies only to units in that tier
	var totalCost int64
	var remaining = quantity
	var prevUpTo int64 = 0

	for _, tier := range price.Tiers {
		if remaining <= 0 {
			break
		}

		upTo := getTierUpTo(tier.UpTo)

		// Calculate units in this tier
		var tierUnits int64
		if upTo == -1 {
			// Infinite tier - all remaining units
			tierUnits = remaining
		} else {
			tierCapacity := upTo - prevUpTo
			tierUnits = min(remaining, tierCapacity)
		}

		// Add flat amount (only once per tier if we use any units from it)
		if tierUnits > 0 && tier.FlatAmount != nil {
			totalCost += *tier.FlatAmount
		}

		// Add unit-based cost
		if tier.UnitAmount != nil {
			totalCost += *tier.UnitAmount * tierUnits
		}

		remaining -= tierUnits
		if upTo != -1 {
			prevUpTo = upTo
		}
	}

	return totalCost
}

// getTierUpTo extracts the up_to value from a tier
// Returns -1 for infinite ("inf" or 0)
func getTierUpTo(upTo interface{}) int64 {
	if upTo == nil {
		return -1
	}

	switch v := upTo.(type) {
	case string:
		if v == "inf" {
			return -1
		}
		return -1
	case float64:
		if v == 0 {
			return -1
		}
		return int64(v)
	case int64:
		if v == 0 {
			return -1
		}
		return v
	case int:
		if v == 0 {
			return -1
		}
		return int64(v)
	default:
		return -1
	}
}
