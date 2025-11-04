# Pricing Strategies

## 1. Tiered Pricing

**Graduated** vs **Volume**:

**Use Graduated** for incremental discounts:
```json
{
  "tiers_mode": "graduated",
  "tiers": [
    { "up_to": 1000, "unit_amount": 10 },
    { "up_to": "inf", "unit_amount": 8 }
  ]
}
```
- First 1,000 units @ $0.10
- Additional units @ $0.08
- Usage of 2,000 = (1,000 × $0.10) + (1,000 × $0.08) = $180

**Use Volume** for all-or-nothing pricing:
```json
{
  "tiers_mode": "volume",
  "tiers": [
    { "up_to": 1000, "unit_amount": 10 },
    { "up_to": "inf", "unit_amount": 8 }
  ]
}
```
- Usage of 2,000 falls in tier 2
- All units @ $0.08
- Total = 2,000 × $0.08 = $160

## 2. Default Prices

Mark one price as default per product:

```json
{
  "prices": [
    {
      "id": "monthly",
      "amount": 999,
      "interval": "month",
      "default": true  // Recommended option
    },
    {
      "id": "yearly",
      "amount": 9999,
      "interval": "year"
    }
  ]
}
```

## 3. UI Configuration

Add UI metadata for better customer-facing displays:

```json
{
  "ui": {
    "display_name": "Professional",
    "tagline": "For growing businesses",
    "features": [
      "Unlimited team members",
      "Priority support",
      "Advanced analytics"
    ],
    "badge": "Most Popular",
    "highlighted": true,
    "sort_order": 2
  }
}