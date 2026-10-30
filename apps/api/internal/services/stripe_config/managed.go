package stripe_config

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"sort"

	"api/internal/logger"
)

const (
	MetadataKeyConfigID = "omnibase_id"
	MetadataKeyManaged  = "omnibase_managed"
	MetadataKeyHash     = "omnibase_hash"

	MetadataManagedValue = "true"

	MaxMetadataKeys        = 50
	MaxMetadataKeyLength   = 40
	MaxMetadataValueLength = 500
	MaxLookupKeyLength     = 200
)

func managedMetadata(kind, configID, hash string, userMetadata map[string]string) map[string]string {
	out := make(map[string]string, len(userMetadata)+3)
	for k, v := range userMetadata {
		out[k] = v
	}
	if configID != "" {
		out[MetadataKeyConfigID] = configID
	}
	out[MetadataKeyManaged] = MetadataManagedValue
	if hash != "" {
		out[MetadataKeyHash] = hash
	}
	logger.Logger.Debug("stripe_config.managed_metadata",
		"resource", kind,
		"config_id", configID,
		"hash", hash,
		"keys", len(out),
	)
	return out
}

func isManagedMetadataKey(key string) bool {
	return key == MetadataKeyConfigID || key == MetadataKeyManaged || key == MetadataKeyHash
}

func stripManagedMetadata(metadata map[string]string) map[string]string {
	if len(metadata) == 0 {
		return nil
	}
	out := make(map[string]string, len(metadata))
	for k, v := range metadata {
		if isManagedMetadataKey(k) {
			continue
		}
		out[k] = v
	}
	return out
}

func productConfigHash(product Product) string {
	sanitized := product
	sanitized.StripeID = ""
	sanitized.UI = nil
	sanitized.Prices = nil
	if sanitized.Type == "" {
		sanitized.Type = "service"
	}
	return stableHash(sanitized)
}

func priceConfigHash(price Price) string {
	sanitized := price
	sanitized.StripeID = ""
	sanitized.UI = nil
	sanitized.Public = nil
	sanitized.Default = false
	sanitized.EnterpriseTemplate = ""
	sanitized.EnterpriseID = ""
	if sanitized.BillingScheme == "" {
		sanitized.BillingScheme = "per_unit"
	}
	if sanitized.BillingScheme != "tiered" {
		sanitized.TiersMode = ""
		sanitized.Tiers = nil
	}
	for i := range sanitized.Tiers {
		if sanitized.Tiers[i].FlatAmount != nil && *sanitized.Tiers[i].FlatAmount == 0 {
			sanitized.Tiers[i].FlatAmount = nil
		}
		if sanitized.Tiers[i].UnitAmount != nil && *sanitized.Tiers[i].UnitAmount == 0 {
			sanitized.Tiers[i].UnitAmount = nil
		}
	}
	if sanitized.Interval != "" {
		if sanitized.IntervalCount == 0 {
			sanitized.IntervalCount = 1
		}
		if sanitized.UsageType == "" {
			sanitized.UsageType = "licensed"
		}
	}
	return stableHash(sanitized)
}

func couponConfigHash(coupon Coupon) string {
	sanitized := coupon
	sanitized.StripeID = ""
	sanitized.Metadata = stripManagedMetadata(coupon.Metadata)
	if sanitized.PercentOff == nil {
		sanitized.PercentOff = float64Pointer(0)
	}
	if sanitized.AmountOff == nil {
		sanitized.AmountOff = int64Pointer(0)
	}
	if sanitized.DurationInMonths == nil {
		sanitized.DurationInMonths = int64Pointer(0)
	}
	if sanitized.MaxRedemptions == nil {
		sanitized.MaxRedemptions = int64Pointer(0)
	}
	if sanitized.RedeemBy == nil {
		sanitized.RedeemBy = int64Pointer(0)
	}
	if *sanitized.AmountOff == 0 {
		sanitized.Currency = ""
	}
	sanitized.AppliesTo = sortedCopy(sanitized.AppliesTo)
	return stableHash(sanitized)
}

func promoConfigHash(promo PromotionCode) string {
	sanitized := promo
	sanitized.StripeID = ""
	sanitized.Metadata = stripManagedMetadata(promo.Metadata)
	if sanitized.Active == nil {
		sanitized.Active = boolPointer(true)
	}
	if sanitized.FirstTimeTransaction == nil {
		sanitized.FirstTimeTransaction = boolPointer(false)
	}
	if sanitized.MaxRedemptions == nil {
		sanitized.MaxRedemptions = int64Pointer(0)
	}
	if sanitized.MinimumAmount == nil {
		sanitized.MinimumAmount = int64Pointer(0)
	}
	if *sanitized.MinimumAmount == 0 {
		sanitized.MinimumAmountCurrency = ""
	}
	if sanitized.ExpiresAt == nil {
		sanitized.ExpiresAt = int64Pointer(0)
	}
	return stableHash(sanitized)
}

func webhookConfigHash(webhook WebhookEndpointConfig) string {
	sanitized := webhook
	sanitized.Events = sortedCopy(webhook.Events)
	return stableHash(sanitized)
}

func sortedCopy(values []string) []string {
	if len(values) == 0 {
		return nil
	}
	out := append([]string{}, values...)
	sort.Strings(out)
	return out
}

func boolPointer(value bool) *bool {
	return &value
}

func int64Pointer(value int64) *int64 {
	return &value
}

func float64Pointer(value float64) *float64 {
	return &value
}

func stableHash(value any) string {
	encoded, err := json.Marshal(value)
	if err != nil {
		logger.Logger.Error("stripe_config.hash_encode_failed", "error", err, "value_type", value)
		return ""
	}
	sum := sha256.Sum256(encoded)
	return hex.EncodeToString(sum[:])
}
