---
title: Stripe Sync
description: How the Stripe configuration sync mechanism works
---

# How Stripe Sync Works

OmniBase's "Stripe as Code" approach stores billing configuration in PostgreSQL and syncs it to Stripe. This page explains the mechanism.

## The Problem

Stripe has limitations for configuration management:

1. **Immutable history** — Products/prices with payments can't be deleted
2. **No version control** — No way to track changes over time
3. **No rollback** — Can't revert to a previous configuration
4. **Environment drift** — Hard to keep dev/staging/prod in sync

## The Solution

OmniBase introduces a database-backed configuration layer:

```
┌─────────────────────────────────────────────────────────┐
│                  YOUR APPLICATION                        │
├─────────────────────────────────────────────────────────┤
│  stripe/                                                 │
│  ├── products.config.json                               │
│  ├── enterprise.config.json                             │
│  └── metered.config.json                                │
└─────────────────────────────────────────────────────────┘
                           │
                           │ omnibase stripe push
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  OMNIBASE API                            │
├─────────────────────────────────────────────────────────┤
│  1. Validate configuration                              │
│  2. Compute diff with current state                     │
│  3. Apply changes to Stripe                             │
│  4. Store version in PostgreSQL                         │
└─────────────────────────────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
┌─────────────────────┐    ┌─────────────────────┐
│     POSTGRESQL      │    │       STRIPE        │
├─────────────────────┤    ├─────────────────────┤
│  stripe_configs     │    │  Products           │
│  ├── id             │    │  Prices             │
│  ├── version        │    │  Meters             │
│  ├── config (JSONB) │    │  Coupons            │
│  ├── created_at     │    │  Webhooks           │
│  └── changes        │    │                     │
└─────────────────────┘    └─────────────────────┘
```

## Config ID vs Stripe ID

OmniBase maintains a mapping between your config IDs and Stripe IDs:

```
Config ID          →    Stripe ID
───────────────────────────────────
pro_plan           →    prod_ABC123xyz
pro_monthly        →    price_DEF456abc
pro_yearly         →    price_GHI789def
```

This means:
- Your code always uses stable config IDs
- Stripe IDs can change (e.g., when recreating resources)
- Environment portability (same config, different Stripe accounts)

## The Diff Algorithm

When you push a configuration, OmniBase:

1. **Fetches current state** — Gets the latest config from PostgreSQL
2. **Computes diff** — Determines what changed
3. **Plans operations** — Decides create/update/archive for each resource
4. **Applies to Stripe** — Makes API calls to Stripe
5. **Records version** — Stores the new config with changes

### Example Diff

```json
{
  "products": {
    "created": [{ "productId": "enterprise", "productName": "Enterprise" }],
    "updated": [{ "productId": "pro", "productName": "Professional" }],
    "archived": []
  },
  "prices": {
    "created": [{ "priceId": "enterprise_monthly", "productId": "enterprise" }],
    "updated": [],
    "archived": [{ "priceId": "old_price", "productId": "pro" }]
  }
}
```

## Archiving vs Deleting

Stripe doesn't allow deleting resources with history. OmniBase handles this by:

1. **Archiving** — Marks the resource as inactive in Stripe
2. **Removing from config** — Excludes from future syncs
3. **Preserving history** — Maintains audit trail

```
Active Price                    Archived Price
────────────────────────────────────────────────
visible in API: yes    →       visible: no
usable for new subs: yes  →    usable: no
existing subs: work     →      existing: still work
```

## Version History

Every configuration change creates a new version:

```sql
SELECT id, version, created_at FROM stripe_configs ORDER BY created_at DESC;

-- id        │ version │ created_at
-- ──────────┼─────────┼─────────────────────
-- uuid-5    │ 2.1.0   │ 2024-01-15 10:30:00
-- uuid-4    │ 2.0.0   │ 2024-01-10 14:20:00
-- uuid-3    │ 1.2.0   │ 2024-01-05 09:15:00
-- uuid-2    │ 1.1.0   │ 2024-01-02 16:45:00
-- uuid-1    │ 1.0.0   │ 2024-01-01 12:00:00
```

View history via CLI:

```bash
omnibase stripe history
```

## Free Tier Support

Stripe doesn't allow $0 prices. OmniBase handles this:

1. **Stores free prices in PostgreSQL** — Full config including $0 prices
2. **Skips Stripe sync for free prices** — Doesn't create in Stripe
3. **Handles checkout specially** — Free tier bypasses Stripe checkout

```json
{
  "id": "free_plan",
  "name": "Free",
  "prices": [{
    "id": "free_monthly",
    "amount": 0,  // OmniBase handles this
    "currency": "usd",
    "interval": "month"
  }]
}
```

## Pulling Existing Config

Import from an existing Stripe account:

```bash
omnibase stripe pull
```

This:
1. Fetches all products, prices, meters from Stripe
2. Generates config IDs based on Stripe metadata or names
3. Creates a local configuration file
4. You can then customize and push

## Multi-File Configs

OmniBase merges all `*.config.json` files in `omnibase/stripe/`:

```
omnibase/stripe/
├── core.config.json      # Base products
├── enterprise.config.json # Enterprise tier
└── addons.config.json    # Add-on products
```

All files are merged before pushing, allowing modular organization.

## Related Topics

- [Stripe Configuration Guide](/guides/stripe-config) — How to configure
- [API Reference: Stripe](/reference/api/v1/stripe) — Stripe API endpoints
