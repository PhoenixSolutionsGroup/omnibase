package stripe_config

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"github.com/stripe/stripe-go/v82"

	"api/internal/database/repository"
)

var ArchiveAllError = errors.New("Failed to archive all stripe resources")

type ArchiveAllOptions struct {
	Force bool
}

type ArchiveAllResult struct {
	Archived []string
	Errors   []string
	Force    bool
}

func (s *Service) ArchiveAll(ctx context.Context, options ArchiveAllOptions) (*ArchiveAllResult, error) {
	result := &ArchiveAllResult{Force: options.Force}

	currentConfig, version := s.currentArchiveConfig(ctx)
	meterEventNames := make(map[string]bool)
	if currentConfig != nil {
		for _, meter := range currentConfig.Meters {
			meterEventNames[meter.EventName] = true
		}
	}

	promoParams := &stripe.PromotionCodeListParams{Active: stripe.Bool(true)}
	promoParams.Limit = stripe.Int64(100)
	s.stripe.ApplyAccount(promoParams)
	for promo, err := range s.stripe.Stripe.V1PromotionCodes.List(ctx, promoParams) {
		if err != nil {
			return nil, fmt.Errorf("%w: list promotion codes: %w", ArchiveAllError, err)
		}
		if !options.Force && !isManagedMetadata(promo.Metadata) {
			continue
		}
		updateParams := &stripe.PromotionCodeUpdateParams{Active: stripe.Bool(false)}
		s.stripe.ApplyAccount(updateParams)
		if _, err := s.stripe.Stripe.V1PromotionCodes.Update(ctx, promo.ID, updateParams); err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("promo_code %s: %v", promo.ID, err))
			continue
		}
		result.Archived = append(result.Archived, fmt.Sprintf("promo_code: %s (%s)", promo.ID, promo.Code))
	}

	couponParams := &stripe.CouponListParams{}
	couponParams.Limit = stripe.Int64(100)
	s.stripe.ApplyAccount(couponParams)
	for cpn, err := range s.stripe.Stripe.V1Coupons.List(ctx, couponParams) {
		if err != nil {
			return nil, fmt.Errorf("%w: list coupons: %w", ArchiveAllError, err)
		}
		if !options.Force && !isManagedMetadata(cpn.Metadata) {
			continue
		}
		deleteParams := &stripe.CouponDeleteParams{}
		s.stripe.ApplyAccount(deleteParams)
		if _, err := s.stripe.Stripe.V1Coupons.Delete(ctx, cpn.ID, deleteParams); err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("coupon %s: %v", cpn.ID, err))
			continue
		}
		result.Archived = append(result.Archived, fmt.Sprintf("coupon: %s (%s)", cpn.ID, cpn.Name))
	}

	meterParams := &stripe.BillingMeterListParams{Status: stripe.String("active")}
	meterParams.Limit = stripe.Int64(100)
	s.stripe.ApplyAccount(meterParams)
	for m, err := range s.stripe.Stripe.V1BillingMeters.List(ctx, meterParams) {
		if err != nil {
			return nil, fmt.Errorf("%w: list meters: %w", ArchiveAllError, err)
		}
		if !options.Force && !meterEventNames[m.EventName] {
			continue
		}
		params := &stripe.BillingMeterDeactivateParams{}
		s.stripe.ApplyAccount(params)
		if _, err := s.stripe.Stripe.V1BillingMeters.Deactivate(ctx, m.ID, params); err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("meter %s: %v", m.ID, err))
			continue
		}
		result.Archived = append(result.Archived, fmt.Sprintf("meter: %s (%s)", m.ID, m.DisplayName))
	}

	webhookParams := &stripe.WebhookEndpointListParams{}
	webhookParams.Limit = stripe.Int64(100)
	s.stripe.ApplyAccount(webhookParams)
	for endpoint, err := range s.stripe.Stripe.V1WebhookEndpoints.List(ctx, webhookParams) {
		if err != nil {
			return nil, fmt.Errorf("%w: list webhooks: %w", ArchiveAllError, err)
		}
		if !options.Force && !isManagedMetadata(endpoint.Metadata) {
			continue
		}
		if err := s.DeleteWebhook(ctx, endpoint.ID); err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("webhook %s: %v", endpoint.ID, err))
			continue
		}
		result.Archived = append(result.Archived, fmt.Sprintf("webhook: %s (%s)", endpoint.ID, endpoint.URL))
	}

	priceListParams := &stripe.PriceListParams{Active: stripe.Bool(true)}
	priceListParams.Limit = stripe.Int64(100)
	s.stripe.ApplyAccount(priceListParams)
	for p, err := range s.stripe.Stripe.V1Prices.List(ctx, priceListParams) {
		if err != nil {
			return nil, fmt.Errorf("%w: list prices: %w", ArchiveAllError, err)
		}
		if !options.Force && !isManagedMetadata(p.Metadata) {
			continue
		}
		params := &stripe.PriceUpdateParams{Active: stripe.Bool(false)}
		s.stripe.ApplyAccount(params)
		if _, err := s.stripe.Stripe.V1Prices.Update(ctx, p.ID, params); err != nil {
			if !isDefaultPriceArchiveError(err) || p.Product == nil {
				result.Errors = append(result.Errors, fmt.Sprintf("price %s: %v", p.ID, err))
				continue
			}
			clearParams := &stripe.ProductUpdateParams{DefaultPrice: stripe.String("")}
			s.stripe.ApplyAccount(clearParams)
			if _, clearErr := s.stripe.Stripe.V1Products.Update(ctx, p.Product.ID, clearParams); clearErr != nil {
				result.Errors = append(result.Errors, fmt.Sprintf("price %s: clear default price: %v", p.ID, clearErr))
				continue
			}
			if _, retryErr := s.stripe.Stripe.V1Prices.Update(ctx, p.ID, params); retryErr != nil {
				result.Errors = append(result.Errors, fmt.Sprintf("price %s: %v", p.ID, retryErr))
				continue
			}
		}
		result.Archived = append(result.Archived, fmt.Sprintf("price: %s", p.ID))
	}

	productListParams := &stripe.ProductListParams{Active: stripe.Bool(true)}
	productListParams.Limit = stripe.Int64(100)
	s.stripe.ApplyAccount(productListParams)
	for p, err := range s.stripe.Stripe.V1Products.List(ctx, productListParams) {
		if err != nil {
			return nil, fmt.Errorf("%w: list products: %w", ArchiveAllError, err)
		}
		if !options.Force && !isManagedMetadata(p.Metadata) {
			continue
		}
		params := &stripe.ProductUpdateParams{Active: stripe.Bool(false)}
		s.stripe.ApplyAccount(params)
		if _, err := s.stripe.Stripe.V1Products.Update(ctx, p.ID, params); err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("product %s: %v", p.ID, err))
			continue
		}
		result.Archived = append(result.Archived, fmt.Sprintf("product: %s (%s)", p.ID, p.Name))
	}

	empty := ConfigData{
		"version":         version,
		"meters":          []any{},
		"products":        []any{},
		"coupons":         []any{},
		"promotion_codes": []any{},
	}
	emptyBytes, err := json.Marshal(empty)
	if err != nil {
		return nil, fmt.Errorf("%w: marshal empty config: %w", ArchiveAllError, err)
	}
	if _, err := s.repo.CreateStripeConfig(ctx, repository.CreateStripeConfigParams{
		Config:  emptyBytes,
		Version: version,
	}); err != nil {
		return nil, fmt.Errorf("%w: persist empty config: %w", ArchiveAllError, err)
	}
	s.invalidateIdentityCache()
	return result, nil
}

func isDefaultPriceArchiveError(err error) bool {
	var stripeErr *stripe.Error
	return errors.As(err, &stripeErr) && strings.Contains(strings.ToLower(stripeErr.Msg), "default price")
}

func (s *Service) currentArchiveConfig(ctx context.Context) (*StripeConfiguration, string) {
	version := "1.0.0"
	latest, err := s.repo.GetLatestStripeConfig(ctx)
	if err != nil {
		return nil, version
	}
	var raw ConfigData
	if err := json.Unmarshal(latest.Config, &raw); err != nil {
		return nil, version
	}
	parsed, err := s.validator.ParseAndValidateConfig(raw)
	if err != nil {
		return nil, version
	}
	return parsed, parsed.Version
}
