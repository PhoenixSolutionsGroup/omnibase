# JSON Configuration Reference

This page provides a complete reference for the `stripe.config.json` file format.

## Root Structure

```json
{
  "version": "1.0.0",
  "meters": [...],
  "products": [...]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `version` | string | Yes | Semantic version (e.g., "1.0.0") |
| `meters` | array | No | Billing meters for usage-based pricing |
| `products` | array | Yes | Product definitions with prices |

## Version

Semantic version string following the pattern `major.minor.patch`:

```json
{
  "version": "1.0.0"
}
```

**Pattern**: `^\d+\.\d+\.\d+$`

**Versioning Strategy**:
- **Major** (1.0.0 → 2.0.0): Breaking changes, significant restructuring
- **Minor** (1.0.0 → 1.1.0): New products or features, backward compatible
- **Patch** (1.0.0 → 1.0.1): Bug fixes, minor adjustments

## Meters

Meters track usage events for metered billing. Define meters before referencing them in prices.

### Basic Structure

```json
{
  "meters": [
    {
      "id": "api_requests",
      "display_name": "API Requests",
      "event_name": "api_request",
      "default_aggregation": {
        "formula": "sum"
      }
    }
  ]
}
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier (alphanumeric, hyphens, underscores) |
| `display_name` | string | Yes | Human-readable name (1-256 chars) |
| `event_name` | string | Yes | Event name for tracking usage |
| `default_aggregation` | object | Yes | How to aggregate usage events |
| `customer_mapping` | object | No | Customer identification in events |
| `value_settings` | object | No | Usage value extraction settings |

### Meter ID

**Pattern**: `^[a-zA-Z0-9_-]+$`

```json
{
  "id": "api_requests"
}
```

### Display Name

**Length**: 1-256 characters

```json
{
  "display_name": "API Requests"
}
```

### Event Name

**Pattern**: `^[a-zA-Z0-9_-]+$`

```json
{
  "event_name": "api_request"
}
```

### Default Aggregation

| Field | Type | Required | Values | Description |
|-------|------|----------|--------|-------------|
| `formula` | string | Yes | `sum`, `count`, `last` | Aggregation method |

**Formulas**:
- `sum`: Sum all event values
- `count`: Count number of events
- `last`: Use most recent event value

```json
{
  "default_aggregation": {
    "formula": "sum"
  }
}
```

### Customer Mapping

Defines how to identify customers in usage events. Optional - defaults shown below:

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `event_payload_key` | string | `stripe_customer_id` | Key containing customer ID |
| `type` | string | `by_id` | Mapping type |

```json
{
  "customer_mapping": {
    "event_payload_key": "stripe_customer_id",
    "type": "by_id"
  }
}
```

### Value Settings

Defines how to extract usage values from events. Optional - defaults shown below:

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `event_payload_key` | string | `value` | Key containing usage value |

```json
{
  "value_settings": {
    "event_payload_key": "value"
  }
}
```

## Products

Products represent your service offerings. Each product must have at least one price.

### Basic Structure

```json
{
  "products": [
    {
      "id": "basic_plan",
      "name": "Basic Plan",
      "description": "Perfect for individuals",
      "type": "service",
      "prices": [...],
      "ui": {...}
    }
  ]
}
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier |
| `name` | string | Yes | Display name (1-256 chars) |
| `description` | string | No | Product description (max 500 chars) |
| `type` | string | No | Product type (default: `service`) |
| `prices` | array | Yes | Price definitions (min 1) |
| `ui` | object | No | UI display configuration |

### Product ID

**Pattern**: `^[a-zA-Z0-9_-]+$`

```json
{
  "id": "basic_plan"
}
```

### Product Name

**Length**: 1-256 characters

```json
{
  "name": "Basic Plan"
}
```

### Description

**Length**: 0-500 characters

```json
{
  "description": "Perfect for individuals and small teams"
}
```

### Product Type

**Values**: `service`, `good`, `metered`

- `service`: Subscription services (default)
- `good`: One-time purchases
- `metered`: Usage-based services

```json
{
  "type": "service"
}
```

### Product UI

Optional UI configuration for pricing tables and displays:

| Field | Type | Description |
|-------|------|-------------|
| `display_name` | string | Override product name (max 256 chars) |
| `tagline` | string | Short tagline (max 500 chars) |
| `features` | array | Feature list (strings, max 256 chars each) |
| `badge` | string | Badge text like "Most Popular" (max 100 chars) |
| `cta_text` | string | Custom button text (max 100 chars) |
| `highlighted` | boolean | Highlight in UI |
| `sort_order` | integer | Display order (min 0) |

```json
{
  "ui": {
    "display_name": "Professional",
    "tagline": "For growing businesses",
    "features": [
      "Unlimited team members",
      "100GB storage",
      "Priority support"
    ],
    "badge": "Most Popular",
    "cta_text": "Upgrade Now",
    "highlighted": true,
    "sort_order": 2
  }
}
```

## Prices

Prices define how customers pay for products. Products must have at least one price.

### Basic Structure

```json
{
  "prices": [
    {
      "id": "basic_monthly",
      "amount": 999,
      "currency": "usd",
      "interval": "month"
    }
  ]
}
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier |
| `amount` | integer | Conditional | Amount in smallest currency unit (cents) |
| `currency` | string | Yes | 3-letter ISO 4217 code |
| `interval` | string | Conditional | Billing interval |
| `interval_count` | integer | No | Intervals between billing (default: 1) |
| `usage_type` | string | No | Usage type for metered billing |
| `meter` | string | Conditional | Meter ID for metered usage |
| `billing_scheme` | string | No | Billing scheme (default: `per_unit`) |
| `tiers_mode` | string | Conditional | Tier mode for tiered pricing |
| `tiers` | array | Conditional | Pricing tiers |
| `default` | boolean | No | Mark as default price |
| `ui` | object | No | UI display configuration |

### Price ID

**Pattern**: `^[a-zA-Z0-9_-]+$`

```json
{
  "id": "basic_monthly"
}
```

### Amount

**Required for**: Non-tiered pricing  
**Not allowed for**: Tiered pricing (amount defined by tiers)

**Minimum**: 0 (integer, smallest currency unit)

```json
{
  "amount": 999
}
```

For tiered pricing, omit the amount field:

```json
{
  "billing_scheme": "tiered",
  "tiers": [...]
}
```

### Currency

**Pattern**: `^[a-z]{3}$` (lowercase, 3-letter ISO 4217 code)

**Examples**: `usd`, `eur`, `gbp`, `jpy`

```json
{
  "currency": "usd"
}
```

### Interval

**Required for**: Recurring prices (subscriptions)

**Values**: `month`, `year`, `week`, `day`

```json
{
  "interval": "month"
}
```

### Interval Count

**Minimum**: 1 (default: 1)

Number of intervals between billings:

```json
{
  "interval": "month",
  "interval_count": 3
}
```

This creates quarterly billing (every 3 months).

### Usage Type

**Values**: `licensed`, `metered`

**Required for**: Metered billing

```json
{
  "usage_type": "metered",
  "meter": "api_requests"
}
```

### Meter

**Required when**: `usage_type` is `metered`

References a meter ID from the `meters` array:

```json
{
  "usage_type": "metered",
  "meter": "api_requests",
  "interval": "month"
}
```

The meter must be defined in the configuration before being referenced.

### Billing Scheme

**Values**: `per_unit`, `tiered`

**Default**: `per_unit`

```json
{
  "billing_scheme": "per_unit"
}
```

For tiered pricing:

```json
{
  "billing_scheme": "tiered",
  "tiers_mode": "graduated",
  "tiers": [...]
}
```

### Tiers Mode

**Required when**: `billing_scheme` is `tiered`

**Values**: `graduated`, `volume`

- **`graduated`**: Each tier applies to its portion of usage
- **`volume`**: Entire usage charged at the tier it falls into

```json
{
  "billing_scheme": "tiered",
  "tiers_mode": "graduated"
}
```

### Tiers

**Required when**: `billing_scheme` is `tiered`

Array of tier objects defining pricing at different usage levels.

#### Tier Structure

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `up_to` | integer or "inf" | Yes | Upper bound for this tier |
| `unit_amount` | integer | No | Per-unit price in this tier |
| `flat_amount` | integer | No | Flat fee for this tier |

#### Examples

**Graduated Pricing** (each tier applies to its portion):

```json
{
  "billing_scheme": "tiered",
  "tiers_mode": "graduated",
  "tiers": [
    {
      "up_to": 1000,
      "unit_amount": 10,
      "flat_amount": null
    },
    {
      "up_to": 10000,
      "unit_amount": 8,
      "flat_amount": null
    },
    {
      "up_to": "inf",
      "unit_amount": 6,
      "flat_amount": null
    }
  ]
}
```

Usage of 5,000 units would be charged:
- First 1,000 units @ $0.10 = $100
- Next 4,000 units @ $0.08 = $320
- **Total: $420**

**Volume Pricing** (entire usage charged at one rate):

```json
{
  "billing_scheme": "tiered",
  "tiers_mode": "volume",
  "tiers": [
    {
      "up_to": 1000,
      "unit_amount": 5,
      "flat_amount": 500
    },
    {
      "up_to": 10000,
      "unit_amount": 3,
      "flat_amount": null
    },
    {
      "up_to": "inf",
      "unit_amount": 2,
      "flat_amount": null
    }
  ]
}
```

Usage of 5,000 units would be charged:
- Falls in tier 2 (1,001-10,000)
- **Total: 5,000 × $0.03 = $150**

**With Flat Amounts**:

```json
{
  "tiers": [
    {
      "up_to": 1000,
      "unit_amount": 25,
      "flat_amount": 5000
    }
  ]
}
```

This tier charges: $50 flat fee + ($0.25 × units)

### Default

Mark this price as the product's default:

```json
{
  "default": true
}
```

### Price UI

Optional UI configuration for price display:

| Field | Type | Description |
|-------|------|-------------|
| `display_name` | string | Price variant name (max 256 chars) |
| `billing_period` | string | Display text for billing period (max 100 chars) |
| `price_display` | object | Custom price formatting |
| `features` | array | Price-specific features (strings, max 256 chars each) |
| `limits` | array | Usage limits/quotas |

#### Price Display Object

| Field | Type | Description |
|-------|------|-------------|
| `custom_text` | string | Custom price text like "Contact us" (max 100 chars) |
| `show_currency` | boolean | Show/hide currency symbol |
| `suffix` | string | Text after price like "per user" (max 100 chars) |

#### Price Limits

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `text` | string | Yes | Display text (max 256 chars) |
| `value` | number | No | Numeric limit for enforcement (min 0) |
| `unit` | string | No | Unit of measurement (max 50 chars) |

```json
{
  "ui": {
    "display_name": "Monthly",
    "billing_period": "per month",
    "price_display": {
      "suffix": "(Save 17%!)",
      "show_currency": true
    },
    "features": [
      "Monthly reports",
      "Standard SLA"
    ],
    "limits": [
      {
        "text": "10,000 API calls included",
        "value": 10000,
        "unit": "calls"
      },
      {
        "text": "5 integrations",
        "value": 5,
        "unit": "integrations"
      }
    ]
  }
}
```

## Validation Rules

The system validates your configuration before applying changes:

1. **Schema Validation**: Ensures structure matches JSON schema
2. **Required Fields**: Version, products, and product prices must be present
3. **ID Format**: IDs must be alphanumeric with hyphens/underscores
4. **Meter References**: Prices referencing meters must have those meters defined
5. **Tiered Pricing**: Tiered prices must have `tiers_mode` and `tiers` array
6. **Metered Pricing**: Metered prices must specify `interval` and `meter`
7. **Currency Codes**: Must be valid 3-letter ISO codes
8. **Tier Structure**: At least one tier must exist, last tier must be "inf"

## Common Validation Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "version is required" | Missing version field | Add semantic version string |
| "price references undefined meter X" | Meter not defined | Add meter to `meters` array |
| "tiers_mode is required when billing_scheme is tiered" | Missing tiers_mode | Add `"tiers_mode": "graduated"` or `"volume"` |
| "meter is required for metered pricing" | Metered price without meter | Add `"meter": "meter_id"` field |
| "currency must be a 3-character ISO code" | Invalid currency | Use lowercase 3-letter code like `"usd"` |
| "amount must not be set for tiered pricing" | Amount field in tiered price | Remove `amount` field, use `tiers` instead |