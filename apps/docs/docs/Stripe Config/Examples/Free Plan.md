# Free Plan

Local-only plan that doesn't create Stripe resources:

```json
{
  "version": "1.0.0",
  "products": [
    {
      "id": "free",
      "name": "Free Plan",
      "description": "Get started for free",
      "type": "service",
      "prices": [
        {
          "id": "free",
          "amount": 0,
          "currency": "usd"
        }
      ]
    },
    {
      "id": "paid_plan",
      "name": "Paid Plan",
      "description": "Unlock premium features",
      "type": "service",
      "prices": [
        {
          "id": "paid_monthly",
          "amount": 1999,
          "currency": "usd",
          "interval": "month"
        }
      ]
    }
  ]
}
```

The "free" product and price:
- Are stored in your database
- Are tracked in ID mappings
- Are **not** created in Stripe
- Can be used in your application logic