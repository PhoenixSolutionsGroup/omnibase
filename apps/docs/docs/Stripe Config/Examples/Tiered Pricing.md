# Tiered Pricing

Volume discounts where each tier applies to its portion:

```json
{
  "version": "1.3.0",
  "meters": [
    {
      "id": "bandwidth_usage",
      "display_name": "Bandwidth Usage (GB)",
      "event_name": "bandwidth_transfer",
      "default_aggregation": {
        "formula": "sum"
      }
    },
    {
      "id": "api_calls",
      "display_name": "API Calls",
      "event_name": "api_call",
      "default_aggregation": {
        "formula": "sum"
      }
    }
  ],
  "products": [
    {
      "id": "bandwidth_usage",
      "name": "Bandwidth Usage",
      "description": "Tiered pricing for data transfer with volume discounts",
      "type": "service",
      "prices": [
        {
          "id": "bandwidth_tiered",
          "currency": "usd",
          "interval": "month",
          "usage_type": "metered",
          "meter": "bandwidth_usage",
          "billing_scheme": "tiered",
          "tiers_mode": "graduated",
          "tiers": [
            {
              "up_to": 1000,
              "unit_amount": 10,
              "flat_amount": null
            },
            {
              "up_to": 10000,
              "unit_amount": 8,
              "flat_amount": null
            },
            {
              "up_to": 100000,
              "unit_amount": 6,
              "flat_amount": null
            },
            {
              "up_to": "inf",
              "unit_amount": 4,
              "flat_amount": null
            }
          ]
        }
      ]
    },
    {
      "id": "api_calls_tiered",
      "name": "API Calls with Volume Pricing",
      "description": "Graduated pricing tiers for API usage",
      "type": "service",
      "prices": [
        {
          "id": "api_graduated",
          "currency": "usd",
          "interval": "month",
          "usage_type": "metered",
          "meter": "api_calls",
          "billing_scheme": "tiered",
          "tiers_mode": "volume",
          "tiers": [
            {
              "up_to": 1000,
              "unit_amount": 5,
              "flat_amount": 500
            },
            {
              "up_to": 10000,
              "unit_amount": 3,
              "flat_amount": null
            },
            {
              "up_to": 50000,
              "unit_amount": 2,
              "flat_amount": null
            },
            {
              "up_to": "inf",
              "unit_amount": 1,
              "flat_amount": null
            }
          ]
        }
      ]
    }
  ]
}
```

## Pricing Calculations

**Graduated Example**:
- Usage: 5,000 GB
- Tier 1 (0-1,000): 1,000 × $0.10 = $100
- Tier 2 (1,001-10,000): 4,000 × $0.08 = $320
- **Total: $420**

**Volume Example**:
- Usage: 5,000 calls
- Falls in tier 2 (1,001-10,000)
- **Total: 5,000 × $0.03 = $150**