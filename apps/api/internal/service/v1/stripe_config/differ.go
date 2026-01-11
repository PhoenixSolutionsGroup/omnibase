package stripe_config

import (
	"api/internal/logger"
	"api/internal/models"
	"reflect"
)

type Differ struct{}

func NewDiffer() *Differ {
	return &Differ{}
}

func (d *Differ) CalculateConfigDiff(oldConfig, newConfig *models.StripeConfiguration) *models.ConfigDiff {
	logger.Logger.Info("Calculating configuration diff",
		"oldProductCount", len(oldConfig.Products),
		"newProductCount", len(newConfig.Products),
		"oldMeterCount", len(oldConfig.Meters),
		"newMeterCount", len(newConfig.Meters),
		"oldCouponCount", len(oldConfig.Coupons),
		"newCouponCount", len(newConfig.Coupons),
		"oldPromoCount", len(oldConfig.PromotionCodes),
		"newPromoCount", len(newConfig.PromotionCodes))

	diff := &models.ConfigDiff{
		NewProducts:           []models.Product{},
		UpdatedProducts:       []models.ProductUpdate{},
		ArchivedProducts:      []string{},
		NewMeters:             []models.Meter{},
		ArchivedMeters:        []string{},
		NewCoupons:            []models.Coupon{},
		UpdatedCoupons:        []models.CouponUpdate{},
		ArchivedCoupons:       []string{},
		NewPromotionCodes:     []models.PromotionCode{},
		UpdatedPromotionCodes: []models.PromoCodeUpdate{},
		DeactivatedPromoCodes: []string{},
	}

	// Create maps for easier lookup
	oldProductMap := make(map[string]models.Product)
	newProductMap := make(map[string]models.Product)

	for _, product := range oldConfig.Products {
		oldProductMap[product.ID] = product
	}

	for _, product := range newConfig.Products {
		newProductMap[product.ID] = product
	}

	// Find new and updated products
	for _, newProduct := range newConfig.Products {
		if oldProduct, exists := oldProductMap[newProduct.ID]; !exists {
			// This is a new product
			logger.Logger.Debug("New product detected", "productID", newProduct.ID, "name", newProduct.Name)
			diff.NewProducts = append(diff.NewProducts, newProduct)
		} else {
			// Check if the product has been updated
			if update := d.calculateProductUpdate(oldProduct, newProduct); update != nil {
				logger.Logger.Debug("Product update detected", "productID", update.ID)
				diff.UpdatedProducts = append(diff.UpdatedProducts, *update)
			}
		}
	}

	// Find archived products
	for productID := range oldProductMap {
		if _, exists := newProductMap[productID]; !exists {
			logger.Logger.Debug("Product archived", "productID", productID)
			diff.ArchivedProducts = append(diff.ArchivedProducts, productID)
		}
	}

	// Handle meter differences
	oldMeterMap := make(map[string]models.Meter)
	newMeterMap := make(map[string]models.Meter)

	for _, meter := range oldConfig.Meters {
		oldMeterMap[meter.ID] = meter
	}

	for _, meter := range newConfig.Meters {
		newMeterMap[meter.ID] = meter
	}

	// Find new meters
	for _, newMeter := range newConfig.Meters {
		if _, exists := oldMeterMap[newMeter.ID]; !exists {
			logger.Logger.Debug("New meter detected", "meterID", newMeter.ID, "displayName", newMeter.DisplayName)
			diff.NewMeters = append(diff.NewMeters, newMeter)
		}
		// Note: Meters are immutable in Stripe, so we don't check for updates
	}

	// Find archived meters
	for meterID := range oldMeterMap {
		if _, exists := newMeterMap[meterID]; !exists {
			logger.Logger.Debug("Meter archived", "meterID", meterID)
			diff.ArchivedMeters = append(diff.ArchivedMeters, meterID)
		}
	}

	// Handle coupon differences
	oldCouponMap := make(map[string]models.Coupon)
	newCouponMap := make(map[string]models.Coupon)

	for _, coupon := range oldConfig.Coupons {
		oldCouponMap[coupon.ID] = coupon
	}

	for _, coupon := range newConfig.Coupons {
		newCouponMap[coupon.ID] = coupon
	}

	// Find new and updated coupons
	for _, newCoupon := range newConfig.Coupons {
		if oldCoupon, exists := oldCouponMap[newCoupon.ID]; !exists {
			logger.Logger.Debug("New coupon detected", "couponID", newCoupon.ID, "name", newCoupon.Name)
			diff.NewCoupons = append(diff.NewCoupons, newCoupon)
		} else {
			if update := d.calculateCouponUpdate(oldCoupon, newCoupon); update != nil {
				logger.Logger.Debug("Coupon update detected", "couponID", update.ID)
				diff.UpdatedCoupons = append(diff.UpdatedCoupons, *update)
			}
		}
	}

	// Find archived coupons
	for couponID := range oldCouponMap {
		if _, exists := newCouponMap[couponID]; !exists {
			logger.Logger.Debug("Coupon archived", "couponID", couponID)
			diff.ArchivedCoupons = append(diff.ArchivedCoupons, couponID)
		}
	}

	// Handle promotion code differences
	oldPromoMap := make(map[string]models.PromotionCode)
	newPromoMap := make(map[string]models.PromotionCode)

	for _, promo := range oldConfig.PromotionCodes {
		oldPromoMap[promo.ID] = promo
	}

	for _, promo := range newConfig.PromotionCodes {
		newPromoMap[promo.ID] = promo
	}

	// Find new and updated promotion codes
	for _, newPromo := range newConfig.PromotionCodes {
		if oldPromo, exists := oldPromoMap[newPromo.ID]; !exists {
			logger.Logger.Debug("New promotion code detected", "promoID", newPromo.ID, "code", newPromo.Code)
			diff.NewPromotionCodes = append(diff.NewPromotionCodes, newPromo)
		} else {
			if update := d.calculatePromoCodeUpdate(oldPromo, newPromo); update != nil {
				logger.Logger.Debug("Promotion code update detected", "promoID", update.ID)
				diff.UpdatedPromotionCodes = append(diff.UpdatedPromotionCodes, *update)
			}
		}
	}

	// Find deactivated promotion codes
	for promoID := range oldPromoMap {
		if _, exists := newPromoMap[promoID]; !exists {
			logger.Logger.Debug("Promotion code deactivated", "promoID", promoID)
			diff.DeactivatedPromoCodes = append(diff.DeactivatedPromoCodes, promoID)
		}
	}

	logger.Logger.Info("Configuration diff calculated",
		"newProducts", len(diff.NewProducts),
		"updatedProducts", len(diff.UpdatedProducts),
		"archivedProducts", len(diff.ArchivedProducts),
		"newMeters", len(diff.NewMeters),
		"archivedMeters", len(diff.ArchivedMeters),
		"newCoupons", len(diff.NewCoupons),
		"updatedCoupons", len(diff.UpdatedCoupons),
		"archivedCoupons", len(diff.ArchivedCoupons),
		"newPromos", len(diff.NewPromotionCodes),
		"updatedPromos", len(diff.UpdatedPromotionCodes),
		"deactivatedPromos", len(diff.DeactivatedPromoCodes))

	return diff
}

func (d *Differ) calculateProductUpdate(oldProduct, newProduct models.Product) *models.ProductUpdate {
	update := &models.ProductUpdate{
		ID:               newProduct.ID,
		FieldChanges:     make(map[string]interface{}),
		NewPrices:        []models.Price{},
		UpdatedPrices:    []models.Price{},
		ArchivedPrices:   []string{},
		RequiresRecreate: false,
	}

	hasChanges := false

	// Check for field changes
	if oldProduct.Name != newProduct.Name {
		update.FieldChanges["name"] = newProduct.Name
		hasChanges = true
	}

	if oldProduct.Description != newProduct.Description {
		update.FieldChanges["description"] = newProduct.Description
		hasChanges = true
	}

	if oldProduct.Type != newProduct.Type {
		update.FieldChanges["type"] = newProduct.Type
		update.RequiresRecreate = true
		hasChanges = true
	}

	// Check price changes
	oldPriceMap := make(map[string]models.Price)
	newPriceMap := make(map[string]models.Price)

	for _, price := range oldProduct.Prices {
		oldPriceMap[price.ID] = price
	}

	for _, price := range newProduct.Prices {
		newPriceMap[price.ID] = price
	}

	// Find new and updated prices
	for _, newPrice := range newProduct.Prices {
		if oldPrice, exists := oldPriceMap[newPrice.ID]; !exists {
			logger.Logger.Trace("New price detected", "priceID", newPrice.ID, "productID", newProduct.ID)
			update.NewPrices = append(update.NewPrices, newPrice)
			hasChanges = true
		} else if !reflect.DeepEqual(oldPrice, newPrice) {
			// Prices are immutable in Stripe, so any change requires a new price
			logger.Logger.Trace("Price modified (requires recreation)", "priceID", newPrice.ID, "productID", newProduct.ID)
			update.NewPrices = append(update.NewPrices, newPrice)
			update.ArchivedPrices = append(update.ArchivedPrices, oldPrice.ID)
			hasChanges = true
		}
	}

	// Find archived prices
	for priceID := range oldPriceMap {
		if _, exists := newPriceMap[priceID]; !exists {
			logger.Logger.Trace("Price archived", "priceID", priceID, "productID", newProduct.ID)
			update.ArchivedPrices = append(update.ArchivedPrices, priceID)
			hasChanges = true
		}
	}

	if !hasChanges {
		return nil
	}

	return update
}

func (d *Differ) calculateCouponUpdate(oldCoupon, newCoupon models.Coupon) *models.CouponUpdate {
	update := &models.CouponUpdate{
		ID:           newCoupon.ID,
		FieldChanges: make(map[string]interface{}),
	}

	hasChanges := false

	// Mutable fields: name, metadata
	if oldCoupon.Name != newCoupon.Name {
		update.FieldChanges["name"] = newCoupon.Name
		hasChanges = true
	}

	if !reflect.DeepEqual(oldCoupon.Metadata, newCoupon.Metadata) {
		update.FieldChanges["metadata"] = newCoupon.Metadata
		hasChanges = true
	}

	// Immutable fields - if any change, mark for recreation
	// percent_off, amount_off, currency, duration, duration_in_months, max_redemptions, redeem_by, applies_to
	if !reflect.DeepEqual(oldCoupon.PercentOff, newCoupon.PercentOff) {
		update.FieldChanges["percent_off"] = newCoupon.PercentOff
		update.FieldChanges["requires_recreate"] = true
		hasChanges = true
	}

	if !reflect.DeepEqual(oldCoupon.AmountOff, newCoupon.AmountOff) {
		update.FieldChanges["amount_off"] = newCoupon.AmountOff
		update.FieldChanges["requires_recreate"] = true
		hasChanges = true
	}

	if oldCoupon.Currency != newCoupon.Currency {
		update.FieldChanges["currency"] = newCoupon.Currency
		update.FieldChanges["requires_recreate"] = true
		hasChanges = true
	}

	if oldCoupon.Duration != newCoupon.Duration {
		update.FieldChanges["duration"] = newCoupon.Duration
		update.FieldChanges["requires_recreate"] = true
		hasChanges = true
	}

	if !reflect.DeepEqual(oldCoupon.DurationInMonths, newCoupon.DurationInMonths) {
		update.FieldChanges["duration_in_months"] = newCoupon.DurationInMonths
		update.FieldChanges["requires_recreate"] = true
		hasChanges = true
	}

	if !reflect.DeepEqual(oldCoupon.MaxRedemptions, newCoupon.MaxRedemptions) {
		update.FieldChanges["max_redemptions"] = newCoupon.MaxRedemptions
		update.FieldChanges["requires_recreate"] = true
		hasChanges = true
	}

	if !reflect.DeepEqual(oldCoupon.RedeemBy, newCoupon.RedeemBy) {
		update.FieldChanges["redeem_by"] = newCoupon.RedeemBy
		update.FieldChanges["requires_recreate"] = true
		hasChanges = true
	}

	if !reflect.DeepEqual(oldCoupon.AppliesTo, newCoupon.AppliesTo) {
		update.FieldChanges["applies_to"] = newCoupon.AppliesTo
		update.FieldChanges["requires_recreate"] = true
		hasChanges = true
	}

	if !hasChanges {
		return nil
	}

	return update
}

func (d *Differ) calculatePromoCodeUpdate(oldPromo, newPromo models.PromotionCode) *models.PromoCodeUpdate {
	update := &models.PromoCodeUpdate{
		ID:           newPromo.ID,
		FieldChanges: make(map[string]interface{}),
	}

	hasChanges := false

	// Mutable fields: active, metadata
	if !reflect.DeepEqual(oldPromo.Active, newPromo.Active) {
		update.FieldChanges["active"] = newPromo.Active
		hasChanges = true
	}

	if !reflect.DeepEqual(oldPromo.Metadata, newPromo.Metadata) {
		update.FieldChanges["metadata"] = newPromo.Metadata
		hasChanges = true
	}

	// Immutable fields - if any change, mark for recreation
	// code, coupon, max_redemptions, first_time_transaction, minimum_amount, minimum_amount_currency, expires_at
	if oldPromo.Code != newPromo.Code {
		update.FieldChanges["code"] = newPromo.Code
		update.FieldChanges["requires_recreate"] = true
		hasChanges = true
	}

	if oldPromo.Coupon != newPromo.Coupon {
		update.FieldChanges["coupon"] = newPromo.Coupon
		update.FieldChanges["requires_recreate"] = true
		hasChanges = true
	}

	if !reflect.DeepEqual(oldPromo.MaxRedemptions, newPromo.MaxRedemptions) {
		update.FieldChanges["max_redemptions"] = newPromo.MaxRedemptions
		update.FieldChanges["requires_recreate"] = true
		hasChanges = true
	}

	if !reflect.DeepEqual(oldPromo.FirstTimeTransaction, newPromo.FirstTimeTransaction) {
		update.FieldChanges["first_time_transaction"] = newPromo.FirstTimeTransaction
		update.FieldChanges["requires_recreate"] = true
		hasChanges = true
	}

	if !reflect.DeepEqual(oldPromo.MinimumAmount, newPromo.MinimumAmount) {
		update.FieldChanges["minimum_amount"] = newPromo.MinimumAmount
		update.FieldChanges["requires_recreate"] = true
		hasChanges = true
	}

	if oldPromo.MinimumAmountCurrency != newPromo.MinimumAmountCurrency {
		update.FieldChanges["minimum_amount_currency"] = newPromo.MinimumAmountCurrency
		update.FieldChanges["requires_recreate"] = true
		hasChanges = true
	}

	if !reflect.DeepEqual(oldPromo.ExpiresAt, newPromo.ExpiresAt) {
		update.FieldChanges["expires_at"] = newPromo.ExpiresAt
		update.FieldChanges["requires_recreate"] = true
		hasChanges = true
	}

	if !hasChanges {
		return nil
	}

	return update
}
