package stripe_config

import (
	"context"
	"time"

	"github.com/stripe/stripe-go/v82"
)

const stripeIdentityCacheTTL = 30 * time.Second

type identityCache struct {
	products            map[string]string
	prices              map[string]string
	coupons             map[string]string
	promos              map[string]string
	meterIDsByEventName map[string]string
	expiresAt           time.Time
}

type StripeIdentity struct {
	Products map[string]string
	Prices   map[string]string
	Coupons  map[string]string
	Promos   map[string]string
	Meters   map[string]string
}

func (s *Service) LoadStripeIdentity(ctx context.Context, config *StripeConfiguration) (*StripeIdentity, error) {
	cached, err := s.loadCachedIdentity(ctx)
	if err != nil {
		return nil, err
	}
	return buildStripeIdentity(cached, config), nil
}

func (s *Service) loadCachedIdentity(ctx context.Context) (*identityCache, error) {
	s.identityMu.Lock()
	if s.identityCache != nil && time.Now().Before(s.identityCache.expiresAt) {
		cached := s.identityCache
		s.identityMu.Unlock()
		return cached, nil
	}
	s.identityMu.Unlock()

	products, err := s.listManagedProducts(ctx)
	if err != nil {
		return nil, err
	}
	productIDs := make(map[string]string, len(products))
	for configID, product := range products {
		productIDs[configID] = product.ID
	}

	prices, err := s.listManagedPrices(ctx)
	if err != nil {
		return nil, err
	}
	priceIDs := make(map[string]string, len(prices))
	for configID, price := range prices {
		priceIDs[configID] = price.ID
	}

	coupons, err := s.listManagedCoupons(ctx)
	if err != nil {
		return nil, err
	}
	couponIDs := make(map[string]string, len(coupons))
	for configID, coupon := range coupons {
		couponIDs[configID] = coupon.ID
	}

	promos, err := s.listManagedPromotionCodes(ctx)
	if err != nil {
		return nil, err
	}
	promoIDs := make(map[string]string, len(promos))
	for configID, promo := range promos {
		promoIDs[configID] = promo.ID
	}

	meters, err := s.listActiveMetersByEventName(ctx)
	if err != nil {
		return nil, err
	}
	meterIDsByEventName := make(map[string]string, len(meters))
	for eventName, meter := range meters {
		meterIDsByEventName[eventName] = meter.ID
	}

	cached := &identityCache{
		products:            productIDs,
		prices:              priceIDs,
		coupons:             couponIDs,
		promos:              promoIDs,
		meterIDsByEventName: meterIDsByEventName,
		expiresAt:           time.Now().Add(stripeIdentityCacheTTL),
	}

	s.identityMu.Lock()
	s.identityCache = cached
	s.identityMu.Unlock()
	return cached, nil
}

func (s *Service) invalidateIdentityCache() {
	s.identityMu.Lock()
	s.identityCache = nil
	s.identityMu.Unlock()
}

func buildStripeIdentity(cached *identityCache, config *StripeConfiguration) *StripeIdentity {
	identity := &StripeIdentity{
		Products: cached.products,
		Prices:   cached.prices,
		Coupons:  cached.coupons,
		Promos:   cached.promos,
		Meters:   make(map[string]string),
	}
	if config == nil {
		return identity
	}
	for _, meter := range config.Meters {
		if stripeID := cached.meterIDsByEventName[meter.EventName]; stripeID != "" {
			identity.Meters[meter.ID] = stripeID
		}
	}
	return identity
}

func PriceConfigID(price *stripe.Price) string {
	if price == nil {
		return ""
	}
	if configID := price.Metadata[MetadataKeyConfigID]; configID != "" {
		return configID
	}
	return price.LookupKey
}

func IsLegacyPrice(price *stripe.Price) bool {
	if price == nil {
		return false
	}
	configID := price.Metadata[MetadataKeyConfigID]
	if configID == "" {
		return false
	}
	return price.LookupKey != configID || !price.Active
}
