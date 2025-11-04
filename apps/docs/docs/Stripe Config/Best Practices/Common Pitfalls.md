# Common Pitfalls

## 1. Forgetting Meter Definitions

❌ **Error**:
```json
{
  "products": [{
    "prices": [{
      "meter": "api_calls"  // Undefined
    }]
  }]
}
```

✅ **Fix**:
```json
{
  "meters": [{
    "id": "api_calls",
    ...
  }],
  "products": [...]
}
```

## 2. Missing Required Fields

❌ **Error**:
```json
{
  "prices": [{
    "billing_scheme": "tiered"
    // Missing tiers_mode and tiers
  }]
}
```

✅ **Fix**:
```json
{
  "prices": [{
    "billing_scheme": "tiered",
    "tiers_mode": "graduated",
    "tiers": [...]
  }]
}
```

## 3. Incorrect Tier Structure

❌ **Error**:
```json
{
  "tiers": [
    { "up_to": 1000, "unit_amount": 10 }
    // Missing "inf" tier
  ]
}
```

✅ **Fix**:
```json
{
  "tiers": [
    { "up_to": 1000, "unit_amount": 10 },
    { "up_to": "inf", "unit_amount": 8 }
  ]
}
```

## 4. Amount in Tiered Pricing

❌ **Error**:
```json
{
  "amount": 999,  // Not allowed with tiered
  "billing_scheme": "tiered",
  "tiers": [...]
}
```

✅ **Fix**:
```json
{
  "billing_scheme": "tiered",
  "tiers": [...]
  // No amount field
}