package models

import (
	"database/sql/driver"
	"encoding/json"
)

// StripeConfigData represents the raw JSON configuration data
type StripeConfigData map[string]interface{}

func (s StripeConfigData) Value() (driver.Value, error) {
	if s == nil {
		return nil, nil
	}
	return json.Marshal(s)
}

func (s *StripeConfigData) Scan(value interface{}) error {
	if value == nil {
		*s = nil
		return nil
	}

	bytes, ok := value.([]byte)
	if !ok {
		return nil
	}

	return json.Unmarshal(bytes, s)
}

// Parsed configuration structs that match the JSON schema

type StripeConfiguration struct {
	Version        string                  `json:"version" validate:"required"`
	Webhooks       []WebhookEndpointConfig `json:"webhooks,omitempty" validate:"dive"`
	Meters         []Meter                 `json:"meters,omitempty" validate:"dive"`
	Products       []Product               `json:"products" validate:"required,dive"`
	Coupons        []Coupon                `json:"coupons,omitempty" validate:"dive"`
	PromotionCodes []PromotionCode         `json:"promotion_codes,omitempty" validate:"dive"`
}

// WebhookEndpointConfig represents a single webhook endpoint configuration from the config file
type WebhookEndpointConfig struct {
	ID      string   `json:"id,omitempty"`
	URL     string   `json:"url" validate:"required"`
	Events  []string `json:"events" validate:"required,min=1"`
	Connect bool     `json:"connect,omitempty"`
}

type Product struct {
	ID          string     `json:"id" validate:"required"`
	StripeID    string     `json:"stripe_id,omitempty"` // Original Stripe ID for migration support
	Name        string     `json:"name" validate:"required"`
	Description string     `json:"description,omitempty"`
	Type        string     `json:"type,omitempty"` // service, good
	Prices      []Price    `json:"prices" validate:"required,dive"`
	UI          *ProductUI `json:"ui,omitempty"`
}

type Price struct {
	ID                 string   `json:"id" validate:"required"`
	StripeID           string   `json:"stripe_id,omitempty"`             // Original Stripe ID for migration support
	Public             *bool    `json:"public,omitempty"`                // nil = true (default), false = hidden from public API
	TaxIncludedInPrice *bool    `json:"tax_included_in_price,omitempty"` // nil = false (default)
	Amount             float64  `json:"amount,omitempty" validate:"min=0"`
	Currency           string   `json:"currency" validate:"required,len=3"`
	Interval           string   `json:"interval,omitempty"`       // month, year, week, day
	IntervalCount      int      `json:"interval_count,omitempty"` // default 1
	UsageType          string   `json:"usage_type,omitempty"`     // licensed, metered
	Meter              string   `json:"meter,omitempty"`          // meter ID for metered pricing
	BillingScheme      string   `json:"billing_scheme,omitempty"` // per_unit, tiered
	TiersMode          string   `json:"tiers_mode,omitempty"`     // graduated, volume (required when billing_scheme is tiered)
	Tiers              []Tier   `json:"tiers,omitempty"`
	Default            bool     `json:"default,omitempty"`             // mark as default price for the product
	EnterpriseTemplate string   `json:"enterprise_template,omitempty"` // enterprise template group (e.g., "tier1_10pct_off")
	EnterpriseID       string   `json:"enterprise_id,omitempty"`       // enterprise pricing group ID (e.g., "acme_corp")
	UI                 *PriceUI `json:"ui,omitempty"`
}

// PriceWithStripeID extends Price to include the actual Stripe ID for API responses
type PriceWithStripeID struct {
	Price
	StripeID *string `json:"stripe_id,omitempty"` // actual Stripe price ID (null for free prices)
}

// ProductWithStripeIDs extends Product to include Stripe IDs for API responses
type ProductWithStripeIDs struct {
	ID          string              `json:"id" validate:"required"`
	Name        string              `json:"name" validate:"required"`
	Description string              `json:"description,omitempty"`
	Type        string              `json:"type,omitempty"` // service, good, metered
	Prices      []PriceWithStripeID `json:"prices" validate:"required,dive"`
	UI          *ProductUI          `json:"ui,omitempty"`
	StripeID    *string             `json:"stripe_id,omitempty"` // actual Stripe product ID (null for free products)
}

// StripeConfigurationWithIDs extends StripeConfiguration to include Stripe IDs
type StripeConfigurationWithIDs struct {
	Version        string                      `json:"version" validate:"required"`
	Meters         []MeterWithStripeID         `json:"meters,omitempty" validate:"dive"`
	Products       []ProductWithStripeIDs      `json:"products" validate:"required,dive"`
	Coupons        []CouponWithStripeID        `json:"coupons,omitempty" validate:"dive"`
	PromotionCodes []PromotionCodeWithStripeID `json:"promotion_codes,omitempty" validate:"dive"`
}

type Tier struct {
	UpTo       interface{} `json:"up_to"` // integer or "inf"
	FlatAmount *int64      `json:"flat_amount,omitempty"`
	UnitAmount *int64      `json:"unit_amount,omitempty"`
}

// UI configuration structures

type ProductUI struct {
	DisplayName string   `json:"display_name,omitempty"`
	Tagline     string   `json:"tagline,omitempty"`
	Features    []string `json:"features,omitempty"`
	Badge       string   `json:"badge,omitempty"`
	CTAText     string   `json:"cta_text,omitempty"`
	Highlighted bool     `json:"highlighted,omitempty"`
	SortOrder   int      `json:"sort_order,omitempty"`
}

type PriceUI struct {
	DisplayName   string        `json:"display_name,omitempty"`
	PriceDisplay  *PriceDisplay `json:"price_display,omitempty"`
	BillingPeriod string        `json:"billing_period,omitempty"`
	Features      []string      `json:"features,omitempty"`
	Limits        []PriceLimit  `json:"limits,omitempty"`
}

type PriceDisplay struct {
	CustomText   string `json:"custom_text,omitempty"`
	ShowCurrency *bool  `json:"show_currency,omitempty"`
	Suffix       string `json:"suffix,omitempty"`
}

type PriceLimit struct {
	Text  string   `json:"text"`
	Value *float64 `json:"value,omitempty"`
	Unit  string   `json:"unit,omitempty"`
}

// Response structures
type StripeConfigResponse struct {
	Message string               `json:"message"`
	Changes *StripeConfigChanges `json:"changes,omitempty"`
	Config  *StripeConfiguration `json:"config,omitempty"`
	Errors  []string             `json:"errors,omitempty"`
}

type StripeConfigChanges struct {
	Products       *ProductChanges        `json:"products,omitempty"`
	Prices         *PriceChanges          `json:"prices,omitempty"`
	Meters         *MeterChanges          `json:"meters,omitempty"`
	Webhooks       *WebhookChanges        `json:"webhooks,omitempty"`
	Coupons        *CouponChanges         `json:"coupons,omitempty"`
	PromotionCodes *PromotionCodeChanges  `json:"promotion_codes,omitempty"`
}

type MeterChanges struct {
	Created  []MeterChange `json:"created,omitempty"`
	Updated  []MeterChange `json:"updated,omitempty"`
	Archived []MeterChange `json:"archived,omitempty"`
}

type MeterChange struct {
	MeterID     string `json:"meter_id"`
	DisplayName string `json:"display_name"`
	Action      string `json:"action"`
	StripeID    string `json:"stripe_id,omitempty"`
}

type WebhookChanges struct {
	Created   []WebhookChange `json:"created,omitempty"`
	Updated   []WebhookChange `json:"updated,omitempty"`
	Unchanged []WebhookChange `json:"unchanged,omitempty"`
}

type WebhookChange struct {
	WebhookID string `json:"webhook_id,omitempty"`
	URL       string `json:"url"`
	Action    string `json:"action"`
	StripeID  string `json:"stripe_id,omitempty"`
}

type CouponChanges struct {
	Created  []CouponChange `json:"created,omitempty"`
	Updated  []CouponChange `json:"updated,omitempty"`
	Archived []CouponChange `json:"archived,omitempty"`
}

type CouponChange struct {
	CouponID string `json:"coupon_id"`
	Name     string `json:"name"`
	Action   string `json:"action"`
	StripeID string `json:"stripe_id,omitempty"`
}

type PromotionCodeChanges struct {
	Created     []PromotionCodeChange `json:"created,omitempty"`
	Updated     []PromotionCodeChange `json:"updated,omitempty"`
	Deactivated []PromotionCodeChange `json:"deactivated,omitempty"`
}

type PromotionCodeChange struct {
	PromoID  string `json:"promo_id"`
	Code     string `json:"code"`
	Action   string `json:"action"`
	StripeID string `json:"stripe_id,omitempty"`
}

type ProductChanges struct {
	Created  []ProductChange `json:"created,omitempty"`
	Updated  []ProductChange `json:"updated,omitempty"`
	Archived []ProductChange `json:"archived,omitempty"`
}

type ProductChange struct {
	ProductID   string   `json:"product_id"`
	ProductName string   `json:"product_name"`
	Action      string   `json:"action"`
	Details     []string `json:"details,omitempty"`
}

type PriceChanges struct {
	Created  []PriceChange `json:"created,omitempty"`
	Updated  []PriceChange `json:"updated,omitempty"`
	Archived []PriceChange `json:"archived,omitempty"`
}

type PriceChange struct {
	PriceID   string `json:"price_id"`
	ProductID string `json:"product_id"`
	Action    string `json:"action"`
	StripeID  string `json:"stripe_id,omitempty"`
}

// Diff detection structures

type ConfigDiff struct {
	NewProducts            []Product
	UpdatedProducts        []ProductUpdate
	ArchivedProducts       []string
	NewMeters              []Meter
	ArchivedMeters         []string
	NewCoupons             []Coupon
	UpdatedCoupons         []CouponUpdate
	ArchivedCoupons        []string
	NewPromotionCodes      []PromotionCode
	UpdatedPromotionCodes  []PromoCodeUpdate
	DeactivatedPromoCodes  []string
}

type ProductUpdate struct {
	ID               string
	FieldChanges     map[string]interface{}
	NewPrices        []Price
	UpdatedPrices    []Price
	ArchivedPrices   []string
	RequiresRecreate bool
}

type CouponUpdate struct {
	ID           string
	FieldChanges map[string]interface{}
}

type PromoCodeUpdate struct {
	ID           string
	FieldChanges map[string]interface{}
}

// Meter represents a billing meter configuration
type Meter struct {
	ID                 string                  `json:"id" validate:"required"`
	StripeID           string                  `json:"stripe_id,omitempty"` // Original Stripe ID for migration support
	DisplayName        string                  `json:"display_name" validate:"required"`
	EventName          string                  `json:"event_name" validate:"required"`
	DefaultAggregation MeterDefaultAggregation `json:"default_aggregation" validate:"required"`
	CustomerMapping    *MeterCustomerMapping   `json:"customer_mapping,omitempty"`
	ValueSettings      *MeterValueSettings     `json:"value_settings,omitempty"`
}

// MeterWithStripeID extends Meter to include the actual Stripe ID for API responses
type MeterWithStripeID struct {
	Meter
	StripeID *string `json:"stripe_id,omitempty"` // actual Stripe meter ID
}

// MeterDefaultAggregation defines how usage events are aggregated
type MeterDefaultAggregation struct {
	Formula string `json:"formula" validate:"required,oneof=sum count last"`
}

// MeterCustomerMapping defines how to identify customers in events (optional, has defaults)
type MeterCustomerMapping struct {
	EventPayloadKey string `json:"event_payload_key" validate:"required"`
	Type            string `json:"type" validate:"required,oneof=by_id"`
}

// MeterValueSettings defines how to extract usage values from events (optional, has defaults)
type MeterValueSettings struct {
	EventPayloadKey string `json:"event_payload_key" validate:"required"`
}

// Coupon represents a discount that can be applied to subscriptions
type Coupon struct {
	ID               string            `json:"id" validate:"required"`
	StripeID         string            `json:"stripe_id,omitempty"`
	Name             string            `json:"name,omitempty"`
	PercentOff       *float64          `json:"percent_off,omitempty" validate:"omitempty,gte=0,lte=100"`
	AmountOff        *int64            `json:"amount_off,omitempty" validate:"omitempty,gt=0"`
	Currency         string            `json:"currency,omitempty"`
	Duration         string            `json:"duration" validate:"required,oneof=once repeating forever"`
	DurationInMonths *int64            `json:"duration_in_months,omitempty"`
	MaxRedemptions   *int64            `json:"max_redemptions,omitempty"`
	RedeemBy         *int64            `json:"redeem_by,omitempty"`
	AppliesTo        []string          `json:"applies_to,omitempty"`
	Metadata         map[string]string `json:"metadata,omitempty"`
}

// CouponWithStripeID extends Coupon to include the actual Stripe ID for API responses
type CouponWithStripeID struct {
	Coupon
	StripeID *string `json:"stripe_id,omitempty"`
}

// PromotionCode represents a customer-facing code that applies a coupon
type PromotionCode struct {
	ID                    string            `json:"id" validate:"required"`
	StripeID              string            `json:"stripe_id,omitempty"`
	Code                  string            `json:"code" validate:"required"`
	Coupon                string            `json:"coupon" validate:"required"`
	Active                *bool             `json:"active,omitempty"`
	MaxRedemptions        *int64            `json:"max_redemptions,omitempty"`
	FirstTimeTransaction  *bool             `json:"first_time_transaction,omitempty"`
	MinimumAmount         *int64            `json:"minimum_amount,omitempty"`
	MinimumAmountCurrency string            `json:"minimum_amount_currency,omitempty"`
	ExpiresAt             *int64            `json:"expires_at,omitempty"`
	Metadata              map[string]string `json:"metadata,omitempty"`
}

// PromotionCodeWithStripeID extends PromotionCode to include the actual Stripe ID for API responses
type PromotionCodeWithStripeID struct {
	PromotionCode
	StripeID *string `json:"stripe_id,omitempty"`
}

// SubscriptionResponse represents an active subscription for a tenant
type SubscriptionResponse struct {
	SubscriptionID     string `json:"subscription_id" binding:"required"`
	ConfigPriceID      string `json:"config_price_id" binding:"required"`
	Status             string `json:"status" binding:"required"`
	IsLegacyPrice      bool   `json:"is_legacy_price" binding:"required"`
	CurrentPeriodStart int64  `json:"current_period_start" binding:"required"`
	CurrentPeriodEnd   int64  `json:"current_period_end" binding:"required"`
	CancelAtPeriodEnd  bool   `json:"cancel_at_period_end" binding:"required"`
	CanceledAt         *int64 `json:"canceled_at,omitempty"`
	TrialStart         *int64 `json:"trial_start,omitempty"`
	TrialEnd           *int64 `json:"trial_end,omitempty"`
}

// BillingStatusResponse represents the billing status of a tenant
type BillingStatusResponse struct {
	IsActive bool `json:"is_active" binding:"required"`
}
