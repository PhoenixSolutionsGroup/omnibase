# Configuration Management

## 1. Test Before Deploying

Always validate configurations before deploying to production.

**Local Testing**:
```bash
# Test your configuration locally
omnibase stripe validate
```

## 2. Incremental Changes

Make small, focused updates rather than large rewrites:

✅ **Good**: Add one new product per update
```json
{
  "version": "1.1.0",  // Minor version bump
  "products": [
    // ... existing products
    {
      "id": "new_pro_plan",  // One new product
      "name": "Pro Plan",
      "prices": [...]
    }
  ]
}
```

❌ **Avoid**: Restructuring everything at once
```json
{
  "version": "2.0.0",  // Major version jump
  "products": [
    // Completely different structure
  ]
}
```

## 3. Document Changes

Use git commit messages to document pricing changes:

```bash
git add omnibase/stripe.config.json
git commit -m "feat: add Pro tier at $29.99/month

- Added 'saas_pro' product
- Includes advanced analytics and priority support
- Monthly and annual pricing options"
```

## 4. Keep History

Never delete old configurations:
- Maintain full audit trail in git
- Database automatically keeps version history
- Allows rollbacks if needed

## 5. Review Changes

Before deploying, review what will change:

1. Check the diff in git
2. Review which products/prices will be created/updated/archived
3. Confirm the impact on existing customers