package models

import (
	"database/sql/driver"
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
	"gorm.io/gorm"
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

// StripeConfig represents a stored stripe configuration
type StripeConfig struct {
	ID        uuid.UUID        `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()" binding:"required"`
	Config    StripeConfigData `json:"config" gorm:"type:jsonb;not null" binding:"required"`
	Version   string           `json:"version" gorm:"not null" binding:"required"`
	CreatedAt time.Time        `json:"created_at" binding:"required"`
	UpdatedAt time.Time        `json:"updated_at" binding:"required"`
}

func (StripeConfig) TableName() string {
	return "stripe.stripe_configs"
}

// StripeWebhook represents a stored webhook endpoint configuration
type StripeWebhook struct {
	ID        uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()" binding:"required"`
	StripeID  string         `json:"stripe_id" gorm:"not null;uniqueIndex" binding:"required"` // Stripe webhook endpoint ID (we_xxx)
	URL       string         `json:"url" gorm:"not null" binding:"required"`
	Secret    string         `json:"secret" gorm:"not null" binding:"required"` // Webhook signing secret (whsec_xxx)
	Events    pq.StringArray `json:"events" gorm:"type:text[];not null;default:'{}'" binding:"required"`
	Connect   bool           `json:"connect" gorm:"not null;default:false"` // If true, listens to connected account events
	ConfigID  *uuid.UUID     `json:"config_id,omitempty" gorm:"type:uuid;index"` // Optional link to StripeConfig
	CreatedAt time.Time      `json:"created_at" binding:"required"`
	UpdatedAt time.Time      `json:"updated_at" binding:"required"`
}

func (StripeWebhook) TableName() string {
	return "stripe.stripe_webhooks"
}

func (s *StripeWebhook) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return nil
}

// Parsed configuration structs that match the JSON schema

type StripeConfiguration struct {
	Version  string                  `json:"version" validate:"required"`
	Webhooks []WebhookEndpointConfig `json:"webhooks,omitempty" validate:"dive"`
	Meters   []Meter                 `json:"meters,omitempty" validate:"dive"`
	Products []Product               `json:"products" validate:"required,dive"`
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
	Type        string     `json:"type,omitempty"` // service, good, metered
	Prices      []Price    `json:"prices" validate:"required,dive"`
	UI          *ProductUI `json:"ui,omitempty"`
}

type Price struct {
	ID                 string   `json:"id" validate:"required"`
	StripeID           string   `json:"stripe_id,omitempty"`             // Original Stripe ID for migration support
	Public             *bool    `json:"public,omitempty"`                // nil = true (default), false = hidden from public API
	TaxIncludedInPrice *bool    `json:"tax_included_in_price,omitempty"` // nil = false (default)
	Amount             int64    `json:"amount,omitempty" validate:"min=0"`
	Currency           string   `json:"currency" validate:"required,len=3"`
	Interval           string   `json:"interval,omitempty"`       // month, year, week, day
	IntervalCount      int      `json:"interval_count,omitempty"` // default 1
	UsageType          string   `json:"usage_type,omitempty"`     // licensed, metered
	Meter              string   `json:"meter,omitempty"`          // meter ID for metered pricing
	BillingScheme      string   `json:"billing_scheme,omitempty"` // per_unit, tiered
	TiersMode          string   `json:"tiers_mode,omitempty"`     // graduated, volume (required when billing_scheme is tiered)
	Tiers              []Tier   `json:"tiers,omitempty"`
	Default            bool     `json:"default,omitempty"` // mark as default price for the product
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
	Version  string                 `json:"version" validate:"required"`
	Meters   []MeterWithStripeID    `json:"meters,omitempty" validate:"dive"`
	Products []ProductWithStripeIDs `json:"products" validate:"required,dive"`
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
	Created  []ProductChange `json:"created,omitempty"`
	Updated  []ProductChange `json:"updated,omitempty"`
	Archived []ProductChange `json:"archived,omitempty"`
	Meters   *MeterChanges   `json:"meters,omitempty"`
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

type ProductChange struct {
	ProductID   string   `json:"product_id"`
	ProductName string   `json:"product_name"`
	Action      string   `json:"action"`
	Details     []string `json:"details,omitempty"`
}

// Diff detection structures

type ConfigDiff struct {
	NewProducts      []Product
	UpdatedProducts  []ProductUpdate
	ArchivedProducts []string
	NewMeters        []Meter
	ArchivedMeters   []string
}

type ProductUpdate struct {
	ID               string
	FieldChanges     map[string]interface{}
	NewPrices        []Price
	UpdatedPrices    []Price
	ArchivedPrices   []string
	RequiresRecreate bool
}

// StripeIDMapping stores the relationship between config IDs and actual Stripe IDs
type StripeIDMapping struct {
	ID              uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()" binding:"required"`
	ConfigID        uuid.UUID      `json:"config_id" gorm:"type:uuid;not null;index" binding:"required"`            // References StripeConfig.ID
	ConfigItemID    string         `json:"config_item_id" gorm:"not null;index" binding:"required"`                 // Our config ID (e.g., "price_test_basic_monthly")
	StripeID        string         `json:"stripe_id" gorm:"not null;index" binding:"required"`                      // Stripe's generated ID (e.g., "price_1S7p7w...")
	StripeIDHistory pq.StringArray `json:"stripe_id_history" gorm:"type:text[];default:ARRAY[]" binding:"required"` // Historical Stripe IDs for legacy price tracking
	ItemType        string         `json:"item_type" gorm:"not null" binding:"required"`                            // "product" or "price"
	CreatedAt       time.Time      `json:"created_at" binding:"required"`
	UpdatedAt       time.Time      `json:"updated_at" binding:"required"`
}

func (StripeIDMapping) TableName() string {
	return "stripe.stripe_id_mappings"
}

func (s *StripeIDMapping) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return nil
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
