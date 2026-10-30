package stripe_config

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"sort"
	"sync"

	"github.com/stripe/stripe-go/v82"
)

var ConfigStatusError = errors.New("Failed to get stripe config status")

const (
	statusKindProduct       = "product"
	statusKindPrice         = "price"
	statusKindMeter         = "meter"
	statusKindCoupon        = "coupon"
	statusKindPromotionCode = "promotion_code"
	statusKindWebhook       = "webhook"

	statusStateAdded     = "added"
	statusStateChanged   = "changed"
	statusStateRemoved   = "removed"
	statusStateMissing   = "missing"
	statusStateModified  = "modified"
	statusStateUntracked = "untracked"

	statusReasonExternalEdit  = "external_edit"
	statusReasonApplyMismatch = "apply_mismatch"
	statusReasonMissingHash   = "missing_hash"
	statusReasonLookupKey     = "lookup_key_changed"
	statusReasonDefaultPrice  = "default_price_changed"
	statusReasonDisabled      = "disabled"
)

type ConfigStatusEntry struct {
	Kind     string `json:"kind"`
	ID       string `json:"id"`
	Name     string `json:"name,omitempty"`
	State    string `json:"state"`
	Reason   string `json:"reason,omitempty"`
	StripeID string `json:"stripe_id,omitempty"`
}

type ConfigStatusSummary struct {
	Pending   int `json:"pending"`
	Drift     int `json:"drift"`
	Untracked int `json:"untracked"`
}

type ConfigStatus struct {
	Pending   []ConfigStatusEntry `json:"pending"`
	Drift     []ConfigStatusEntry `json:"drift"`
	Untracked []ConfigStatusEntry `json:"untracked"`
	Summary   ConfigStatusSummary `json:"summary"`
}

type liveState struct {
	meters   map[string]*stripe.BillingMeter
	products map[string]*stripe.Product
	prices   map[string]*stripe.Price
	coupons  map[string]*stripe.Coupon
	promos   map[string]*stripe.PromotionCode
}

func (s *Service) Status(ctx context.Context, desired *StripeConfiguration) (*ConfigStatus, error) {
	if desired == nil {
		desired = &StripeConfiguration{}
	}

	applied, err := s.loadAppliedConfig(ctx)
	if err != nil {
		return nil, fmt.Errorf("%w: %w", ConfigStatusError, err)
	}
	live, err := s.listLiveState(ctx)
	if err != nil {
		return nil, fmt.Errorf("%w: %w", ConfigStatusError, err)
	}
	actualWebhooks, err := s.listStatusWebhooks(ctx, desired)
	if err != nil {
		return nil, fmt.Errorf("%w: %w", ConfigStatusError, err)
	}

	status := &ConfigStatus{
		Pending:   pendingStatus(desired, applied),
		Drift:     driftStatus(applied, live, actualWebhooks, s.managed == nil),
		Untracked: untrackedStatus(desired, applied, live, actualWebhooks),
	}
	sortStatusEntries(status.Pending)
	sortStatusEntries(status.Drift)
	sortStatusEntries(status.Untracked)
	status.Summary = ConfigStatusSummary{
		Pending:   len(status.Pending),
		Drift:     len(status.Drift),
		Untracked: len(status.Untracked),
	}
	return status, nil
}

func (s *Service) loadAppliedConfig(ctx context.Context) (*StripeConfiguration, error) {
	row, err := s.repo.GetLatestStripeConfig(ctx)
	if errors.Is(err, sql.ErrNoRows) {
		return &StripeConfiguration{}, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to load applied config: %w", err)
	}
	if len(row.Config) == 0 {
		return &StripeConfiguration{}, nil
	}
	var raw ConfigData
	if err := json.Unmarshal(row.Config, &raw); err != nil {
		return nil, fmt.Errorf("failed to unmarshal applied config: %w", err)
	}
	applied, err := s.validator.ParseAndValidateConfig(raw)
	if err != nil {
		return nil, fmt.Errorf("failed to parse applied config: %w", err)
	}
	return applied, nil
}

func (s *Service) listLiveState(ctx context.Context) (*liveState, error) {
	state := &liveState{}
	var wg sync.WaitGroup
	var mu sync.Mutex
	var firstErr error
	run := func(fn func() error) {
		wg.Add(1)
		go func() {
			defer wg.Done()
			if err := fn(); err != nil {
				mu.Lock()
				if firstErr == nil {
					firstErr = err
				}
				mu.Unlock()
			}
		}()
	}
	run(func() error {
		values, err := s.listActiveMetersByEventName(ctx)
		state.meters = values
		return err
	})
	run(func() error {
		values, err := s.listManagedProducts(ctx)
		state.products = values
		return err
	})
	run(func() error {
		values, err := s.listManagedPrices(ctx)
		state.prices = values
		return err
	})
	run(func() error {
		values, err := s.listManagedCoupons(ctx)
		state.coupons = values
		return err
	})
	run(func() error {
		values, err := s.listManagedPromotionCodesForStatus(ctx)
		state.promos = values
		return err
	})
	wg.Wait()
	if firstErr != nil {
		return nil, firstErr
	}
	return state, nil
}

func (s *Service) listStatusWebhooks(ctx context.Context, desired *StripeConfiguration) (map[string]StripeWebhookInfo, error) {
	if s.managed == nil {
		return s.listManagedWebhooks(ctx, desired)
	}
	rows, err := s.repo.ListStripeWebhooks(ctx)
	if err != nil {
		return nil, err
	}
	out := make(map[string]StripeWebhookInfo, len(rows))
	for _, row := range rows {
		out[row.Url] = StripeWebhookInfo{
			ID:      row.StripeID,
			URL:     row.Url,
			Events:  row.Events,
			Connect: row.Connect,
			Metadata: map[string]string{
				MetadataKeyManaged: MetadataManagedValue,
			},
		}
	}
	return out, nil
}

func pendingStatus(desired, applied *StripeConfiguration) []ConfigStatusEntry {
	out := make([]ConfigStatusEntry, 0)

	desiredProducts := desiredProductsByID(desired)
	appliedProducts := desiredProductsByID(applied)
	for _, id := range sortedKeys(desiredProducts) {
		if id == "free" {
			continue
		}
		desiredProduct := desiredProducts[id]
		appliedProduct, ok := appliedProducts[id]
		if !ok {
			out = append(out, statusEntry(statusKindProduct, id, desiredProduct.Name, statusStateAdded, "", ""))
			continue
		}
		if productConfigHash(desiredProduct) != productConfigHash(appliedProduct) {
			out = append(out, statusEntry(statusKindProduct, id, desiredProduct.Name, statusStateChanged, "", ""))
		}
		if desiredDefault := defaultPriceConfigID(desiredProduct); desiredDefault != "" && desiredDefault != defaultPriceConfigID(appliedProduct) {
			out = mergeStatusEntry(out, statusEntry(statusKindProduct, id, desiredProduct.Name, statusStateChanged, statusReasonDefaultPrice, ""))
		}
	}
	for _, id := range sortedKeys(appliedProducts) {
		if id == "free" {
			continue
		}
		if _, ok := desiredProducts[id]; !ok {
			out = append(out, statusEntry(statusKindProduct, id, appliedProducts[id].Name, statusStateRemoved, "", ""))
		}
	}

	desiredPrices := desiredPricesByID(desired)
	appliedPrices := desiredPricesByID(applied)
	for _, id := range sortedKeys(desiredPrices) {
		if id == "free" {
			continue
		}
		desiredPrice := desiredPrices[id]
		appliedPrice, ok := appliedPrices[id]
		if !ok {
			out = append(out, statusEntry(statusKindPrice, id, "", statusStateAdded, "", ""))
			continue
		}
		if priceConfigHash(desiredPrice) != priceConfigHash(appliedPrice) {
			out = append(out, statusEntry(statusKindPrice, id, "", statusStateChanged, "", ""))
		}
	}
	for _, id := range sortedKeys(appliedPrices) {
		if id == "free" {
			continue
		}
		if _, ok := desiredPrices[id]; !ok {
			out = append(out, statusEntry(statusKindPrice, id, "", statusStateRemoved, "", ""))
		}
	}

	desiredCoupons := desiredCouponsByID(desired)
	appliedCoupons := desiredCouponsByID(applied)
	for _, id := range sortedKeys(desiredCoupons) {
		desiredCoupon := desiredCoupons[id]
		appliedCoupon, ok := appliedCoupons[id]
		if !ok {
			out = append(out, statusEntry(statusKindCoupon, id, desiredCoupon.Name, statusStateAdded, "", ""))
			continue
		}
		if couponConfigHash(desiredCoupon) != couponConfigHash(appliedCoupon) {
			out = append(out, statusEntry(statusKindCoupon, id, desiredCoupon.Name, statusStateChanged, "", ""))
		}
	}
	for _, id := range sortedKeys(appliedCoupons) {
		if _, ok := desiredCoupons[id]; !ok {
			out = append(out, statusEntry(statusKindCoupon, id, appliedCoupons[id].Name, statusStateRemoved, "", ""))
		}
	}

	desiredPromos := desiredPromosByID(desired)
	appliedPromos := desiredPromosByID(applied)
	for _, id := range sortedKeys(desiredPromos) {
		desiredPromo := desiredPromos[id]
		appliedPromo, ok := appliedPromos[id]
		if !ok {
			out = append(out, statusEntry(statusKindPromotionCode, id, desiredPromo.Code, statusStateAdded, "", ""))
			continue
		}
		if promoConfigHash(desiredPromo) != promoConfigHash(appliedPromo) {
			out = append(out, statusEntry(statusKindPromotionCode, id, desiredPromo.Code, statusStateChanged, "", ""))
		}
	}
	for _, id := range sortedKeys(appliedPromos) {
		if _, ok := desiredPromos[id]; !ok {
			out = append(out, statusEntry(statusKindPromotionCode, id, appliedPromos[id].Code, statusStateRemoved, "", ""))
		}
	}

	desiredMeters := desiredMetersByEventName(desired)
	appliedMeters := desiredMetersByEventName(applied)
	for _, eventName := range sortedKeys(desiredMeters) {
		desiredMeter := desiredMeters[eventName]
		appliedMeter, ok := appliedMeters[eventName]
		if !ok {
			out = append(out, statusEntry(statusKindMeter, meterID(desiredMeter), desiredMeter.DisplayName, statusStateAdded, "", ""))
			continue
		}
		if meterFieldsChanged(desiredMeter, appliedMeter) {
			out = append(out, statusEntry(statusKindMeter, meterID(desiredMeter), desiredMeter.DisplayName, statusStateChanged, "", ""))
		}
	}
	for _, eventName := range sortedKeys(appliedMeters) {
		if _, ok := desiredMeters[eventName]; !ok {
			appliedMeter := appliedMeters[eventName]
			out = append(out, statusEntry(statusKindMeter, meterID(appliedMeter), appliedMeter.DisplayName, statusStateRemoved, "", ""))
		}
	}

	desiredWebhooks := webhooksByURL(desired)
	appliedWebhooks := webhooksByURL(applied)
	for _, url := range sortedKeys(desiredWebhooks) {
		desiredWebhook := desiredWebhooks[url]
		appliedWebhook, ok := appliedWebhooks[url]
		if !ok {
			out = append(out, statusEntry(statusKindWebhook, url, url, statusStateAdded, "", ""))
			continue
		}
		if webhookConfigHash(desiredWebhook) != webhookConfigHash(appliedWebhook) {
			out = append(out, statusEntry(statusKindWebhook, url, url, statusStateChanged, "", ""))
		}
	}
	for _, url := range sortedKeys(appliedWebhooks) {
		if _, ok := desiredWebhooks[url]; !ok {
			out = append(out, statusEntry(statusKindWebhook, url, url, statusStateRemoved, "", ""))
		}
	}

	return out
}

func driftStatus(applied *StripeConfiguration, live *liveState, actualWebhooks map[string]StripeWebhookInfo, checkWebhookHash bool) []ConfigStatusEntry {
	out := make([]ConfigStatusEntry, 0)
	meterConfigIDs := meterConfigIDsByStripeID(live, applied)
	productConfigIDs := productConfigIDsByStripeID(live)

	appliedProducts := desiredProductsByID(applied)
	for _, id := range sortedKeys(appliedProducts) {
		if id == "free" {
			continue
		}
		product := appliedProducts[id]
		liveProduct, ok := live.products[id]
		if !ok {
			out = append(out, statusEntry(statusKindProduct, id, product.Name, statusStateMissing, "", ""))
			continue
		}
		actual := Product{
			ID:          id,
			Name:        liveProduct.Name,
			Description: liveProduct.Description,
			Type:        string(liveProduct.Type),
		}
		reasons := driftReasons(productConfigHash(actual), liveProduct.Metadata[MetadataKeyHash], productConfigHash(product))
		if appliedDefault := defaultPriceConfigID(product); appliedDefault != "" {
			if liveDefaultPrice, ok := live.prices[appliedDefault]; ok && defaultPriceID(liveProduct) != liveDefaultPrice.ID {
				reasons = joinReasons(reasons, statusReasonDefaultPrice)
			}
		}
		if reasons != "" {
			out = append(out, statusEntry(statusKindProduct, id, product.Name, statusStateModified, reasons, liveProduct.ID))
		}
	}

	appliedPrices := desiredPricesByID(applied)
	for _, id := range sortedKeys(appliedPrices) {
		if id == "free" {
			continue
		}
		price := appliedPrices[id]
		livePrice, ok := live.prices[id]
		if !ok {
			out = append(out, statusEntry(statusKindPrice, id, "", statusStateMissing, "", ""))
			continue
		}
		actual := convertStripePriceToConfig(livePrice, meterConfigIDs)
		actual.ID = id
		reasons := driftReasons(priceConfigHash(actual), livePrice.Metadata[MetadataKeyHash], priceConfigHash(price))
		if livePrice.LookupKey != id {
			reasons = joinReasons(reasons, statusReasonLookupKey)
		}
		if reasons != "" {
			out = append(out, statusEntry(statusKindPrice, id, "", statusStateModified, reasons, livePrice.ID))
		}
	}

	appliedCoupons := desiredCouponsByID(applied)
	for _, id := range sortedKeys(appliedCoupons) {
		coupon := appliedCoupons[id]
		liveCoupon, ok := live.coupons[id]
		if !ok {
			out = append(out, statusEntry(statusKindCoupon, id, coupon.Name, statusStateMissing, "", ""))
			continue
		}
		actual := convertStripeCouponToConfig(liveCoupon)
		actual.ID = id
		for i, stripeProductID := range actual.AppliesTo {
			if configID, ok := productConfigIDs[stripeProductID]; ok {
				actual.AppliesTo[i] = configID
			}
		}
		reasons := driftReasons(couponConfigHash(actual), liveCoupon.Metadata[MetadataKeyHash], couponConfigHash(coupon))
		if reasons != "" {
			out = append(out, statusEntry(statusKindCoupon, id, coupon.Name, statusStateModified, reasons, liveCoupon.ID))
		}
	}

	couponsForPromos := make([]Coupon, 0, len(live.coupons))
	for id, liveCoupon := range live.coupons {
		coupon := convertStripeCouponToConfig(liveCoupon)
		coupon.ID = id
		coupon.StripeID = liveCoupon.ID
		couponsForPromos = append(couponsForPromos, coupon)
	}
	appliedPromos := desiredPromosByID(applied)
	for _, id := range sortedKeys(appliedPromos) {
		promo := appliedPromos[id]
		livePromo, ok := live.promos[id]
		if !ok {
			out = append(out, statusEntry(statusKindPromotionCode, id, promo.Code, statusStateMissing, "", ""))
			continue
		}
		actual := convertStripePromoCodeToConfig(livePromo, couponsForPromos)
		actual.ID = id
		reasons := driftReasons(promoConfigHash(actual), livePromo.Metadata[MetadataKeyHash], promoConfigHash(promo))
		if reasons != "" {
			out = append(out, statusEntry(statusKindPromotionCode, id, promo.Code, statusStateModified, reasons, livePromo.ID))
		}
	}

	appliedMeters := desiredMetersByEventName(applied)
	for _, eventName := range sortedKeys(appliedMeters) {
		meter := appliedMeters[eventName]
		liveMeter, ok := live.meters[eventName]
		if !ok {
			out = append(out, statusEntry(statusKindMeter, meterID(meter), meter.DisplayName, statusStateMissing, "", ""))
			continue
		}
		if meterFieldsChanged(meter, convertStripeMeterToConfig(liveMeter)) {
			out = append(out, statusEntry(statusKindMeter, meterID(meter), meter.DisplayName, statusStateModified, statusReasonExternalEdit, liveMeter.ID))
		}
	}

	appliedWebhooks := webhooksByURL(applied)
	for _, url := range sortedKeys(appliedWebhooks) {
		webhook := appliedWebhooks[url]
		liveWebhook, ok := actualWebhooks[url]
		if !ok {
			out = append(out, statusEntry(statusKindWebhook, url, url, statusStateMissing, "", ""))
			continue
		}
		if reasons := webhookDriftReasons(webhook, liveWebhook, checkWebhookHash); reasons != "" {
			out = append(out, statusEntry(statusKindWebhook, url, url, statusStateModified, reasons, liveWebhook.ID))
		}
	}

	return out
}

func untrackedStatus(desired, applied *StripeConfiguration, live *liveState, actualWebhooks map[string]StripeWebhookInfo) []ConfigStatusEntry {
	out := make([]ConfigStatusEntry, 0)
	desiredProducts := desiredProductsByID(desired)
	appliedProducts := desiredProductsByID(applied)
	for _, id := range sortedKeys(live.products) {
		if id == "free" {
			continue
		}
		if _, ok := desiredProducts[id]; ok {
			continue
		}
		if _, ok := appliedProducts[id]; ok {
			continue
		}
		product := live.products[id]
		out = append(out, statusEntry(statusKindProduct, id, product.Name, statusStateUntracked, "", product.ID))
	}

	desiredPrices := desiredPricesByID(desired)
	appliedPrices := desiredPricesByID(applied)
	for _, id := range sortedKeys(live.prices) {
		if id == "free" {
			continue
		}
		if _, ok := desiredPrices[id]; ok {
			continue
		}
		if _, ok := appliedPrices[id]; ok {
			continue
		}
		price := live.prices[id]
		out = append(out, statusEntry(statusKindPrice, id, "", statusStateUntracked, "", price.ID))
	}

	desiredCoupons := desiredCouponsByID(desired)
	appliedCoupons := desiredCouponsByID(applied)
	for _, id := range sortedKeys(live.coupons) {
		if _, ok := desiredCoupons[id]; ok {
			continue
		}
		if _, ok := appliedCoupons[id]; ok {
			continue
		}
		coupon := live.coupons[id]
		out = append(out, statusEntry(statusKindCoupon, id, coupon.Name, statusStateUntracked, "", coupon.ID))
	}

	desiredPromos := desiredPromosByID(desired)
	appliedPromos := desiredPromosByID(applied)
	for _, id := range sortedKeys(live.promos) {
		if _, ok := desiredPromos[id]; ok {
			continue
		}
		if _, ok := appliedPromos[id]; ok {
			continue
		}
		promo := live.promos[id]
		out = append(out, statusEntry(statusKindPromotionCode, id, promo.Code, statusStateUntracked, "", promo.ID))
	}

	desiredMeters := desiredMetersByEventName(desired)
	appliedMeters := desiredMetersByEventName(applied)
	for _, eventName := range sortedKeys(live.meters) {
		if _, ok := desiredMeters[eventName]; ok {
			continue
		}
		if _, ok := appliedMeters[eventName]; ok {
			continue
		}
		meter := live.meters[eventName]
		out = append(out, statusEntry(statusKindMeter, eventName, meter.DisplayName, statusStateUntracked, "", meter.ID))
	}

	desiredWebhooks := webhooksByURL(desired)
	appliedWebhooks := webhooksByURL(applied)
	for _, url := range sortedKeys(actualWebhooks) {
		webhook := actualWebhooks[url]
		if !isManagedMetadata(webhook.Metadata) {
			continue
		}
		if _, ok := desiredWebhooks[url]; ok {
			continue
		}
		if _, ok := appliedWebhooks[url]; ok {
			continue
		}
		out = append(out, statusEntry(statusKindWebhook, url, url, statusStateUntracked, "", webhook.ID))
	}

	return out
}

func statusEntry(kind, id, name, state, reason, stripeID string) ConfigStatusEntry {
	return ConfigStatusEntry{
		Kind:     kind,
		ID:       id,
		Name:     name,
		State:    state,
		Reason:   reason,
		StripeID: stripeID,
	}
}

func sortStatusEntries(entries []ConfigStatusEntry) {
	sort.Slice(entries, func(i, j int) bool {
		if entries[i].Kind != entries[j].Kind {
			return entries[i].Kind < entries[j].Kind
		}
		if entries[i].ID != entries[j].ID {
			return entries[i].ID < entries[j].ID
		}
		return entries[i].State < entries[j].State
	})
}

func driftReasons(actualHash, metadataHash, appliedHash string) string {
	reasons := ""
	if metadataHash == "" {
		reasons = joinReasons(reasons, statusReasonMissingHash)
	} else if actualHash != metadataHash {
		reasons = joinReasons(reasons, statusReasonExternalEdit)
	}
	if appliedHash != metadataHash {
		reasons = joinReasons(reasons, statusReasonApplyMismatch)
	}
	return reasons
}

func joinReasons(existing, reason string) string {
	if existing == "" {
		return reason
	}
	return existing + "," + reason
}

func meterID(meter Meter) string {
	if meter.ID != "" {
		return meter.ID
	}
	return meter.EventName
}

func webhooksByURL(config *StripeConfiguration) map[string]WebhookEndpointConfig {
	out := make(map[string]WebhookEndpointConfig, len(config.Webhooks))
	for _, webhook := range config.Webhooks {
		out[webhook.URL] = webhook
	}
	return out
}

func webhookDriftReasons(webhook WebhookEndpointConfig, live StripeWebhookInfo, checkHash bool) string {
	reasons := ""
	if webhook.Connect != live.Connect || !stringSlicesEqual(webhook.Events, live.Events) {
		reasons = joinReasons(reasons, statusReasonExternalEdit)
	}
	if checkHash {
		if live.Metadata[MetadataKeyHash] != webhookConfigHash(webhook) {
			reasons = joinReasons(reasons, statusReasonApplyMismatch)
		}
		if live.Status != "" && live.Status != "enabled" {
			reasons = joinReasons(reasons, statusReasonDisabled)
		}
	}
	return reasons
}

func stringSlicesEqual(left, right []string) bool {
	leftSorted := sortedCopy(left)
	rightSorted := sortedCopy(right)
	if len(leftSorted) != len(rightSorted) {
		return false
	}
	for i := range leftSorted {
		if leftSorted[i] != rightSorted[i] {
			return false
		}
	}
	return true
}

func productConfigIDsByStripeID(live *liveState) map[string]string {
	out := make(map[string]string, len(live.products))
	for configID, product := range live.products {
		out[product.ID] = configID
	}
	return out
}

func defaultPriceConfigID(product Product) string {
	for _, price := range product.Prices {
		if price.Default && price.ID != "free" {
			return price.ID
		}
	}
	return ""
}

func mergeStatusEntry(entries []ConfigStatusEntry, entry ConfigStatusEntry) []ConfigStatusEntry {
	for i := range entries {
		if entries[i].Kind == entry.Kind && entries[i].ID == entry.ID && entries[i].State == entry.State {
			entries[i].Reason = joinReasons(entries[i].Reason, entry.Reason)
			return entries
		}
	}
	return append(entries, entry)
}

func meterConfigIDsByStripeID(live *liveState, applied *StripeConfiguration) map[string]string {
	out := make(map[string]string, len(live.meters))
	appliedMeters := desiredMetersByEventName(applied)
	for eventName, liveMeter := range live.meters {
		meter, ok := appliedMeters[eventName]
		if !ok || meter.ID == "" {
			continue
		}
		out[liveMeter.ID] = meter.ID
	}
	return out
}
