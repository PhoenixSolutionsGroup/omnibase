package stripe_config

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/stripe/stripe-go/v82"

)

var CreateCouponError = errors.New("Failed to create stripe coupon")

func (s *Service) createCoupon(ctx context.Context, couponConfig Coupon, configID uuid.UUID) (*CouponChange, error) {
	if couponConfig.StripeID != "" {
		existing, err := s.GetMapping(ctx, couponConfig.ID, "coupon")
		if err != nil {
			return nil, err
		}
		if existing != nil {
			return &CouponChange{
				CouponID: couponConfig.ID,
				Name:     couponConfig.Name,
				Action:   "skipped",
			}, nil
		}
		if configID != uuid.Nil {
			if err := s.SaveMapping(ctx, configID, couponConfig.ID, couponConfig.StripeID, "coupon"); err != nil {
				return nil, err
			}
		}
		return &CouponChange{
			CouponID: couponConfig.ID,
			Name:     couponConfig.Name,
			Action:   "linked",
			StripeID: couponConfig.StripeID,
		}, nil
	}

	params := buildCouponCreateParams(couponConfig)
	s.stripe.ApplyAccount(params)

	stripeCoupon, err := s.stripe.Stripe.V1Coupons.Create(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("%w: %w", CreateCouponError, err)
	}
	if configID != uuid.Nil {
		if err := s.SaveMapping(ctx, configID, couponConfig.ID, stripeCoupon.ID, "coupon"); err != nil {
			return nil, err
		}
	}
	return &CouponChange{
		CouponID: couponConfig.ID,
		Name:     couponConfig.Name,
		Action:   "created",
		StripeID: stripeCoupon.ID,
	}, nil
}

func (s *Service) updateCoupon(ctx context.Context, update CouponUpdate) (*CouponChange, error) {
	if len(update.FieldChanges) > 0 {
		params := &stripe.CouponUpdateParams{}
		if name, ok := update.FieldChanges["name"].(string); ok {
			params.Name = stripe.String(name)
		}
		if metadata, ok := update.FieldChanges["metadata"].(map[string]string); ok {
			params.Metadata = metadata
		}
		s.stripe.ApplyAccount(params)
		if _, err := s.stripe.Stripe.V1Coupons.Update(ctx, update.ID, params); err != nil {
			return nil, fmt.Errorf("failed to update coupon: %w", err)
		}
	}
	name := ""
	if n, ok := update.FieldChanges["name"].(string); ok {
		name = n
	}
	return &CouponChange{
		CouponID: update.ID,
		Name:     name,
		Action:   "updated",
	}, nil
}

func (s *Service) deleteCoupon(ctx context.Context, couponID string) (*CouponChange, error) {
	getParams := &stripe.CouponRetrieveParams{}
	s.stripe.ApplyAccount(getParams)
	stripeCoupon, err := s.stripe.Stripe.V1Coupons.Retrieve(ctx, couponID, getParams)
	if err != nil {
		if stripeErr, ok := err.(*stripe.Error); ok && stripeErr.Code == stripe.ErrorCodeResourceMissing {
			return &CouponChange{
				CouponID: couponID,
				Name:     couponID,
				Action:   "archived",
			}, nil
		}
		return nil, fmt.Errorf("failed to get coupon for deletion: %w", err)
	}
	deleteParams := &stripe.CouponDeleteParams{}
	s.stripe.ApplyAccount(deleteParams)
	if _, err := s.stripe.Stripe.V1Coupons.Delete(ctx, couponID, deleteParams); err != nil {
		return nil, fmt.Errorf("failed to delete coupon: %w", err)
	}
	return &CouponChange{
		CouponID: couponID,
		Name:     stripeCoupon.Name,
		Action:   "archived",
		StripeID: stripeCoupon.ID,
	}, nil
}

func (s *Service) recreateCoupon(ctx context.Context, couponConfig Coupon, configID uuid.UUID) (*CouponChange, string, error) {
	newConfig := couponConfig
	newConfig.ID = couponConfig.ID + "_v2"
	params := buildCouponCreateParams(newConfig)
	s.stripe.ApplyAccount(params)
	stripeCoupon, err := s.stripe.Stripe.V1Coupons.Create(ctx, params)
	if err != nil {
		return nil, "", fmt.Errorf("failed to create new Stripe coupon: %w", err)
	}
	if configID != uuid.Nil {
		if err := s.SaveMapping(ctx, configID, couponConfig.ID, stripeCoupon.ID, "coupon"); err != nil {
			return nil, "", err
		}
	}
	return &CouponChange{
		CouponID: couponConfig.ID,
		Name:     couponConfig.Name,
		Action:   "recreated",
		StripeID: stripeCoupon.ID,
	}, stripeCoupon.ID, nil
}

func buildCouponCreateParams(c Coupon) *stripe.CouponCreateParams {
	params := &stripe.CouponCreateParams{
		ID: stripe.String(c.ID),
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
		params.AppliesTo = &stripe.CouponCreateAppliesToParams{
			Products: stripe.StringSlice(c.AppliesTo),
		}
	}
	if len(c.Metadata) > 0 {
		params.Metadata = make(map[string]string)
		for k, v := range c.Metadata {
			params.Metadata[k] = v
		}
	}
	return params
}
