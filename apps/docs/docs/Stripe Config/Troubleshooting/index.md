# Troubleshooting

Common issues and solutions for Stripe configuration.

## Validation Errors

### "version is required"

**Error**:
```
Configuration validation failed: version is required
```

**Cause**: Missing or empty version field

**Solution**:
```json
{
  "version": "1.0.0",  // Add version field
  "products": [...]
}
```

---

### "price references undefined meter X"

**Error**:
```
Configuration validation failed: price basic_monthly references undefined meter api_calls
```

**Cause**: Price references a meter that doesn't exist in the `meters` array

**Solution**:
```json
{
  "meters": [
    {
      "id": "api_calls",  // Define the meter first
      "display_name": "API Calls",
      "event_name": "api_call",
      "default_aggregation": { "formula": "sum" }
    }
  ],
  "products": [{
    "prices": [{
      "meter": "api_calls"  // Now it's defined
    }]
  }]
}
```

---

### "tiers_mode is required when billing_scheme is tiered"

**Error**:
```
Configuration validation failed: tiers_mode is required when billing_scheme is tiered
```

**Cause**: Tiered pricing without specifying `tiers_mode`

**Solution**:
```json
{
  "billing_scheme": "tiered",
  "tiers_mode": "graduated",  // Add this field
  "tiers": [...]
}
```

---

### "meter is required for metered pricing"

**Error**:
```
Configuration validation failed: meter is required for metered pricing
```

**Cause**: `usage_type: "metered"` without specifying which meter to use

**Solution**:
```json
{
  "usage_type": "metered",
  "meter": "api_requests",  // Add meter reference
  "interval": "month"
}
```

---

### "currency must be a 3-character ISO code"

**Error**:
```
Configuration validation failed: currency must be a 3-character ISO code
```

**Cause**: Invalid currency code (wrong length or format)

**Solutions**:

❌ **Wrong**:
```json
{
  "currency": "USD"  // Uppercase
}
```

❌ **Wrong**:
```json
{
  "currency": "us"  // Too short
}
```

✅ **Correct**:
```json
{
  "currency": "usd"  // Lowercase, 3 letters
}
```

---

### "amount must not be set for tiered pricing"

**Error**:
```
Configuration validation failed: amount must not be set for tiered pricing
```

**Cause**: Including `amount` field with tiered pricing

**Solution**:

❌ **Wrong**:
```json
{
  "amount": 999,  // Remove this
  "billing_scheme": "tiered",
  "tiers": [...]
}
```

✅ **Correct**:
```json
{
  "billing_scheme": "tiered",
  "tiers": [...]  // Amount defined by tiers
}
```

---

### "tiers are required when billing_scheme is tiered"

**Error**:
```
Configuration validation failed: tiers are required when billing_scheme is tiered
```

**Cause**: Tiered pricing without tiers array

**Solution**:
```json
{
  "billing_scheme": "tiered",
  "tiers_mode": "graduated",
  "tiers": [  // Add tiers array
    {
      "up_to": 1000,
      "unit_amount": 10,
      "flat_amount": null
    },
    {
      "up_to": "inf",
      "unit_amount": 8,
      "flat_amount": null
    }
  ]
}
```

---

### "interval is required for metered pricing"

**Error**:
```
Configuration validation failed: interval is required for metered pricing
```

**Cause**: Metered pricing without billing interval

**Solution**:
```json
{
  "usage_type": "metered",
  "meter": "api_calls",
  "interval": "month"  // Add interval
}
```

---

## Configuration Issues

### Configuration Won't Update

**Symptom**: Changes aren't reflected in Stripe

**Possible Causes**:

1. **Configuration unchanged**
   - Check response message for "no change was made"
   - System detected identical configuration
   - Solution: Make actual changes to products/prices

2. **Validation errors not shown**
   - Check for `errors` array in response
   - Review error messages carefully
   - Solution: Fix validation errors before redeploying

3. **Deployment not triggered**
   - Ensure file is saved
   - Verify deployment process ran
   - Check deployment logs

---

### Products Not Created

**Symptom**: Products don't appear in Stripe dashboard

**Possible Causes**:

1. **Free products**
   - Products with `id: "free"` are local-only
   - Solution: This is expected behavior

2. **Validation failed**
   - Check for validation errors
   - Review required fields
   - Solution: Fix errors and redeploy

3. **Stripe API error**
   - Check API response in logs
   - Verify Stripe API key is correct
   - Solution: Review Stripe dashboard for details

---

### Prices Not Created

**Symptom**: Prices missing from Stripe products

**Possible Causes**:

1. **Meter not created first**
   - Meters must exist before prices referencing them
   - Solution: Check meter creation succeeded

2. **Invalid tier configuration**
   - Last tier must use `"inf"`
   - All required tier fields must be present
   - Solution: Review tier structure

3. **Product creation failed**
   - Prices can't be created if product failed
   - Solution: Fix product issues first

---

## Metered Billing Issues

### Meters Not Working with Prices

**Symptom**: Meter-based prices not tracking usage

**Diagnosis Steps**:

1. **Check meter exists**:
   ```json
   {
     "meters": [
       {
         "id": "api_requests",  // Must be defined
         ...
       }
     ]
   }
   ```

2. **Verify meter ID matches**:
   ```json
   {
     "prices": [{
       "meter": "api_requests"  // Must match meter.id exactly
     }]
   }
   ```

3. **Confirm meter has Stripe ID**:
   - Check GET `/api/v1/stripe/config` response
   - Meter should have `stripe_id` field populated
   - If missing, meter creation failed

**Solutions**:

- Ensure meter exists in `meters` array
- Verify exact ID match (case-sensitive)
- Check meter was created successfully
- Review meter validation errors

---

### Usage Not Tracked

**Symptom**: Usage events not showing in Stripe

**Possible Causes**:

1. **Wrong event name**
   - Must match meter's `event_name` exactly
   - Solution: Verify event name in code matches config

2. **Wrong aggregation formula**
   - `sum`: Total all values
   - `count`: Count events
   - `last`: Use latest value
   - Solution: Choose appropriate formula for use case

3. **Customer mapping issues**
   - Default expects `stripe_customer_id` in event
   - Solution: Include correct customer ID in events

---

## Tiered Pricing Issues

### Charges Don't Match Expected Calculations

**Symptom**: Bills don't match tier calculations

**Diagnosis**:

1. **Check tiers_mode**:
   - `graduated`: Each tier applies to its portion
   - `volume`: Entire usage charged at one tier

2. **Verify tier boundaries**:
   - Ensure no gaps in tier ranges
   - Last tier must be `"inf"`

3. **Review tier amounts**:
   - Check `unit_amount` and `flat_amount`
   - Amounts are in smallest currency unit (cents)

**Example Calculation**:

**Graduated** (5,000 units):
```json
{
  "tiers_mode": "graduated",
  "tiers": [
    { "up_to": 1000, "unit_amount": 10 },
    { "up_to": "inf", "unit_amount": 8 }
  ]
}
```
- 1,000 × $0.10 = $100
- 4,000 × $0.08 = $320
- **Total: $420**

**Volume** (5,000 units):
```json
{
  "tiers_mode": "volume",
  "tiers": [
    { "up_to": 1000, "unit_amount": 10 },
    { "up_to": "inf", "unit_amount": 8 }
  ]
}
```
- Falls in tier 2
- 5,000 × $0.08 = $400
- **Total: $400**

---

### Missing "inf" in Last Tier

**Error**:
```
Configuration validation failed: last tier must use "inf"
```

**Cause**: Last tier has numeric `up_to` value

**Solution**:

❌ **Wrong**:
```json
{
  "tiers": [
    { "up_to": 1000, "unit_amount": 10 },
    { "up_to": 10000, "unit_amount": 8 }  // No "inf"
  ]
}
```

✅ **Correct**:
```json
{
  "tiers": [
    { "up_to": 1000, "unit_amount": 10 },
    { "up_to": "inf", "unit_amount": 8 }  // Last tier is "inf"
  ]
}
```

---

## Archiving Issues

### Products Won't Archive

**Symptom**: Products remain active after removal from config

**Possible Causes**:

1. **Active subscriptions exist**
   - Stripe doesn't allow deleting products with active subscriptions
   - Products are marked inactive but not deleted
   - Solution: This is expected Stripe behavior

2. **Price archiving failed**
   - Prices must be archived before products
   - Solution: Check price archival logs

3. **Stripe API error**
   - Network issues
   - API rate limits
   - Solution: Retry or check Stripe status

---

### Prices Won't Archive

**Symptom**: Prices remain active in Stripe

**Possible Causes**:

1. **Active subscriptions**
   - Prices with active subscriptions can't be deleted
   - Marked inactive but not deleted
   - Solution: Expected behavior for prices in use

2. **ID mapping not found**
   - System can't find Stripe ID for config ID
   - Solution: Check ID mappings in database

---

## Database Issues

### ID Mapping Not Found

**Symptom**: "Failed to find Stripe ID for config item X"

**Cause**: Mapping doesn't exist in database

**Solutions**:

1. **Item never created**
   - Check if initial creation succeeded
   - Review creation logs
   - Recreate if necessary

2. **Database connection lost**
   - Verify database is accessible
   - Check connection settings
   - Reconnect and retry

3. **Manual Stripe changes**
   - If resources created manually in Stripe
   - They won't have config ID mappings
   - Solution: Use `/pull` to import existing resources

---

### Configuration History Missing

**Symptom**: No previous versions in history

**Cause**: First deployment or database reset

**Solution**: This is normal for first deployment

---

## JSON Syntax Errors

### Trailing Commas

**Error**:
```
Invalid JSON format: unexpected token
```

**Cause**: Trailing comma in JSON

**Solution**:

❌ **Wrong**:
```json
{
  "version": "1.0.0",
  "products": [],  // Trailing comma
}
```

✅ **Correct**:
```json
{
  "version": "1.0.0",
  "products": []  // No trailing comma
}
```

---

### Missing Quotes

**Error**:
```
Invalid JSON format: expected string
```

**Cause**: Missing quotes around strings

**Solution**:

❌ **Wrong**:
```json
{
  "version": 1.0.0  // Not quoted
}
```

✅ **Correct**:
```json
{
  "version": "1.0.0"  // Properly quoted
}
```

---

### Comments in JSON

**Error**:
```
Invalid JSON format: unexpected token
```

**Cause**: JSON doesn't support comments

**Solution**:

❌ **Wrong**:
```json
{
  "version": "1.0.0",  // This is a comment
  "products": []
}
```

✅ **Correct**:
```json
{
  "version": "1.0.0",
  "products": []
}
```

Use git commit messages for documentation instead.

---

## Testing Strategies

### Validate Before Deploying

**Use validation endpoint**:
```bash
# In your CI/CD pipeline
curl -X POST https://your-api.com/api/v1/stripe/config/validate \
  -H "Content-Type: application/json" \
  -d @omnibase/stripe.config.json
```

### Test in Staging First

1. Deploy to staging environment
2. Verify products/prices created correctly
3. Test with test Stripe account
4. Review changes before production

### Use Test Mode

- Stripe test mode for development
- Live mode only for production
- Keep configurations separate

---

## Getting Help

### Check Logs

Review application logs for detailed error messages:
- Validation errors
- Stripe API responses
- Database connection issues

### Stripe Dashboard

1. Log into Stripe Dashboard
2. Check Products section
3. Review API logs
4. Verify webhooks (if applicable)

### Configuration Pull

Pull current Stripe state to see what exists:
```bash
# Use API endpoint to pull current config
GET /api/v1/stripe/config/pull
```

This shows:
- All active products
- All active prices
- All active meters
- Current configuration in JSON format

### Database Inspection

Check ID mappings table:
```sql
SELECT * FROM stripe.stripe_id_mappings
WHERE config_item_id = 'your_item_id';
```

---

## Common Patterns

### Debugging Workflow

1. **Check validation**
   - Review error messages
   - Fix JSON syntax
   - Verify required fields

2. **Review configuration**
   - Compare with working examples
   - Check field types and values
   - Verify references (meters, products)

3. **Test incrementally**
   - Start with simple config
   - Add complexity gradually
   - Test each addition

4. **Check Stripe**
   - Verify items in dashboard
   - Review API logs
   - Confirm webhooks working

5. **Database verification**
   - Check ID mappings exist
   - Verify configuration stored
   - Review version history

---

## Quick Reference

### Validation Checklist

Before deploying, verify:
- [ ] Version number is valid semantic version
- [ ] All product IDs are unique
- [ ] All price IDs are unique
- [ ] All meter IDs are unique
- [ ] Meters defined before being referenced
- [ ] Currency codes are lowercase 3-letter ISO
- [ ] Tiered prices have `tiers_mode` and `tiers`
- [ ] Last tier uses `"inf"`
- [ ] Metered prices have `interval` and `meter`
- [ ] No trailing commas in JSON
- [ ] All strings properly quoted
- [ ] No comments in JSON

### Common Fixes

| Issue | Fix |
|-------|-----|
| Missing version | Add `"version": "1.0.0"` |
| Undefined meter | Add meter to `meters` array |
| Missing tiers_mode | Add `"tiers_mode": "graduated"` or `"volume"` |
| No "inf" tier | Change last tier to `"up_to": "inf"` |
| Wrong currency | Use lowercase: `"usd"` not `"USD"` |
| Amount in tiered price | Remove `amount` field |
| Metered without interval | Add `"interval": "month"` |
| Metered without meter | Add `"meter": "meter_id"` |