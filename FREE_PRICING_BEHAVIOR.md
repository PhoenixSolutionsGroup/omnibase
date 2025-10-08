# Free Pricing Tier Support

## Overview

The Stripe Config service supports "free" pricing tiers that bypass Stripe API limitations while maintaining full integration with the database-backed configuration system.

## Behavior

### Products with ID "free"
- **Database Storage**: Stored normally in PostgreSQL with full versioning support
- **Stripe API**: Completely bypassed - no API calls made to Stripe
- **ID Mapping**: Maps to itself (config ID = stripe ID) for consistency
- **Actions**: All operations (create, update, archive) work locally only

### Prices with ID "free"
- **Database Storage**: Stored normally in PostgreSQL with full versioning support
- **Stripe API**: Completely bypassed - no API calls made to Stripe
- **ID Mapping**: Maps to itself (config ID = stripe ID) for consistency
- **Actions**: All operations (create, update, archive) work locally only

## Implementation Details

### What Works Normally
- ✅ Config validation and parsing
- ✅ Database storage and versioning
- ✅ Config rollbacks and migrations
- ✅ A/B testing between config versions
- ✅ UI rendering and pricing tables
- ✅ Audit trails and change tracking

### What's Bypassed
- ❌ Stripe product creation/updates
- ❌ Stripe price creation/updates
- ❌ Stripe webhooks for free items
- ❌ Stripe dashboard visibility

## Usage Example

```json
{
  "products": [
    {
      "id": "free",
      "name": "Free Plan",
      "description": "Get started for free",
      "type": "service",
      "prices": [
        {
          "id": "free",
          "currency": "usd",
          "amount": 0,
          "interval": "month"
        }
      ]
    }
  ]
}
```

## Benefits

1. **Stripe Limitation Workaround**: Solves Stripe's restriction on $0 prices
2. **Consistent Config Management**: Free tiers participate in all config features
3. **UI Compatibility**: Frontend components work unchanged
4. **Version Control**: Free plans are versioned like any other config
5. **Enterprise Features**: Supports staged rollouts, A/B testing, etc.

## Action Types

When processing free items, you'll see these action types in responses:
- `created_local` - Free product/price created (database only)
- `updated_local` - Free product/price updated (database only)  
- `archived_local` - Free product/price archived (database only)