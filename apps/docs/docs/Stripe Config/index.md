# Stripe Configuration

The Stripe Configuration system provides a database-backed, version-controlled approach to managing your Stripe products, prices, and billing meters. This innovative "Stripe as Code" solution stores billing configurations as versioned JSON, enabling enterprise features like safe deployment/rollback of pricing changes, user migration between config versions, audit trails, and staged rollouts.

## Overview

The Stripe Config system solves a fundamental limitation of Stripe: **immutability constraints**. You cannot delete products or prices that have payment history in Stripe. Our solution stores configuration as versioned JSON, allowing you to:

- **Version Control**: Track every change to your pricing structure with full audit history
- **Safe Rollbacks**: Revert to previous configurations without losing historical data
- **User Migration**: Gradually migrate users between pricing structures
- **A/B Testing**: Run multiple pricing configurations simultaneously
- **Staged Rollouts**: Deploy pricing changes incrementally

## Core Concepts

### Configuration Structure

A Stripe configuration consists of three main components:

1. **Version**: Semantic version identifier for the configuration
2. **Meters** (optional): Usage-based billing meters for metered pricing
3. **Products**: Your service offerings with associated prices

### ID Mapping System

The system maintains a mapping between your custom configuration IDs and actual Stripe IDs:

- **Config IDs**: Human-readable identifiers you define (e.g., `basic_monthly`)
- **Stripe IDs**: Auto-generated Stripe identifiers (e.g., `price_1S7p7w...`)

This mapping enables:
- Consistent references across configuration versions
- Easy lookup from config ID to Stripe ID
- Support for configuration rollbacks and updates

## Quick Start

### Configuration File Location

Place your Stripe configuration in your project:

```
your-project/
  omnibase/
    stripe.config.json  ← Your Stripe configuration
```

### Basic Configuration

Create a simple subscription plan:

```json
{
  "version": "1.0.0",
  "products": [
    {
      "id": "basic_plan",
      "name": "Basic Plan",
      "description": "Simple monthly subscription",
      "type": "service",
      "prices": [
        {
          "id": "basic_monthly",
          "amount": 999,
          "currency": "usd",
          "interval": "month"
        }
      ]
    }
  ]
}
```

This creates:
- A "Basic Plan" product in Stripe
- A $9.99/month recurring price
- ID mapping from `basic_monthly` to the actual Stripe price ID

## How It Works

### Configuration Storage

1. **Local File**: You define `stripe.config.json` in your project
2. **Version Control**: Changes are tracked in your git repository
3. **Database Storage**: Configuration is stored in PostgreSQL when deployed
4. **ID Mapping**: System maintains mapping between your IDs and Stripe IDs
5. **Stripe Sync**: Changes are automatically synced to Stripe

### Configuration Lifecycle

#### First Deployment

When you deploy for the first time:

1. Configuration is validated against the JSON schema
2. Meters are created in Stripe (if defined)
3. Products are created in Stripe
4. Prices are created and associated with products
5. ID mappings are saved to the database
6. Configuration is stored with version history

#### Updates

When you update your configuration:

1. System retrieves previous configuration from database
2. Changes are calculated by comparing old vs new
3. Stripe resources are updated:
   - New meters/products/prices are created
   - Changed products are updated
   - Removed items are archived
4. New ID mappings are created for new items
5. Updated configuration is stored as new version

#### Archiving

When you remove items from your configuration:

- **Products**: Set to `active: false` in Stripe
- **Prices**: Set to `active: false` in Stripe
- **Meters**: Deactivated in Stripe
- Historical data remains intact for reporting

## Next Steps

Explore detailed documentation:

- **[JSON Configuration](./JSON%20Config/index.md)**: Complete schema reference and field documentation
- **[Examples](./Examples/index.md)**: Practical configuration examples for different use cases
- **[Best Practices](./Best%20Practices/index.md)**: Tips for managing configurations effectively
- **[Troubleshooting](./Troubleshooting/index.md)**: Common issues and solutions

## Key Features

✅ **Version Control**: Full audit trail of pricing changes  
✅ **Safe Updates**: Validation before applying changes  
✅ **ID Mapping**: Human-readable IDs with Stripe integration  
✅ **Flexible Pricing**: Support for all Stripe pricing models  
✅ **Metered Billing**: Track and charge for actual usage  
✅ **Tiered Pricing**: Volume discounts and graduated pricing  
✅ **UI Support**: Rich metadata for customer-facing displays  
✅ **Free Tiers**: Local-only products without Stripe overhead