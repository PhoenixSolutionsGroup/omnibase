package stripe_config

import (
	"encoding/json"
	"fmt"
	"strings"

)

type Validator struct{}

func NewValidator() *Validator {
	return &Validator{}
}

func (v *Validator) ParseAndValidateConfig(configData ConfigData) (*Configuration, error) {
	productsValue, hasProducts := configData["products"]
	if !hasProducts {
		return nil, fmt.Errorf("products is required")
	}
	if productsValue == nil {
		return nil, fmt.Errorf("products must be an array, not null")
	}

	filterEmptyObjects(configData, "products")

	for _, key := range []string{"meters", "coupons", "promotion_codes"} {
		val, present := configData[key]
		if !present {
			continue
		}
		if val == nil {
			return nil, fmt.Errorf("%s must be an array, not null", key)
		}
		filterEmptyObjects(configData, key)
	}

	configBytes, err := json.Marshal(configData)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal config data: %w", err)
	}
	var config Configuration
	if err := json.Unmarshal(configBytes, &config); err != nil {
		return nil, fmt.Errorf("invalid JSON structure: %w", err)
	}

	if config.Version == "" {
		return nil, fmt.Errorf("version is required")
	}

	if len(config.Webhooks) > 0 {
		if err := v.validateWebhooks(config.Webhooks); err != nil {
			return nil, fmt.Errorf("webhooks validation failed: %w", err)
		}
	}

	meterIDs := make(map[string]bool)
	for _, m := range config.Meters {
		if meterIDs[m.ID] {
			return nil, fmt.Errorf("duplicate meter ID: %s", m.ID)
		}
		meterIDs[m.ID] = true
	}
	for i, m := range config.Meters {
		if err := v.validateMeter(m); err != nil {
			return nil, fmt.Errorf("meter %d validation failed: %w", i, err)
		}
	}

	productIDs := make(map[string]bool)
	for _, p := range config.Products {
		if productIDs[p.ID] {
			return nil, fmt.Errorf("duplicate product ID: %s", p.ID)
		}
		productIDs[p.ID] = true
	}
	priceIDs := make(map[string]bool)
	for _, p := range config.Products {
		for _, price := range p.Prices {
			if priceIDs[price.ID] {
				return nil, fmt.Errorf("duplicate price ID: %s", price.ID)
			}
			priceIDs[price.ID] = true
		}
	}
	for i, p := range config.Products {
		if err := v.validateProduct(p); err != nil {
			return nil, fmt.Errorf("product %d validation failed: %w", i, err)
		}
	}
	if err := v.validateMeterReferences(config); err != nil {
		return nil, fmt.Errorf("meter reference validation failed: %w", err)
	}

	couponIDs := make(map[string]bool)
	for _, c := range config.Coupons {
		if couponIDs[c.ID] {
			return nil, fmt.Errorf("duplicate coupon ID: %s", c.ID)
		}
		couponIDs[c.ID] = true
	}
	for i, c := range config.Coupons {
		if err := v.validateCoupon(c, productIDs); err != nil {
			return nil, fmt.Errorf("coupon %d validation failed: %w", i, err)
		}
	}

	promoIDs := make(map[string]bool)
	promoCodes := make(map[string]bool)
	for _, p := range config.PromotionCodes {
		if promoIDs[p.ID] {
			return nil, fmt.Errorf("duplicate promotion code ID: %s", p.ID)
		}
		promoIDs[p.ID] = true
		if promoCodes[p.Code] {
			return nil, fmt.Errorf("duplicate promotion code: %s", p.Code)
		}
		promoCodes[p.Code] = true
	}
	for i, p := range config.PromotionCodes {
		if err := v.validatePromotionCode(p, couponIDs); err != nil {
			return nil, fmt.Errorf("promotion code %d validation failed: %w", i, err)
		}
	}

	return &config, nil
}

func filterEmptyObjects(configData ConfigData, key string) {
	arr, ok := configData[key].([]interface{})
	if !ok {
		return
	}
	filtered := []interface{}{}
	for _, item := range arr {
		if m, ok := item.(map[string]interface{}); ok && len(m) > 0 {
			filtered = append(filtered, item)
		}
	}
	configData[key] = filtered
}

func (v *Validator) validateProduct(product Product) error {
	if product.ID == "" {
		return fmt.Errorf("product ID is required")
	}
	if product.Name == "" {
		return fmt.Errorf("product name is required")
	}
	if len(product.Prices) == 0 {
		return fmt.Errorf("at least one price is required")
	}
	for i, p := range product.Prices {
		if err := v.validatePrice(p, product.Type); err != nil {
			return fmt.Errorf("price %d validation failed: %w", i, err)
		}
	}
	return nil
}

func (v *Validator) validatePrice(price Price, productType string) error {
	if price.ID == "" {
		return fmt.Errorf("price ID is required")
	}
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
	if price.Interval != "" && !v.isValidInterval(price.Interval) {
		return fmt.Errorf("invalid interval: %s", price.Interval)
	}
	if price.UsageType == "metered" {
		if price.Interval == "" {
			return fmt.Errorf("interval is required for metered pricing")
		}
		if price.Meter == "" {
			return fmt.Errorf("meter is required for metered pricing")
		}
	}
	if price.BillingScheme == "per_unit" && (price.TiersMode != "" || len(price.Tiers) > 0) {
		return fmt.Errorf("per_unit billing scheme cannot have tiers configuration (use 'tiered' billing scheme for tiers)")
	}
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
		lastTier := price.Tiers[len(price.Tiers)-1]
		upToStr, isString := lastTier.UpTo.(string)
		if !isString || upToStr != "inf" {
			return fmt.Errorf("tiered pricing must have final tier with up_to: \"inf\"")
		}
	}
	return nil
}

func (v *Validator) isValidTiersMode(tiersMode string) bool {
	for _, valid := range []string{"graduated", "volume"} {
		if strings.ToLower(tiersMode) == valid {
			return true
		}
	}
	return false
}

func (v *Validator) isValidInterval(interval string) bool {
	for _, valid := range []string{"day", "week", "month", "year"} {
		if strings.ToLower(interval) == valid {
			return true
		}
	}
	return false
}

func (v *Validator) isValidCurrency(currency string) bool {
	for _, valid := range []string{
		"usd", "eur", "gbp", "cad", "aud", "jpy", "inr", "brl", "mxn", "sgd",
		"hkd", "nzd", "chf", "sek", "dkk", "nok", "pln", "czk", "ils", "zar",
	} {
		if strings.ToLower(currency) == valid {
			return true
		}
	}
	return false
}

func (v *Validator) validateMeter(meter Meter) error {
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
	if meter.ValueSettings != nil && meter.ValueSettings.EventPayloadKey == "" {
		return fmt.Errorf("value_settings.event_payload_key is required when value_settings is provided")
	}
	return nil
}

func (v *Validator) validateMeterReferences(config Configuration) error {
	defined := make(map[string]bool)
	for _, m := range config.Meters {
		defined[m.ID] = true
	}
	for _, p := range config.Products {
		for _, price := range p.Prices {
			if price.UsageType == "metered" && price.Meter != "" && !defined[price.Meter] {
				return fmt.Errorf("price %s references undefined meter %s", price.ID, price.Meter)
			}
		}
	}
	return nil
}

func (v *Validator) isValidAggregationFormula(formula string) bool {
	for _, valid := range []string{"sum", "count", "last"} {
		if strings.ToLower(formula) == valid {
			return true
		}
	}
	return false
}

func (v *Validator) validateWebhooks(webhooks []WebhookEndpointConfig) error {
	seenIDs := make(map[string]bool)
	seenURLs := make(map[string]bool)
	for i, w := range webhooks {
		if w.URL == "" {
			return fmt.Errorf("webhook %d: url is required", i)
		}
		if seenURLs[w.URL] {
			return fmt.Errorf("webhook %d: duplicate URL %s", i, w.URL)
		}
		seenURLs[w.URL] = true
		if w.ID != "" {
			if seenIDs[w.ID] {
				return fmt.Errorf("webhook %d: duplicate ID %s", i, w.ID)
			}
			seenIDs[w.ID] = true
		}
		if len(w.Events) == 0 {
			return fmt.Errorf("webhook %d: at least one event is required", i)
		}
		eventsSeen := make(map[string]bool)
		for _, ev := range w.Events {
			if ev == "" {
				return fmt.Errorf("webhook %d: event cannot be empty", i)
			}
			if eventsSeen[ev] {
				return fmt.Errorf("webhook %d: duplicate event %s", i, ev)
			}
			eventsSeen[ev] = true
		}
	}
	return nil
}

func (v *Validator) validateCoupon(coupon Coupon, productIDs map[string]bool) error {
	if coupon.ID == "" {
		return fmt.Errorf("coupon ID is required")
	}
	hasPercentOff := coupon.PercentOff != nil
	hasAmountOff := coupon.AmountOff != nil
	if !hasPercentOff && !hasAmountOff {
		return fmt.Errorf("coupon must have either percent_off or amount_off")
	}
	if hasPercentOff && hasAmountOff {
		return fmt.Errorf("coupon cannot have both percent_off and amount_off")
	}
	if hasPercentOff && (*coupon.PercentOff < 0 || *coupon.PercentOff > 100) {
		return fmt.Errorf("percent_off must be between 0 and 100")
	}
	if hasAmountOff && *coupon.AmountOff <= 0 {
		return fmt.Errorf("amount_off must be greater than 0")
	}
	if hasAmountOff && coupon.Currency == "" {
		return fmt.Errorf("currency is required when amount_off is set")
	}
	if coupon.Currency != "" && !v.isValidCurrency(coupon.Currency) {
		return fmt.Errorf("invalid currency: %s", coupon.Currency)
	}
	if coupon.Duration == "" {
		return fmt.Errorf("duration is required")
	}
	valid := false
	for _, d := range []string{"once", "repeating", "forever"} {
		if coupon.Duration == d {
			valid = true
			break
		}
	}
	if !valid {
		return fmt.Errorf("invalid duration: %s (must be 'once', 'repeating', or 'forever')", coupon.Duration)
	}
	if coupon.Duration == "repeating" {
		if coupon.DurationInMonths == nil || *coupon.DurationInMonths <= 0 {
			return fmt.Errorf("duration_in_months is required and must be positive when duration is 'repeating'")
		}
	}
	if coupon.Duration == "forever" && hasAmountOff {
		return fmt.Errorf("'forever' duration is only allowed with percent_off coupons, not amount_off")
	}
	for _, productID := range coupon.AppliesTo {
		if !productIDs[productID] {
			return fmt.Errorf("coupon applies_to references undefined product: %s", productID)
		}
	}
	return nil
}

func (v *Validator) validatePromotionCode(promo PromotionCode, couponIDs map[string]bool) error {
	if promo.ID == "" {
		return fmt.Errorf("promotion code ID is required")
	}
	if promo.Code == "" {
		return fmt.Errorf("promotion code is required")
	}
	if promo.Coupon == "" {
		return fmt.Errorf("coupon reference is required")
	}
	if !couponIDs[promo.Coupon] {
		return fmt.Errorf("promotion code references undefined coupon: %s", promo.Coupon)
	}
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

func (v *Validator) ParseAndValidate(configData ConfigData) (*Configuration, error) {
	return v.ParseAndValidateConfig(configData)
}
