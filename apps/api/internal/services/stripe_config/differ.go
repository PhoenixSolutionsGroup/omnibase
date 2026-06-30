package stripe_config

import (
	"reflect"

	"api/internal/logger"
)

type Differ struct{}

func NewDiffer() *Differ {
	return &Differ{}
}

func (d *Differ) CalculateConfigDiff(oldConfig, newConfig *StripeConfiguration) *ConfigDiff {
	logger.Logger.Info("Calculating configuration diff",
		"oldProductCount", len(oldConfig.Products),
		"newProductCount", len(newConfig.Products),
		"oldMeterCount", len(oldConfig.Meters),
		"newMeterCount", len(newConfig.Meters),
		"oldCouponCount", len(oldConfig.Coupons),
		"newCouponCount", len(newConfig.Coupons),
		"oldPromoCount", len(oldConfig.PromotionCodes),
		"newPromoCount", len(newConfig.PromotionCodes))

	diff := &ConfigDiff{
		NewProducts:           []Product{},
		UpdatedProducts:       []ProductUpdate{},
		ArchivedProducts:      []string{},
		NewMeters:             []Meter{},
		ArchivedMeters:        []string{},
		NewCoupons:            []Coupon{},
		UpdatedCoupons:        []CouponUpdate{},
		ArchivedCoupons:       []string{},
		NewPromotionCodes:     []PromotionCode{},
		UpdatedPromotionCodes: []PromoCodeUpdate{},
		DeactivatedPromoCodes: []string{},
	}

	oldProductMap := make(map[string]Product)
	newProductMap := make(map[string]Product)
	for _, p := range oldConfig.Products {
		oldProductMap[p.ID] = p
	}
	for _, p := range newConfig.Products {
		newProductMap[p.ID] = p
	}

	for _, newProduct := range newConfig.Products {
		if oldProduct, exists := oldProductMap[newProduct.ID]; !exists {
			diff.NewProducts = append(diff.NewProducts, newProduct)
		} else if update := d.calculateProductUpdate(oldProduct, newProduct); update != nil {
			diff.UpdatedProducts = append(diff.UpdatedProducts, *update)
		}
	}
	for id := range oldProductMap {
		if _, exists := newProductMap[id]; !exists {
			diff.ArchivedProducts = append(diff.ArchivedProducts, id)
		}
	}

	oldMeterMap := make(map[string]Meter)
	newMeterMap := make(map[string]Meter)
	for _, m := range oldConfig.Meters {
		oldMeterMap[m.ID] = m
	}
	for _, m := range newConfig.Meters {
		newMeterMap[m.ID] = m
	}
	for _, newMeter := range newConfig.Meters {
		if _, exists := oldMeterMap[newMeter.ID]; !exists {
			diff.NewMeters = append(diff.NewMeters, newMeter)
		}
	}
	for id := range oldMeterMap {
		if _, exists := newMeterMap[id]; !exists {
			diff.ArchivedMeters = append(diff.ArchivedMeters, id)
		}
	}

	oldCouponMap := make(map[string]Coupon)
	newCouponMap := make(map[string]Coupon)
	for _, c := range oldConfig.Coupons {
		oldCouponMap[c.ID] = c
	}
	for _, c := range newConfig.Coupons {
		newCouponMap[c.ID] = c
	}
	for _, newCoupon := range newConfig.Coupons {
		if oldCoupon, exists := oldCouponMap[newCoupon.ID]; !exists {
			diff.NewCoupons = append(diff.NewCoupons, newCoupon)
		} else if update := d.calculateCouponUpdate(oldCoupon, newCoupon); update != nil {
			diff.UpdatedCoupons = append(diff.UpdatedCoupons, *update)
		}
	}
	for id := range oldCouponMap {
		if _, exists := newCouponMap[id]; !exists {
			diff.ArchivedCoupons = append(diff.ArchivedCoupons, id)
		}
	}

	oldPromoMap := make(map[string]PromotionCode)
	newPromoMap := make(map[string]PromotionCode)
	for _, p := range oldConfig.PromotionCodes {
		oldPromoMap[p.ID] = p
	}
	for _, p := range newConfig.PromotionCodes {
		newPromoMap[p.ID] = p
	}
	for _, newPromo := range newConfig.PromotionCodes {
		if oldPromo, exists := oldPromoMap[newPromo.ID]; !exists {
			diff.NewPromotionCodes = append(diff.NewPromotionCodes, newPromo)
		} else if update := d.calculatePromoCodeUpdate(oldPromo, newPromo); update != nil {
			diff.UpdatedPromotionCodes = append(diff.UpdatedPromotionCodes, *update)
		}
	}
	for id := range oldPromoMap {
		if _, exists := newPromoMap[id]; !exists {
			diff.DeactivatedPromoCodes = append(diff.DeactivatedPromoCodes, id)
		}
	}

	return diff
}

func (d *Differ) calculateProductUpdate(oldProduct, newProduct Product) *ProductUpdate {
	update := &ProductUpdate{
		ID:               newProduct.ID,
		FieldChanges:     make(map[string]interface{}),
		NewPrices:        []Price{},
		UpdatedPrices:    []Price{},
		ArchivedPrices:   []string{},
		RequiresRecreate: false,
	}
	hasChanges := false

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

	oldPriceMap := make(map[string]Price)
	newPriceMap := make(map[string]Price)
	for _, p := range oldProduct.Prices {
		oldPriceMap[p.ID] = p
	}
	for _, p := range newProduct.Prices {
		newPriceMap[p.ID] = p
	}

	for _, newPrice := range newProduct.Prices {
		if oldPrice, exists := oldPriceMap[newPrice.ID]; !exists {
			update.NewPrices = append(update.NewPrices, newPrice)
			hasChanges = true
		} else if !reflect.DeepEqual(oldPrice, newPrice) {
			update.NewPrices = append(update.NewPrices, newPrice)
			update.ArchivedPrices = append(update.ArchivedPrices, oldPrice.ID)
			hasChanges = true
		}
	}
	for id := range oldPriceMap {
		if _, exists := newPriceMap[id]; !exists {
			update.ArchivedPrices = append(update.ArchivedPrices, id)
			hasChanges = true
		}
	}

	if !hasChanges {
		return nil
	}
	return update
}

func (d *Differ) calculateCouponUpdate(oldCoupon, newCoupon Coupon) *CouponUpdate {
	update := &CouponUpdate{
		ID:           newCoupon.ID,
		FieldChanges: make(map[string]interface{}),
	}
	hasChanges := false

	if oldCoupon.Name != newCoupon.Name {
		update.FieldChanges["name"] = newCoupon.Name
		hasChanges = true
	}
	if !reflect.DeepEqual(oldCoupon.Metadata, newCoupon.Metadata) {
		update.FieldChanges["metadata"] = newCoupon.Metadata
		hasChanges = true
	}
	immutables := []struct {
		key string
		neq bool
		val interface{}
	}{
		{"percent_off", !reflect.DeepEqual(oldCoupon.PercentOff, newCoupon.PercentOff), newCoupon.PercentOff},
		{"amount_off", !reflect.DeepEqual(oldCoupon.AmountOff, newCoupon.AmountOff), newCoupon.AmountOff},
		{"currency", oldCoupon.Currency != newCoupon.Currency, newCoupon.Currency},
		{"duration", oldCoupon.Duration != newCoupon.Duration, newCoupon.Duration},
		{"duration_in_months", !reflect.DeepEqual(oldCoupon.DurationInMonths, newCoupon.DurationInMonths), newCoupon.DurationInMonths},
		{"max_redemptions", !reflect.DeepEqual(oldCoupon.MaxRedemptions, newCoupon.MaxRedemptions), newCoupon.MaxRedemptions},
		{"redeem_by", !reflect.DeepEqual(oldCoupon.RedeemBy, newCoupon.RedeemBy), newCoupon.RedeemBy},
		{"applies_to", !reflect.DeepEqual(oldCoupon.AppliesTo, newCoupon.AppliesTo), newCoupon.AppliesTo},
	}
	for _, f := range immutables {
		if f.neq {
			update.FieldChanges[f.key] = f.val
			update.FieldChanges["requires_recreate"] = true
			hasChanges = true
		}
	}

	if !hasChanges {
		return nil
	}
	return update
}

func (d *Differ) calculatePromoCodeUpdate(oldPromo, newPromo PromotionCode) *PromoCodeUpdate {
	update := &PromoCodeUpdate{
		ID:           newPromo.ID,
		FieldChanges: make(map[string]interface{}),
	}
	hasChanges := false

	if !reflect.DeepEqual(oldPromo.Active, newPromo.Active) {
		update.FieldChanges["active"] = newPromo.Active
		hasChanges = true
	}
	if !reflect.DeepEqual(oldPromo.Metadata, newPromo.Metadata) {
		update.FieldChanges["metadata"] = newPromo.Metadata
		hasChanges = true
	}
	immutables := []struct {
		key string
		neq bool
		val interface{}
	}{
		{"code", oldPromo.Code != newPromo.Code, newPromo.Code},
		{"coupon", oldPromo.Coupon != newPromo.Coupon, newPromo.Coupon},
		{"max_redemptions", !reflect.DeepEqual(oldPromo.MaxRedemptions, newPromo.MaxRedemptions), newPromo.MaxRedemptions},
		{"first_time_transaction", !reflect.DeepEqual(oldPromo.FirstTimeTransaction, newPromo.FirstTimeTransaction), newPromo.FirstTimeTransaction},
		{"minimum_amount", !reflect.DeepEqual(oldPromo.MinimumAmount, newPromo.MinimumAmount), newPromo.MinimumAmount},
		{"minimum_amount_currency", oldPromo.MinimumAmountCurrency != newPromo.MinimumAmountCurrency, newPromo.MinimumAmountCurrency},
		{"expires_at", !reflect.DeepEqual(oldPromo.ExpiresAt, newPromo.ExpiresAt), newPromo.ExpiresAt},
	}
	for _, f := range immutables {
		if f.neq {
			update.FieldChanges[f.key] = f.val
			update.FieldChanges["requires_recreate"] = true
			hasChanges = true
		}
	}

	if !hasChanges {
		return nil
	}
	return update
}
