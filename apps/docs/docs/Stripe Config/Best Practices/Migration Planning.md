# Migration Planning

When changing pricing, understand how price updates work and plan accordingly.

## How Price Updates Work

When you update a price's `amount` or other properties for an existing `id`:
1. The old price is **archived** in Stripe
2. A new price is **created** with the updated values
3. **Existing users remain on the old (archived) price**
4. New users get the new price

This means price changes are **non-breaking** by default - existing subscriptions continue unaffected.

## Migration Strategies

### Option 1: Manual Migration (Recommended for Most Cases)

Let existing users stay on old pricing while new users get the new price.

**When to use:**
- Price increases that might cause churn
- Want to grandfather existing customers
- Need time to communicate changes

**Implementation:**
```json
{
  "version": "2.0.0",
  "products": [{
    "id": "basic_plan",
    "prices": [{
      "id": "basic_monthly",
      "amount": 1999  // Updated from 999
    }]
  }]
}
```

After deployment:
- Existing users: Stay on old $9.99 price
- New users: Get new $19.99 price
- Manually migrate users via Stripe Dashboard or API when ready

### Option 2: Create Separate Price IDs

Add new prices alongside old ones for more control:

```json
{
  "version": "2.0.0",
  "products": [{
    "id": "basic_plan",
    "prices": [
      {
        "id": "basic_monthly_v1",
        "amount": 999
      },
      {
        "id": "basic_monthly_v2",
        "amount": 1999,
        "default": true  // New default for new subscriptions
      }
    ]
  }]
}
```

**Benefits:**
- Both prices remain active and visible
- Easier to track which users are on which version
- Can remove old price once migration is complete

### Option 3: Programmatic Migration (Future)

> **Note:** This feature is planned but not yet available.

OmniBase will provide SDK methods like `omnibase.payments.updatePrice()` to programmatically migrate users to new prices.

## Migration Steps

### 1. Create New Version

Bump the version number:

```json
{
  "version": "2.0.0"  // Was 1.x.x
}
```

### 2. Update Pricing

Choose your strategy (update existing ID or create new IDs).

### 3. Deploy Configuration

```bash
omnibase stripe validate
omnibase stripe push
```

### 4. Migrate Users

**Manual approach:**
- Use Stripe Dashboard to update subscriptions
- Or use Stripe API to programmatically switch subscriptions
- Migrate in batches to monitor impact

**Example Stripe API call:**
```javascript
// Update a subscription to new price
await stripe.subscriptions.update(subscriptionId, {
  items: [{
    id: subscriptionItemId,
    price: 'new_price_id'
  }]
});
```

### 5. Monitor Impact

Track key metrics during migration:
- Conversion rates for new users
- Churn rates for migrated users
- Revenue changes
- Customer feedback

### 6. Clean Up (Optional)

Once all users are migrated, you can remove old price IDs from your config:

```json
{
  "version": "2.1.0",
  "products": [{
    "prices": [{
      "id": "basic_monthly_v2"  // Only new price remains
    }]
  }]
}
```

## Best Practices

1. **Communicate Changes**: Notify users before migrating them to new pricing
2. **Grandfather Existing Users**: Consider letting current users keep old pricing
3. **Monitor Churn**: Watch for increased cancellations during migrations
4. **Migrate Gradually**: Don't move all users at once
5. **Have a Rollback Plan**: Keep old prices available in case you need to revert