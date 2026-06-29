package stripe

import (
	"context"

	"github.com/google/uuid"

	"api/internal/models"
)

func (h *Handler) addStripeIDsToConfig(ctx context.Context, config models.StripeConfiguration, configID uuid.UUID) models.StripeConfigurationWithIDs {
	_ = configID

	meters := make([]models.MeterWithStripeID, 0, len(config.Meters))
	for _, m := range config.Meters {
		mWith := models.MeterWithStripeID{Meter: m}
		if id, err := h.stripeConfig.GetStripeIDByConfigItemID(ctx, m.ID, "meter"); err == nil && id != "" && id != m.ID {
			mWith.StripeID = &id
		}
		meters = append(meters, mWith)
	}

	products := make([]models.ProductWithStripeIDs, 0, len(config.Products))
	for _, p := range config.Products {
		pWith := models.ProductWithStripeIDs{
			ID:          p.ID,
			Name:        p.Name,
			Description: p.Description,
			Type:        p.Type,
			UI:          p.UI,
		}
		if id, err := h.stripeConfig.GetStripeIDByConfigItemID(ctx, p.ID, "product"); err == nil && id != "" {
			pWith.StripeID = &id
		}
		prices := make([]models.PriceWithStripeID, 0, len(p.Prices))
		for _, price := range p.Prices {
			priceWith := models.PriceWithStripeID{Price: price}
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

	coupons := make([]models.CouponWithStripeID, 0, len(config.Coupons))
	for _, c := range config.Coupons {
		cWith := models.CouponWithStripeID{Coupon: c}
		if id, err := h.stripeConfig.GetStripeIDByConfigItemID(ctx, c.ID, "coupon"); err == nil && id != "" {
			cWith.StripeID = &id
		}
		coupons = append(coupons, cWith)
	}

	promos := make([]models.PromotionCodeWithStripeID, 0, len(config.PromotionCodes))
	for _, p := range config.PromotionCodes {
		pWith := models.PromotionCodeWithStripeID{PromotionCode: p}
		if id, err := h.stripeConfig.GetStripeIDByConfigItemID(ctx, p.ID, "promotion_code"); err == nil && id != "" {
			pWith.StripeID = &id
		}
		promos = append(promos, pWith)
	}

	return models.StripeConfigurationWithIDs{
		Version:        config.Version,
		Meters:         meters,
		Products:       products,
		Coupons:        coupons,
		PromotionCodes: promos,
	}
}

func filterPublicPrices(config models.StripeConfiguration) models.StripeConfiguration {
	filtered := config
	filtered.Products = []models.Product{}
	for _, product := range config.Products {
		var publicPrices []models.Price
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
