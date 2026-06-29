package stripe_config

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/stripe/stripe-go/v82"

	"api/internal/models"
)

var CreatePriceError = errors.New("Failed to create stripe price")

func (s *Service) createPricesForProduct(ctx context.Context, productConfig models.Product, stripeProductID string, configID uuid.UUID) ([]string, error) {
	var details []string
	for _, priceConfig := range productConfig.Prices {
		stripeID, detail, err := s.createPriceInternal(ctx, priceConfig, stripeProductID, configID)
		if err != nil {
			return nil, fmt.Errorf("failed to create price %s: %w", priceConfig.ID, err)
		}
		if detail != "" {
			details = append(details, detail)
		}
		if priceConfig.Default && stripeID != "" && priceConfig.ID != "free" {
			defaultParams := &stripe.ProductUpdateParams{DefaultPrice: stripe.String(stripeID)}
			s.stripe.ApplyAccount(defaultParams)
			if _, err := s.stripe.Stripe.V1Products.Update(ctx, stripeProductID, defaultParams); err != nil {
				return nil, fmt.Errorf("failed to set default price %s: %w", priceConfig.ID, err)
			}
			details = append(details, fmt.Sprintf("Set as default price: %s", stripeID))
		}
	}
	return details, nil
}

func (s *Service) createPrice(ctx context.Context, priceConfig models.Price, productID string, configID uuid.UUID) (string, error) {
	stripeID, _, err := s.createPriceInternal(ctx, priceConfig, productID, configID)
	if err != nil {
		return "", err
	}
	if priceConfig.Default && stripeID != "" && priceConfig.ID != "free" {
		defaultParams := &stripe.ProductUpdateParams{DefaultPrice: stripe.String(stripeID)}
		s.stripe.ApplyAccount(defaultParams)
		if _, err := s.stripe.Stripe.V1Products.Update(ctx, productID, defaultParams); err != nil {
			return "", fmt.Errorf("failed to set default price %s: %w", priceConfig.ID, err)
		}
	}
	return stripeID, nil
}

func (s *Service) createPriceInternal(ctx context.Context, priceConfig models.Price, stripeProductID string, configID uuid.UUID) (string, string, error) {
	if priceConfig.StripeID != "" {
		existing, err := s.GetMapping(ctx, priceConfig.ID, "price")
		if err != nil {
			return "", "", err
		}
		if existing != nil {
			return existing.StripeID, fmt.Sprintf("Skipped price %s as stripe_id has already been linked to %s. Remove the stripe_id mapping to modify this resource.",
				priceConfig.ID, existing.StripeID), nil
		}
		if configID != uuid.Nil {
			if err := s.SaveMapping(ctx, configID, priceConfig.ID, priceConfig.StripeID, "price"); err != nil {
				return "", "", err
			}
		}
		return priceConfig.StripeID, fmt.Sprintf("Linked existing Stripe price %s to config ID %s", priceConfig.StripeID, priceConfig.ID), nil
	}

	if priceConfig.ID == "free" {
		if configID != uuid.Nil {
			if err := s.SaveMapping(ctx, configID, priceConfig.ID, priceConfig.ID, "price"); err != nil {
				return "", "", err
			}
		}
		return priceConfig.ID, fmt.Sprintf("Created free price: %s (local only)", priceConfig.ID), nil
	}

	params := &stripe.PriceCreateParams{
		Product:  stripe.String(stripeProductID),
		Currency: stripe.String(priceConfig.Currency),
	}
	taxBehavior := "exclusive"
	if priceConfig.TaxIncludedInPrice != nil && *priceConfig.TaxIncludedInPrice {
		taxBehavior = "inclusive"
	}
	params.TaxBehavior = stripe.String(taxBehavior)

	if priceConfig.BillingScheme != "tiered" {
		params.UnitAmountDecimal = stripe.Float64(priceConfig.Amount)
	}
	if priceConfig.Interval != "" {
		params.Recurring = &stripe.PriceCreateRecurringParams{
			Interval: stripe.String(priceConfig.Interval),
		}
		if priceConfig.IntervalCount > 0 {
			params.Recurring.IntervalCount = stripe.Int64(int64(priceConfig.IntervalCount))
		}
	}
	if priceConfig.UsageType != "" {
		if params.Recurring == nil {
			params.Recurring = &stripe.PriceCreateRecurringParams{}
		}
		params.Recurring.UsageType = stripe.String(priceConfig.UsageType)
		if priceConfig.UsageType == "metered" && priceConfig.Meter != "" {
			stripeMeterID, err := s.GetStripeIDByConfigItemID(ctx, priceConfig.Meter, "meter")
			if err != nil || stripeMeterID == "" {
				stripeMeterID = priceConfig.Meter
			}
			params.Recurring.Meter = stripe.String(stripeMeterID)
		}
	}
	if priceConfig.BillingScheme != "" {
		params.BillingScheme = stripe.String(priceConfig.BillingScheme)
	}
	if priceConfig.BillingScheme == "tiered" && priceConfig.TiersMode != "" {
		params.TiersMode = stripe.String(priceConfig.TiersMode)
	}
	if len(priceConfig.Tiers) > 0 {
		params.Tiers = buildTierParams(priceConfig.Tiers)
	}
	s.stripe.ApplyAccount(params)

	stripePrice, err := s.stripe.Stripe.V1Prices.Create(ctx, params)
	if err != nil {
		return "", "", fmt.Errorf("%w: %w", CreatePriceError, err)
	}
	if configID != uuid.Nil {
		if err := s.SaveMapping(ctx, configID, priceConfig.ID, stripePrice.ID, "price"); err != nil {
			return "", "", err
		}
	}
	return stripePrice.ID, fmt.Sprintf("Created price: %s (config: %s)", stripePrice.ID, priceConfig.ID), nil
}

func (s *Service) archivePrice(ctx context.Context, priceConfigID string) error {
	if priceConfigID == "free" {
		return nil
	}
	stripeID, _ := s.GetStripeIDByConfigItemID(ctx, priceConfigID, "price")
	if stripeID == "" {
		stripeID = priceConfigID
	}
	params := &stripe.PriceUpdateParams{Active: stripe.Bool(false)}
	s.stripe.ApplyAccount(params)
	if _, err := s.stripe.Stripe.V1Prices.Update(ctx, stripeID, params); err != nil {
		return fmt.Errorf("could not archive price %s (tried Stripe ID: %s): %w", priceConfigID, stripeID, err)
	}
	return nil
}

func buildTierParams(tiers []models.Tier) []*stripe.PriceCreateTierParams {
	out := make([]*stripe.PriceCreateTierParams, 0, len(tiers))
	for _, tier := range tiers {
		t := &stripe.PriceCreateTierParams{}
		switch v := tier.UpTo.(type) {
		case string:
			if v == "inf" {
				t.UpToInf = stripe.Bool(true)
			}
		case float64:
			t.UpTo = stripe.Int64(int64(v))
		case int:
			t.UpTo = stripe.Int64(int64(v))
		}
		if tier.FlatAmount != nil {
			t.FlatAmount = tier.FlatAmount
		}
		if tier.UnitAmount != nil {
			t.UnitAmount = tier.UnitAmount
		}
		out = append(out, t)
	}
	return out
}
