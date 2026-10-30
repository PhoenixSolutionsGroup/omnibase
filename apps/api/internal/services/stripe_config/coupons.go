package stripe_config

import (
	"context"
	"errors"
	"fmt"

	"github.com/stripe/stripe-go/v82"
)

var CreateCouponError = errors.New("Failed to create stripe coupon")

func (s *Service) createCoupon(ctx context.Context, couponConfig Coupon, productStripeIDs map[string]string) (*CouponChange, error) {
	if couponConfig.StripeID != "" {
		tagParams := &stripe.CouponUpdateParams{
			Metadata: managedMetadata("coupon", couponConfig.ID, couponConfigHash(couponConfig), couponConfig.Metadata),
		}
		s.stripe.ApplyAccount(tagParams)
		if _, err := s.stripe.Stripe.V1Coupons.Update(ctx, couponConfig.StripeID, tagParams); err != nil {
			return nil, fmt.Errorf("failed to tag linked coupon %s: %w", couponConfig.ID, err)
		}
		return &CouponChange{
			CouponID: couponConfig.ID,
			Name:     couponConfig.Name,
			Action:   "linked",
			StripeID: couponConfig.StripeID,
		}, nil
	}

	params := buildCouponCreateParams(couponConfig, true, productStripeIDs)
	s.stripe.ApplyAccount(params)

	stripeCoupon, err := s.stripe.Stripe.V1Coupons.Create(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("%w: %w", CreateCouponError, err)
	}
	return &CouponChange{
		CouponID: couponConfig.ID,
		Name:     couponConfig.Name,
		Action:   "created",
		StripeID: stripeCoupon.ID,
	}, nil
}

func (s *Service) updateCouponFromConfig(ctx context.Context, desired Coupon, stripeID string) (*CouponChange, error) {
	params := &stripe.CouponUpdateParams{
		Metadata: managedMetadata("coupon", desired.ID, couponConfigHash(desired), desired.Metadata),
	}
	if desired.Name != "" {
		params.Name = stripe.String(desired.Name)
	}
	s.stripe.ApplyAccount(params)
	if _, err := s.stripe.Stripe.V1Coupons.Update(ctx, stripeID, params); err != nil {
		return nil, fmt.Errorf("failed to update coupon: %w", err)
	}
	return &CouponChange{
		CouponID: desired.ID,
		Name:     desired.Name,
		Action:   "updated",
		StripeID: stripeID,
	}, nil
}

func (s *Service) deleteCoupon(ctx context.Context, coupon *stripe.Coupon) (*CouponChange, error) {
	deleteParams := &stripe.CouponDeleteParams{}
	s.stripe.ApplyAccount(deleteParams)
	if _, err := s.stripe.Stripe.V1Coupons.Delete(ctx, coupon.ID, deleteParams); err != nil {
		if stripeErr, ok := err.(*stripe.Error); ok && stripeErr.Code == stripe.ErrorCodeResourceMissing {
			return &CouponChange{
				CouponID: coupon.ID,
				Name:     coupon.Name,
				Action:   "archived",
				StripeID: coupon.ID,
			}, nil
		}
		return nil, fmt.Errorf("failed to delete coupon: %w", err)
	}
	return &CouponChange{
		CouponID: coupon.ID,
		Name:     coupon.Name,
		Action:   "archived",
		StripeID: coupon.ID,
	}, nil
}

func (s *Service) recreateCoupon(ctx context.Context, desired Coupon, productStripeIDs map[string]string) (*CouponChange, string, error) {
	params := buildCouponCreateParams(desired, false, productStripeIDs)
	s.stripe.ApplyAccount(params)
	stripeCoupon, err := s.stripe.Stripe.V1Coupons.Create(ctx, params)
	if err != nil {
		return nil, "", fmt.Errorf("failed to create replacement Stripe coupon: %w", err)
	}
	return &CouponChange{
		CouponID: desired.ID,
		Name:     desired.Name,
		Action:   "recreated",
		StripeID: stripeCoupon.ID,
	}, stripeCoupon.ID, nil
}

func buildCouponCreateParams(c Coupon, includeCustomID bool, productStripeIDs map[string]string) *stripe.CouponCreateParams {
	params := &stripe.CouponCreateParams{}
	if includeCustomID {
		params.ID = stripe.String(c.ID)
	}
	if c.Name != "" {
		params.Name = stripe.String(c.Name)
	}
	if c.PercentOff != nil {
		params.PercentOff = stripe.Float64(*c.PercentOff)
	}
	if c.AmountOff != nil {
		params.AmountOff = stripe.Int64(*c.AmountOff)
	}
	if c.Currency != "" {
		params.Currency = stripe.String(c.Currency)
	}
	params.Duration = stripe.String(c.Duration)
	if c.DurationInMonths != nil {
		params.DurationInMonths = stripe.Int64(*c.DurationInMonths)
	}
	if c.MaxRedemptions != nil {
		params.MaxRedemptions = stripe.Int64(*c.MaxRedemptions)
	}
	if c.RedeemBy != nil {
		params.RedeemBy = stripe.Int64(*c.RedeemBy)
	}
	if len(c.AppliesTo) > 0 {
		products := make([]string, 0, len(c.AppliesTo))
		for _, configProductID := range c.AppliesTo {
			if stripeID := productStripeIDs[configProductID]; stripeID != "" {
				products = append(products, stripeID)
			} else {
				products = append(products, configProductID)
			}
		}
		params.AppliesTo = &stripe.CouponCreateAppliesToParams{
			Products: stripe.StringSlice(products),
		}
	}
	params.Metadata = managedMetadata("coupon", c.ID, couponConfigHash(c), c.Metadata)
	return params
}
