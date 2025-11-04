# Custom Billing Intervals

Custom billing interval using `interval_count`:

```json
{
  "version": "1.0.0",
  "products": [
    {
      "id": "quarterly_plan",
      "name": "Quarterly Plan",
      "description": "Billed every 3 months",
      "type": "service",
      "prices": [
        {
          "id": "quarterly_price",
          "amount": 8999,
          "currency": "usd",
          "interval": "month",
          "interval_count": 3
        }
      ]
    }
  ]
}
```

This bills $89.99 every 3 months.

## Other Examples

You can create any custom billing interval by combining `interval` and `interval_count`:

- **Quarterly**: `"interval": "month", "interval_count": 3`
- **Semi-annual**: `"interval": "month", "interval_count": 6`
- **Bi-weekly**: `"interval": "week", "interval_count": 2`
- **Every 2 years**: `"interval": "year", "interval_count": 2`