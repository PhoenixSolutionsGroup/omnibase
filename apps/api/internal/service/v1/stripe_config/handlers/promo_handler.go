package handlers

import (
	"api/internal/logger"
	"api/internal/models"
	"fmt"

	"github.com/google/uuid"
	"github.com/stripe/stripe-go/v82"
	"github.com/stripe/stripe-go/v82/promotioncode"
)

type PromoHandler struct {
	idMapper  IDMapperInterface
	accountID string
}

func NewPromoHandler(idMapper IDMapperInterface, accountID string) *PromoHandler {
	return &PromoHandler{
		idMapper:  idMapper,
		accountID: accountID,
	}
}

func (h *PromoHandler) CreatePromotionCode(promoConfig models.PromotionCode, configID uuid.UUID) (*models.PromotionCodeChange, error) {
	logger.Logger.Info("Creating promotion code", "promoID", promoConfig.ID, "code", promoConfig.Code)

	// Check if stripe_id is provided for migration support
	if promoConfig.StripeID != "" {
		logger.Logger.Info("Promotion code has stripe_id, checking for existing mapping",
			"promoID", promoConfig.ID,
			"stripeID", promoConfig.StripeID)

		existingMapping, err := h.idMapper.GetMappingByConfigItemID(promoConfig.ID, "promotion_code")
		if err != nil {
			return nil, fmt.Errorf("failed to check existing mapping: %w", err)
		}

		if existingMapping != nil {
			logger.Logger.Info("Skipped promotion code - stripe_id already linked",
				"promoID", promoConfig.ID,
				"existingStripeID", existingMapping.StripeID)

			return &models.PromotionCodeChange{
				PromoID: promoConfig.ID,
				Code:    promoConfig.Code,
				Action:  "skipped",
			}, nil
		}

		// No mapping exists - CREATE mapping with provided stripe_id
		logger.Logger.Info("Creating stripe_id mapping from config",
			"promoID", promoConfig.ID,
			"stripeID", promoConfig.StripeID)

		if configID != uuid.Nil {
			if err := h.idMapper.SaveIDMapping(configID, promoConfig.ID, promoConfig.StripeID, "promotion_code"); err != nil {
				return nil, fmt.Errorf("failed to create promotion code mapping: %w", err)
			}
		}

		return &models.PromotionCodeChange{
			PromoID:  promoConfig.ID,
			Code:     promoConfig.Code,
			Action:   "linked",
			StripeID: promoConfig.StripeID,
		}, nil
	}

	// Resolve coupon config ID to Stripe ID
	couponStripeID, err := h.idMapper.GetStripeIDByConfigItemID(promoConfig.Coupon, "coupon")
	if err != nil {
		logger.Logger.Error("Failed to resolve coupon ID for promotion code", "error", err, "promoID", promoConfig.ID, "couponID", promoConfig.Coupon)
		return nil, fmt.Errorf("failed to resolve coupon ID %s: %w", promoConfig.Coupon, err)
	}

	// Build promotion code params
	promoParams := &stripe.PromotionCodeParams{
		Code:   stripe.String(promoConfig.Code),
		Coupon: stripe.String(couponStripeID),
	}

	if promoConfig.Active != nil {
		promoParams.Active = stripe.Bool(*promoConfig.Active)
	}

	if promoConfig.MaxRedemptions != nil {
		promoParams.MaxRedemptions = stripe.Int64(*promoConfig.MaxRedemptions)
	}

	if promoConfig.FirstTimeTransaction != nil {
		promoParams.Restrictions = &stripe.PromotionCodeRestrictionsParams{
			FirstTimeTransaction: stripe.Bool(*promoConfig.FirstTimeTransaction),
		}
	}

	if promoConfig.MinimumAmount != nil {
		if promoParams.Restrictions == nil {
			promoParams.Restrictions = &stripe.PromotionCodeRestrictionsParams{}
		}
		promoParams.Restrictions.MinimumAmount = stripe.Int64(*promoConfig.MinimumAmount)
		if promoConfig.MinimumAmountCurrency != "" {
			promoParams.Restrictions.MinimumAmountCurrency = stripe.String(promoConfig.MinimumAmountCurrency)
		}
	}

	if promoConfig.ExpiresAt != nil {
		promoParams.ExpiresAt = stripe.Int64(*promoConfig.ExpiresAt)
	}

	if len(promoConfig.Metadata) > 0 {
		promoParams.Metadata = make(map[string]string)
		for k, v := range promoConfig.Metadata {
			promoParams.Metadata[k] = v
		}
	}

	ApplyConnectAccount(h.accountID, promoParams)

	logger.Logger.Info("Making Stripe API call to create promotion code", "promoID", promoConfig.ID, "code", promoConfig.Code)
	stripePromo, err := promotioncode.New(promoParams)
	if err != nil {
		logger.Logger.Error("Failed to create Stripe promotion code", "error", err, "promoID", promoConfig.ID)
		return nil, fmt.Errorf("failed to create Stripe promotion code: %w", err)
	}
	logger.Logger.Info("Stripe promotion code created successfully", "configPromoID", promoConfig.ID, "stripeID", stripePromo.ID)

	// Save promotion code ID mapping
	if configID != uuid.Nil {
		if err := h.idMapper.SaveIDMapping(configID, promoConfig.ID, stripePromo.ID, "promotion_code"); err != nil {
			logger.Logger.Error("Failed to save promotion code ID mapping", "error", err, "promoID", promoConfig.ID)
			return nil, fmt.Errorf("failed to save promotion code ID mapping: %w", err)
		}
	}

	return &models.PromotionCodeChange{
		PromoID:  promoConfig.ID,
		Code:     promoConfig.Code,
		Action:   "created",
		StripeID: stripePromo.ID,
	}, nil
}

func (h *PromoHandler) UpdatePromotionCode(update models.PromoCodeUpdate) (*models.PromotionCodeChange, error) {
	logger.Logger.Info("Updating promotion code", "promoID", update.ID)

	// Get the Stripe ID for this promotion code
	stripeID, err := h.idMapper.GetStripeIDByConfigItemID(update.ID, "promotion_code")
	if err != nil {
		logger.Logger.Error("Failed to get Stripe ID for promotion code", "error", err, "promoID", update.ID)
		return nil, fmt.Errorf("failed to get Stripe ID for promotion code: %w", err)
	}

	// Only active and metadata are mutable in Stripe promotion codes
	if len(update.FieldChanges) > 0 {
		updateParams := &stripe.PromotionCodeParams{}

		if active, ok := update.FieldChanges["active"].(bool); ok {
			updateParams.Active = stripe.Bool(active)
		}

		if metadata, ok := update.FieldChanges["metadata"].(map[string]string); ok {
			updateParams.Metadata = metadata
		}

		ApplyConnectAccount(h.accountID, updateParams)

		logger.Logger.Info("Making Stripe API call to update promotion code", "promoID", update.ID, "stripeID", stripeID)
		_, err := promotioncode.Update(stripeID, updateParams)
		if err != nil {
			logger.Logger.Error("Failed to update Stripe promotion code", "error", err, "promoID", update.ID)
			return nil, fmt.Errorf("failed to update promotion code: %w", err)
		}
		logger.Logger.Info("Promotion code updated successfully", "promoID", update.ID)
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

func (h *PromoHandler) DeactivatePromotionCode(promoID string) (*models.PromotionCodeChange, error) {
	logger.Logger.Info("Deactivating promotion code", "promoID", promoID)

	// Get the Stripe ID for this promotion code
	stripeID, err := h.idMapper.GetStripeIDByConfigItemID(promoID, "promotion_code")
	if err != nil {
		// If no mapping found, the promo code might not have been created in Stripe yet
		logger.Logger.Info("No Stripe ID found for promotion code, treating as already deactivated", "promoID", promoID)
		return &models.PromotionCodeChange{
			PromoID: promoID,
			Code:    promoID,
			Action:  "deactivated",
		}, nil
	}

	// Deactivate by setting active=false
	updateParams := &stripe.PromotionCodeParams{
		Active: stripe.Bool(false),
	}
	ApplyConnectAccount(h.accountID, updateParams)

	logger.Logger.Info("Making Stripe API call to deactivate promotion code", "promoID", promoID, "stripeID", stripeID)
	stripePromo, err := promotioncode.Update(stripeID, updateParams)
	if err != nil {
		if stripeErr, ok := err.(*stripe.Error); ok && stripeErr.Code == stripe.ErrorCodeResourceMissing {
			logger.Logger.Info("Promotion code not found in Stripe, treating as already deactivated", "promoID", promoID)
			return &models.PromotionCodeChange{
				PromoID: promoID,
				Code:    promoID,
				Action:  "deactivated",
			}, nil
		}
		logger.Logger.Error("Failed to deactivate Stripe promotion code", "error", err, "promoID", promoID)
		return nil, fmt.Errorf("failed to deactivate promotion code: %w", err)
	}

	logger.Logger.Info("Promotion code deactivated successfully", "promoID", promoID)
	return &models.PromotionCodeChange{
		PromoID:  promoID,
		Code:     stripePromo.Code,
		Action:   "deactivated",
		StripeID: stripeID,
	}, nil
}

// RecreatePromotionCode handles immutable field changes by deactivating the old code and creating a new one
func (h *PromoHandler) RecreatePromotionCode(promoConfig models.PromotionCode, configID uuid.UUID) (*models.PromotionCodeChange, error) {
	logger.Logger.Info("Recreating promotion code due to immutable field change", "promoID", promoConfig.ID)

	// First, deactivate the existing promotion code
	_, err := h.DeactivatePromotionCode(promoConfig.ID)
	if err != nil {
		logger.Logger.Warn("Failed to deactivate old promotion code, continuing with creation", "error", err, "promoID", promoConfig.ID)
	}

	// Resolve coupon config ID to Stripe ID
	couponStripeID, err := h.idMapper.GetStripeIDByConfigItemID(promoConfig.Coupon, "coupon")
	if err != nil {
		logger.Logger.Error("Failed to resolve coupon ID for promotion code recreation", "error", err, "promoID", promoConfig.ID, "couponID", promoConfig.Coupon)
		return nil, fmt.Errorf("failed to resolve coupon ID %s: %w", promoConfig.Coupon, err)
	}

	// Build promotion code params for the new code
	promoParams := &stripe.PromotionCodeParams{
		Code:   stripe.String(promoConfig.Code),
		Coupon: stripe.String(couponStripeID),
	}

	if promoConfig.Active != nil {
		promoParams.Active = stripe.Bool(*promoConfig.Active)
	} else {
		promoParams.Active = stripe.Bool(true) // Default to active for new codes
	}

	if promoConfig.MaxRedemptions != nil {
		promoParams.MaxRedemptions = stripe.Int64(*promoConfig.MaxRedemptions)
	}

	if promoConfig.FirstTimeTransaction != nil {
		promoParams.Restrictions = &stripe.PromotionCodeRestrictionsParams{
			FirstTimeTransaction: stripe.Bool(*promoConfig.FirstTimeTransaction),
		}
	}

	if promoConfig.MinimumAmount != nil {
		if promoParams.Restrictions == nil {
			promoParams.Restrictions = &stripe.PromotionCodeRestrictionsParams{}
		}
		promoParams.Restrictions.MinimumAmount = stripe.Int64(*promoConfig.MinimumAmount)
		if promoConfig.MinimumAmountCurrency != "" {
			promoParams.Restrictions.MinimumAmountCurrency = stripe.String(promoConfig.MinimumAmountCurrency)
		}
	}

	if promoConfig.ExpiresAt != nil {
		promoParams.ExpiresAt = stripe.Int64(*promoConfig.ExpiresAt)
	}

	if len(promoConfig.Metadata) > 0 {
		promoParams.Metadata = make(map[string]string)
		for k, v := range promoConfig.Metadata {
			promoParams.Metadata[k] = v
		}
	}

	ApplyConnectAccount(h.accountID, promoParams)

	logger.Logger.Info("Making Stripe API call to create new promotion code version", "promoID", promoConfig.ID, "code", promoConfig.Code)
	stripePromo, err := promotioncode.New(promoParams)
	if err != nil {
		logger.Logger.Error("Failed to create new Stripe promotion code", "error", err, "promoID", promoConfig.ID)
		return nil, fmt.Errorf("failed to create new Stripe promotion code: %w", err)
	}

	// Update the ID mapping to point to the new Stripe promotion code
	if configID != uuid.Nil {
		if err := h.idMapper.SaveIDMapping(configID, promoConfig.ID, stripePromo.ID, "promotion_code"); err != nil {
			logger.Logger.Error("Failed to update promotion code ID mapping", "error", err, "promoID", promoConfig.ID)
			return nil, fmt.Errorf("failed to update promotion code ID mapping: %w", err)
		}
	}

	logger.Logger.Info("Promotion code recreated successfully", "configPromoID", promoConfig.ID, "newStripeID", stripePromo.ID)
	return &models.PromotionCodeChange{
		PromoID:  promoConfig.ID,
		Code:     promoConfig.Code,
		Action:   "recreated",
		StripeID: stripePromo.ID,
	}, nil
}

// CreatePromotionCodeWithNewCoupon creates a promotion code pointing to a new coupon (used during coupon cascade recreation)
func (h *PromoHandler) CreatePromotionCodeWithNewCoupon(promoConfig models.PromotionCode, newCouponStripeID string, configID uuid.UUID) (*models.PromotionCodeChange, error) {
	logger.Logger.Info("Creating promotion code with new coupon", "promoID", promoConfig.ID, "newCouponStripeID", newCouponStripeID)

	// Build promotion code params
	promoParams := &stripe.PromotionCodeParams{
		Code:   stripe.String(promoConfig.Code),
		Coupon: stripe.String(newCouponStripeID),
	}

	if promoConfig.Active != nil {
		promoParams.Active = stripe.Bool(*promoConfig.Active)
	} else {
		promoParams.Active = stripe.Bool(true)
	}

	if promoConfig.MaxRedemptions != nil {
		promoParams.MaxRedemptions = stripe.Int64(*promoConfig.MaxRedemptions)
	}

	if promoConfig.FirstTimeTransaction != nil {
		promoParams.Restrictions = &stripe.PromotionCodeRestrictionsParams{
			FirstTimeTransaction: stripe.Bool(*promoConfig.FirstTimeTransaction),
		}
	}

	if promoConfig.MinimumAmount != nil {
		if promoParams.Restrictions == nil {
			promoParams.Restrictions = &stripe.PromotionCodeRestrictionsParams{}
		}
		promoParams.Restrictions.MinimumAmount = stripe.Int64(*promoConfig.MinimumAmount)
		if promoConfig.MinimumAmountCurrency != "" {
			promoParams.Restrictions.MinimumAmountCurrency = stripe.String(promoConfig.MinimumAmountCurrency)
		}
	}

	if promoConfig.ExpiresAt != nil {
		promoParams.ExpiresAt = stripe.Int64(*promoConfig.ExpiresAt)
	}

	if len(promoConfig.Metadata) > 0 {
		promoParams.Metadata = make(map[string]string)
		for k, v := range promoConfig.Metadata {
			promoParams.Metadata[k] = v
		}
	}

	ApplyConnectAccount(h.accountID, promoParams)

	logger.Logger.Info("Making Stripe API call to create promotion code with new coupon", "promoID", promoConfig.ID)
	stripePromo, err := promotioncode.New(promoParams)
	if err != nil {
		logger.Logger.Error("Failed to create Stripe promotion code with new coupon", "error", err, "promoID", promoConfig.ID)
		return nil, fmt.Errorf("failed to create Stripe promotion code with new coupon: %w", err)
	}

	// Update the ID mapping to point to the new Stripe promotion code
	if configID != uuid.Nil {
		if err := h.idMapper.SaveIDMapping(configID, promoConfig.ID, stripePromo.ID, "promotion_code"); err != nil {
			logger.Logger.Error("Failed to save promotion code ID mapping", "error", err, "promoID", promoConfig.ID)
			return nil, fmt.Errorf("failed to save promotion code ID mapping: %w", err)
		}
	}

	return &models.PromotionCodeChange{
		PromoID:  promoConfig.ID,
		Code:     promoConfig.Code,
		Action:   "recreated",
		StripeID: stripePromo.ID,
	}, nil
}
