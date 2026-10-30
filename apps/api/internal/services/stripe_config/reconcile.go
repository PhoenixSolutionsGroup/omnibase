package stripe_config

import (
	"context"
	"fmt"
	"sort"
	"sync"

	"github.com/stripe/stripe-go/v82"

	"api/internal/logger"
)

type reconcileState struct {
	productStripeIDs     map[string]string
	priceStripeIDs       map[string]string
	meterStripeIDs       map[string]string
	couponStripeIDs      map[string]string
	promoStripeIDs       map[string]string
	currentDefaultPrices map[string]string
	recreatedProducts    map[string]bool
	recreatedMeters      map[string]bool
	recreatedCoupons     map[string]string
}

func newReconcileState() *reconcileState {
	return &reconcileState{
		productStripeIDs:     make(map[string]string),
		priceStripeIDs:       make(map[string]string),
		meterStripeIDs:       make(map[string]string),
		couponStripeIDs:      make(map[string]string),
		currentDefaultPrices: make(map[string]string),
		recreatedProducts:    make(map[string]bool),
		recreatedMeters:      make(map[string]bool),
		recreatedCoupons:     make(map[string]string),
	}
}

func (s *Service) reconcile(ctx context.Context, config *StripeConfiguration, state *reconcileState) (*ConfigChanges, error) {
	changes := newConfigChanges()
	logger.Logger.Debug("stripe_config.reconcile.start",
		"products", len(config.Products),
		"coupons", len(config.Coupons),
		"promotion_codes", len(config.PromotionCodes),
		"meters", len(config.Meters),
		"webhooks", len(config.Webhooks),
	)

	var (
		actualMeters   map[string]*stripe.BillingMeter
		actualProducts map[string]*stripe.Product
		actualPrices   map[string]*stripe.Price
		actualCoupons  map[string]*stripe.Coupon
		actualPromos   map[string]*stripe.PromotionCode
	)
	var (
		listWG  sync.WaitGroup
		listMu  sync.Mutex
		listErr error
	)
	runList := func(fn func() error) {
		listWG.Add(1)
		go func() {
			defer listWG.Done()
			if err := fn(); err != nil {
				listMu.Lock()
				if listErr == nil {
					listErr = err
				}
				listMu.Unlock()
			}
		}()
	}
	runList(func() error {
		var err error
		actualMeters, err = s.listActiveMetersByEventName(ctx)
		return err
	})
	runList(func() error {
		var err error
		actualProducts, err = s.listManagedProducts(ctx)
		return err
	})
	runList(func() error {
		var err error
		actualPrices, err = s.listManagedPrices(ctx)
		return err
	})
	runList(func() error {
		var err error
		actualCoupons, err = s.listManagedCoupons(ctx)
		return err
	})
	runList(func() error {
		var err error
		actualPromos, err = s.listManagedPromotionCodes(ctx)
		return err
	})
	listWG.Wait()
	if listErr != nil {
		return nil, listErr
	}

	for configID, product := range actualProducts {
		state.productStripeIDs[configID] = product.ID
		state.currentDefaultPrices[configID] = defaultPriceID(product)
	}
	for configID, price := range actualPrices {
		state.priceStripeIDs[configID] = price.ID
	}
	for configID, coupon := range actualCoupons {
		state.couponStripeIDs[configID] = coupon.ID
	}

	desiredProducts := desiredProductsByID(config)
	desiredPrices := desiredPricesByID(config)
	desiredMeters := desiredMetersByEventName(config)

	if err := s.archiveRemovedPromotionCodes(ctx, config, actualPromos, changes); err != nil {
		return nil, err
	}
	if err := s.archiveRemovedCoupons(ctx, config, actualCoupons, changes); err != nil {
		return nil, err
	}
	if err := s.archiveRemovedPrices(ctx, desiredPrices, actualPrices, state, changes); err != nil {
		return nil, err
	}
	if err := s.archiveRemovedProducts(ctx, desiredProducts, actualProducts, changes); err != nil {
		return nil, err
	}
	if err := s.archiveRemovedMeters(ctx, desiredMeters, actualMeters, changes); err != nil {
		return nil, err
	}

	if err := s.reconcileMeters(ctx, config, actualMeters, state, changes); err != nil {
		return nil, err
	}
	if err := s.reconcileProducts(ctx, config, actualProducts, state, changes); err != nil {
		return nil, err
	}
	if err := s.reconcilePrices(ctx, config, actualPrices, state, changes); err != nil {
		return nil, err
	}
	if err := s.reconcileCoupons(ctx, config, actualCoupons, state, changes); err != nil {
		return nil, err
	}
	if err := s.reconcilePromotionCodes(ctx, config, actualPromos, state, changes); err != nil {
		return nil, err
	}

	if s.managed == nil {
		actualWebhooks, err := s.listManagedWebhooks(ctx, config)
		if err != nil {
			return nil, err
		}
		if err := s.archiveRemovedWebhooks(ctx, config, actualWebhooks, changes); err != nil {
			return nil, err
		}
		if err := s.reconcileWebhooks(ctx, config, actualWebhooks, changes); err != nil {
			return nil, err
		}
	} else {
		if err := s.reconcileManagedWebhooks(ctx, config, changes); err != nil {
			return nil, err
		}
	}
	if err := s.applyDefaultPrices(ctx, config, state); err != nil {
		return nil, err
	}

	logger.Logger.Info("stripe_config.reconcile.done",
		"products_created", len(changes.Products.Created),
		"products_updated", len(changes.Products.Updated),
		"products_archived", len(changes.Products.Archived),
		"prices_created", len(changes.Prices.Created),
		"prices_updated", len(changes.Prices.Updated),
		"prices_archived", len(changes.Prices.Archived),
	)
	return changes, nil
}

func newConfigChanges() *ConfigChanges {
	return &ConfigChanges{
		Products:       &ProductChanges{},
		Prices:         &PriceChanges{},
		Meters:         &MeterChanges{},
		Webhooks:       &WebhookChanges{},
		Coupons:        &CouponChanges{},
		PromotionCodes: &PromotionCodeChanges{},
	}
}

func (s *Service) archiveRemovedPromotionCodes(ctx context.Context, config *StripeConfiguration, actual map[string]*stripe.PromotionCode, changes *ConfigChanges) error {
	desired := desiredPromosByID(config)
	keys := sortedKeys(actual)
	for _, configID := range keys {
		if _, ok := desired[configID]; ok {
			continue
		}
		change, err := s.deactivatePromotionCodeByStripeID(ctx, actual[configID].ID, configID)
		if err != nil {
			return err
		}
		changes.PromotionCodes.Deactivated = append(changes.PromotionCodes.Deactivated, *change)
	}
	return nil
}

func (s *Service) archiveRemovedCoupons(ctx context.Context, config *StripeConfiguration, actual map[string]*stripe.Coupon, changes *ConfigChanges) error {
	desired := desiredCouponsByID(config)
	keys := sortedKeys(actual)
	for _, configID := range keys {
		if _, ok := desired[configID]; ok {
			continue
		}
		change, err := s.deleteCoupon(ctx, actual[configID])
		if err != nil {
			return err
		}
		change.CouponID = configID
		changes.Coupons.Archived = append(changes.Coupons.Archived, *change)
	}
	return nil
}

func (s *Service) archiveRemovedPrices(ctx context.Context, desired map[string]Price, actual map[string]*stripe.Price, state *reconcileState, changes *ConfigChanges) error {
	productByStripeID := reverseStringMap(state.productStripeIDs)
	keys := sortedKeys(actual)
	for _, configID := range keys {
		if _, ok := desired[configID]; ok {
			continue
		}
		price := actual[configID]
		if err := s.archivePriceByStripeID(ctx, price.ID); err != nil {
			return err
		}
		productID := ""
		if price.Product != nil {
			productID = productByStripeID[price.Product.ID]
		}
		changes.Prices.Archived = append(changes.Prices.Archived, PriceChange{
			PriceID:   configID,
			ProductID: productID,
			Action:    "archived",
			StripeID:  price.ID,
		})
	}
	return nil
}

func (s *Service) archiveRemovedProducts(ctx context.Context, desired map[string]Product, actual map[string]*stripe.Product, changes *ConfigChanges) error {
	keys := sortedKeys(actual)
	for _, configID := range keys {
		if _, ok := desired[configID]; ok {
			continue
		}
		change, err := s.archiveProduct(ctx, actual[configID])
		if err != nil {
			return err
		}
		change.ProductID = configID
		changes.Products.Archived = append(changes.Products.Archived, *change)
	}
	return nil
}

func (s *Service) archiveRemovedMeters(ctx context.Context, desired map[string]Meter, actual map[string]*stripe.BillingMeter, changes *ConfigChanges) error {
	keys := sortedKeys(actual)
	for _, eventName := range keys {
		if _, ok := desired[eventName]; ok {
			continue
		}
		change, err := s.deactivateMeter(ctx, actual[eventName])
		if err != nil {
			return err
		}
		change.MeterID = eventName
		changes.Meters.Archived = append(changes.Meters.Archived, *change)
	}
	return nil
}

func (s *Service) archiveRemovedWebhooks(ctx context.Context, config *StripeConfiguration, actual map[string]StripeWebhookInfo, changes *ConfigChanges) error {
	desired := make(map[string]bool, len(config.Webhooks))
	for _, webhook := range config.Webhooks {
		desired[desiredWebhookKey(webhook)] = true
	}
	keys := sortedKeys(actual)
	for _, key := range keys {
		if desired[key] {
			continue
		}
		webhook := actual[key]
		if err := s.DeleteWebhook(ctx, webhook.ID); err != nil {
			return err
		}
		changes.Webhooks.Deleted = append(changes.Webhooks.Deleted, WebhookChange{
			WebhookID: webhook.ID,
			URL:       webhook.URL,
			Action:    "deleted",
			StripeID:  webhook.ID,
		})
	}
	return nil
}

func (s *Service) reconcileMeters(ctx context.Context, config *StripeConfiguration, actual map[string]*stripe.BillingMeter, state *reconcileState, changes *ConfigChanges) error {
	for _, meter := range config.Meters {
		live := actual[meter.EventName]
		if live == nil {
			stripeID, err := s.createMeter(ctx, meter)
			if err != nil {
				return err
			}
			state.meterStripeIDs[meter.ID] = stripeID
			changes.Meters.Created = append(changes.Meters.Created, MeterChange{
				MeterID:     meter.ID,
				DisplayName: meter.DisplayName,
				Action:      "created",
				StripeID:    stripeID,
			})
			continue
		}

		if meterNeedsRecreate(meter, live) {
			if _, err := s.deactivateMeter(ctx, live); err != nil {
				return err
			}
			recreateMeter := meter
			recreateMeter.StripeID = ""
			stripeID, err := s.createMeter(ctx, recreateMeter)
			if err != nil {
				return err
			}
			state.meterStripeIDs[meter.ID] = stripeID
			changes.Meters.Updated = append(changes.Meters.Updated, MeterChange{
				MeterID:     meter.ID,
				DisplayName: meter.DisplayName,
				Action:      "recreated",
				StripeID:    stripeID,
			})
			continue
		}

		state.meterStripeIDs[meter.ID] = live.ID
		if live.DisplayName != meter.DisplayName {
			change, err := s.updateMeterDisplayName(ctx, live.ID, meter.DisplayName)
			if err != nil {
				return err
			}
			change.MeterID = meter.ID
			changes.Meters.Updated = append(changes.Meters.Updated, *change)
		}
	}
	return nil
}

func (s *Service) reconcileProducts(ctx context.Context, config *StripeConfiguration, actual map[string]*stripe.Product, state *reconcileState, changes *ConfigChanges) error {
	for _, product := range config.Products {
		if product.ID == "free" {
			continue
		}
		live := actual[product.ID]
		if live == nil {
			change, err := s.createProduct(ctx, product)
			if err != nil {
				return err
			}
			state.productStripeIDs[product.ID] = change.StripeID
			changes.Products.Created = append(changes.Products.Created, *change)
			continue
		}

		state.productStripeIDs[product.ID] = live.ID
		state.currentDefaultPrices[product.ID] = defaultPriceID(live)

		if productConfigHash(product) == live.Metadata[MetadataKeyHash] && !productNeedsRecreate(product, live) {
			continue
		}
		if productNeedsRecreate(product, live) {
			newStripeID, change, err := s.recreateProduct(ctx, product, live)
			if err != nil {
				return err
			}
			state.productStripeIDs[product.ID] = newStripeID
			state.currentDefaultPrices[product.ID] = ""
			state.recreatedProducts[product.ID] = true
			changes.Products.Updated = append(changes.Products.Updated, *change)
			continue
		}

		change, err := s.updateProductFromConfig(ctx, product, live.ID)
		if err != nil {
			return err
		}
		changes.Products.Updated = append(changes.Products.Updated, *change)
	}
	return nil
}

func (s *Service) reconcilePrices(ctx context.Context, config *StripeConfiguration, actual map[string]*stripe.Price, state *reconcileState, changes *ConfigChanges) error {
	for _, product := range config.Products {
		if product.ID == "free" {
			continue
		}
		for _, price := range product.Prices {
			if price.ID == "free" {
				continue
			}
			live := actual[price.ID]
			forceRecreate := state.recreatedProducts[product.ID] ||
				(price.UsageType == "metered" && state.recreatedMeters[price.Meter])

			if live == nil {
				createPrice := price
				if forceRecreate {
					createPrice.StripeID = ""
				}
				stripeID, _, err := s.createPrice(ctx, createPrice, state.productStripeIDs[product.ID], state.meterStripeIDs[price.Meter], false)
				if err != nil {
					return err
				}
				state.priceStripeIDs[price.ID] = stripeID
				changes.Prices.Created = append(changes.Prices.Created, PriceChange{
					PriceID:   price.ID,
					ProductID: product.ID,
					Action:    "created",
					StripeID:  stripeID,
				})
				continue
			}

			state.priceStripeIDs[price.ID] = live.ID
			if !forceRecreate && priceConfigHash(price) == live.Metadata[MetadataKeyHash] {
				continue
			}

			if err := s.archivePriceByStripeID(ctx, live.ID); err != nil {
				return err
			}
			recreatePrice := price
			recreatePrice.StripeID = ""
			stripeID, _, err := s.createPrice(ctx, recreatePrice, state.productStripeIDs[product.ID], state.meterStripeIDs[price.Meter], true)
			if err != nil {
				return err
			}
			state.priceStripeIDs[price.ID] = stripeID
			changes.Prices.Updated = append(changes.Prices.Updated, PriceChange{
				PriceID:   price.ID,
				ProductID: product.ID,
				Action:    "recreated",
				StripeID:  stripeID,
			})
		}
	}
	return nil
}

func (s *Service) reconcileCoupons(ctx context.Context, config *StripeConfiguration, actual map[string]*stripe.Coupon, state *reconcileState, changes *ConfigChanges) error {
	productConfigByStripeID := reverseStringMap(state.productStripeIDs)
	for _, coupon := range config.Coupons {
		live := actual[coupon.ID]
		if live == nil {
			change, err := s.createCoupon(ctx, coupon, state.productStripeIDs)
			if err != nil {
				return err
			}
			state.couponStripeIDs[coupon.ID] = change.StripeID
			changes.Coupons.Created = append(changes.Coupons.Created, *change)
			continue
		}

		state.couponStripeIDs[coupon.ID] = live.ID

		if couponConfigHash(coupon) == live.Metadata[MetadataKeyHash] && !couponImmutableChanged(coupon, live, productConfigByStripeID) {
			continue
		}
		if couponImmutableChanged(coupon, live, productConfigByStripeID) {
			if _, err := s.deleteCoupon(ctx, live); err != nil {
				return err
			}
			change, newStripeID, err := s.recreateCoupon(ctx, coupon, state.productStripeIDs)
			if err != nil {
				return err
			}
			state.couponStripeIDs[coupon.ID] = newStripeID
			state.recreatedCoupons[coupon.ID] = newStripeID
			changes.Coupons.Updated = append(changes.Coupons.Updated, *change)
			continue
		}

		change, err := s.updateCouponFromConfig(ctx, coupon, live.ID)
		if err != nil {
			return err
		}
		changes.Coupons.Updated = append(changes.Coupons.Updated, *change)
	}
	return nil
}

func (s *Service) reconcilePromotionCodes(ctx context.Context, config *StripeConfiguration, actual map[string]*stripe.PromotionCode, state *reconcileState, changes *ConfigChanges) error {
	for _, promo := range config.PromotionCodes {
		couponStripeID := state.couponStripeIDs[promo.Coupon]
		if couponStripeID == "" {
			couponStripeID = promo.Coupon
		}
		couponRecreated := state.recreatedCoupons[promo.Coupon] != ""
		live := actual[promo.ID]

		if live == nil {
			change, err := s.createPromotionCode(ctx, promo, couponStripeID)
			if err != nil {
				return err
			}
			changes.PromotionCodes.Created = append(changes.PromotionCodes.Created, *change)
			continue
		}

		if !couponRecreated && promoConfigHash(promo) == live.Metadata[MetadataKeyHash] && !promoImmutableChanged(promo, live, couponStripeID) {
			continue
		}
		if couponRecreated || promoImmutableChanged(promo, live, couponStripeID) {
			if _, err := s.deactivatePromotionCodeByStripeID(ctx, live.ID, promo.ID); err != nil {
				return err
			}
			change, err := s.recreatePromotionCode(ctx, promo, couponStripeID)
			if err != nil {
				return err
			}
			changes.PromotionCodes.Updated = append(changes.PromotionCodes.Updated, *change)
			continue
		}

		change, err := s.updatePromotionCodeFromConfig(ctx, promo, live.ID)
		if err != nil {
			return err
		}
		changes.PromotionCodes.Updated = append(changes.PromotionCodes.Updated, *change)
	}
	return nil
}

func (s *Service) reconcileWebhooks(ctx context.Context, config *StripeConfiguration, actual map[string]StripeWebhookInfo, changes *ConfigChanges) error {
	for _, webhook := range config.Webhooks {
		live, ok := actual[desiredWebhookKey(webhook)]
		if !ok {
			result, err := s.createWebhook(ctx, webhook)
			if err != nil {
				return err
			}
			appendWebhookResult(changes, *result)
			continue
		}

		if webhookConfigHash(webhook) == live.Metadata[MetadataKeyHash] {
			changes.Webhooks.Unchanged = append(changes.Webhooks.Unchanged, WebhookChange{
				WebhookID: live.ID,
				URL:       live.URL,
				Action:    "unchanged",
				StripeID:  live.ID,
			})
			continue
		}
		if webhook.Connect != live.Connect {
			if err := s.DeleteWebhook(ctx, live.ID); err != nil {
				return err
			}
			result, err := s.createWebhook(ctx, webhook)
			if err != nil {
				return err
			}
			result.Action = "recreated"
			appendWebhookResult(changes, *result)
			continue
		}
		result, err := s.updateWebhook(ctx, webhook, live.ID)
		if err != nil {
			return err
		}
		appendWebhookResult(changes, *result)
	}
	return nil
}

func (s *Service) reconcileManagedWebhooks(ctx context.Context, config *StripeConfiguration, changes *ConfigChanges) error {
	results, err := s.processWebhooksManaged(ctx, config.Webhooks)
	if err != nil {
		return err
	}
	for _, result := range results {
		appendWebhookResult(changes, result)
	}
	return nil
}

func appendWebhookResult(changes *ConfigChanges, result WebhookResult) {
	change := WebhookChange{
		WebhookID: result.ID,
		URL:       result.URL,
		Action:    result.Action,
		StripeID:  result.StripeID,
	}
	switch result.Action {
	case "created":
		changes.Webhooks.Created = append(changes.Webhooks.Created, change)
	case "updated", "recreated":
		changes.Webhooks.Updated = append(changes.Webhooks.Updated, change)
	default:
		changes.Webhooks.Unchanged = append(changes.Webhooks.Unchanged, change)
	}
}

func (s *Service) applyDefaultPrices(ctx context.Context, config *StripeConfiguration, state *reconcileState) error {
	for _, product := range config.Products {
		if product.ID == "free" {
			continue
		}
		productStripeID := state.productStripeIDs[product.ID]
		if productStripeID == "" {
			continue
		}
		desiredDefault := ""
		for _, price := range product.Prices {
			if price.Default && price.ID != "free" {
				desiredDefault = state.priceStripeIDs[price.ID]
				break
			}
		}
		if desiredDefault == "" || desiredDefault == state.currentDefaultPrices[product.ID] {
			continue
		}
		if err := s.setDefaultPrice(ctx, productStripeID, desiredDefault); err != nil {
			return err
		}
		state.currentDefaultPrices[product.ID] = desiredDefault
	}
	return nil
}

func (s *Service) listActiveMetersByEventName(ctx context.Context) (map[string]*stripe.BillingMeter, error) {
	params := &stripe.BillingMeterListParams{Status: stripe.String("active")}
	params.Limit = stripe.Int64(100)
	s.stripe.ApplyAccount(params)
	out := make(map[string]*stripe.BillingMeter)
	for meter, err := range s.stripe.Stripe.V1BillingMeters.List(ctx, params) {
		if err != nil {
			return nil, fmt.Errorf("failed to list meters: %w", err)
		}
		out[meter.EventName] = meter
	}
	return out, nil
}

func (s *Service) listManagedProducts(ctx context.Context) (map[string]*stripe.Product, error) {
	params := &stripe.ProductListParams{Active: stripe.Bool(true)}
	params.Limit = stripe.Int64(100)
	s.stripe.ApplyAccount(params)
	out := make(map[string]*stripe.Product)
	for product, err := range s.stripe.Stripe.V1Products.List(ctx, params) {
		if err != nil {
			return nil, fmt.Errorf("failed to list products: %w", err)
		}
		if id := managedConfigID(product.Metadata); id != "" {
			out[id] = product
		}
	}
	return out, nil
}

func (s *Service) listManagedPrices(ctx context.Context) (map[string]*stripe.Price, error) {
	params := &stripe.PriceListParams{Active: stripe.Bool(true)}
	params.Limit = stripe.Int64(100)
	s.stripe.ApplyAccount(params)
	out := make(map[string]*stripe.Price)
	for price, err := range s.stripe.Stripe.V1Prices.List(ctx, params) {
		if err != nil {
			return nil, fmt.Errorf("failed to list prices: %w", err)
		}
		if id := managedPriceConfigID(price); id != "" {
			out[id] = price
		}
	}
	return out, nil
}

func (s *Service) listManagedCoupons(ctx context.Context) (map[string]*stripe.Coupon, error) {
	params := &stripe.CouponListParams{}
	params.Limit = stripe.Int64(100)
	s.stripe.ApplyAccount(params)
	out := make(map[string]*stripe.Coupon)
	for coupon, err := range s.stripe.Stripe.V1Coupons.List(ctx, params) {
		if err != nil {
			return nil, fmt.Errorf("failed to list coupons: %w", err)
		}
		if id := managedConfigID(coupon.Metadata); id != "" {
			out[id] = coupon
		}
	}
	return out, nil
}

func (s *Service) listManagedPromotionCodes(ctx context.Context) (map[string]*stripe.PromotionCode, error) {
	params := &stripe.PromotionCodeListParams{Active: stripe.Bool(true)}
	params.Limit = stripe.Int64(100)
	s.stripe.ApplyAccount(params)
	out := make(map[string]*stripe.PromotionCode)
	for promo, err := range s.stripe.Stripe.V1PromotionCodes.List(ctx, params) {
		if err != nil {
			return nil, fmt.Errorf("failed to list promotion codes: %w", err)
		}
		if id := managedConfigID(promo.Metadata); id != "" {
			out[id] = promo
		}
	}
	return out, nil
}

func (s *Service) listManagedWebhooks(ctx context.Context, config *StripeConfiguration) (map[string]StripeWebhookInfo, error) {
	webhooks, err := s.listStripeWebhooks(ctx)
	if err != nil {
		return nil, err
	}
	desiredURLs := make(map[string]bool, len(config.Webhooks))
	for _, webhook := range config.Webhooks {
		desiredURLs[webhook.URL] = true
	}
	out := make(map[string]StripeWebhookInfo)
	for _, webhook := range webhooks {
		if isManagedMetadata(webhook.Metadata) || desiredURLs[webhook.URL] {
			out[managedWebhookKey(webhook)] = webhook
		}
	}
	return out, nil
}

func desiredProductsByID(config *StripeConfiguration) map[string]Product {
	out := make(map[string]Product, len(config.Products))
	for _, product := range config.Products {
		out[product.ID] = product
	}
	return out
}

func desiredPricesByID(config *StripeConfiguration) map[string]Price {
	prices := make(map[string]Price)
	for _, product := range config.Products {
		for _, price := range product.Prices {
			prices[price.ID] = price
		}
	}
	return prices
}

func desiredCouponsByID(config *StripeConfiguration) map[string]Coupon {
	out := make(map[string]Coupon, len(config.Coupons))
	for _, coupon := range config.Coupons {
		out[coupon.ID] = coupon
	}
	return out
}

func desiredPromosByID(config *StripeConfiguration) map[string]PromotionCode {
	out := make(map[string]PromotionCode, len(config.PromotionCodes))
	for _, promo := range config.PromotionCodes {
		out[promo.ID] = promo
	}
	return out
}

func desiredMetersByEventName(config *StripeConfiguration) map[string]Meter {
	out := make(map[string]Meter, len(config.Meters))
	for _, meter := range config.Meters {
		out[meter.EventName] = meter
	}
	return out
}

func managedConfigID(metadata map[string]string) string {
	if !isManagedMetadata(metadata) {
		return ""
	}
	return metadata[MetadataKeyConfigID]
}

func isManagedMetadata(metadata map[string]string) bool {
	return metadata != nil && metadata[MetadataKeyManaged] == MetadataManagedValue
}

func managedPriceConfigID(price *stripe.Price) string {
	if !isManagedMetadata(price.Metadata) {
		return ""
	}
	if id := price.Metadata[MetadataKeyConfigID]; id != "" {
		return id
	}
	return price.LookupKey
}

func managedWebhookKey(webhook StripeWebhookInfo) string {
	return webhook.URL
}

func desiredWebhookKey(webhook WebhookEndpointConfig) string {
	return webhook.URL
}

func defaultPriceID(product *stripe.Product) string {
	if product.DefaultPrice != nil {
		return product.DefaultPrice.ID
	}
	return ""
}

func productNeedsRecreate(desired Product, live *stripe.Product) bool {
	return productType(desired) != productTypeOf(live)
}

func meterNeedsRecreate(desired Meter, live *stripe.BillingMeter) bool {
	if desired.EventName != live.EventName {
		return true
	}
	desiredFormula := desired.DefaultAggregation.Formula
	if live.DefaultAggregation == nil || desiredFormula != string(live.DefaultAggregation.Formula) {
		return true
	}

	desiredKey, desiredType := "stripe_customer_id", "by_id"
	if desired.CustomerMapping != nil {
		desiredKey = desired.CustomerMapping.EventPayloadKey
		desiredType = desired.CustomerMapping.Type
	}
	liveKey, liveType := "", ""
	if live.CustomerMapping != nil {
		liveKey = live.CustomerMapping.EventPayloadKey
		liveType = string(live.CustomerMapping.Type)
	}
	if desiredKey != liveKey || desiredType != liveType {
		return true
	}

	desiredValueKey := "value"
	if desired.ValueSettings != nil {
		desiredValueKey = desired.ValueSettings.EventPayloadKey
	}
	liveValueKey := ""
	if live.ValueSettings != nil {
		liveValueKey = live.ValueSettings.EventPayloadKey
	}
	return desiredValueKey != liveValueKey
}

func couponImmutableChanged(desired Coupon, live *stripe.Coupon, productConfigByStripeID map[string]string) bool {
	if !floatPtrMatches(desired.PercentOff, live.PercentOff) {
		return true
	}
	if !int64PtrMatches(desired.AmountOff, live.AmountOff) {
		return true
	}
	if desired.Currency != "" && desired.Currency != string(live.Currency) {
		return true
	}
	if desired.Duration != string(live.Duration) {
		return true
	}
	if !int64PtrMatches(desired.DurationInMonths, live.DurationInMonths) {
		return true
	}
	if !int64PtrMatches(desired.MaxRedemptions, live.MaxRedemptions) {
		return true
	}
	if !int64PtrMatches(desired.RedeemBy, live.RedeemBy) {
		return true
	}
	var liveProducts []string
	if live.AppliesTo != nil {
		for _, stripeProductID := range live.AppliesTo.Products {
			if configProductID := productConfigByStripeID[stripeProductID]; configProductID != "" {
				liveProducts = append(liveProducts, configProductID)
			} else {
				liveProducts = append(liveProducts, stripeProductID)
			}
		}
	}
	return !stringSetsEqual(desired.AppliesTo, liveProducts)
}

func promoImmutableChanged(desired PromotionCode, live *stripe.PromotionCode, couponStripeID string) bool {
	if desired.Code != live.Code {
		return true
	}
	if live.Coupon != nil && live.Coupon.ID != couponStripeID {
		return true
	}
	if !int64PtrMatches(desired.MaxRedemptions, live.MaxRedemptions) {
		return true
	}
	if !int64PtrMatches(desired.ExpiresAt, live.ExpiresAt) {
		return true
	}

	desiredFirst := desired.FirstTimeTransaction != nil && *desired.FirstTimeTransaction
	liveFirst := live.Restrictions != nil && live.Restrictions.FirstTimeTransaction
	if desiredFirst != liveFirst {
		return true
	}

	var desiredMinimum int64
	if desired.MinimumAmount != nil {
		desiredMinimum = *desired.MinimumAmount
	}
	var liveMinimum int64
	if live.Restrictions != nil {
		liveMinimum = live.Restrictions.MinimumAmount
	}
	if desiredMinimum != liveMinimum {
		return true
	}
	if desired.MinimumAmountCurrency != "" && live.Restrictions != nil {
		if desired.MinimumAmountCurrency != string(live.Restrictions.MinimumAmountCurrency) {
			return true
		}
	}
	return false
}

func floatPtrMatches(value *float64, actual float64) bool {
	if value == nil {
		return actual == 0
	}
	return *value == actual
}

func int64PtrMatches(value *int64, actual int64) bool {
	if value == nil {
		return actual == 0
	}
	return *value == actual
}

func stringSetsEqual(a, b []string) bool {
	if len(a) != len(b) {
		return false
	}
	set := make(map[string]bool, len(a))
	for _, value := range a {
		set[value] = true
	}
	for _, value := range b {
		if !set[value] {
			return false
		}
	}
	return true
}

func reverseStringMap(source map[string]string) map[string]string {
	out := make(map[string]string, len(source))
	for key, value := range source {
		out[value] = key
	}
	return out
}

func sortedKeys[T any](values map[string]T) []string {
	keys := make([]string, 0, len(values))
	for key := range values {
		keys = append(keys, key)
	}
	sort.Strings(keys)
	return keys
}
