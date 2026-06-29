package stripe_config

import (
	"database/sql/driver"
	"encoding/json"
)

// ConfigData is the raw JSON config blob (what handlers bind from request body).
type ConfigData map[string]any

func (s ConfigData) Value() (driver.Value, error) {
	if s == nil {
		return nil, nil
	}
	return json.Marshal(s)
}

func (s *ConfigData) Scan(value any) error {
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

// Configuration is the parsed config matching the JSON schema.
type Configuration struct {
	Version        string                  `json:"version" validate:"required"`
	Webhooks       []WebhookEndpointConfig `json:"webhooks,omitempty" validate:"dive"`
	Meters         []Meter                 `json:"meters,omitempty" validate:"dive"`
	Products       []Product               `json:"products" validate:"required,dive"`
	Coupons        []Coupon                `json:"coupons,omitempty" validate:"dive"`
	PromotionCodes []PromotionCode         `json:"promotion_codes,omitempty" validate:"dive"`
}

type WebhookEndpointConfig struct {
	ID      string   `json:"id,omitempty"`
	URL     string   `json:"url" validate:"required"`
	Events  []string `json:"events" validate:"required,min=1"`
	Connect bool     `json:"connect,omitempty"`
}

type Product struct {
	ID          string     `json:"id" validate:"required"`
	StripeID    string     `json:"stripe_id,omitempty"`
	Name        string     `json:"name" validate:"required"`
	Description string     `json:"description,omitempty"`
	Type        string     `json:"type,omitempty"`
	Prices      []Price    `json:"prices" validate:"required,dive"`
	UI          *ProductUI `json:"ui,omitempty"`
}

type Price struct {
	ID                 string   `json:"id" validate:"required"`
	StripeID           string   `json:"stripe_id,omitempty"`
	Public             *bool    `json:"public,omitempty"`
	TaxIncludedInPrice *bool    `json:"tax_included_in_price,omitempty"`
	Amount             float64  `json:"amount,omitempty" validate:"min=0"`
	Currency           string   `json:"currency" validate:"required,len=3"`
	Interval           string   `json:"interval,omitempty"`
	IntervalCount      int      `json:"interval_count,omitempty"`
	UsageType          string   `json:"usage_type,omitempty"`
	Meter              string   `json:"meter,omitempty"`
	BillingScheme      string   `json:"billing_scheme,omitempty"`
	TiersMode          string   `json:"tiers_mode,omitempty"`
	Tiers              []Tier   `json:"tiers,omitempty"`
	Default            bool     `json:"default,omitempty"`
	EnterpriseTemplate string   `json:"enterprise_template,omitempty"`
	EnterpriseID       string   `json:"enterprise_id,omitempty"`
	UI                 *PriceUI `json:"ui,omitempty"`
}

type PriceWithStripeID struct {
	Price
	StripeID *string `json:"stripe_id,omitempty"`
}

type ProductWithStripeIDs struct {
	ID          string              `json:"id" validate:"required"`
	Name        string              `json:"name" validate:"required"`
	Description string              `json:"description,omitempty"`
	Type        string              `json:"type,omitempty"`
	Prices      []PriceWithStripeID `json:"prices" validate:"required,dive"`
	UI          *ProductUI          `json:"ui,omitempty"`
	StripeID    *string             `json:"stripe_id,omitempty"`
}

type ConfigurationWithIDs struct {
	Version        string                      `json:"version" validate:"required"`
	Meters         []MeterWithStripeID         `json:"meters,omitempty" validate:"dive"`
	Products       []ProductWithStripeIDs      `json:"products" validate:"required,dive"`
	Coupons        []CouponWithStripeID        `json:"coupons,omitempty" validate:"dive"`
	PromotionCodes []PromotionCodeWithStripeID `json:"promotion_codes,omitempty" validate:"dive"`
}

type Tier struct {
	UpTo       any    `json:"up_to"`
	FlatAmount *int64 `json:"flat_amount,omitempty"`
	UnitAmount *int64 `json:"unit_amount,omitempty"`
}

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

type Meter struct {
	ID                 string                  `json:"id" validate:"required"`
	StripeID           string                  `json:"stripe_id,omitempty"`
	DisplayName        string                  `json:"display_name" validate:"required"`
	EventName          string                  `json:"event_name" validate:"required"`
	DefaultAggregation MeterDefaultAggregation `json:"default_aggregation" validate:"required"`
	CustomerMapping    *MeterCustomerMapping   `json:"customer_mapping,omitempty"`
	ValueSettings      *MeterValueSettings     `json:"value_settings,omitempty"`
}

type MeterWithStripeID struct {
	Meter
	StripeID *string `json:"stripe_id,omitempty"`
}

type MeterDefaultAggregation struct {
	Formula string `json:"formula" validate:"required,oneof=sum count last"`
}

type MeterCustomerMapping struct {
	EventPayloadKey string `json:"event_payload_key" validate:"required"`
	Type            string `json:"type" validate:"required,oneof=by_id"`
}

type MeterValueSettings struct {
	EventPayloadKey string `json:"event_payload_key" validate:"required"`
}

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

type CouponWithStripeID struct {
	Coupon
	StripeID *string `json:"stripe_id,omitempty"`
}

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

type PromotionCodeWithStripeID struct {
	PromotionCode
	StripeID *string `json:"stripe_id,omitempty"`
}

// Response shapes returned by Sync().

type ConfigResponse struct {
	Message string         `json:"message"`
	Changes *ConfigChanges `json:"changes,omitempty"`
	Config  *Configuration `json:"config,omitempty"`
	Errors  []string       `json:"errors,omitempty"`
}

type ConfigChanges struct {
	Products       *ProductChanges       `json:"products,omitempty"`
	Prices         *PriceChanges         `json:"prices,omitempty"`
	Meters         *MeterChanges         `json:"meters,omitempty"`
	Webhooks       *WebhookChanges       `json:"webhooks,omitempty"`
	Coupons        *CouponChanges        `json:"coupons,omitempty"`
	PromotionCodes *PromotionCodeChanges `json:"promotion_codes,omitempty"`
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
	StripeID    string   `json:"stripe_id,omitempty"`
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

// Diff types used by Differ.

type ConfigDiff struct {
	NewProducts           []Product
	UpdatedProducts       []ProductUpdate
	ArchivedProducts      []string
	NewMeters             []Meter
	ArchivedMeters        []string
	NewCoupons            []Coupon
	UpdatedCoupons        []CouponUpdate
	ArchivedCoupons       []string
	NewPromotionCodes     []PromotionCode
	UpdatedPromotionCodes []PromoCodeUpdate
	DeactivatedPromoCodes []string
}

type ProductUpdate struct {
	ID               string
	FieldChanges     map[string]any
	NewPrices        []Price
	UpdatedPrices    []Price
	ArchivedPrices   []string
	RequiresRecreate bool
}

type CouponUpdate struct {
	ID           string
	FieldChanges map[string]any
}

type PromoCodeUpdate struct {
	ID           string
	FieldChanges map[string]any
}
