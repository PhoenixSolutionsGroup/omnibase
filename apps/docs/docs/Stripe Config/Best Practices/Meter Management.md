# Meter Management

## 1. Define Meters First

Always define meters before referencing in prices:

✅ **Correct**:
```json
{
  "meters": [
    {
      "id": "api_calls",
      "display_name": "API Calls",
      "event_name": "api_call",
      "default_aggregation": { "formula": "sum" }
    }
  ],
  "products": [
    {
      "id": "usage_plan",
      "prices": [{
        "meter": "api_calls"  // References defined meter
      }]
    }
  ]
}
```

❌ **Wrong**:
```json
{
  "products": [
    {
      "prices": [{
        "meter": "api_calls"  // ERROR: Undefined meter
      }]
    }
  ]
  // meters array missing 
}
```

## 2. Immutable Meters

Meters cannot be updated once created, only deactivated:

❌ **Cannot do this**:
```json
// Version 1.0.0
{
  "meters": [{
    "id": "api_calls",
    "default_aggregation": { "formula": "sum" }
  }]
}

// Version 1.1.0
{
  "meters": [{
    "id": "api_calls",
    "default_aggregation": { "formula": "count" }  // ERROR: Can't change formula
  }]
}
```

✅ **Instead, create a new meter**:
```json
{
  "meters": [
    {
      "id": "api_calls_v2",  // New meter
      "default_aggregation": { "formula": "count" }
    }
  ]
}
```

## 3. Consistent Event Names

Use clear, descriptive event names:

✅ **Good**:
```json
{
  "event_name": "api_request_processed"
}
```

❌ **Avoid**:
```json
{
  "event_name": "evt1"  // Unclear
}
```

## 4. Choose Aggregation Carefully

Select the right formula for your use case:

| Formula | Use Case | Example |
|---------|----------|---------|
| `sum` | Total usage | API requests, bandwidth, compute time |
| `count` | Number of events | Transactions, deployments, builds |
| `last` | Current state | Storage used, seats occupied |