package stripe_config

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"

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
	return stableHash(sanitized)
}

func couponConfigHash(coupon Coupon) string {
	sanitized := coupon
	sanitized.StripeID = ""
	sanitized.Metadata = stripManagedMetadata(coupon.Metadata)
	return stableHash(sanitized)
}

func promoConfigHash(promo PromotionCode) string {
	sanitized := promo
	sanitized.StripeID = ""
	sanitized.Metadata = stripManagedMetadata(promo.Metadata)
	return stableHash(sanitized)
}

func webhookConfigHash(webhook WebhookEndpointConfig) string {
	sanitized := webhook
	return stableHash(sanitized)
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
