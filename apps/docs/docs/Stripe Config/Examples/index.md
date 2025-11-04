# Configuration Examples

This page provides practical examples for common Stripe configuration scenarios.

## Overview

Browse examples by use case:

- [Simple Subscription](./Simple%20Subscription.md) - Basic monthly subscription plan
- [Multiple Plans](./Multiple%20Plans.md) - Multiple tiers with monthly and annual options
- [Metered Billing](./Metered%20Billing.md) - Pay-per-use pricing with usage tracking
- [Tiered Pricing](./Tiered%20Pricing.md) - Volume discounts with graduated or volume pricing
- [Advanced UI Configuration](./Advanced%20UI%20Configuration.md) - Rich UI metadata for pricing tables
- [Enterprise Pricing](./Enterprise%20Pricing.md) - Base subscription with usage-based add-ons
- [Free Plan](./Free%20Plan.md) - Local-only plan that doesn't create Stripe resources
- [Custom Billing Intervals](./Custom%20Billing%20Intervals.md) - Quarterly, semi-annual, and custom intervals

## Quick Reference

### By Complexity

**Beginner:**
- [Simple Subscription](./Simple%20Subscription.md) - Start here for basic subscriptions
- [Free Plan](./Free%20Plan.md) - Understanding free tier implementation

**Intermediate:**
- [Multiple Plans](./Multiple%20Plans.md) - Multiple products and pricing tiers
- [Custom Billing Intervals](./Custom%20Billing%20Intervals.md) - Beyond monthly/yearly billing

**Advanced:**
- [Metered Billing](./Metered%20Billing.md) - Usage-based pricing
- [Tiered Pricing](./Tiered%20Pricing.md) - Volume discounts
- [Advanced UI Configuration](./Advanced%20UI%20Configuration.md) - Rich pricing table metadata
- [Enterprise Pricing](./Enterprise%20Pricing.md) - Complex multi-product setups

### By Pricing Model

**Fixed Pricing:**
- [Simple Subscription](./Simple%20Subscription.md)
- [Multiple Plans](./Multiple%20Plans.md)
- [Custom Billing Intervals](./Custom%20Billing%20Intervals.md)

**Usage-Based:**
- [Metered Billing](./Metered%20Billing.md)
- [Tiered Pricing](./Tiered%20Pricing.md)

**Hybrid (Fixed + Usage):**
- [Enterprise Pricing](./Enterprise%20Pricing.md)

## Tips

- All examples use valid JSON that can be copied and modified
- Remember to validate with `omnibase stripe validate` before pushing
- Start with simpler examples and build up complexity
- Check the [JSON Config](../JSON%20Config/index.md) reference for field definitions