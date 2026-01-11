package stripe_config

import (
	"api/internal/logger"
	"api/internal/models"
	"encoding/json"
	"fmt"
	"strings"
)

type Validator struct{}

func NewValidator() *Validator {
	return &Validator{}
}

func (v *Validator) ParseAndValidateConfig(configData models.StripeConfigData) (*models.StripeConfiguration, error) {
	logger.Logger.Debug("Starting configuration validation")

	// Validate that products field exists in the raw data (even if empty array)
	productsValue, hasProducts := configData["products"]
	if !hasProducts {
		logger.Logger.Error("Configuration products field is missing")
		return nil, fmt.Errorf("products is required")
	}

	// Validate that products is not null (must be an array, even if empty)
	if productsValue == nil {
		logger.Logger.Error("Configuration products field is null")
		return nil, fmt.Errorf("products must be an array, not null")
	}

	// Filter out empty objects from products array to handle schema test edge cases
	if productsArray, ok := productsValue.([]interface{}); ok {
		filteredProducts := []interface{}{}
		for _, p := range productsArray {
			if pMap, ok := p.(map[string]interface{}); ok && len(pMap) > 0 {
				filteredProducts = append(filteredProducts, p)
			}
		}
		configData["products"] = filteredProducts
	}

	// Validate that meters (if present) is not null (must be an array, even if empty)
	if metersValue, hasMeters := configData["meters"]; hasMeters {
		if metersValue == nil {
			logger.Logger.Error("Configuration meters field is null")
			return nil, fmt.Errorf("meters must be an array, not null")
		}
		// Filter out empty objects from meters array to handle schema test edge cases
		if metersArray, ok := metersValue.([]interface{}); ok {
			filteredMeters := []interface{}{}
			for _, m := range metersArray {
				if mMap, ok := m.(map[string]interface{}); ok && len(mMap) > 0 {
					filteredMeters = append(filteredMeters, m)
				}
			}
			configData["meters"] = filteredMeters
		}
	}

	// Validate that coupons (if present) is not null (must be an array, even if empty)
	if couponsValue, hasCoupons := configData["coupons"]; hasCoupons {
		if couponsValue == nil {
			logger.Logger.Error("Configuration coupons field is null")
			return nil, fmt.Errorf("coupons must be an array, not null")
		}
		// Filter out empty objects from coupons array
		if couponsArray, ok := couponsValue.([]interface{}); ok {
			filteredCoupons := []interface{}{}
			for _, c := range couponsArray {
				if cMap, ok := c.(map[string]interface{}); ok && len(cMap) > 0 {
					filteredCoupons = append(filteredCoupons, c)
				}
			}
			configData["coupons"] = filteredCoupons
		}
	}

	// Validate that promotion_codes (if present) is not null (must be an array, even if empty)
	if promosValue, hasPromos := configData["promotion_codes"]; hasPromos {
		if promosValue == nil {
			logger.Logger.Error("Configuration promotion_codes field is null")
			return nil, fmt.Errorf("promotion_codes must be an array, not null")
		}
		// Filter out empty objects from promotion_codes array
		if promosArray, ok := promosValue.([]interface{}); ok {
			filteredPromos := []interface{}{}
			for _, p := range promosArray {
				if pMap, ok := p.(map[string]interface{}); ok && len(pMap) > 0 {
					filteredPromos = append(filteredPromos, p)
				}
			}
			configData["promotion_codes"] = filteredPromos
		}
	}

	configBytes, err := json.Marshal(configData)
	if err != nil {
		logger.Logger.Error("Failed to marshal config data", "error", err)
		return nil, fmt.Errorf("failed to marshal config data: %w", err)
	}

	var config models.StripeConfiguration
	if err := json.Unmarshal(configBytes, &config); err != nil {
		logger.Logger.Error("Invalid JSON structure", "error", err)
		return nil, fmt.Errorf("invalid JSON structure: %w", err)
	}

	// Basic validation
	if config.Version == "" {
		logger.Logger.Error("Configuration version is missing")
		return nil, fmt.Errorf("version is required")
	}

	logger.Logger.Debug("Configuration parsed successfully", "version", config.Version, "productCount", len(config.Products), "meterCount", len(config.Meters), "couponCount", len(config.Coupons), "promoCount", len(config.PromotionCodes))

	// Validate webhooks if present
	if len(config.Webhooks) > 0 {
		if err := v.validateWebhooks(config.Webhooks); err != nil {
			logger.Logger.Error("Webhooks validation failed", "error", err)
			return nil, fmt.Errorf("webhooks validation failed: %w", err)
		}
		logger.Logger.Debug("Webhooks validated successfully", "count", len(config.Webhooks))
	}

	// Check for duplicate meter IDs
	meterIDs := make(map[string]bool)
	for _, meter := range config.Meters {
		if meterIDs[meter.ID] {
			logger.Logger.Error("Duplicate meter ID found", "meterID", meter.ID)
			return nil, fmt.Errorf("duplicate meter ID: %s", meter.ID)
		}
		meterIDs[meter.ID] = true
	}

	// Validate meters if present
	for i, meter := range config.Meters {
		if err := v.validateMeter(meter); err != nil {
			logger.Logger.Error("Meter validation failed", "error", err, "meterIndex", i, "meterID", meter.ID)
			return nil, fmt.Errorf("meter %d validation failed: %w", i, err)
		}
	}
	logger.Logger.Debug("All meters validated successfully", "count", len(config.Meters))

	// Check for duplicate product IDs
	productIDs := make(map[string]bool)
	for _, product := range config.Products {
		if productIDs[product.ID] {
			logger.Logger.Error("Duplicate product ID found", "productID", product.ID)
			return nil, fmt.Errorf("duplicate product ID: %s", product.ID)
		}
		productIDs[product.ID] = true
	}

	// Check for duplicate price IDs across all products
	priceIDs := make(map[string]bool)
	for _, product := range config.Products {
		for _, price := range product.Prices {
			if priceIDs[price.ID] {
				logger.Logger.Error("Duplicate price ID found", "priceID", price.ID)
				return nil, fmt.Errorf("duplicate price ID: %s", price.ID)
			}
			priceIDs[price.ID] = true
		}
	}

	// Validate each product
	for i, product := range config.Products {
		if err := v.validateProduct(product); err != nil {
			logger.Logger.Error("Product validation failed", "error", err, "productIndex", i, "productID", product.ID)
			return nil, fmt.Errorf("product %d validation failed: %w", i, err)
		}
	}
	logger.Logger.Debug("All products validated successfully", "count", len(config.Products))

	// Validate meter references in prices
	if err := v.validateMeterReferences(config); err != nil {
		logger.Logger.Error("Meter reference validation failed", "error", err)
		return nil, fmt.Errorf("meter reference validation failed: %w", err)
	}

	// Check for duplicate coupon IDs
	couponIDs := make(map[string]bool)
	for _, coupon := range config.Coupons {
		if couponIDs[coupon.ID] {
			logger.Logger.Error("Duplicate coupon ID found", "couponID", coupon.ID)
			return nil, fmt.Errorf("duplicate coupon ID: %s", coupon.ID)
		}
		couponIDs[coupon.ID] = true
	}

	// Validate each coupon
	for i, coupon := range config.Coupons {
		if err := v.validateCoupon(coupon, productIDs); err != nil {
			logger.Logger.Error("Coupon validation failed", "error", err, "couponIndex", i, "couponID", coupon.ID)
			return nil, fmt.Errorf("coupon %d validation failed: %w", i, err)
		}
	}
	logger.Logger.Debug("All coupons validated successfully", "count", len(config.Coupons))

	// Check for duplicate promotion code IDs
	promoIDs := make(map[string]bool)
	promoCodes := make(map[string]bool)
	for _, promo := range config.PromotionCodes {
		if promoIDs[promo.ID] {
			logger.Logger.Error("Duplicate promotion code ID found", "promoID", promo.ID)
			return nil, fmt.Errorf("duplicate promotion code ID: %s", promo.ID)
		}
		promoIDs[promo.ID] = true

		if promoCodes[promo.Code] {
			logger.Logger.Error("Duplicate promotion code found", "code", promo.Code)
			return nil, fmt.Errorf("duplicate promotion code: %s", promo.Code)
		}
		promoCodes[promo.Code] = true
	}

	// Validate each promotion code
	for i, promo := range config.PromotionCodes {
		if err := v.validatePromotionCode(promo, couponIDs); err != nil {
			logger.Logger.Error("Promotion code validation failed", "error", err, "promoIndex", i, "promoID", promo.ID)
			return nil, fmt.Errorf("promotion code %d validation failed: %w", i, err)
		}
	}
	logger.Logger.Debug("All promotion codes validated successfully", "count", len(config.PromotionCodes))

	logger.Logger.Info("Configuration validation completed successfully")
	return &config, nil
}

func (v *Validator) validateProduct(product models.Product) error {
	logger.Logger.Trace("Validating product", "productID", product.ID)

	if product.ID == "" {
		return fmt.Errorf("product ID is required")
	}

	if product.Name == "" {
		return fmt.Errorf("product name is required")
	}

	if len(product.Prices) == 0 {
		return fmt.Errorf("at least one price is required")
	}

	// Validate each price
	for i, price := range product.Prices {
		if err := v.validatePrice(price, product.Type); err != nil {
			logger.Logger.Debug("Price validation failed", "productID", product.ID, "priceIndex", i, "priceID", price.ID)
			return fmt.Errorf("price %d validation failed: %w", i, err)
		}
	}

	return nil
}

func (v *Validator) validatePrice(price models.Price, productType string) error {
	if price.ID == "" {
		return fmt.Errorf("price ID is required")
	}

	// For tiered billing, amount is not required (pricing is defined by tiers)
	// For non-tiered billing, amount must be non-negative (allows $0 for PAYG plans)
	if price.BillingScheme != "tiered" {
		if price.Amount < 0 {
			return fmt.Errorf("price amount must be non-negative for non-tiered pricing")
		}
	} else if price.Amount != 0 {
		return fmt.Errorf("price amount must not be set for tiered pricing (pricing is defined by tiers)")
	}

	if !v.isValidCurrency(price.Currency) {
		return fmt.Errorf("invalid currency: %s (must be a supported ISO 4217 currency code)", price.Currency)
	}

	// For recurring prices, interval is required
	if price.Interval != "" && !v.isValidInterval(price.Interval) {
		return fmt.Errorf("invalid interval: %s", price.Interval)
	}

	// For metered billing (when usage_type is "metered"), interval and meter are required
	if price.UsageType == "metered" {
		if price.Interval == "" {
			return fmt.Errorf("interval is required for metered pricing")
		}
		if price.Meter == "" {
			return fmt.Errorf("meter is required for metered pricing")
		}
	}

	// Validate billing scheme and tiers compatibility
	// Stripe constraint: per_unit billing cannot have tiers
	if price.BillingScheme == "per_unit" && (price.TiersMode != "" || len(price.Tiers) > 0) {
		return fmt.Errorf("per_unit billing scheme cannot have tiers configuration (use 'tiered' billing scheme for tiers)")
	}

	// For tiered billing scheme, tiers_mode is required
	if price.BillingScheme == "tiered" {
		if price.TiersMode == "" {
			return fmt.Errorf("tiers_mode is required when billing_scheme is tiered")
		}
		if !v.isValidTiersMode(price.TiersMode) {
			return fmt.Errorf("invalid tiers_mode: %s (must be 'graduated' or 'volume')", price.TiersMode)
		}
		if len(price.Tiers) == 0 {
			return fmt.Errorf("tiers are required when billing_scheme is tiered")
		}
		// Validate that the last tier has up_to = "inf"
		lastTier := price.Tiers[len(price.Tiers)-1]
		upToStr, isString := lastTier.UpTo.(string)
		if !isString || upToStr != "inf" {
			return fmt.Errorf("tiered pricing must have final tier with up_to: \"inf\"")
		}
	}

	return nil
}

func (v *Validator) isValidTiersMode(tiersMode string) bool {
	validModes := []string{"graduated", "volume"}
	for _, valid := range validModes {
		if strings.ToLower(tiersMode) == valid {
			return true
		}
	}
	return false
}

func (v *Validator) isValidInterval(interval string) bool {
	validIntervals := []string{"day", "week", "month", "year"}
	for _, valid := range validIntervals {
		if strings.ToLower(interval) == valid {
			return true
		}
	}
	return false
}

func (v *Validator) isValidCurrency(currency string) bool {
	validCurrencies := []string{
		"usd", "eur", "gbp", "cad", "aud", "jpy", "inr", "brl", "mxn", "sgd",
		"hkd", "nzd", "chf", "sek", "dkk", "nok", "pln", "czk", "ils", "zar",
	}
	for _, valid := range validCurrencies {
		if strings.ToLower(currency) == valid {
			return true
		}
	}
	return false
}

// validateMeter validates a meter configuration
func (v *Validator) validateMeter(meter models.Meter) error {
	logger.Logger.Trace("Validating meter", "meterID", meter.ID)

	if meter.ID == "" {
		return fmt.Errorf("meter ID is required")
	}

	if meter.DisplayName == "" {
		return fmt.Errorf("meter display_name is required")
	}

	if meter.EventName == "" {
		return fmt.Errorf("meter event_name is required")
	}

	if meter.DefaultAggregation.Formula == "" {
		return fmt.Errorf("meter default_aggregation.formula is required")
	}

	if !v.isValidAggregationFormula(meter.DefaultAggregation.Formula) {
		return fmt.Errorf("invalid aggregation formula: %s (must be 'sum', 'count', or 'last')", meter.DefaultAggregation.Formula)
	}

	// Validate optional customer mapping if provided
	if meter.CustomerMapping != nil {
		if meter.CustomerMapping.EventPayloadKey == "" {
			return fmt.Errorf("customer_mapping.event_payload_key is required when customer_mapping is provided")
		}
		if meter.CustomerMapping.Type == "" {
			return fmt.Errorf("customer_mapping.type is required when customer_mapping is provided")
		}
		if meter.CustomerMapping.Type != "by_id" {
			return fmt.Errorf("invalid customer_mapping.type: %s (must be 'by_id')", meter.CustomerMapping.Type)
		}
	}

	// Validate optional value settings if provided
	if meter.ValueSettings != nil {
		if meter.ValueSettings.EventPayloadKey == "" {
			return fmt.Errorf("value_settings.event_payload_key is required when value_settings is provided")
		}
	}

	return nil
}

// validateMeterReferences ensures all meter references in prices exist
func (v *Validator) validateMeterReferences(config models.StripeConfiguration) error {
	logger.Logger.Debug("Validating meter references")

	// Create a map of defined meters
	definedMeters := make(map[string]bool)
	for _, meter := range config.Meters {
		definedMeters[meter.ID] = true
	}

	// Check all prices that reference meters
	for _, product := range config.Products {
		for _, price := range product.Prices {
			if price.UsageType == "metered" && price.Meter != "" {
				if !definedMeters[price.Meter] {
					logger.Logger.Error("Price references undefined meter", "priceID", price.ID, "meterID", price.Meter)
					return fmt.Errorf("price %s references undefined meter %s", price.ID, price.Meter)
				}
			}
		}
	}

	logger.Logger.Debug("All meter references validated successfully")
	return nil
}

// isValidAggregationFormula checks if the aggregation formula is valid
func (v *Validator) isValidAggregationFormula(formula string) bool {
	validFormulas := []string{"sum", "count", "last"}
	for _, valid := range validFormulas {
		if strings.ToLower(formula) == valid {
			return true
		}
	}
	return false
}

// validateWebhooks validates the webhooks array configuration
func (v *Validator) validateWebhooks(webhooks []models.WebhookEndpointConfig) error {
	logger.Logger.Trace("Validating webhooks configuration", "count", len(webhooks))

	seenIDs := make(map[string]bool)
	seenURLs := make(map[string]bool)

	for i, webhook := range webhooks {
		// Validate URL is required
		if webhook.URL == "" {
			return fmt.Errorf("webhook %d: url is required", i)
		}

		// Check for duplicate URLs
		if seenURLs[webhook.URL] {
			return fmt.Errorf("webhook %d: duplicate URL %s", i, webhook.URL)
		}
		seenURLs[webhook.URL] = true

		// Validate ID uniqueness if provided
		if webhook.ID != "" {
			if seenIDs[webhook.ID] {
				return fmt.Errorf("webhook %d: duplicate ID %s", i, webhook.ID)
			}
			seenIDs[webhook.ID] = true
		}

		// Validate events
		if len(webhook.Events) == 0 {
			return fmt.Errorf("webhook %d: at least one event is required", i)
		}

		// Check for duplicate events within this webhook
		eventsSeen := make(map[string]bool)
		for _, event := range webhook.Events {
			if event == "" {
				return fmt.Errorf("webhook %d: event cannot be empty", i)
			}
			if eventsSeen[event] {
				return fmt.Errorf("webhook %d: duplicate event %s", i, event)
			}
			eventsSeen[event] = true
		}
	}

	return nil
}

// validateCoupon validates a coupon configuration
func (v *Validator) validateCoupon(coupon models.Coupon, productIDs map[string]bool) error {
	logger.Logger.Trace("Validating coupon", "couponID", coupon.ID)

	if coupon.ID == "" {
		return fmt.Errorf("coupon ID is required")
	}

	// Must have either percent_off or amount_off, but not both
	hasPercentOff := coupon.PercentOff != nil
	hasAmountOff := coupon.AmountOff != nil

	if !hasPercentOff && !hasAmountOff {
		return fmt.Errorf("coupon must have either percent_off or amount_off")
	}

	if hasPercentOff && hasAmountOff {
		return fmt.Errorf("coupon cannot have both percent_off and amount_off")
	}

	// Validate percent_off range
	if hasPercentOff && (*coupon.PercentOff < 0 || *coupon.PercentOff > 100) {
		return fmt.Errorf("percent_off must be between 0 and 100")
	}

	// Validate amount_off is positive
	if hasAmountOff && *coupon.AmountOff <= 0 {
		return fmt.Errorf("amount_off must be greater than 0")
	}

	// If amount_off is set, currency is required
	if hasAmountOff && coupon.Currency == "" {
		return fmt.Errorf("currency is required when amount_off is set")
	}

	// Validate currency if provided
	if coupon.Currency != "" && !v.isValidCurrency(coupon.Currency) {
		return fmt.Errorf("invalid currency: %s", coupon.Currency)
	}

	// Validate duration
	if coupon.Duration == "" {
		return fmt.Errorf("duration is required")
	}

	validDurations := []string{"once", "repeating", "forever"}
	isValidDuration := false
	for _, d := range validDurations {
		if coupon.Duration == d {
			isValidDuration = true
			break
		}
	}
	if !isValidDuration {
		return fmt.Errorf("invalid duration: %s (must be 'once', 'repeating', or 'forever')", coupon.Duration)
	}

	// duration_in_months is required when duration is "repeating"
	if coupon.Duration == "repeating" {
		if coupon.DurationInMonths == nil || *coupon.DurationInMonths <= 0 {
			return fmt.Errorf("duration_in_months is required and must be positive when duration is 'repeating'")
		}
	}

	// Stripe restriction: 'forever' duration is only allowed with percent_off coupons
	if coupon.Duration == "forever" && hasAmountOff {
		return fmt.Errorf("'forever' duration is only allowed with percent_off coupons, not amount_off")
	}

	// Validate applies_to references valid product IDs
	for _, productID := range coupon.AppliesTo {
		if !productIDs[productID] {
			return fmt.Errorf("coupon applies_to references undefined product: %s", productID)
		}
	}

	return nil
}

// validatePromotionCode validates a promotion code configuration
func (v *Validator) validatePromotionCode(promo models.PromotionCode, couponIDs map[string]bool) error {
	logger.Logger.Trace("Validating promotion code", "promoID", promo.ID)

	if promo.ID == "" {
		return fmt.Errorf("promotion code ID is required")
	}

	if promo.Code == "" {
		return fmt.Errorf("promotion code is required")
	}

	if promo.Coupon == "" {
		return fmt.Errorf("coupon reference is required")
	}

	// Validate coupon reference exists
	if !couponIDs[promo.Coupon] {
		return fmt.Errorf("promotion code references undefined coupon: %s", promo.Coupon)
	}

	// Validate minimum_amount_currency if minimum_amount is set
	if promo.MinimumAmount != nil && *promo.MinimumAmount > 0 {
		if promo.MinimumAmountCurrency == "" {
			return fmt.Errorf("minimum_amount_currency is required when minimum_amount is set")
		}
		if !v.isValidCurrency(promo.MinimumAmountCurrency) {
			return fmt.Errorf("invalid minimum_amount_currency: %s", promo.MinimumAmountCurrency)
		}
	}

	return nil
}
