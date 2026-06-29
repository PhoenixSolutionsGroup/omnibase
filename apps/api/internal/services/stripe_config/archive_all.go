package stripe_config

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/stripe/stripe-go/v82"

	"api/internal/database/repository"
	"api/internal/models"
)

var ArchiveAllError = errors.New("Failed to archive all stripe resources")

type ArchiveAllResult struct {
	Archived []string
	Errors   []string
}

func (s *Service) ArchiveAll(ctx context.Context) (*ArchiveAllResult, error) {
	result := &ArchiveAllResult{}

	promoParams := &stripe.PromotionCodeListParams{}
	promoParams.Filters.AddFilter("active", "", "true")
	s.stripe.ApplyAccount(promoParams)
	for promo, err := range s.stripe.Stripe.V1PromotionCodes.List(ctx, promoParams) {
		if err != nil {
			return nil, fmt.Errorf("%w: list promotion codes: %w", ArchiveAllError, err)
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
	s.stripe.ApplyAccount(couponParams)
	for cpn, err := range s.stripe.Stripe.V1Coupons.List(ctx, couponParams) {
		if err != nil {
			return nil, fmt.Errorf("%w: list coupons: %w", ArchiveAllError, err)
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
	s.stripe.ApplyAccount(meterParams)
	for m, err := range s.stripe.Stripe.V1BillingMeters.List(ctx, meterParams) {
		if err != nil {
			return nil, fmt.Errorf("%w: list meters: %w", ArchiveAllError, err)
		}
		params := &stripe.BillingMeterDeactivateParams{}
		s.stripe.ApplyAccount(params)
		if _, err := s.stripe.Stripe.V1BillingMeters.Deactivate(ctx, m.ID, params); err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("meter %s: %v", m.ID, err))
			continue
		}
		result.Archived = append(result.Archived, fmt.Sprintf("meter: %s (%s)", m.ID, m.DisplayName))
	}

	priceListParams := &stripe.PriceListParams{}
	priceListParams.Filters.AddFilter("active", "", "true")
	s.stripe.ApplyAccount(priceListParams)
	for p, err := range s.stripe.Stripe.V1Prices.List(ctx, priceListParams) {
		if err != nil {
			return nil, fmt.Errorf("%w: list prices: %w", ArchiveAllError, err)
		}
		params := &stripe.PriceUpdateParams{Active: stripe.Bool(false)}
		s.stripe.ApplyAccount(params)
		if _, err := s.stripe.Stripe.V1Prices.Update(ctx, p.ID, params); err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("price %s: %v", p.ID, err))
			continue
		}
		result.Archived = append(result.Archived, fmt.Sprintf("price: %s", p.ID))
	}

	productListParams := &stripe.ProductListParams{}
	productListParams.Filters.AddFilter("active", "", "true")
	s.stripe.ApplyAccount(productListParams)
	for p, err := range s.stripe.Stripe.V1Products.List(ctx, productListParams) {
		if err != nil {
			return nil, fmt.Errorf("%w: list products: %w", ArchiveAllError, err)
		}
		params := &stripe.ProductUpdateParams{Active: stripe.Bool(false)}
		s.stripe.ApplyAccount(params)
		if _, err := s.stripe.Stripe.V1Products.Update(ctx, p.ID, params); err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("product %s: %v", p.ID, err))
			continue
		}
		result.Archived = append(result.Archived, fmt.Sprintf("product: %s (%s)", p.ID, p.Name))
	}

	version := "1.0.0"
	if latest, err := s.repo.GetLatestStripeConfig(ctx); err == nil {
		var raw models.StripeConfigData
		if err := json.Unmarshal(latest.Config, &raw); err == nil {
			if parsed, err := s.validator.ParseAndValidateConfig(raw); err == nil {
				version = parsed.Version
			}
		}
	}

	empty := models.StripeConfigData{
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
	return result, nil
}
