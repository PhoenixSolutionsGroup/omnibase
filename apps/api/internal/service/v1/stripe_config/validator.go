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
	logger.Logger.Debug("Configuration parsed successfully", "version", config.Version, "productCount", len(config.Products), "meterCount", len(config.Meters))

	// Validate meters if present
	for i, meter := range config.Meters {
		if err := v.validateMeter(meter); err != nil {
			logger.Logger.Error("Meter validation failed", "error", err, "meterIndex", i, "meterID", meter.ID)
			return nil, fmt.Errorf("meter %d validation failed: %w", i, err)
		}
	}
	logger.Logger.Debug("All meters validated successfully", "count", len(config.Meters))

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
	// For non-tiered billing, amount is required and must be non-negative
	if price.BillingScheme != "tiered" {
		if price.Amount <= 0 {
			return fmt.Errorf("price amount is required and must be positive for non-tiered pricing")
		}
	} else if price.Amount != 0 {
		return fmt.Errorf("price amount must not be set for tiered pricing (pricing is defined by tiers)")
	}

	if len(price.Currency) != 3 {
		return fmt.Errorf("currency must be a 3-character ISO code")
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
