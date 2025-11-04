# Metered Billing

Pay-per-use pricing with usage tracking:

```json
{
  "version": "1.2.0",
  "meters": [
    {
      "id": "api_requests",
      "display_name": "API Requests",
      "event_name": "api_request",
      "default_aggregation": {
        "formula": "sum"
      }
    },
    {
      "id": "storage_gb",
      "display_name": "Storage (GB)",
      "event_name": "storage_usage",
      "default_aggregation": {
        "formula": "last"
      }
    },
    {
      "id": "compute_minutes",
      "display_name": "Compute Minutes",
      "event_name": "compute_usage",
      "default_aggregation": {
        "formula": "sum"
      }
    }
  ],
  "products": [
    {
      "id": "api_usage",
      "name": "API Usage",
      "description": "Pay-per-use API access with metered billing",
      "type": "service",
      "prices": [
        {
          "id": "api_per_request",
          "amount": 10,
          "currency": "usd",
          "interval": "month",
          "usage_type": "metered",
          "meter": "api_requests",
          "billing_scheme": "per_unit"
        }
      ]
    },
    {
      "id": "storage_service",
      "name": "Cloud Storage",
      "description": "Scalable storage with usage-based pricing",
      "type": "service",
      "prices": [
        {
          "id": "storage_gb_monthly",
          "amount": 50,
          "currency": "usd",
          "interval": "month",
          "usage_type": "metered",
          "meter": "storage_gb",
          "billing_scheme": "per_unit"
        }
      ]
    },
    {
      "id": "compute_hours",
      "name": "Compute Hours",
      "description": "Pay for actual compute time used",
      "type": "service",
      "prices": [
        {
          "id": "compute_hour_rate",
          "amount": 25,
          "currency": "usd",
          "interval": "month",
          "usage_type": "metered",
          "meter": "compute_minutes",
          "billing_scheme": "per_unit"
        }
      ]
    }
  ]
}
```

This creates:
- 3 meters for tracking usage
- 3 products with metered pricing
- Charges based on actual usage