package stripe_config

import (
	"context"
	"errors"
	"fmt"

	"github.com/stripe/stripe-go/v82"
)

var CreatePriceError = errors.New("Failed to create stripe price")

func (s *Service) createPrice(ctx context.Context, priceConfig Price, stripeProductID, meterStripeID string, transferLookupKey bool) (string, string, error) {
	if priceConfig.StripeID != "" {
		tagParams := &stripe.PriceUpdateParams{
			Active:    stripe.Bool(true),
			LookupKey: stripe.String(priceConfig.ID),
			Metadata:  managedMetadata("price", priceConfig.ID, priceConfigHash(priceConfig), nil),
		}
		if transferLookupKey {
			tagParams.TransferLookupKey = stripe.Bool(true)
		}
		s.stripe.ApplyAccount(tagParams)
		if _, err := s.stripe.Stripe.V1Prices.Update(ctx, priceConfig.StripeID, tagParams); err != nil {
			return "", "", fmt.Errorf("failed to tag linked price %s: %w", priceConfig.ID, err)
		}
		return priceConfig.StripeID, fmt.Sprintf("Linked existing Stripe price %s to config ID %s", priceConfig.StripeID, priceConfig.ID), nil
	}

	if priceConfig.ID == "free" {
		return priceConfig.ID, fmt.Sprintf("Created free price: %s (local only)", priceConfig.ID), nil
	}

	params := &stripe.PriceCreateParams{
		Product:           stripe.String(stripeProductID),
		Currency:          stripe.String(priceConfig.Currency),
		LookupKey:         stripe.String(priceConfig.ID),
		TransferLookupKey: stripe.Bool(transferLookupKey),
		Metadata:          managedMetadata("price", priceConfig.ID, priceConfigHash(priceConfig), nil),
	}
	if priceConfig.TaxIncludedInPrice != nil {
		if *priceConfig.TaxIncludedInPrice {
			params.TaxBehavior = stripe.String("inclusive")
		} else {
			params.TaxBehavior = stripe.String("exclusive")
		}
	}

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
			meter := meterStripeID
			if meter == "" {
				meter = priceConfig.Meter
			}
			params.Recurring.Meter = stripe.String(meter)
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
		archived, findErr := s.findArchivedPriceByLookupKey(ctx, priceConfig.ID)
		if findErr != nil {
			return "", "", fmt.Errorf("%w: %w", CreatePriceError, findErr)
		}
		if archived != nil {
			if archived.Product != nil && archived.Product.ID == stripeProductID {
				updateParams := &stripe.PriceUpdateParams{
					Active:   stripe.Bool(true),
					Metadata: managedMetadata("price", priceConfig.ID, priceConfigHash(priceConfig), nil),
				}
				s.stripe.ApplyAccount(updateParams)
				updated, updateErr := s.stripe.Stripe.V1Prices.Update(ctx, archived.ID, updateParams)
				if updateErr != nil {
					return "", "", fmt.Errorf("%w: failed to reactivate archived price %s: %w", CreatePriceError, archived.ID, updateErr)
				}
				return updated.ID, fmt.Sprintf("Reactivated archived price: %s (config: %s)", updated.ID, priceConfig.ID), nil
			}

			params.TransferLookupKey = stripe.Bool(true)
			s.stripe.ApplyAccount(params)
			stripePrice, err = s.stripe.Stripe.V1Prices.Create(ctx, params)
			if err == nil {
				return stripePrice.ID, fmt.Sprintf("Created price with transferred lookup key: %s (config: %s)", stripePrice.ID, priceConfig.ID), nil
			}
		}
		return "", "", fmt.Errorf("%w: %w", CreatePriceError, err)
	}
	return stripePrice.ID, fmt.Sprintf("Created price: %s (config: %s)", stripePrice.ID, priceConfig.ID), nil
}

func (s *Service) findArchivedPriceByLookupKey(ctx context.Context, configPriceID string) (*stripe.Price, error) {
	params := &stripe.PriceListParams{LookupKeys: []*string{stripe.String(configPriceID)}}
	params.Limit = stripe.Int64(100)
	s.stripe.ApplyAccount(params)
	for price, err := range s.stripe.Stripe.V1Prices.List(ctx, params) {
		if err != nil {
			return nil, fmt.Errorf("failed to find archived price %s: %w", configPriceID, err)
		}
		if price.Metadata[MetadataKeyConfigID] == configPriceID {
			return price, nil
		}
	}
	return nil, nil
}

func (s *Service) archivePriceByStripeID(ctx context.Context, stripeID string) error {
	if stripeID == "free" {
		return nil
	}
	params := &stripe.PriceUpdateParams{Active: stripe.Bool(false)}
	s.stripe.ApplyAccount(params)
	if _, err := s.stripe.Stripe.V1Prices.Update(ctx, stripeID, params); err != nil {
		if stripeErr, ok := err.(*stripe.Error); ok && stripeErr.Code == stripe.ErrorCodeResourceMissing {
			return nil
		}
		if !isDefaultPriceArchiveError(err) {
			return fmt.Errorf("could not archive price %s: %w", stripeID, err)
		}

		getParams := &stripe.PriceRetrieveParams{}
		s.stripe.ApplyAccount(getParams)
		livePrice, getErr := s.stripe.Stripe.V1Prices.Retrieve(ctx, stripeID, getParams)
		if getErr != nil || livePrice.Product == nil {
			return fmt.Errorf("could not archive price %s: %w", stripeID, err)
		}
		clearParams := &stripe.ProductUpdateParams{DefaultPrice: stripe.String("")}
		s.stripe.ApplyAccount(clearParams)
		if _, clearErr := s.stripe.Stripe.V1Products.Update(ctx, livePrice.Product.ID, clearParams); clearErr != nil {
			return fmt.Errorf("could not clear default price for %s: %w", stripeID, clearErr)
		}
		if _, retryErr := s.stripe.Stripe.V1Prices.Update(ctx, stripeID, params); retryErr != nil {
			return fmt.Errorf("could not archive price %s: %w", stripeID, retryErr)
		}
	}
	return nil
}

func (s *Service) setDefaultPrice(ctx context.Context, productStripeID, priceStripeID string) error {
	params := &stripe.ProductUpdateParams{DefaultPrice: stripe.String(priceStripeID)}
	s.stripe.ApplyAccount(params)
	if _, err := s.stripe.Stripe.V1Products.Update(ctx, productStripeID, params); err != nil {
		return fmt.Errorf("failed to set default price %s on product %s: %w", priceStripeID, productStripeID, err)
	}
	return nil
}

func buildTierParams(tiers []Tier) []*stripe.PriceCreateTierParams {
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
