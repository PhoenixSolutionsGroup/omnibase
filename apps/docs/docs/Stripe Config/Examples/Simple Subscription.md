# Simple Subscription

A basic monthly subscription plan:

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
- Product: "Basic Plan"
- Price: $9.99/month