package handlers

import (
	"api/internal/logger"
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
	logger.Logger.Info("Creating prices for product",
		"productID", productConfig.ID,
		"stripeProductID", stripeProductID,
		"priceCount", len(productConfig.Prices))

	var details []string

	// Create prices for the product
	for _, priceConfig := range productConfig.Prices {
		// Check if stripe_id is provided for migration support
		if priceConfig.StripeID != "" {
			logger.Logger.Info("Price has stripe_id, checking for existing mapping",
				"priceID", priceConfig.ID,
				"stripeID", priceConfig.StripeID)

			// Check if mapping already exists for this config_id
			existingMapping, err := h.idMapper.GetMappingByConfigItemID(priceConfig.ID, "price")

			if err != nil {
				return nil, fmt.Errorf("failed to check existing mapping: %w", err)
			}

			if existingMapping != nil {
				// Mapping exists - SKIP
				logger.Logger.Info("Skipped price - stripe_id already linked",
					"priceID", priceConfig.ID,
					"existingStripeID", existingMapping.StripeID)

				details = append(details, fmt.Sprintf("Skipped price %s as stripe_id has already been linked to %s. Remove the stripe_id mapping to modify this resource.",
					priceConfig.ID, existingMapping.StripeID))
				continue
			}

			// No mapping exists - CREATE mapping with provided stripe_id
			logger.Logger.Info("Creating stripe_id mapping from config",
				"priceID", priceConfig.ID,
				"stripeID", priceConfig.StripeID)

			if configID != uuid.Nil {
				if err := h.idMapper.SaveIDMapping(configID, priceConfig.ID, priceConfig.StripeID, "price"); err != nil {
					return nil, fmt.Errorf("failed to create price mapping: %w", err)
				}
			}

			details = append(details, fmt.Sprintf("Linked existing Stripe price %s to config ID %s", priceConfig.StripeID, priceConfig.ID))
			continue
		}

		// Skip Stripe API for free prices
		if priceConfig.ID == "free" {
			logger.Logger.Debug("Skipping free price (local only)", "priceID", priceConfig.ID)
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

		// Set tax behavior
		taxBehavior := "exclusive" // default
		if priceConfig.TaxIncludedInPrice != nil && *priceConfig.TaxIncludedInPrice {
			taxBehavior = "inclusive"
		}
		priceParams.TaxBehavior = stripe.String(taxBehavior)

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

		ApplyConnectAccount(h.accountID, priceParams)

		logger.Logger.Info("Making Stripe API call to create price",
			"priceID", priceConfig.ID,
			"productID", productConfig.ID,
			"amount", priceConfig.Amount,
			"currency", priceConfig.Currency)
		stripePrice, err := price.New(priceParams)
		if err != nil {
			logger.Logger.Error("Failed to create Stripe price",
				"error", err,
				"priceID", priceConfig.ID,
				"productID", productConfig.ID)
			return nil, fmt.Errorf("failed to create price %s: %w", priceConfig.ID, err)
		}
		logger.Logger.Info("Stripe price created successfully", "configPriceID", priceConfig.ID, "stripeID", stripePrice.ID)

		// Save price ID mapping if we have user and config IDs
		if configID != uuid.Nil {
			if err := h.idMapper.SaveIDMapping(configID, priceConfig.ID, stripePrice.ID, "price"); err != nil {
				logger.Logger.Error("Failed to save price ID mapping", "error", err, "priceID", priceConfig.ID)
				return nil, fmt.Errorf("failed to save price ID mapping: %w", err)
			}
		}

		// Set as default price if specified
		if priceConfig.Default {
			logger.Logger.Debug("Setting default price", "priceID", stripePrice.ID, "productID", stripeProductID)
			defaultParams := &stripe.ProductParams{
				DefaultPrice: stripe.String(stripePrice.ID),
			}
			ApplyConnectAccount(h.accountID, defaultParams)
			_, err := product.Update(stripeProductID, defaultParams)
			if err != nil {
				logger.Logger.Error("Failed to set default price", "error", err, "priceID", priceConfig.ID)
				return nil, fmt.Errorf("failed to set default price %s: %w", priceConfig.ID, err)
			}
			details = append(details, fmt.Sprintf("Set as default price: %s", stripePrice.ID))
		}

		details = append(details, fmt.Sprintf("Created price: %s (config: %s)", stripePrice.ID, priceConfig.ID))
	}

	logger.Logger.Info("All prices created for product", "productID", productConfig.ID, "priceCount", len(productConfig.Prices))
	return details, nil
}

func (h *PriceHandler) CreatePrice(priceConfig models.Price, productID string, configID uuid.UUID) (string, error) {
	logger.Logger.Info("Creating price", "priceID", priceConfig.ID, "productID", productID)

	// Check if stripe_id is provided for migration support
	if priceConfig.StripeID != "" {
		logger.Logger.Info("Price has stripe_id, checking for existing mapping",
			"priceID", priceConfig.ID,
			"stripeID", priceConfig.StripeID)

		// Check if mapping already exists for this config_id
		existingMapping, err := h.idMapper.GetMappingByConfigItemID(priceConfig.ID, "price")

		if err != nil {
			return "", fmt.Errorf("failed to check existing mapping: %w", err)
		}

		if existingMapping != nil {
			// Mapping exists - SKIP and return the existing Stripe ID
			logger.Logger.Info("Skipped price - stripe_id already linked",
				"priceID", priceConfig.ID,
				"existingStripeID", existingMapping.StripeID)

			return existingMapping.StripeID, nil
		}

		// No mapping exists - CREATE mapping with provided stripe_id
		logger.Logger.Info("Creating stripe_id mapping from config",
			"priceID", priceConfig.ID,
			"stripeID", priceConfig.StripeID)

		if configID != uuid.Nil {
			if err := h.idMapper.SaveIDMapping(configID, priceConfig.ID, priceConfig.StripeID, "price"); err != nil {
				return "", fmt.Errorf("failed to create price mapping: %w", err)
			}
		}

		return priceConfig.StripeID, nil
	}

	// Skip Stripe API for free prices
	if priceConfig.ID == "free" {
		logger.Logger.Debug("Skipping free price (local only)", "priceID", priceConfig.ID)
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

	// Set tax behavior
	taxBehavior := "exclusive" // default
	if priceConfig.TaxIncludedInPrice != nil && *priceConfig.TaxIncludedInPrice {
		taxBehavior = "inclusive"
	}
	priceParams.TaxBehavior = stripe.String(taxBehavior)

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

	ApplyConnectAccount(h.accountID, priceParams)

	logger.Logger.Info("Making Stripe API call to create price", "priceID", priceConfig.ID, "productID", productID)
	stripePrice, err := price.New(priceParams)
	if err != nil {
		logger.Logger.Error("Failed to create Stripe price", "error", err, "priceID", priceConfig.ID)
		return "", fmt.Errorf("failed to create price: %w", err)
	}
	logger.Logger.Info("Stripe price created successfully", "configPriceID", priceConfig.ID, "stripeID", stripePrice.ID)

	// Save the ID mapping for the new price with the current config
	if configID != uuid.Nil {
		if err := h.idMapper.SaveIDMapping(configID, priceConfig.ID, stripePrice.ID, "price"); err != nil {
			logger.Logger.Error("Failed to save price ID mapping", "error", err, "priceID", priceConfig.ID)
			return "", fmt.Errorf("failed to save price ID mapping: %w", err)
		}
	}

	// Set as default price if specified
	if priceConfig.Default {
		logger.Logger.Debug("Setting default price", "priceID", stripePrice.ID, "productID", productID)
		defaultParams := &stripe.ProductParams{
			DefaultPrice: stripe.String(stripePrice.ID),
		}
		ApplyConnectAccount(h.accountID, defaultParams)
		_, err := product.Update(productID, defaultParams)
		if err != nil {
			logger.Logger.Error("Failed to set default price", "error", err, "priceID", priceConfig.ID)
			return "", fmt.Errorf("failed to set default price %s: %w", priceConfig.ID, err)
		}
	}

	return stripePrice.ID, nil
}

func (h *PriceHandler) ArchivePrice(priceConfigID string) error {
	logger.Logger.Info("Archiving price", "priceID", priceConfigID)

	// Skip Stripe API for free prices
	if priceConfigID == "free" {
		logger.Logger.Debug("Skipping free price archival", "priceID", priceConfigID)
		return nil // No Stripe archiving needed for free prices
	}

	var actualStripeID string

	// Try to get the actual Stripe ID from our mapping
	stripeID, err := h.idMapper.GetStripeIDByConfigItemID(priceConfigID, "price")
	if err == nil && stripeID != "" {
		actualStripeID = stripeID
		logger.Logger.Debug("Found Stripe ID mapping", "configPriceID", priceConfigID, "stripeID", actualStripeID)
	} else {
		// Fallback to using the config ID (might be an actual Stripe ID)
		actualStripeID = priceConfigID
		logger.Logger.Warn("No Stripe ID mapping found, using config ID", "priceID", priceConfigID)
	}

	archiveParams := &stripe.PriceParams{
		Active: stripe.Bool(false),
	}
	ApplyConnectAccount(h.accountID, archiveParams)

	logger.Logger.Info("Making Stripe API call to archive price", "stripeID", actualStripeID)
	_, err = price.Update(actualStripeID, archiveParams)
	if err != nil {
		logger.Logger.Error("Failed to archive Stripe price", "error", err, "priceID", priceConfigID, "stripeID", actualStripeID)
		return fmt.Errorf("could not archive price %s (config: %s, tried Stripe ID: %s): %w", priceConfigID, priceConfigID, actualStripeID, err)
	}

	logger.Logger.Info("Price archived successfully", "priceID", priceConfigID, "stripeID", actualStripeID)
	return nil
}
