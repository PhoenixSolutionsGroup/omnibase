package stripe

import (
	"context"

	"github.com/google/uuid"

	"api/internal/services/stripe_config"
)

func (h *Handler) addStripeIDsToConfig(ctx context.Context, config stripe_config.Configuration, configID uuid.UUID) stripe_config.ConfigurationWithIDs {
	_ = configID

	meters := make([]stripe_config.MeterWithStripeID, 0, len(config.Meters))
	for _, m := range config.Meters {
		mWith := stripe_config.MeterWithStripeID{Meter: m}
		if id, err := h.stripeConfig.GetStripeIDByConfigItemID(ctx, m.ID, "meter"); err == nil && id != "" && id != m.ID {
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
		if id, err := h.stripeConfig.GetStripeIDByConfigItemID(ctx, p.ID, "product"); err == nil && id != "" {
			pWith.StripeID = &id
		}
		prices := make([]stripe_config.PriceWithStripeID, 0, len(p.Prices))
		for _, price := range p.Prices {
			priceWith := stripe_config.PriceWithStripeID{Price: price}
			if price.ID != "free" {
				if id, err := h.stripeConfig.GetStripeIDByConfigItemID(ctx, price.ID, "price"); err == nil && id != "" {
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
		if id, err := h.stripeConfig.GetStripeIDByConfigItemID(ctx, c.ID, "coupon"); err == nil && id != "" {
			cWith.StripeID = &id
		}
		coupons = append(coupons, cWith)
	}

	promos := make([]stripe_config.PromotionCodeWithStripeID, 0, len(config.PromotionCodes))
	for _, p := range config.PromotionCodes {
		pWith := stripe_config.PromotionCodeWithStripeID{PromotionCode: p}
		if id, err := h.stripeConfig.GetStripeIDByConfigItemID(ctx, p.ID, "promotion_code"); err == nil && id != "" {
			pWith.StripeID = &id
		}
		promos = append(promos, pWith)
	}

	return stripe_config.ConfigurationWithIDs{
		Version:        config.Version,
		Meters:         meters,
		Products:       products,
		Coupons:        coupons,
		PromotionCodes: promos,
	}
}

func filterPublicPrices(config stripe_config.Configuration) stripe_config.Configuration {
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
