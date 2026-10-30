package stripe

import (
	"context"

	"api/internal/logger"
	"api/internal/services/stripe_config"
)

func (h *Handler) addStripeIDsToConfig(ctx context.Context, config stripe_config.StripeConfiguration) stripe_config.StripeConfigurationWithIDs {
	identity, err := h.stripeConfig.LoadStripeIdentity(ctx, &config)
	if err != nil {
		logger.Logger.Warn("Failed to load Stripe identity for config response", "error", err)
		identity = &stripe_config.StripeIdentity{}
	}

	meters := make([]stripe_config.MeterWithStripeID, 0, len(config.Meters))
	for _, m := range config.Meters {
		mWith := stripe_config.MeterWithStripeID{Meter: m}
		if id := identity.Meters[m.ID]; id != "" {
			mWith.StripeID = &id
		}
		meters = append(meters, mWith)
	}

	products := make([]stripe_config.ProductWithStripeIDs, 0, len(config.Products))
	for _, p := range config.Products {
		pWith := stripe_config.ProductWithStripeIDs{
			ID:          p.ID,
			Name:        p.Name,
			Description: p.Description,
			Type:        p.Type,
			UI:          p.UI,
		}
		if id := identity.Products[p.ID]; id != "" {
			pWith.StripeID = &id
		}
		prices := make([]stripe_config.PriceWithStripeID, 0, len(p.Prices))
		for _, price := range p.Prices {
			priceWith := stripe_config.PriceWithStripeID{Price: price}
			if price.ID != "free" {
				if id := identity.Prices[price.ID]; id != "" {
					priceWith.StripeID = &id
				}
			}
			prices = append(prices, priceWith)
		}
		pWith.Prices = prices
		products = append(products, pWith)
	}

	coupons := make([]stripe_config.CouponWithStripeID, 0, len(config.Coupons))
	for _, c := range config.Coupons {
		cWith := stripe_config.CouponWithStripeID{Coupon: c}
		if id := identity.Coupons[c.ID]; id != "" {
			cWith.StripeID = &id
		}
		coupons = append(coupons, cWith)
	}

	promos := make([]stripe_config.PromotionCodeWithStripeID, 0, len(config.PromotionCodes))
	for _, p := range config.PromotionCodes {
		pWith := stripe_config.PromotionCodeWithStripeID{PromotionCode: p}
		if id := identity.Promos[p.ID]; id != "" {
			pWith.StripeID = &id
		}
		promos = append(promos, pWith)
	}

	return stripe_config.StripeConfigurationWithIDs{
		Version:        config.Version,
		Meters:         meters,
		Products:       products,
		Coupons:        coupons,
		PromotionCodes: promos,
	}
}

func filterPublicPrices(config stripe_config.StripeConfiguration) stripe_config.StripeConfiguration {
	filtered := config
	filtered.Products = []stripe_config.Product{}
	for _, product := range config.Products {
		var publicPrices []stripe_config.Price
		for _, p := range product.Prices {
			if p.Public == nil || *p.Public {
				publicPrices = append(publicPrices, p)
			}
		}
		if len(publicPrices) > 0 {
			product.Prices = publicPrices
			filtered.Products = append(filtered.Products, product)
		}
	}
	return filtered
}
