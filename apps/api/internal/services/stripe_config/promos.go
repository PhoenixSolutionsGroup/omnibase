package stripe_config

import (
	"context"
	"errors"
	"fmt"

	"github.com/stripe/stripe-go/v82"
)

var CreatePromotionCodeError = errors.New("Failed to create stripe promotion code")

func (s *Service) createPromotionCode(ctx context.Context, promoConfig PromotionCode, couponStripeID string) (*PromotionCodeChange, error) {
	if promoConfig.StripeID != "" {
		tagParams := &stripe.PromotionCodeUpdateParams{
			Active:   stripe.Bool(true),
			Metadata: managedMetadata("promotion_code", promoConfig.ID, promoConfigHash(promoConfig), promoConfig.Metadata),
		}
		s.stripe.ApplyAccount(tagParams)
		if _, err := s.stripe.Stripe.V1PromotionCodes.Update(ctx, promoConfig.StripeID, tagParams); err != nil {
			return nil, fmt.Errorf("failed to tag linked promotion code %s: %w", promoConfig.ID, err)
		}
		return &PromotionCodeChange{
			PromoID:  promoConfig.ID,
			Code:     promoConfig.Code,
			Action:   "linked",
			StripeID: promoConfig.StripeID,
		}, nil
	}

	params := buildPromotionCodeCreateParams(promoConfig, couponStripeID)
	s.stripe.ApplyAccount(params)
	stripePromo, err := s.stripe.Stripe.V1PromotionCodes.Create(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("%w: %w", CreatePromotionCodeError, err)
	}
	return &PromotionCodeChange{
		PromoID:  promoConfig.ID,
		Code:     promoConfig.Code,
		Action:   "created",
		StripeID: stripePromo.ID,
	}, nil
}

func (s *Service) updatePromotionCodeFromConfig(ctx context.Context, desired PromotionCode, stripeID string) (*PromotionCodeChange, error) {
	active := true
	if desired.Active != nil {
		active = *desired.Active
	}
	params := &stripe.PromotionCodeUpdateParams{
		Active:   stripe.Bool(active),
		Metadata: managedMetadata("promotion_code", desired.ID, promoConfigHash(desired), desired.Metadata),
	}
	s.stripe.ApplyAccount(params)
	if _, err := s.stripe.Stripe.V1PromotionCodes.Update(ctx, stripeID, params); err != nil {
		return nil, fmt.Errorf("failed to update promotion code: %w", err)
	}
	return &PromotionCodeChange{
		PromoID:  desired.ID,
		Code:     desired.Code,
		Action:   "updated",
		StripeID: stripeID,
	}, nil
}

func (s *Service) deactivatePromotionCodeByStripeID(ctx context.Context, stripeID, configID string) (*PromotionCodeChange, error) {
	params := &stripe.PromotionCodeUpdateParams{Active: stripe.Bool(false)}
	s.stripe.ApplyAccount(params)
	stripePromo, err := s.stripe.Stripe.V1PromotionCodes.Update(ctx, stripeID, params)
	if err != nil {
		if stripeErr, ok := err.(*stripe.Error); ok && stripeErr.Code == stripe.ErrorCodeResourceMissing {
			return &PromotionCodeChange{
				PromoID:  configID,
				Code:     configID,
				Action:   "deactivated",
				StripeID: stripeID,
			}, nil
		}
		return nil, fmt.Errorf("failed to deactivate promotion code: %w", err)
	}
	return &PromotionCodeChange{
		PromoID:  configID,
		Code:     stripePromo.Code,
		Action:   "deactivated",
		StripeID: stripeID,
	}, nil
}

func (s *Service) recreatePromotionCode(ctx context.Context, desired PromotionCode, couponStripeID string) (*PromotionCodeChange, error) {
	params := buildPromotionCodeCreateParams(desired, couponStripeID)
	if desired.Active == nil {
		params.Active = stripe.Bool(true)
	}
	s.stripe.ApplyAccount(params)
	stripePromo, err := s.stripe.Stripe.V1PromotionCodes.Create(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("failed to create replacement Stripe promotion code: %w", err)
	}
	return &PromotionCodeChange{
		PromoID:  desired.ID,
		Code:     desired.Code,
		Action:   "recreated",
		StripeID: stripePromo.ID,
	}, nil
}

func buildPromotionCodeCreateParams(p PromotionCode, couponStripeID string) *stripe.PromotionCodeCreateParams {
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
	params.Metadata = managedMetadata("promotion_code", p.ID, promoConfigHash(p), p.Metadata)
	return params
}
