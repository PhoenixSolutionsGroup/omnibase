package stripe_config

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"github.com/stripe/stripe-go/v82"
)

var PullConfigError = errors.New("Failed to pull stripe configuration")

func (s *Service) Pull(ctx context.Context) (*StripeConfiguration, error) {
	meterParams := &stripe.BillingMeterListParams{Status: stripe.String("active")}
	meterParams.Limit = stripe.Int64(100)
	s.stripe.ApplyAccount(meterParams)
	var stripeMeters []*stripe.BillingMeter
	for m, err := range s.stripe.Stripe.V1BillingMeters.List(ctx, meterParams) {
		if err != nil {
			return nil, fmt.Errorf("%w: meters: %w", PullConfigError, err)
		}
		stripeMeters = append(stripeMeters, m)
	}

	productParams := &stripe.ProductListParams{Active: stripe.Bool(true)}
	productParams.Limit = stripe.Int64(100)
	s.stripe.ApplyAccount(productParams)
	var stripeProducts []*stripe.Product
	for p, err := range s.stripe.Stripe.V1Products.List(ctx, productParams) {
		if err != nil {
			return nil, fmt.Errorf("%w: products: %w", PullConfigError, err)
		}
		stripeProducts = append(stripeProducts, p)
	}

	priceParams := &stripe.PriceListParams{Active: stripe.Bool(true)}
	priceParams.Limit = stripe.Int64(100)
	priceParams.Expand = []*string{stripe.String("data.tiers")}
	s.stripe.ApplyAccount(priceParams)
	var stripePrices []*stripe.Price
	for p, err := range s.stripe.Stripe.V1Prices.List(ctx, priceParams) {
		if err != nil {
			return nil, fmt.Errorf("%w: prices: %w", PullConfigError, err)
		}
		stripePrices = append(stripePrices, p)
	}

	webhookParams := &stripe.WebhookEndpointListParams{}
	webhookParams.Limit = stripe.Int64(100)
	s.stripe.ApplyAccount(webhookParams)
	var configWebhooks []WebhookEndpointConfig
	for ep, err := range s.stripe.Stripe.V1WebhookEndpoints.List(ctx, webhookParams) {
		if err != nil {
			return nil, fmt.Errorf("%w: webhooks: %w", PullConfigError, err)
		}
		events := make([]string, len(ep.EnabledEvents))
		copy(events, ep.EnabledEvents)
		webhookID := configIDFromMetadata(ep.Metadata)
		if webhookID == "" && !isManagedMetadata(ep.Metadata) {
			webhookID = ep.ID
		}
		configWebhooks = append(configWebhooks, WebhookEndpointConfig{
			ID:      webhookID,
			URL:     ep.URL,
			Events:  events,
			Connect: ep.Application != "",
		})
	}

	couponListParams := &stripe.CouponListParams{}
	couponListParams.Limit = stripe.Int64(100)
	couponListParams.Expand = []*string{stripe.String("data.applies_to")}
	s.stripe.ApplyAccount(couponListParams)
	var stripeCoupons []*stripe.Coupon
	for cpn, err := range s.stripe.Stripe.V1Coupons.List(ctx, couponListParams) {
		if err != nil {
			return nil, fmt.Errorf("%w: coupons: %w", PullConfigError, err)
		}
		stripeCoupons = append(stripeCoupons, cpn)
	}

	promoListParams := &stripe.PromotionCodeListParams{Active: stripe.Bool(true)}
	promoListParams.Limit = stripe.Int64(100)
	s.stripe.ApplyAccount(promoListParams)
	var stripePromos []*stripe.PromotionCode
	for promo, err := range s.stripe.Stripe.V1PromotionCodes.List(ctx, promoListParams) {
		if err != nil {
			return nil, fmt.Errorf("%w: promotion codes: %w", PullConfigError, err)
		}
		stripePromos = append(stripePromos, promo)
	}

	meterConfigIDs := assignMeterConfigIDs(stripeMeters)
	configMeters := make([]Meter, 0, len(stripeMeters))
	for _, sm := range stripeMeters {
		m := convertStripeMeterToConfig(sm)
		m.ID = meterConfigIDs[sm.ID]
		m.StripeID = sm.ID
		configMeters = append(configMeters, m)
	}

	productConfigIDs := assignProductConfigIDs(stripeProducts)
	priceConfigIDs := assignPriceConfigIDs(stripePrices, productConfigIDs)
	productConfigByStripeID := reverseStringMap(productConfigIDs)

	couponAllocator := newConfigIDAllocator(taggedConfigIDs(stripeCoupons, func(c *stripe.Coupon) string {
		return configIDFromMetadata(c.Metadata)
	}))
	configCoupons := make([]Coupon, 0, len(stripeCoupons))
	for _, cpn := range stripeCoupons {
		cc := convertStripeCouponToConfig(cpn)
		cc.ID = couponAllocator.resolve(configIDFromMetadata(cpn.Metadata), normalizeConfigID(cpn.Name), cpn.ID)
		cc.StripeID = cpn.ID
		for i, stripeProductID := range cc.AppliesTo {
			if configProductID := productConfigByStripeID[stripeProductID]; configProductID != "" {
				cc.AppliesTo[i] = configProductID
			}
		}
		configCoupons = append(configCoupons, cc)
	}

	promoAllocator := newConfigIDAllocator(taggedConfigIDs(stripePromos, func(p *stripe.PromotionCode) string {
		return configIDFromMetadata(p.Metadata)
	}))
	configPromos := make([]PromotionCode, 0, len(stripePromos))
	for _, promo := range stripePromos {
		pp := convertStripePromoCodeToConfig(promo, configCoupons)
		pp.ID = promoAllocator.resolve(configIDFromMetadata(promo.Metadata), normalizeConfigID(promo.Code), promo.ID)
		pp.StripeID = promo.ID
		configPromos = append(configPromos, pp)
	}

	pricesByProduct := make(map[string][]*stripe.Price)
	for _, sp := range stripePrices {
		if sp.Product != nil {
			pricesByProduct[sp.Product.ID] = append(pricesByProduct[sp.Product.ID], sp)
		}
	}

	configProducts := make([]Product, 0, len(stripeProducts))
	for _, sp := range stripeProducts {
		cp := Product{
			ID:          productConfigIDs[sp.ID],
			StripeID:    sp.ID,
			Name:        sp.Name,
			Description: sp.Description,
			Type:        "service",
		}
		if sp.Type != "" {
			cp.Type = string(sp.Type)
		}
		for _, price := range pricesByProduct[sp.ID] {
			cprice := convertStripePriceToConfig(price, meterConfigIDs)
			cprice.ID = priceConfigIDs[price.ID]
			cprice.StripeID = price.ID
			cp.Prices = append(cp.Prices, cprice)
		}
		if len(cp.Prices) > 0 {
			configProducts = append(configProducts, cp)
		}
	}

	version := "1.0.0"
	if latest, err := s.repo.GetLatestStripeConfig(ctx); err == nil {
		var raw ConfigData
		if err := json.Unmarshal(latest.Config, &raw); err == nil {
			if parsed, err := s.validator.ParseAndValidateConfig(raw); err == nil {
				version = parsed.Version
			}
		}
	}

	if configWebhooks == nil {
		configWebhooks = []WebhookEndpointConfig{}
	}
	if configCoupons == nil {
		configCoupons = []Coupon{}
	}
	if configPromos == nil {
		configPromos = []PromotionCode{}
	}
	return &StripeConfiguration{
		Version:        version,
		Webhooks:       configWebhooks,
		Meters:         configMeters,
		Products:       configProducts,
		Coupons:        configCoupons,
		PromotionCodes: configPromos,
	}, nil
}

func convertStripeMeterToConfig(sm *stripe.BillingMeter) Meter {
	cm := Meter{
		DisplayName: sm.DisplayName,
		EventName:   sm.EventName,
		DefaultAggregation: MeterDefaultAggregation{
			Formula: string(sm.DefaultAggregation.Formula),
		},
	}
	if sm.CustomerMapping != nil {
		cm.CustomerMapping = &MeterCustomerMapping{
			EventPayloadKey: sm.CustomerMapping.EventPayloadKey,
			Type:            string(sm.CustomerMapping.Type),
		}
	}
	if sm.ValueSettings != nil {
		cm.ValueSettings = &MeterValueSettings{
			EventPayloadKey: sm.ValueSettings.EventPayloadKey,
		}
	}
	return cm
}

func convertStripePriceToConfig(sp *stripe.Price, meterConfigIDs map[string]string) Price {
	amount := float64(sp.UnitAmount)
	if sp.UnitAmountDecimal != 0 {
		amount = sp.UnitAmountDecimal
	}
	cp := Price{
		Amount:   amount,
		Currency: string(sp.Currency),
	}
	switch sp.TaxBehavior {
	case "inclusive":
		inclusive := true
		cp.TaxIncludedInPrice = &inclusive
	case "exclusive":
		exclusive := false
		cp.TaxIncludedInPrice = &exclusive
	}
	if sp.Recurring != nil {
		cp.Interval = string(sp.Recurring.Interval)
		cp.IntervalCount = int(sp.Recurring.IntervalCount)
		if sp.Recurring.UsageType != "" {
			cp.UsageType = string(sp.Recurring.UsageType)
		}
		if sp.Recurring.Meter != "" {
			if configID, ok := meterConfigIDs[sp.Recurring.Meter]; ok {
				cp.Meter = configID
			} else {
				cp.Meter = sp.Recurring.Meter
			}
		}
	}
	if sp.BillingScheme != "" {
		cp.BillingScheme = string(sp.BillingScheme)
	}
	if len(sp.Tiers) > 0 {
		if sp.TiersMode != "" {
			cp.TiersMode = string(sp.TiersMode)
		} else {
			cp.TiersMode = "graduated"
		}
		for _, t := range sp.Tiers {
			ct := Tier{}
			if t.UpTo == 0 {
				ct.UpTo = "inf"
			} else {
				ct.UpTo = t.UpTo
			}
			if t.FlatAmount > 0 {
				ct.FlatAmount = &t.FlatAmount
			}
			if t.UnitAmount > 0 {
				ct.UnitAmount = &t.UnitAmount
			}
			cp.Tiers = append(cp.Tiers, ct)
		}
	}
	return cp
}

func convertStripeCouponToConfig(sc *stripe.Coupon) Coupon {
	cc := Coupon{
		Name:     sc.Name,
		Duration: string(sc.Duration),
	}
	if sc.PercentOff > 0 {
		v := sc.PercentOff
		cc.PercentOff = &v
	}
	if sc.AmountOff > 0 {
		cc.AmountOff = &sc.AmountOff
		cc.Currency = string(sc.Currency)
	}
	if sc.DurationInMonths > 0 {
		cc.DurationInMonths = &sc.DurationInMonths
	}
	if sc.MaxRedemptions > 0 {
		cc.MaxRedemptions = &sc.MaxRedemptions
	}
	if sc.RedeemBy > 0 {
		cc.RedeemBy = &sc.RedeemBy
	}
	if sc.AppliesTo != nil && len(sc.AppliesTo.Products) > 0 {
		cc.AppliesTo = append([]string{}, sc.AppliesTo.Products...)
	}
	if len(sc.Metadata) > 0 {
		if metadata := stripManagedMetadata(sc.Metadata); len(metadata) > 0 {
			cc.Metadata = metadata
		}
	}
	return cc
}

func convertStripePromoCodeToConfig(sp *stripe.PromotionCode, coupons []Coupon) PromotionCode {
	cp := PromotionCode{Code: sp.Code}
	if sp.Coupon != nil {
		couponStripeID := sp.Coupon.ID
		for _, c := range coupons {
			if c.StripeID == couponStripeID {
				cp.Coupon = c.ID
				break
			}
		}
		if cp.Coupon == "" {
			cp.Coupon = couponStripeID
		}
	}
	cp.Active = &sp.Active
	if sp.MaxRedemptions > 0 {
		cp.MaxRedemptions = &sp.MaxRedemptions
	}
	if sp.Restrictions != nil {
		if sp.Restrictions.FirstTimeTransaction {
			t := true
			cp.FirstTimeTransaction = &t
		}
		if sp.Restrictions.MinimumAmount > 0 {
			cp.MinimumAmount = &sp.Restrictions.MinimumAmount
			cp.MinimumAmountCurrency = string(sp.Restrictions.MinimumAmountCurrency)
		}
	}
	if sp.ExpiresAt > 0 {
		cp.ExpiresAt = &sp.ExpiresAt
	}
	if len(sp.Metadata) > 0 {
		if metadata := stripManagedMetadata(sp.Metadata); len(metadata) > 0 {
			cp.Metadata = metadata
		}
	}
	return cp
}

type configIDAllocator struct {
	used map[string]bool
	seen map[string]bool
}

func newConfigIDAllocator(taggedIDs []string) *configIDAllocator {
	used := make(map[string]bool, len(taggedIDs))
	for _, id := range taggedIDs {
		if id != "" {
			used[id] = true
		}
	}
	return &configIDAllocator{used: used, seen: make(map[string]bool)}
}

func (a *configIDAllocator) resolve(taggedID, fallbackID, stripeID string) string {
	if taggedID != "" {
		if !a.seen[taggedID] {
			a.seen[taggedID] = true
			return taggedID
		}
		return uniqueConfigID(taggedID, stripeID, a.used)
	}
	return uniqueConfigID(normalizeConfigID(fallbackID), stripeID, a.used)
}

func uniqueConfigID(baseID, stripeID string, used map[string]bool) string {
	candidate := baseID
	if candidate == "" {
		candidate = normalizeConfigID(stripeID)
	}
	if candidate == "" {
		candidate = "unknown"
	}
	if used[candidate] {
		suffix := normalizeConfigID(stripeID)
		if suffix == "" {
			suffix = "unknown"
		}
		candidate = candidate + "_" + suffix
	}
	for used[candidate] {
		candidate = candidate + "_"
	}
	used[candidate] = true
	return candidate
}

func configIDFromMetadata(metadata map[string]string) string {
	if metadata == nil {
		return ""
	}
	return metadata[MetadataKeyConfigID]
}

func priceConfigIDFromStripe(price *stripe.Price) string {
	if price.LookupKey != "" {
		return price.LookupKey
	}
	return configIDFromMetadata(price.Metadata)
}

func taggedConfigIDs[T any](items []T, id func(T) string) []string {
	ids := make([]string, 0, len(items))
	for _, item := range items {
		if value := id(item); value != "" {
			ids = append(ids, value)
		}
	}
	return ids
}

func assignProductConfigIDs(products []*stripe.Product) map[string]string {
	allocator := newConfigIDAllocator(taggedConfigIDs(products, func(p *stripe.Product) string {
		return configIDFromMetadata(p.Metadata)
	}))
	ids := make(map[string]string, len(products))
	for _, product := range products {
		ids[product.ID] = allocator.resolve(configIDFromMetadata(product.Metadata), normalizeConfigID(product.Name), product.ID)
	}
	return ids
}

func assignPriceConfigIDs(prices []*stripe.Price, productConfigIDs map[string]string) map[string]string {
	allocator := newConfigIDAllocator(taggedConfigIDs(prices, priceConfigIDFromStripe))
	ids := make(map[string]string, len(prices))
	for _, price := range prices {
		productConfigID := ""
		if price.Product != nil {
			productConfigID = productConfigIDs[price.Product.ID]
		}
		fallbackID := normalizeConfigID(generatePriceConfigID(price, productConfigID))
		ids[price.ID] = allocator.resolve(priceConfigIDFromStripe(price), fallbackID, price.ID)
	}
	return ids
}

func assignMeterConfigIDs(meters []*stripe.BillingMeter) map[string]string {
	allocator := newConfigIDAllocator(nil)
	ids := make(map[string]string, len(meters))
	for _, meter := range meters {
		ids[meter.ID] = allocator.resolve("", normalizeConfigID(meter.EventName), meter.ID)
	}
	return ids
}

func normalizeConfigID(name string) string {
	normalized := strings.ToLower(name)
	normalized = strings.ReplaceAll(normalized, " ", "_")
	normalized = strings.ReplaceAll(normalized, "-", "_")
	var b strings.Builder
	for _, ch := range normalized {
		if (ch >= 'a' && ch <= 'z') || (ch >= '0' && ch <= '9') || ch == '_' {
			b.WriteRune(ch)
		}
	}
	result := b.String()
	for strings.Contains(result, "__") {
		result = strings.ReplaceAll(result, "__", "_")
	}
	return strings.Trim(result, "_")
}

func generatePriceConfigID(sp *stripe.Price, productConfigID string) string {
	if sp.Nickname != "" {
		return normalizeConfigID(sp.Nickname)
	}
	if sp.Recurring != nil {
		return fmt.Sprintf("%s_%s", productConfigID, string(sp.Recurring.Interval))
	}
	return fmt.Sprintf("%s_price", productConfigID)
}
