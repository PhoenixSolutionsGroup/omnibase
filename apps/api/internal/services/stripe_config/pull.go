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
	s.stripe.ApplyAccount(meterParams)
	var stripeMeters []*stripe.BillingMeter
	for m, err := range s.stripe.Stripe.V1BillingMeters.List(ctx, meterParams) {
		if err != nil {
			return nil, fmt.Errorf("%w: meters: %w", PullConfigError, err)
		}
		stripeMeters = append(stripeMeters, m)
	}

	productParams := &stripe.ProductListParams{}
	productParams.Filters.AddFilter("active", "", "true")
	s.stripe.ApplyAccount(productParams)
	var stripeProducts []*stripe.Product
	for p, err := range s.stripe.Stripe.V1Products.List(ctx, productParams) {
		if err != nil {
			return nil, fmt.Errorf("%w: products: %w", PullConfigError, err)
		}
		stripeProducts = append(stripeProducts, p)
	}

	priceParams := &stripe.PriceListParams{}
	priceParams.Filters.AddFilter("active", "", "true")
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
	s.stripe.ApplyAccount(webhookParams)
	var configWebhooks []WebhookEndpointConfig
	for ep, err := range s.stripe.Stripe.V1WebhookEndpoints.List(ctx, webhookParams) {
		if err != nil {
			return nil, fmt.Errorf("%w: webhooks: %w", PullConfigError, err)
		}
		events := make([]string, len(ep.EnabledEvents))
		copy(events, ep.EnabledEvents)
		configWebhooks = append(configWebhooks, WebhookEndpointConfig{
			ID:      ep.ID,
			URL:     ep.URL,
			Events:  events,
			Connect: ep.Application != "",
		})
	}

	couponListParams := &stripe.CouponListParams{}
	s.stripe.ApplyAccount(couponListParams)
	var configCoupons []Coupon
	for cpn, err := range s.stripe.Stripe.V1Coupons.List(ctx, couponListParams) {
		if err != nil {
			return nil, fmt.Errorf("%w: coupons: %w", PullConfigError, err)
		}
		cc := convertStripeCouponToConfig(cpn)
		cc.ID = normalizeConfigID(cpn.Name)
		if cc.ID == "" {
			cc.ID = cpn.ID
		}
		cc.StripeID = cpn.ID
		configCoupons = append(configCoupons, cc)
	}

	promoListParams := &stripe.PromotionCodeListParams{}
	promoListParams.Filters.AddFilter("active", "", "true")
	s.stripe.ApplyAccount(promoListParams)
	var configPromos []PromotionCode
	for promo, err := range s.stripe.Stripe.V1PromotionCodes.List(ctx, promoListParams) {
		if err != nil {
			return nil, fmt.Errorf("%w: promotion codes: %w", PullConfigError, err)
		}
		pp := convertStripePromoCodeToConfig(promo, configCoupons)
		pp.ID = normalizeConfigID(promo.Code)
		if pp.ID == "" {
			pp.ID = promo.ID
		}
		pp.StripeID = promo.ID
		configPromos = append(configPromos, pp)
	}

	configMeters := make([]Meter, 0, len(stripeMeters))
	for _, sm := range stripeMeters {
		m := convertStripeMeterToConfig(sm)
		m.ID = normalizeConfigID(sm.DisplayName)
		m.StripeID = sm.ID
		configMeters = append(configMeters, m)
	}

	pricesByProduct := make(map[string][]*stripe.Price)
	for _, sp := range stripePrices {
		if sp.Product != nil {
			pricesByProduct[sp.Product.ID] = append(pricesByProduct[sp.Product.ID], sp)
		}
	}

	configProducts := make([]Product, 0, len(stripeProducts))
	for _, sp := range stripeProducts {
		normalizedID := normalizeConfigID(sp.Name)
		cp := Product{
			ID:          normalizedID,
			StripeID:    sp.ID,
			Name:        sp.Name,
			Description: sp.Description,
			Type:        "service",
		}
		if sp.Type != "" {
			cp.Type = string(sp.Type)
		}
		for _, price := range pricesByProduct[sp.ID] {
			cprice := convertStripePriceToConfig(s, ctx, price)
			cprice.ID = generatePriceConfigID(price, normalizedID)
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

func convertStripePriceToConfig(s *Service, ctx context.Context, sp *stripe.Price) Price {
	cp := Price{
		Amount:   float64(sp.UnitAmount),
		Currency: string(sp.Currency),
	}
	if sp.TaxBehavior == "inclusive" {
		inclusive := true
		cp.TaxIncludedInPrice = &inclusive
	}
	if sp.Recurring != nil {
		cp.Interval = string(sp.Recurring.Interval)
		cp.IntervalCount = int(sp.Recurring.IntervalCount)
		if sp.Recurring.UsageType != "" {
			cp.UsageType = string(sp.Recurring.UsageType)
		}
		if sp.Recurring.Meter != "" {
			if mapping, err := s.repo.GetMappingByStripeID(ctx, sp.Recurring.Meter); err == nil {
				cp.Meter = mapping.ConfigItemID
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
		cc.AppliesTo = sc.AppliesTo.Products
	}
	if len(sc.Metadata) > 0 {
		cc.Metadata = sc.Metadata
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
		cp.Metadata = sp.Metadata
	}
	return cp
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
