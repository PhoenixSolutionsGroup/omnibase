# Complex Enterprise Pricing

Combining base subscription with usage-based add-ons:

```json
{
  "version": "2.0.0",
  "meters": [
    {
      "id": "analytics_events",
      "display_name": "Analytics Events",
      "event_name": "analytics_event",
      "default_aggregation": {
        "formula": "sum"
      }
    }
  ],
  "products": [
    {
      "id": "enterprise_platform",
      "name": "Enterprise Platform",
      "description": "Complete enterprise solution with base subscription",
      "type": "service",
      "prices": [
        {
          "id": "enterprise_base_monthly",
          "amount": 49999,
          "currency": "usd",
          "interval": "month"
        },
        {
          "id": "enterprise_base_yearly",
          "amount": 499999,
          "currency": "usd",
          "interval": "year"
        }
      ]
    },
    {
      "id": "advanced_analytics",
      "name": "Advanced Analytics Module",
      "description": "AI-powered analytics with tiered usage pricing",
      "type": "service",
      "prices": [
        {
          "id": "analytics_events_tiered",
          "currency": "usd",
          "interval": "month",
          "usage_type": "metered",
          "meter": "analytics_events",
          "billing_scheme": "tiered",
          "tiers_mode": "graduated",
          "tiers": [
            {
              "up_to": 10000,
              "unit_amount": 3,
              "flat_amount": 1000
            },
            {
              "up_to": 100000,
              "unit_amount": 2,
              "flat_amount": null
            },
            {
              "up_to": 1000000,
              "unit_amount": 1,
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
    },
    {
      "id": "support_addon",
      "name": "Premium Support",
      "description": "24/7 enterprise support with SLA guarantees",
      "type": "service",
      "prices": [
        {
          "id": "support_monthly",
          "amount": 9999,
          "currency": "usd",
          "interval": "month",
          "interval_count": 1
        },
        {
          "id": "support_quarterly",
          "amount": 26999,
          "currency": "usd",
          "interval": "month",
          "interval_count": 3
        }
      ]
    }
  ]
}
```

This creates:
- Base platform subscription ($499.99/month or $4,999.99/year)
- Usage-based analytics add-on with tiered pricing
- Support add-on with monthly or quarterly billing