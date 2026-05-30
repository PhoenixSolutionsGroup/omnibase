---
title: Coupons & Promotions
description: Create discount codes and promotional campaigns for your customers
---

# Coupons & Promotions

OmniBase supports Stripe coupons and promotion codes for creating discounts, running promotional campaigns, and offering special pricing to customers.

## Coupons

Coupons define the discount amount and rules. Promotion codes are user-facing codes that apply coupons.

### Coupon Configuration

```json
{
  "coupons": [
    {
      "id": "summer_sale",
      "name": "Summer Sale 2024",
      "percent_off": 20,
      "duration": "repeating",
      "duration_in_months": 3,
      "max_redemptions": 100,
      "redeem_by": "2024-09-01T00:00:00Z",
      "applies_to": ["pro", "team"],
      "metadata": {
        "campaign": "summer_2024"
      }
    }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Unique coupon identifier |
| `name` | `string` | No | Display name for the coupon |
| `percent_off` | `number` | One of | Percentage discount (1-100) |
| `amount_off` | `integer` | One of | Fixed amount discount (in cents) |
| `currency` | `string` | If amount_off | Currency for fixed amount discounts |
| `duration` | `string` | Yes | `once`, `repeating`, or `forever` |
| `duration_in_months` | `integer` | If repeating | Number of months for repeating |
| `max_redemptions` | `integer` | No | Maximum total redemptions |
| `redeem_by` | `string` | No | Expiration date (ISO 8601) |
| `applies_to` | `string[]` | No | Product IDs this coupon applies to |
| `metadata` | `object` | No | Custom key-value metadata |
| `stripe_id` | `string` | No | Existing Stripe coupon ID |

### Discount Types

#### Percentage Discount

```json
{
  "id": "20_percent_off",
  "name": "20% Off",
  "percent_off": 20,
  "duration": "once"
}
```

#### Fixed Amount Discount

```json
{
  "id": "10_dollars_off",
  "name": "$10 Off",
  "amount_off": 1000,
  "currency": "usd",
  "duration": "once"
}
```

### Duration Options

| Duration | Description | Example Use Case |
|----------|-------------|------------------|
| `once` | Applied once to the first invoice | One-time welcome discount |
| `repeating` | Applied for a number of months | 3-month promotional period |
| `forever` | Applied indefinitely | Permanent partner discount |

```json
// One-time discount
{
  "id": "welcome",
  "percent_off": 50,
  "duration": "once"
}

// 6-month discount
{
  "id": "startup_program",
  "percent_off": 50,
  "duration": "repeating",
  "duration_in_months": 6
}

// Permanent discount
{
  "id": "partner",
  "percent_off": 25,
  "duration": "forever"
}
```

### Product-Specific Coupons

Restrict coupons to specific products:

```json
{
  "id": "pro_discount",
  "name": "Pro Plan Discount",
  "percent_off": 30,
  "duration": "once",
  "applies_to": ["pro"]
}
```

> **Note:**
The `applies_to` array uses config product IDs, not Stripe IDs.

### Redemption Limits

Control how many times a coupon can be used:

```json
{
  "id": "limited_offer",
  "percent_off": 50,
  "duration": "once",
  "max_redemptions": 100,
  "redeem_by": "2024-12-31T23:59:59Z"
}
```

| Field | Description |
|-------|-------------|
| `max_redemptions` | Total number of times this coupon can be redeemed |
| `redeem_by` | Last date the coupon can be applied |

## Promotion Codes

Promotion codes are user-facing codes that customers enter at checkout.

### Promotion Code Configuration

```json
{
  "promotion_codes": [
    {
      "id": "summer20",
      "code": "SUMMER20",
      "coupon": "summer_sale",
      "active": true,
      "max_redemptions": 50,
      "first_time_transaction": true,
      "minimum_amount": 5000,
      "minimum_amount_currency": "usd",
      "expires_at": "2024-09-01T00:00:00Z",
      "metadata": {
        "source": "email_campaign"
      }
    }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Unique identifier |
| `code` | `string` | Yes | Customer-facing code (e.g., `"SUMMER20"`) |
| `coupon` | `string` | Yes | Config ID of the coupon to apply |
| `active` | `boolean` | No | Whether the code is active (default: true) |
| `max_redemptions` | `integer` | No | Maximum uses for this specific code |
| `first_time_transaction` | `boolean` | No | Only for first-time customers |
| `minimum_amount` | `integer` | No | Minimum order amount (in cents) |
| `minimum_amount_currency` | `string` | If minimum_amount | Currency for minimum |
| `expires_at` | `string` | No | Expiration date (ISO 8601) |
| `metadata` | `object` | No | Custom key-value metadata |
| `stripe_id` | `string` | No | Existing Stripe promotion code ID |

### Promotion Code Restrictions

#### First-Time Customers Only

```json
{
  "id": "new_customer",
  "code": "WELCOME50",
  "coupon": "50_off_first",
  "first_time_transaction": true
}
```

#### Minimum Purchase Amount

```json
{
  "id": "big_spender",
  "code": "SAVE20",
  "coupon": "20_percent_off",
  "minimum_amount": 10000,
  "minimum_amount_currency": "usd"
}
```

### Multiple Codes Per Coupon

Create multiple promotion codes for the same coupon to track different campaigns:

```json
{
  "coupons": [
    {
      "id": "launch_discount",
      "percent_off": 25,
      "duration": "once"
    }
  ],
  "promotion_codes": [
    {
      "id": "launch_twitter",
      "code": "TWITTER25",
      "coupon": "launch_discount",
      "metadata": { "source": "twitter" }
    },
    {
      "id": "launch_newsletter",
      "code": "NEWS25",
      "coupon": "launch_discount",
      "metadata": { "source": "newsletter" }
    },
    {
      "id": "launch_partner",
      "code": "PARTNER25",
      "coupon": "launch_discount",
      "metadata": { "source": "partner_referral" }
    }
  ]
}
```

## Complete Example

```json title="omnibase/stripe/promotions.config.json"
{
  "$schema": "https://dashboard.omnibase.tech/api/stripe-config.schema.json",
  "version": "1.0.0",
  "coupons": [
    {
      "id": "welcome_50",
      "name": "Welcome Discount",
      "percent_off": 50,
      "duration": "once"
    },
    {
      "id": "annual_20",
      "name": "Annual Plan Discount",
      "percent_off": 20,
      "duration": "forever",
      "applies_to": ["pro", "team"]
    },
    {
      "id": "startup_program",
      "name": "Startup Program",
      "percent_off": 50,
      "duration": "repeating",
      "duration_in_months": 12,
      "max_redemptions": 200
    },
    {
      "id": "black_friday",
      "name": "Black Friday 2024",
      "amount_off": 5000,
      "currency": "usd",
      "duration": "once",
      "redeem_by": "2024-12-02T00:00:00Z"
    }
  ],
  "promotion_codes": [
    {
      "id": "welcome",
      "code": "WELCOME50",
      "coupon": "welcome_50",
      "first_time_transaction": true
    },
    {
      "id": "annual_discount",
      "code": "ANNUAL20",
      "coupon": "annual_20"
    },
    {
      "id": "startup_apply",
      "code": "STARTUP2024",
      "coupon": "startup_program",
      "max_redemptions": 200
    },
    {
      "id": "bf24_twitter",
      "code": "BF24TWITTER",
      "coupon": "black_friday",
      "metadata": { "source": "twitter" }
    },
    {
      "id": "bf24_email",
      "code": "BF24EMAIL",
      "coupon": "black_friday",
      "metadata": { "source": "email" }
    }
  ],
  "products": []
}
```

## Using Promotion Codes

### At Checkout

Enable promotion codes in checkout:

```typescript
import { V1PaymentsApi } from '@omnibase/core-js';

const paymentsApi = new V1PaymentsApi(config);

// Allow customers to enter any promotion code
const { data } = await paymentsApi.createCheckout({
  createCheckoutRequest: {
    priceId: 'pro_monthly',
    successUrl: 'https://example.com/success',
    cancelUrl: 'https://example.com/pricing',
    allowPromotionCodes: true,
  },
});
```

### Pre-Applied Code

Apply a specific promotion code automatically:

```typescript
const { data } = await paymentsApi.createCheckout({
  createCheckoutRequest: {
    priceId: 'pro_monthly',
    successUrl: 'https://example.com/success',
    cancelUrl: 'https://example.com/pricing',
    promotionCode: 'WELCOME50',
  },
});
```

> **Note:**
You cannot use both `allowPromotionCodes` and `promotionCode` at the same time.

## Management

### Deactivating Promotion Codes

To deactivate a promotion code, set `active: false`:

```json
{
  "id": "expired_promo",
  "code": "OLDCODE",
  "coupon": "old_discount",
  "active": false
}
```

### Updating Coupons

> **Note:**
Some coupon fields cannot be updated after creation. OmniBase may need to create a new coupon with a new Stripe ID.

Fields that can be updated:
- `name`
- `metadata`

Fields that require coupon recreation:
- `percent_off` / `amount_off`
- `duration`
- `duration_in_months`
- `max_redemptions`
- `redeem_by`
- `applies_to`

## Best Practices

1. **Use Descriptive Codes** — Choose codes that are easy to remember and type: `WELCOME50` not `WLC5020240101`

2. **Track Sources** — Use metadata to track where customers found the code:
   ```json
   { "metadata": { "source": "partner_xyz", "campaign": "q4_2024" } }
   ```

3. **Set Limits** — Always set `max_redemptions` and/or `expires_at` for promotional campaigns

4. **Test First** — Create test coupons in your staging environment before production

5. **Monitor Usage** — Track redemption counts through Stripe Dashboard or API

## Related

- [Checkout & Portal](/guides/stripe/checkout-portal) — Using promotion codes at checkout
- [Configuration Guide](/guides/stripe/configuration) — Full configuration reference
- [Testing](/guides/stripe/testing) — Testing promotion code flows
