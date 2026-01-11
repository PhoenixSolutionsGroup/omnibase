package handlers

import (
	"api/internal/logger"
	"api/internal/models"
	"fmt"

	"github.com/google/uuid"
	"github.com/stripe/stripe-go/v82"
	"github.com/stripe/stripe-go/v82/coupon"
)

type CouponHandler struct {
	idMapper  IDMapperInterface
	accountID string
}

func NewCouponHandler(idMapper IDMapperInterface, accountID string) *CouponHandler {
	return &CouponHandler{
		idMapper:  idMapper,
		accountID: accountID,
	}
}

func (h *CouponHandler) CreateCoupon(couponConfig models.Coupon, configID uuid.UUID) (*models.CouponChange, error) {
	logger.Logger.Info("Creating coupon", "couponID", couponConfig.ID, "name", couponConfig.Name)

	// Check if stripe_id is provided for migration support
	if couponConfig.StripeID != "" {
		logger.Logger.Info("Coupon has stripe_id, checking for existing mapping",
			"couponID", couponConfig.ID,
			"stripeID", couponConfig.StripeID)

		existingMapping, err := h.idMapper.GetMappingByConfigItemID(couponConfig.ID, "coupon")
		if err != nil {
			return nil, fmt.Errorf("failed to check existing mapping: %w", err)
		}

		if existingMapping != nil {
			logger.Logger.Info("Skipped coupon - stripe_id already linked",
				"couponID", couponConfig.ID,
				"existingStripeID", existingMapping.StripeID)

			return &models.CouponChange{
				CouponID: couponConfig.ID,
				Name:     couponConfig.Name,
				Action:   "skipped",
			}, nil
		}

		// No mapping exists - CREATE mapping with provided stripe_id
		logger.Logger.Info("Creating stripe_id mapping from config",
			"couponID", couponConfig.ID,
			"stripeID", couponConfig.StripeID)

		if configID != uuid.Nil {
			if err := h.idMapper.SaveIDMapping(configID, couponConfig.ID, couponConfig.StripeID, "coupon"); err != nil {
				return nil, fmt.Errorf("failed to create coupon mapping: %w", err)
			}
		}

		return &models.CouponChange{
			CouponID: couponConfig.ID,
			Name:     couponConfig.Name,
			Action:   "linked",
			StripeID: couponConfig.StripeID,
		}, nil
	}

	// Build coupon params
	couponParams := &stripe.CouponParams{
		ID: stripe.String(couponConfig.ID),
	}

	if couponConfig.Name != "" {
		couponParams.Name = stripe.String(couponConfig.Name)
	}

	if couponConfig.PercentOff != nil {
		couponParams.PercentOff = stripe.Float64(*couponConfig.PercentOff)
	}

	if couponConfig.AmountOff != nil {
		couponParams.AmountOff = stripe.Int64(*couponConfig.AmountOff)
	}

	if couponConfig.Currency != "" {
		couponParams.Currency = stripe.String(couponConfig.Currency)
	}

	couponParams.Duration = stripe.String(couponConfig.Duration)

	if couponConfig.DurationInMonths != nil {
		couponParams.DurationInMonths = stripe.Int64(*couponConfig.DurationInMonths)
	}

	if couponConfig.MaxRedemptions != nil {
		couponParams.MaxRedemptions = stripe.Int64(*couponConfig.MaxRedemptions)
	}

	if couponConfig.RedeemBy != nil {
		couponParams.RedeemBy = stripe.Int64(*couponConfig.RedeemBy)
	}

	if len(couponConfig.AppliesTo) > 0 {
		couponParams.AppliesTo = &stripe.CouponAppliesToParams{
			Products: stripe.StringSlice(couponConfig.AppliesTo),
		}
	}

	if len(couponConfig.Metadata) > 0 {
		couponParams.Metadata = make(map[string]string)
		for k, v := range couponConfig.Metadata {
			couponParams.Metadata[k] = v
		}
	}

	ApplyConnectAccount(h.accountID, couponParams)

	logger.Logger.Info("Making Stripe API call to create coupon", "couponID", couponConfig.ID)
	stripeCoupon, err := coupon.New(couponParams)
	if err != nil {
		logger.Logger.Error("Failed to create Stripe coupon", "error", err, "couponID", couponConfig.ID)
		return nil, fmt.Errorf("failed to create Stripe coupon: %w", err)
	}
	logger.Logger.Info("Stripe coupon created successfully", "configCouponID", couponConfig.ID, "stripeID", stripeCoupon.ID)

	// Save coupon ID mapping
	if configID != uuid.Nil {
		if err := h.idMapper.SaveIDMapping(configID, couponConfig.ID, stripeCoupon.ID, "coupon"); err != nil {
			logger.Logger.Error("Failed to save coupon ID mapping", "error", err, "couponID", couponConfig.ID)
			return nil, fmt.Errorf("failed to save coupon ID mapping: %w", err)
		}
	}

	return &models.CouponChange{
		CouponID: couponConfig.ID,
		Name:     couponConfig.Name,
		Action:   "created",
		StripeID: stripeCoupon.ID,
	}, nil
}

func (h *CouponHandler) UpdateCoupon(update models.CouponUpdate) (*models.CouponChange, error) {
	logger.Logger.Info("Updating coupon", "couponID", update.ID)

	// Only name and metadata are mutable in Stripe coupons
	if len(update.FieldChanges) > 0 {
		updateParams := &stripe.CouponParams{}

		if name, ok := update.FieldChanges["name"].(string); ok {
			updateParams.Name = stripe.String(name)
		}

		if metadata, ok := update.FieldChanges["metadata"].(map[string]string); ok {
			updateParams.Metadata = metadata
		}

		ApplyConnectAccount(h.accountID, updateParams)

		logger.Logger.Info("Making Stripe API call to update coupon", "couponID", update.ID)
		_, err := coupon.Update(update.ID, updateParams)
		if err != nil {
			logger.Logger.Error("Failed to update Stripe coupon", "error", err, "couponID", update.ID)
			return nil, fmt.Errorf("failed to update coupon: %w", err)
		}
		logger.Logger.Info("Coupon updated successfully", "couponID", update.ID)
	}

	name := ""
	if n, ok := update.FieldChanges["name"].(string); ok {
		name = n
	}

	return &models.CouponChange{
		CouponID: update.ID,
		Name:     name,
		Action:   "updated",
	}, nil
}

func (h *CouponHandler) DeleteCoupon(couponID string) (*models.CouponChange, error) {
	logger.Logger.Info("Deleting coupon", "couponID", couponID)

	// Get the coupon first to retrieve its name
	getParams := &stripe.CouponParams{}
	ApplyConnectAccount(h.accountID, getParams)
	stripeCoupon, err := coupon.Get(couponID, getParams)
	if err != nil {
		if stripeErr, ok := err.(*stripe.Error); ok && stripeErr.Code == stripe.ErrorCodeResourceMissing {
			logger.Logger.Info("Coupon not found in Stripe, treating as already deleted", "couponID", couponID)
			return &models.CouponChange{
				CouponID: couponID,
				Name:     couponID,
				Action:   "archived",
			}, nil
		}
		logger.Logger.Error("Failed to get coupon for deletion", "error", err, "couponID", couponID)
		return nil, fmt.Errorf("failed to get coupon for deletion: %w", err)
	}

	// Delete the coupon (Stripe coupons are deleted, not archived)
	deleteParams := &stripe.CouponParams{}
	ApplyConnectAccount(h.accountID, deleteParams)

	logger.Logger.Info("Making Stripe API call to delete coupon", "couponID", couponID)
	_, err = coupon.Del(couponID, deleteParams)
	if err != nil {
		logger.Logger.Error("Failed to delete Stripe coupon", "error", err, "couponID", couponID)
		return nil, fmt.Errorf("failed to delete coupon: %w", err)
	}

	logger.Logger.Info("Coupon deleted successfully", "couponID", couponID)
	return &models.CouponChange{
		CouponID: couponID,
		Name:     stripeCoupon.Name,
		Action:   "archived",
		StripeID: stripeCoupon.ID,
	}, nil
}

// RecreateCoupon handles immutable field changes by creating a new coupon
// Returns the new Stripe coupon ID for cascade updates to promotion codes
func (h *CouponHandler) RecreateCoupon(couponConfig models.Coupon, configID uuid.UUID) (*models.CouponChange, string, error) {
	logger.Logger.Info("Recreating coupon due to immutable field change", "couponID", couponConfig.ID)

	// First, create the new coupon with a temporary ID suffix
	newCouponConfig := couponConfig
	newCouponConfig.ID = couponConfig.ID + "_v2"

	// Build coupon params for the new coupon
	couponParams := &stripe.CouponParams{
		ID: stripe.String(newCouponConfig.ID),
	}

	if couponConfig.Name != "" {
		couponParams.Name = stripe.String(couponConfig.Name)
	}

	if couponConfig.PercentOff != nil {
		couponParams.PercentOff = stripe.Float64(*couponConfig.PercentOff)
	}

	if couponConfig.AmountOff != nil {
		couponParams.AmountOff = stripe.Int64(*couponConfig.AmountOff)
	}

	if couponConfig.Currency != "" {
		couponParams.Currency = stripe.String(couponConfig.Currency)
	}

	couponParams.Duration = stripe.String(couponConfig.Duration)

	if couponConfig.DurationInMonths != nil {
		couponParams.DurationInMonths = stripe.Int64(*couponConfig.DurationInMonths)
	}

	if couponConfig.MaxRedemptions != nil {
		couponParams.MaxRedemptions = stripe.Int64(*couponConfig.MaxRedemptions)
	}

	if couponConfig.RedeemBy != nil {
		couponParams.RedeemBy = stripe.Int64(*couponConfig.RedeemBy)
	}

	if len(couponConfig.AppliesTo) > 0 {
		couponParams.AppliesTo = &stripe.CouponAppliesToParams{
			Products: stripe.StringSlice(couponConfig.AppliesTo),
		}
	}

	if len(couponConfig.Metadata) > 0 {
		couponParams.Metadata = make(map[string]string)
		for k, v := range couponConfig.Metadata {
			couponParams.Metadata[k] = v
		}
	}

	ApplyConnectAccount(h.accountID, couponParams)

	logger.Logger.Info("Making Stripe API call to create new coupon version", "couponID", newCouponConfig.ID)
	stripeCoupon, err := coupon.New(couponParams)
	if err != nil {
		logger.Logger.Error("Failed to create new Stripe coupon", "error", err, "couponID", newCouponConfig.ID)
		return nil, "", fmt.Errorf("failed to create new Stripe coupon: %w", err)
	}

	// Update the ID mapping to point to the new Stripe coupon
	if configID != uuid.Nil {
		if err := h.idMapper.SaveIDMapping(configID, couponConfig.ID, stripeCoupon.ID, "coupon"); err != nil {
			logger.Logger.Error("Failed to update coupon ID mapping", "error", err, "couponID", couponConfig.ID)
			return nil, "", fmt.Errorf("failed to update coupon ID mapping: %w", err)
		}
	}

	logger.Logger.Info("Coupon recreated successfully", "configCouponID", couponConfig.ID, "newStripeID", stripeCoupon.ID)
	return &models.CouponChange{
		CouponID: couponConfig.ID,
		Name:     couponConfig.Name,
		Action:   "recreated",
		StripeID: stripeCoupon.ID,
	}, stripeCoupon.ID, nil
}
