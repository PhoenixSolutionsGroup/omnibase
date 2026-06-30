package stripe_config

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"api/internal/database/repository"
)

var SyncError = errors.New("Failed to sync stripe configuration")

type SyncArgs struct {
	Config ConfigData
}

func (s *Service) Sync(ctx context.Context, args SyncArgs) (*ConfigResponse, error) {
	config, err := s.validator.ParseAndValidateConfig(args.Config)
	if err != nil {
		return &ConfigResponse{
			Message: "StripeConfiguration validation failed",
			Errors:  []string{err.Error()},
		}, nil
	}

	prevRow, prevErr := s.repo.GetLatestStripeConfig(ctx)
	if prevErr != nil && !errors.Is(prevErr, pgx.ErrNoRows) {
		return nil, fmt.Errorf("%w: failed to fetch latest config: %w", SyncError, prevErr)
	}

	if errors.Is(prevErr, pgx.ErrNoRows) {
		return s.handleFirstTimeSetup(ctx, config, args.Config)
	}

	var prevConfigData ConfigData
	if err := json.Unmarshal(prevRow.Config, &prevConfigData); err != nil {
		return nil, fmt.Errorf("%w: failed to decode previous config: %w", SyncError, err)
	}
	previousConfig, err := s.validator.ParseAndValidateConfig(prevConfigData)
	if err != nil {
		return nil, fmt.Errorf("%w: failed to parse previous config: %w", SyncError, err)
	}

	diff := s.differ.CalculateConfigDiff(previousConfig, config)
	if !hasDiffChanges(diff) {
		return &ConfigResponse{
			Message: "no change was made",
			Config:  config,
		}, nil
	}

	newConfig, err := s.saveConfig(ctx, args.Config, config.Version)
	if err != nil {
		return nil, err
	}

	changes, err := s.applyDiff(ctx, diff, config, newConfig.ID)
	if err != nil {
		return nil, fmt.Errorf("%w: %w", SyncError, err)
	}

	if len(config.Webhooks) > 0 {
		webhookResults, err := s.processWebhooks(ctx, newConfig.ID, config.Webhooks)
		if err != nil {
			return nil, fmt.Errorf("%w: failed to process webhooks: %w", SyncError, err)
		}
		changes.Webhooks = convertWebhookResultsToChanges(webhookResults)
	}

	return &ConfigResponse{
		Message: "StripeConfiguration updated successfully",
		Changes: changes,
		Config:  config,
	}, nil
}

func (s *Service) handleFirstTimeSetup(ctx context.Context, config *StripeConfiguration, raw ConfigData) (*ConfigResponse, error) {
	newConfig, err := s.saveConfig(ctx, raw, config.Version)
	if err != nil {
		return nil, err
	}

	changes := &ConfigChanges{
		Products: &ProductChanges{Created: []ProductChange{}},
	}
	if len(config.Meters) > 0 {
		changes.Meters = &MeterChanges{Created: []MeterChange{}}
		meterChanges, err := s.createMetersWithMapping(ctx, config.Meters, newConfig.ID)
		if err != nil {
			return nil, fmt.Errorf("%w: failed to create meters: %w", SyncError, err)
		}
		changes.Meters.Created = meterChanges
	}

	for _, product := range config.Products {
		productChange, err := s.createProductWithPrices(ctx, product, newConfig.ID)
		if err != nil {
			return nil, fmt.Errorf("%w: failed to create product %s: %w", SyncError, product.ID, err)
		}
		changes.Products.Created = append(changes.Products.Created, *productChange)
	}

	if len(config.Coupons) > 0 {
		changes.Coupons = &CouponChanges{Created: []CouponChange{}}
		for _, c := range config.Coupons {
			cc, err := s.createCoupon(ctx, c, newConfig.ID)
			if err != nil {
				return nil, fmt.Errorf("%w: failed to create coupon %s: %w", SyncError, c.ID, err)
			}
			changes.Coupons.Created = append(changes.Coupons.Created, *cc)
		}
	}

	if len(config.PromotionCodes) > 0 {
		changes.PromotionCodes = &PromotionCodeChanges{Created: []PromotionCodeChange{}}
		for _, p := range config.PromotionCodes {
			pc, err := s.createPromotionCode(ctx, p, newConfig.ID)
			if err != nil {
				return nil, fmt.Errorf("%w: failed to create promotion code %s: %w", SyncError, p.ID, err)
			}
			changes.PromotionCodes.Created = append(changes.PromotionCodes.Created, *pc)
		}
	}

	if len(config.Webhooks) > 0 {
		webhookResults, err := s.processWebhooks(ctx, newConfig.ID, config.Webhooks)
		if err != nil {
			return nil, fmt.Errorf("%w: failed to process webhooks: %w", SyncError, err)
		}
		changes.Webhooks = convertWebhookResultsToChanges(webhookResults)
	}

	return &ConfigResponse{
		Message: "Initial Stripe configuration created successfully",
		Changes: changes,
		Config:  config,
	}, nil
}

func (s *Service) applyDiff(ctx context.Context, diff *ConfigDiff, config *StripeConfiguration, configID uuid.UUID) (*ConfigChanges, error) {
	changes := &ConfigChanges{
		Products: &ProductChanges{
			Created:  []ProductChange{},
			Updated:  []ProductChange{},
			Archived: []ProductChange{},
		},
	}
	if len(diff.NewMeters) > 0 || len(diff.ArchivedMeters) > 0 {
		changes.Meters = &MeterChanges{
			Created:  []MeterChange{},
			Archived: []MeterChange{},
		}
	}
	if len(diff.NewCoupons) > 0 || len(diff.UpdatedCoupons) > 0 || len(diff.ArchivedCoupons) > 0 {
		changes.Coupons = &CouponChanges{
			Created:  []CouponChange{},
			Updated:  []CouponChange{},
			Archived: []CouponChange{},
		}
	}
	if len(diff.NewPromotionCodes) > 0 || len(diff.UpdatedPromotionCodes) > 0 || len(diff.DeactivatedPromoCodes) > 0 {
		changes.PromotionCodes = &PromotionCodeChanges{
			Created:     []PromotionCodeChange{},
			Updated:     []PromotionCodeChange{},
			Deactivated: []PromotionCodeChange{},
		}
	}

	// Phase 1: archives (reverse dependency order)
	for _, promoID := range diff.DeactivatedPromoCodes {
		pc, err := s.deactivatePromotionCode(ctx, promoID)
		if err != nil {
			return nil, fmt.Errorf("failed to deactivate promotion code %s: %w", promoID, err)
		}
		changes.PromotionCodes.Deactivated = append(changes.PromotionCodes.Deactivated, *pc)
	}
	for _, couponID := range diff.ArchivedCoupons {
		cc, err := s.deleteCoupon(ctx, couponID)
		if err != nil {
			return nil, fmt.Errorf("failed to delete coupon %s: %w", couponID, err)
		}
		changes.Coupons.Archived = append(changes.Coupons.Archived, *cc)
	}
	for _, productID := range diff.ArchivedProducts {
		pc, err := s.archiveProduct(ctx, productID)
		if err != nil {
			return nil, fmt.Errorf("failed to archive product %s: %w", productID, err)
		}
		changes.Products.Archived = append(changes.Products.Archived, *pc)
	}
	for _, meterID := range diff.ArchivedMeters {
		stripeID, err := s.GetStripeIDByConfigItemID(ctx, meterID, "meter")
		if err != nil || stripeID == "" {
			return nil, fmt.Errorf("failed to find Stripe ID for meter %s", meterID)
		}
		mc, err := s.deactivateMeter(ctx, stripeID)
		if err != nil {
			return nil, fmt.Errorf("failed to deactivate meter %s: %w", meterID, err)
		}
		mc.MeterID = meterID
		changes.Meters.Archived = append(changes.Meters.Archived, *mc)
	}

	// Phase 2: creates/updates (dependency order)
	if len(diff.NewMeters) > 0 {
		meterChanges, err := s.createMetersWithMapping(ctx, diff.NewMeters, configID)
		if err != nil {
			return nil, fmt.Errorf("failed to create meters: %w", err)
		}
		changes.Meters.Created = meterChanges
	}
	for _, product := range diff.NewProducts {
		pc, err := s.createProductWithPrices(ctx, product, configID)
		if err != nil {
			return nil, fmt.Errorf("failed to create product %s: %w", product.ID, err)
		}
		changes.Products.Created = append(changes.Products.Created, *pc)
	}
	for _, update := range diff.UpdatedProducts {
		pc, err := s.updateProductWithPrices(ctx, update, configID)
		if err != nil {
			return nil, fmt.Errorf("failed to update product %s: %w", update.ID, err)
		}
		changes.Products.Updated = append(changes.Products.Updated, *pc)
	}

	for _, update := range diff.UpdatedCoupons {
		if requiresRecreate, _ := update.FieldChanges["requires_recreate"].(bool); requiresRecreate {
			var couponConfig *Coupon
			for i := range config.Coupons {
				if config.Coupons[i].ID == update.ID {
					couponConfig = &config.Coupons[i]
					break
				}
			}
			if couponConfig == nil {
				return nil, fmt.Errorf("coupon config not found for update: %s", update.ID)
			}
			cc, newStripeID, err := s.recreateCoupon(ctx, *couponConfig, configID)
			if err != nil {
				return nil, fmt.Errorf("failed to recreate coupon %s: %w", update.ID, err)
			}
			changes.Coupons.Updated = append(changes.Coupons.Updated, *cc)

			for _, promo := range config.PromotionCodes {
				if promo.Coupon != update.ID {
					continue
				}
				_, _ = s.deactivatePromotionCode(ctx, promo.ID)
				pc, err := s.createPromotionCodeWithNewCoupon(ctx, promo, newStripeID, configID)
				if err != nil {
					return nil, fmt.Errorf("failed to recreate promotion code %s after coupon recreation: %w", promo.ID, err)
				}
				if changes.PromotionCodes == nil {
					changes.PromotionCodes = &PromotionCodeChanges{Updated: []PromotionCodeChange{}}
				}
				changes.PromotionCodes.Updated = append(changes.PromotionCodes.Updated, *pc)
			}
			continue
		}
		cc, err := s.updateCoupon(ctx, update)
		if err != nil {
			return nil, fmt.Errorf("failed to update coupon %s: %w", update.ID, err)
		}
		changes.Coupons.Updated = append(changes.Coupons.Updated, *cc)
	}
	for _, coupon := range diff.NewCoupons {
		cc, err := s.createCoupon(ctx, coupon, configID)
		if err != nil {
			return nil, fmt.Errorf("failed to create coupon %s: %w", coupon.ID, err)
		}
		changes.Coupons.Created = append(changes.Coupons.Created, *cc)
	}

	for _, update := range diff.UpdatedPromotionCodes {
		if requiresRecreate, _ := update.FieldChanges["requires_recreate"].(bool); requiresRecreate {
			var promoConfig *PromotionCode
			for i := range config.PromotionCodes {
				if config.PromotionCodes[i].ID == update.ID {
					promoConfig = &config.PromotionCodes[i]
					break
				}
			}
			if promoConfig == nil {
				return nil, fmt.Errorf("promotion code config not found for update: %s", update.ID)
			}
			pc, err := s.recreatePromotionCode(ctx, *promoConfig, configID)
			if err != nil {
				return nil, fmt.Errorf("failed to recreate promotion code %s: %w", update.ID, err)
			}
			changes.PromotionCodes.Updated = append(changes.PromotionCodes.Updated, *pc)
			continue
		}
		pc, err := s.updatePromotionCode(ctx, update)
		if err != nil {
			return nil, fmt.Errorf("failed to update promotion code %s: %w", update.ID, err)
		}
		changes.PromotionCodes.Updated = append(changes.PromotionCodes.Updated, *pc)
	}
	for _, promo := range diff.NewPromotionCodes {
		pc, err := s.createPromotionCode(ctx, promo, configID)
		if err != nil {
			return nil, fmt.Errorf("failed to create promotion code %s: %w", promo.ID, err)
		}
		changes.PromotionCodes.Created = append(changes.PromotionCodes.Created, *pc)
	}

	return changes, nil
}

func (s *Service) saveConfig(ctx context.Context, raw ConfigData, version string) (*repository.StripeStripeConfig, error) {
	configBytes, err := json.Marshal(raw)
	if err != nil {
		return nil, fmt.Errorf("%w: failed to marshal config: %w", SyncError, err)
	}
	row, err := s.repo.CreateStripeConfig(ctx, repository.CreateStripeConfigParams{
		Config:  configBytes,
		Version: version,
	})
	if err != nil {
		return nil, fmt.Errorf("%w: failed to save config: %w", SyncError, err)
	}
	return &row, nil
}

func (s *Service) createProductWithPrices(ctx context.Context, product Product, configID uuid.UUID) (*ProductChange, error) {
	productChange, err := s.createProduct(ctx, product, configID)
	if err != nil {
		return nil, err
	}
	priceDetails, err := s.createPricesForProduct(ctx, product, product.ID, configID)
	if err != nil {
		return nil, err
	}
	productChange.Details = append(productChange.Details, priceDetails...)
	return productChange, nil
}

func (s *Service) updateProductWithPrices(ctx context.Context, update ProductUpdate, configID uuid.UUID) (*ProductChange, error) {
	productChange, err := s.updateProduct(ctx, update)
	if err != nil {
		return nil, err
	}
	details := append([]string{}, productChange.Details...)

	for _, priceConfigID := range update.ArchivedPrices {
		if err := s.archivePrice(ctx, priceConfigID); err != nil {
			details = append(details, fmt.Sprintf("Note: Could not archive price %s", priceConfigID))
		} else {
			details = append(details, fmt.Sprintf("Archived price: %s", priceConfigID))
		}
	}
	for _, priceConfig := range update.NewPrices {
		stripeID, err := s.createPrice(ctx, priceConfig, update.ID, configID)
		if err != nil {
			return nil, fmt.Errorf("failed to create new price: %w", err)
		}
		details = append(details, fmt.Sprintf("Created new price: %s (Stripe ID: %s)", priceConfig.ID, stripeID))
	}
	productChange.Details = details
	return productChange, nil
}

func (s *Service) createMetersWithMapping(ctx context.Context, meters []Meter, configID uuid.UUID) ([]MeterChange, error) {
	var out []MeterChange
	for _, m := range meters {
		stripeID, err := s.createMeter(ctx, configID, m)
		if err != nil {
			return nil, fmt.Errorf("failed to create meter %s: %w", m.ID, err)
		}
		out = append(out, MeterChange{
			MeterID:     m.ID,
			DisplayName: m.DisplayName,
			Action:      "created",
			StripeID:    stripeID,
		})
	}
	return out, nil
}

func hasDiffChanges(diff *ConfigDiff) bool {
	return len(diff.NewProducts) > 0 ||
		len(diff.UpdatedProducts) > 0 ||
		len(diff.ArchivedProducts) > 0 ||
		len(diff.NewMeters) > 0 ||
		len(diff.ArchivedMeters) > 0 ||
		len(diff.NewCoupons) > 0 ||
		len(diff.UpdatedCoupons) > 0 ||
		len(diff.ArchivedCoupons) > 0 ||
		len(diff.NewPromotionCodes) > 0 ||
		len(diff.UpdatedPromotionCodes) > 0 ||
		len(diff.DeactivatedPromoCodes) > 0
}

func convertWebhookResultsToChanges(results []WebhookResult) *WebhookChanges {
	if len(results) == 0 {
		return nil
	}
	changes := &WebhookChanges{
		Created:   []WebhookChange{},
		Updated:   []WebhookChange{},
		Unchanged: []WebhookChange{},
	}
	for _, r := range results {
		c := WebhookChange{
			WebhookID: r.ID,
			URL:       r.URL,
			Action:    r.Action,
			StripeID:  r.StripeID,
		}
		switch r.Action {
		case "created":
			changes.Created = append(changes.Created, c)
		case "updated":
			changes.Updated = append(changes.Updated, c)
		case "unchanged":
			changes.Unchanged = append(changes.Unchanged, c)
		}
	}
	return changes
}
