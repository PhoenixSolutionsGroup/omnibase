package stripe_config

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/stripe/stripe-go/v82"

	"api/internal/models"
)

var CreatePromotionCodeError = errors.New("Failed to create stripe promotion code")

func (s *Service) createPromotionCode(ctx context.Context, promoConfig models.PromotionCode, configID uuid.UUID) (*models.PromotionCodeChange, error) {
	if promoConfig.StripeID != "" {
		existing, err := s.GetMapping(ctx, promoConfig.ID, "promotion_code")
		if err != nil {
			return nil, err
		}
		if existing != nil {
			return &models.PromotionCodeChange{
				PromoID: promoConfig.ID,
				Code:    promoConfig.Code,
				Action:  "skipped",
			}, nil
		}
		if configID != uuid.Nil {
			if err := s.SaveMapping(ctx, configID, promoConfig.ID, promoConfig.StripeID, "promotion_code"); err != nil {
				return nil, err
			}
		}
		return &models.PromotionCodeChange{
			PromoID:  promoConfig.ID,
			Code:     promoConfig.Code,
			Action:   "linked",
			StripeID: promoConfig.StripeID,
		}, nil
	}

	couponStripeID, err := s.GetStripeIDByConfigItemID(ctx, promoConfig.Coupon, "coupon")
	if err != nil {
		return nil, fmt.Errorf("failed to resolve coupon ID %s: %w", promoConfig.Coupon, err)
	}
	params := buildPromotionCodeCreateParams(promoConfig, couponStripeID)
	s.stripe.ApplyAccount(params)
	stripePromo, err := s.stripe.Stripe.V1PromotionCodes.Create(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("%w: %w", CreatePromotionCodeError, err)
	}
	if configID != uuid.Nil {
		if err := s.SaveMapping(ctx, configID, promoConfig.ID, stripePromo.ID, "promotion_code"); err != nil {
			return nil, err
		}
	}
	return &models.PromotionCodeChange{
		PromoID:  promoConfig.ID,
		Code:     promoConfig.Code,
		Action:   "created",
		StripeID: stripePromo.ID,
	}, nil
}

func (s *Service) updatePromotionCode(ctx context.Context, update models.PromoCodeUpdate) (*models.PromotionCodeChange, error) {
	stripeID, err := s.GetStripeIDByConfigItemID(ctx, update.ID, "promotion_code")
	if err != nil {
		return nil, fmt.Errorf("failed to get Stripe ID for promotion code: %w", err)
	}
	if len(update.FieldChanges) > 0 {
		params := &stripe.PromotionCodeUpdateParams{}
		if active, ok := update.FieldChanges["active"].(bool); ok {
			params.Active = stripe.Bool(active)
		}
		if metadata, ok := update.FieldChanges["metadata"].(map[string]string); ok {
			params.Metadata = metadata
		}
		s.stripe.ApplyAccount(params)
		if _, err := s.stripe.Stripe.V1PromotionCodes.Update(ctx, stripeID, params); err != nil {
			return nil, fmt.Errorf("failed to update promotion code: %w", err)
		}
	}
	code := ""
	if c, ok := update.FieldChanges["code"].(string); ok {
		code = c
	}
	return &models.PromotionCodeChange{
		PromoID:  update.ID,
		Code:     code,
		Action:   "updated",
		StripeID: stripeID,
	}, nil
}

func (s *Service) deactivatePromotionCode(ctx context.Context, promoID string) (*models.PromotionCodeChange, error) {
	stripeID, err := s.GetStripeIDByConfigItemID(ctx, promoID, "promotion_code")
	if err != nil || stripeID == "" {
		return &models.PromotionCodeChange{
			PromoID: promoID,
			Code:    promoID,
			Action:  "deactivated",
		}, nil
	}
	params := &stripe.PromotionCodeUpdateParams{Active: stripe.Bool(false)}
	s.stripe.ApplyAccount(params)
	stripePromo, err := s.stripe.Stripe.V1PromotionCodes.Update(ctx, stripeID, params)
	if err != nil {
		if stripeErr, ok := err.(*stripe.Error); ok && stripeErr.Code == stripe.ErrorCodeResourceMissing {
			return &models.PromotionCodeChange{
				PromoID: promoID,
				Code:    promoID,
				Action:  "deactivated",
			}, nil
		}
		return nil, fmt.Errorf("failed to deactivate promotion code: %w", err)
	}
	return &models.PromotionCodeChange{
		PromoID:  promoID,
		Code:     stripePromo.Code,
		Action:   "deactivated",
		StripeID: stripeID,
	}, nil
}

func (s *Service) recreatePromotionCode(ctx context.Context, promoConfig models.PromotionCode, configID uuid.UUID) (*models.PromotionCodeChange, error) {
	_, _ = s.deactivatePromotionCode(ctx, promoConfig.ID)

	couponStripeID, err := s.GetStripeIDByConfigItemID(ctx, promoConfig.Coupon, "coupon")
	if err != nil {
		return nil, fmt.Errorf("failed to resolve coupon ID %s: %w", promoConfig.Coupon, err)
	}
	params := buildPromotionCodeCreateParams(promoConfig, couponStripeID)
	if promoConfig.Active == nil {
		params.Active = stripe.Bool(true)
	}
	s.stripe.ApplyAccount(params)
	stripePromo, err := s.stripe.Stripe.V1PromotionCodes.Create(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("failed to create new Stripe promotion code: %w", err)
	}
	if configID != uuid.Nil {
		if err := s.SaveMapping(ctx, configID, promoConfig.ID, stripePromo.ID, "promotion_code"); err != nil {
			return nil, err
		}
	}
	return &models.PromotionCodeChange{
		PromoID:  promoConfig.ID,
		Code:     promoConfig.Code,
		Action:   "recreated",
		StripeID: stripePromo.ID,
	}, nil
}

func (s *Service) createPromotionCodeWithNewCoupon(ctx context.Context, promoConfig models.PromotionCode, newCouponStripeID string, configID uuid.UUID) (*models.PromotionCodeChange, error) {
	params := buildPromotionCodeCreateParams(promoConfig, newCouponStripeID)
	if promoConfig.Active == nil {
		params.Active = stripe.Bool(true)
	}
	s.stripe.ApplyAccount(params)
	stripePromo, err := s.stripe.Stripe.V1PromotionCodes.Create(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("failed to create Stripe promotion code with new coupon: %w", err)
	}
	if configID != uuid.Nil {
		if err := s.SaveMapping(ctx, configID, promoConfig.ID, stripePromo.ID, "promotion_code"); err != nil {
			return nil, err
		}
	}
	return &models.PromotionCodeChange{
		PromoID:  promoConfig.ID,
		Code:     promoConfig.Code,
		Action:   "recreated",
		StripeID: stripePromo.ID,
	}, nil
}

func buildPromotionCodeCreateParams(p models.PromotionCode, couponStripeID string) *stripe.PromotionCodeCreateParams {
	params := &stripe.PromotionCodeCreateParams{
		Code:   stripe.String(p.Code),
		Coupon: stripe.String(couponStripeID),
	}
	if p.Active != nil {
		params.Active = stripe.Bool(*p.Active)
	}
	if p.MaxRedemptions != nil {
		params.MaxRedemptions = stripe.Int64(*p.MaxRedemptions)
	}
	if p.FirstTimeTransaction != nil {
		params.Restrictions = &stripe.PromotionCodeCreateRestrictionsParams{
			FirstTimeTransaction: stripe.Bool(*p.FirstTimeTransaction),
		}
	}
	if p.MinimumAmount != nil {
		if params.Restrictions == nil {
			params.Restrictions = &stripe.PromotionCodeCreateRestrictionsParams{}
		}
		params.Restrictions.MinimumAmount = stripe.Int64(*p.MinimumAmount)
		if p.MinimumAmountCurrency != "" {
			params.Restrictions.MinimumAmountCurrency = stripe.String(p.MinimumAmountCurrency)
		}
	}
	if p.ExpiresAt != nil {
		params.ExpiresAt = stripe.Int64(*p.ExpiresAt)
	}
	if len(p.Metadata) > 0 {
		params.Metadata = make(map[string]string)
		for k, v := range p.Metadata {
			params.Metadata[k] = v
		}
	}
	return params
}
