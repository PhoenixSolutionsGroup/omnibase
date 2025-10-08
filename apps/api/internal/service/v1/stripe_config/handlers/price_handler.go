package handlers

import (
	"api/internal/models"
	"fmt"

	"github.com/google/uuid"
	"github.com/stripe/stripe-go/v82"
	"github.com/stripe/stripe-go/v82/price"
	"github.com/stripe/stripe-go/v82/product"
)

type PriceHandler struct {
	idMapper  IDMapperInterface
	accountID string
}

func NewPriceHandler(idMapper IDMapperInterface, accountID string) *PriceHandler {
	return &PriceHandler{
		idMapper:  idMapper,
		accountID: accountID,
	}
}

func (h *PriceHandler) CreatePricesForProduct(productConfig models.Product, stripeProductID string, configID uuid.UUID) ([]string, error) {
	var details []string

	// Create prices for the product
	for _, priceConfig := range productConfig.Prices {
		// Skip Stripe API for free prices
		if priceConfig.ID == "free" {
			if configID != uuid.Nil {
				if err := h.idMapper.SaveIDMapping(configID, priceConfig.ID, priceConfig.ID, "price"); err != nil {
					return nil, fmt.Errorf("failed to save free price ID mapping: %w", err)
				}
			}

			detailMsg := fmt.Sprintf("Created free price: %s (local only)", priceConfig.ID)
			if priceConfig.Default {
				detailMsg += " - marked as default"
			}
			details = append(details, detailMsg)
			continue
		}

		priceParams := &stripe.PriceParams{
			Product:  stripe.String(stripeProductID),
			Currency: stripe.String(priceConfig.Currency),
		}

		// Set price amount (only for non-tiered pricing)
		if priceConfig.BillingScheme != "tiered" {
			priceParams.UnitAmount = stripe.Int64(priceConfig.Amount)
		}

		// Set recurring parameters if applicable
		if priceConfig.Interval != "" {
			priceParams.Recurring = &stripe.PriceRecurringParams{
				Interval: stripe.String(priceConfig.Interval),
			}
			if priceConfig.IntervalCount > 0 {
				priceParams.Recurring.IntervalCount = stripe.Int64(int64(priceConfig.IntervalCount))
			}
		}

		// Set usage type for metered billing
		if priceConfig.UsageType != "" {
			priceParams.Recurring.UsageType = stripe.String(priceConfig.UsageType)

			// Set meter ID for metered usage (requires v82+ Stripe API)
			if priceConfig.UsageType == "metered" && priceConfig.Meter != "" {
				// Get the actual Stripe meter ID from our mapping
				stripeMeterId, err := h.idMapper.GetStripeIDByConfigItemID(priceConfig.Meter, "meter")
				if err != nil {
					// Fallback to using the configured meter ID directly (for backward compatibility)
					stripeMeterId = priceConfig.Meter
				}
				priceParams.Recurring.Meter = stripe.String(stripeMeterId)
			}
		}

		// Set billing scheme
		if priceConfig.BillingScheme != "" {
			priceParams.BillingScheme = stripe.String(priceConfig.BillingScheme)
		}

		// For tiered billing, we need to specify the tiers_mode as provided by user
		if priceConfig.BillingScheme == "tiered" && priceConfig.TiersMode != "" {
			priceParams.TiersMode = stripe.String(priceConfig.TiersMode)
		}

		// Handle tiered pricing
		if len(priceConfig.Tiers) > 0 {
			var tiers []*stripe.PriceTierParams
			for _, tier := range priceConfig.Tiers {
				tierParam := &stripe.PriceTierParams{}

				// Handle up_to field - Stripe requires this field to be present
				if upTo, ok := tier.UpTo.(string); ok && upTo == "inf" {
					// For "inf", we need to skip setting UpTo and handle this specially
					// We'll set it to nil and handle the "inf" case in the params construction
					tierParam.UpTo = nil
				} else if upTo, ok := tier.UpTo.(float64); ok {
					tierParam.UpTo = stripe.Int64(int64(upTo))
				} else if upTo, ok := tier.UpTo.(int); ok {
					tierParam.UpTo = stripe.Int64(int64(upTo))
				}

				if tier.FlatAmount != nil {
					tierParam.FlatAmount = tier.FlatAmount
				}

				if tier.UnitAmount != nil {
					tierParam.UnitAmount = tier.UnitAmount
				}

				tiers = append(tiers, tierParam)
			}
			priceParams.Tiers = tiers

			// Handle "inf" values by setting them directly in the params
			// We need to set the up_to field to "inf" string for infinite tiers
			for i, tier := range priceConfig.Tiers {
				if upTo, ok := tier.UpTo.(string); ok && upTo == "inf" {
					// We need to use AddExtra to set string "inf" for the up_to field
					priceParams.AddExtra(fmt.Sprintf("tiers[%d][up_to]", i), "inf")
				}
			}
		}

		// Add Connect account if in managed mode
		if h.accountID != "" {
			priceParams.SetStripeAccount(h.accountID)
		}

		stripePrice, err := price.New(priceParams)
		if err != nil {
			return nil, fmt.Errorf("failed to create price %s: %w", priceConfig.ID, err)
		}

		// Save price ID mapping if we have user and config IDs
		if configID != uuid.Nil {
			if err := h.idMapper.SaveIDMapping(configID, priceConfig.ID, stripePrice.ID, "price"); err != nil {
				return nil, fmt.Errorf("failed to save price ID mapping: %w", err)
			}
		}

		// Set as default price if specified
		if priceConfig.Default {
			defaultParams := &stripe.ProductParams{
				DefaultPrice: stripe.String(stripePrice.ID),
			}
			if h.accountID != "" {
				defaultParams.SetStripeAccount(h.accountID)
			}
			_, err := product.Update(stripeProductID, defaultParams)
			if err != nil {
				return nil, fmt.Errorf("failed to set default price %s: %w", priceConfig.ID, err)
			}
			details = append(details, fmt.Sprintf("Set as default price: %s", stripePrice.ID))
		}

		details = append(details, fmt.Sprintf("Created price: %s (config: %s)", stripePrice.ID, priceConfig.ID))
	}

	return details, nil
}

func (h *PriceHandler) CreatePrice(priceConfig models.Price, productID string, configID uuid.UUID) (string, error) {
	// Skip Stripe API for free prices
	if priceConfig.ID == "free" {
		if configID != uuid.Nil {
			if err := h.idMapper.SaveIDMapping(configID, priceConfig.ID, priceConfig.ID, "price"); err != nil {
				return "", fmt.Errorf("failed to save free price ID mapping: %w", err)
			}
		}
		// Note: Default price setting for "free" prices is handled at the application level
		// since we don't actually create them in Stripe
		return priceConfig.ID, nil
	}

	priceParams := &stripe.PriceParams{
		Product:  stripe.String(productID),
		Currency: stripe.String(priceConfig.Currency),
	}

	// Set price amount (only for non-tiered pricing)
	if priceConfig.BillingScheme != "tiered" {
		priceParams.UnitAmount = stripe.Int64(priceConfig.Amount)
	}

	if priceConfig.Interval != "" {
		priceParams.Recurring = &stripe.PriceRecurringParams{
			Interval: stripe.String(priceConfig.Interval),
		}
		if priceConfig.IntervalCount > 0 {
			priceParams.Recurring.IntervalCount = stripe.Int64(int64(priceConfig.IntervalCount))
		}
	}

	// Set usage type for metered billing
	if priceConfig.UsageType != "" {
		if priceParams.Recurring == nil {
			priceParams.Recurring = &stripe.PriceRecurringParams{}
		}
		priceParams.Recurring.UsageType = stripe.String(priceConfig.UsageType)

		// Set meter ID for metered usage (requires v82+ Stripe API)
		if priceConfig.UsageType == "metered" && priceConfig.Meter != "" {
			// Get the actual Stripe meter ID from our mapping
			stripeMeterId, err := h.idMapper.GetStripeIDByConfigItemID(priceConfig.Meter, "meter")
			if err != nil {
				// Fallback to using the configured meter ID directly (for backward compatibility)
				stripeMeterId = priceConfig.Meter
			}
			priceParams.Recurring.Meter = stripe.String(stripeMeterId)
		}
	}

	// Set billing scheme
	if priceConfig.BillingScheme != "" {
		priceParams.BillingScheme = stripe.String(priceConfig.BillingScheme)
	}

	// For tiered billing, we need to specify the tiers_mode as provided by user
	if priceConfig.BillingScheme == "tiered" && priceConfig.TiersMode != "" {
		priceParams.TiersMode = stripe.String(priceConfig.TiersMode)
	}

	// Handle tiered pricing
	if len(priceConfig.Tiers) > 0 {
		var tiers []*stripe.PriceTierParams
		for _, tier := range priceConfig.Tiers {
			tierParam := &stripe.PriceTierParams{}

			// Handle up_to field - Stripe requires this field to be present
			if upTo, ok := tier.UpTo.(string); ok && upTo == "inf" {
				// For "inf", we need to skip setting UpTo and handle this specially
				// We'll set it to nil and handle the "inf" case in the params construction
				tierParam.UpTo = nil
			} else if upTo, ok := tier.UpTo.(float64); ok {
				tierParam.UpTo = stripe.Int64(int64(upTo))
			} else if upTo, ok := tier.UpTo.(int); ok {
				tierParam.UpTo = stripe.Int64(int64(upTo))
			}

			if tier.FlatAmount != nil {
				tierParam.FlatAmount = tier.FlatAmount
			}

			if tier.UnitAmount != nil {
				tierParam.UnitAmount = tier.UnitAmount
			}

			tiers = append(tiers, tierParam)
		}
		priceParams.Tiers = tiers

		// Handle "inf" values by setting them directly in the params
		// We need to set the up_to field to "inf" string for infinite tiers
		for i, tier := range priceConfig.Tiers {
			if upTo, ok := tier.UpTo.(string); ok && upTo == "inf" {
				// We need to use AddExtra to set string "inf" for the up_to field
				priceParams.AddExtra(fmt.Sprintf("tiers[%d][up_to]", i), "inf")
			}
		}
	}

	// Add Connect account if in managed mode
	if h.accountID != "" {
		priceParams.SetStripeAccount(h.accountID)
	}

	stripePrice, err := price.New(priceParams)
	if err != nil {
		return "", fmt.Errorf("failed to create price: %w", err)
	}

	// Save the ID mapping for the new price with the current config
	if configID != uuid.Nil {
		if err := h.idMapper.SaveIDMapping(configID, priceConfig.ID, stripePrice.ID, "price"); err != nil {
			return "", fmt.Errorf("failed to save price ID mapping: %w", err)
		}
	}

	// Set as default price if specified
	if priceConfig.Default {
		defaultParams := &stripe.ProductParams{
			DefaultPrice: stripe.String(stripePrice.ID),
		}
		if h.accountID != "" {
			defaultParams.SetStripeAccount(h.accountID)
		}
		_, err := product.Update(productID, defaultParams)
		if err != nil {
			return "", fmt.Errorf("failed to set default price %s: %w", priceConfig.ID, err)
		}
	}

	return stripePrice.ID, nil
}

func (h *PriceHandler) ArchivePrice(priceConfigID string) error {
	// Skip Stripe API for free prices
	if priceConfigID == "free" {
		return nil // No Stripe archiving needed for free prices
	}

	var actualStripeID string

	// Try to get the actual Stripe ID from our mapping
	stripeID, err := h.idMapper.GetStripeIDByConfigItemID(priceConfigID, "price")
	if err == nil && stripeID != "" {
		actualStripeID = stripeID
	} else {
		// Fallback to using the config ID (might be an actual Stripe ID)
		actualStripeID = priceConfigID
	}

	archiveParams := &stripe.PriceParams{
		Active: stripe.Bool(false),
	}
	if h.accountID != "" {
		archiveParams.SetStripeAccount(h.accountID)
	}
	_, err = price.Update(actualStripeID, archiveParams)
	if err != nil {
		return fmt.Errorf("could not archive price %s (config: %s, tried Stripe ID: %s): %w", priceConfigID, priceConfigID, actualStripeID, err)
	}

	return nil
}
