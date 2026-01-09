# Stripe Config Service - K6 Integration Test Plan

This document provides complete context for implementing k6 integration tests for the Stripe Config service. These tests ensure the Stripe configuration management system works correctly before implementing coupon/promo code features.

## Table of Contents

1. [Overview](#overview)
2. [Architecture Context](#architecture-context)
3. [API Endpoints](#api-endpoints)
4. [SDK Client Reference](#sdk-client-reference)
5. [Test Configuration Examples](#test-configuration-examples)
6. [Test File Structure](#test-file-structure)
7. [Test Specifications](#test-specifications)
8. [Patterns and Conventions](#patterns-and-conventions)

---

## Overview

### Purpose

Port existing Go integration tests from `apps/api/tests/integration/stripe_config_test.go` to k6, and add comprehensive new tests covering all Stripe config service functionality.

### Test Environment

- **Framework**: k6 (TypeScript)
- **Base URL**: `http://localhost:8080` (configurable via `API_URL` env var)
- **Auth**: Service key header (`X-Service-Key`)
- **Stripe**: Uses real Stripe test mode API (requires `STRIPE_SECRET_KEY` env var)

### Key Files

| File | Description |
|------|-------------|
| `tests/api/k6/client.ts` | k6 client factory and helpers |
| `tests/api/k6/sdk.ts` | Auto-generated SDK with typed methods |
| `apps/api/test_configs/*.json` | Test configuration fixtures |
| `apps/api/tests/integration/stripe_config_test.go` | Deprecated Go tests (reference) |

---

## Architecture Context

### Stripe Config Service Components

```
apps/api/internal/service/v1/stripe_config/
├── service.go          # Main service orchestrator
├── validator.go        # Config validation rules
├── differ.go           # Diff calculation between configs
└── handlers/
    ├── config_handler.go   # Orchestrates create/update/archive
    ├── product_handler.go  # Product CRUD with Stripe API
    ├── price_handler.go    # Price CRUD with Stripe API
    └── meter_handler.go    # Meter CRUD with Stripe API
```

### Data Flow

1. **POST /stripe/admin/config** receives JSON config
2. **Validator** parses and validates structure
3. **Differ** calculates changes from previous config
4. **Handlers** apply changes to Stripe API
5. **ID Mapper** stores config_id → stripe_id mappings
6. **Response** returns changes made

### Key Concepts

- **Config ID**: Human-readable ID in config (e.g., `basic_monthly`)
- **Stripe ID**: Actual Stripe resource ID (e.g., `price_1ABC...`)
- **ID Mapping**: Database table linking config IDs to Stripe IDs
- **Immutable Resources**: Prices in Stripe are immutable - changes require archive + create new
- **Free Tier**: Products/prices with ID `free` are local-only (no Stripe API calls)

---

## API Endpoints

### Config Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/stripe/schema` | Get JSON schema for config validation |
| `GET` | `/api/v1/stripe/config` | Get public config (filtered prices) |
| `GET` | `/api/v1/stripe/admin/config` | Get full config (all prices) |
| `POST` | `/api/v1/stripe/admin/config` | Create/update config |
| `POST` | `/api/v1/stripe/admin/config/validate` | Validate config without saving |
| `GET` | `/api/v1/stripe/admin/config/pull` | Pull config from Stripe API |
| `POST` | `/api/v1/stripe/admin/config/archive-all` | Archive all Stripe resources |
| `GET` | `/api/v1/stripe/admin/config/history` | Paginated config history |

### Resource Lookups

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/stripe/config/prices/:price_id` | Get price by config ID |
| `GET` | `/api/v1/stripe/config/products/:product_id` | Get product by config ID |
| `GET` | `/api/v1/stripe/config/meters/:meter_id` | Get meter by config ID |
| `GET` | `/api/v1/stripe/convert/stripe-id/:stripe_id` | Convert Stripe ID to config ID |

### Webhooks

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/stripe/config/webhooks` | Configure webhook endpoints |
| `GET` | `/api/v1/stripe/config/webhook` | Get webhook secret |

---

## SDK Client Reference

### Creating a Client

```typescript
import { createClient, logError } from "../client";

const client = createClient();
// Or with custom headers:
const client = createClient({ "X-Custom-Header": "value" });
```

### Available Methods

```typescript
// Config CRUD
client.getStripeConfigSchema()
client.getStripeConfig()
client.getStripeConfigAdmin()
client.updateStripeConfig(configData)
client.validateStripeConfig(configData)
client.pullStripeConfig()
client.archiveAllStripeConfig()
client.getStripeConfigHistory({ limit: 10, offset: 0 })

// Resource Lookups
client.getPriceByID(priceId)
client.getProductByID(productId)
client.getMeterByID(meterId)
client.convertStripeIDToConfigID(stripeId)

// Webhooks
client.configureWebhooks({ webhooks: [...] })
client.getWebhookSecret()
```

### Response Structure

All responses follow this pattern:

```typescript
const result = client.updateStripeConfig(config);

// result.response - k6 Response object (raw)
// result.data - Typed response object with status and data (PREFERRED)

// IMPORTANT: Use result.data for type safety, NOT result.response
// result.data includes:
// - status: HTTP status code
// - data: The actual response payload (typed)
// - error: Error message if failed

// Success response structure:
{
  "status": 200,
  "success": true,
  "data": { ... }
}

// Error response structure:
{
  "status": 400,
  "success": false,
  "error": "Error message"
}
```

### Error Logging

```typescript
import { logError } from "../client";

if (result.data.status !== 200) {
  logError("updateStripeConfig", result.response);
  return;
}
```

---

## Test Configuration Examples

### Simple Basic Config

```json
{
  "version": "v1.0.0",
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

### Metered Billing Config

```json
{
  "version": "v1.2.0",
  "meters": [
    {
      "id": "api_requests",
      "display_name": "API Requests",
      "event_name": "api_request",
      "default_aggregation": {
        "formula": "sum"
      }
    }
  ],
  "products": [
    {
      "id": "api_usage",
      "name": "API Usage",
      "description": "Pay-per-use API access",
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
    }
  ]
}
```

### Tiered Pricing Config

```json
{
  "version": "v1.3.0",
  "meters": [
    {
      "id": "bandwidth_usage",
      "display_name": "Bandwidth Usage (GB)",
      "event_name": "bandwidth_transfer",
      "default_aggregation": {
        "formula": "sum"
      }
    }
  ],
  "products": [
    {
      "id": "bandwidth_product",
      "name": "Bandwidth Usage",
      "description": "Tiered pricing for data transfer",
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
            { "up_to": 1000, "unit_amount": 10, "flat_amount": null },
            { "up_to": 10000, "unit_amount": 8, "flat_amount": null },
            { "up_to": "inf", "unit_amount": 4, "flat_amount": null }
          ]
        }
      ]
    }
  ]
}
```

### Config with Enterprise/Private Prices

```json
{
  "version": "v1.0.0",
  "products": [
    {
      "id": "pro_plan",
      "name": "Pro Plan",
      "type": "service",
      "prices": [
        {
          "id": "pro_monthly",
          "amount": 4999,
          "currency": "usd",
          "interval": "month",
          "public": true
        },
        {
          "id": "pro_monthly_enterprise",
          "amount": 3999,
          "currency": "usd",
          "interval": "month",
          "public": false,
          "enterprise_template": "tier1_discount"
        }
      ]
    }
  ]
}
```

---

## Test File Structure

Create the following files in `tests/api/k6/stripe-config/`:

```
stripe-config/
├── TEST_PLAN.md              # This document
├── index.ts                  # Export all test functions
├── 01-crud.ts                # Basic CRUD lifecycle tests
├── 02-meters.ts              # Meter-specific tests
├── 03-validation.ts          # Validation error tests
├── 04-differ.ts              # Diff/change detection tests
├── 05-id-mapping.ts          # ID resolution tests
├── 06-admin.ts               # Admin endpoint tests
├── 07-lookups.ts             # Resource lookup tests
├── 08-tiered.ts              # Tiered pricing tests
└── fixtures/                 # Test config JSON files
    ├── simple.json
    ├── with-meters.json
    ├── tiered.json
    └── update-*.json
```

---

## Test Specifications

### 01-crud.ts - Basic CRUD Lifecycle

**Purpose**: Test create, read, update, archive operations for configs.

#### Test Functions

```typescript
// Port from Go tests
export async function createSimpleConfig()
export async function getConfigAfterCreate()
export async function archiveAllConfig()
export async function verifyEmptyAfterArchive()

// New tests
export async function updateProductName()
export async function updateProductDescription()
export async function addNewProduct()
export async function removeProduct()
export async function addNewPrice()
export async function removePrice()
export async function idempotentConfigPush()
```

#### Test: createSimpleConfig

```typescript
/**
 * Create a simple config with one product and one price.
 *
 * Steps:
 * 1. Archive all existing config (clean slate)
 * 2. POST simple config
 * 3. Verify 200 response
 * 4. Verify changes.created includes product
 * 5. Verify response.config matches input
 */
export async function createSimpleConfig() {
  const client = createClient();

  // Clean slate
  client.archiveAllStripeConfig();

  const config = {
    version: "v1.0.0",
    products: [{
      id: "test_product",
      name: "Test Product",
      type: "service",
      prices: [{
        id: "test_price",
        amount: 1000,
        currency: "usd",
        interval: "month"
      }]
    }]
  };

  const result = client.updateStripeConfig(config);

  check(result.data, {
    "create config: status is 200": (d) => d.status === 200,
    "create config: has changes.created": (d) => {
      return d.data?.changes?.created?.length > 0;
    },
    "create config: product was created": (d) => {
      const created = d.data?.changes?.created || [];
      return created.some(p => p.product_id === "test_product");
    }
  });

  // Cleanup
  client.archiveAllStripeConfig();
}
```

#### Test: updateProductName

```typescript
/**
 * Update a product's name (mutable field).
 * Should update in-place, not recreate.
 *
 * Steps:
 * 1. Create config with product
 * 2. Update same config with new product name
 * 3. Verify changes.updated includes product
 * 4. Verify action is "updated" not "recreated"
 * 5. GET config and verify name changed
 */
export async function updateProductName() {
  const client = createClient();
  client.archiveAllStripeConfig();

  // Create initial
  const config1 = {
    version: "v1.0.0",
    products: [{
      id: "test_product",
      name: "Original Name",
      type: "service",
      prices: [{ id: "test_price", amount: 1000, currency: "usd", interval: "month" }]
    }]
  };
  client.updateStripeConfig(config1);

  // Update name
  const config2 = {
    version: "v1.0.1",
    products: [{
      id: "test_product",
      name: "Updated Name",
      type: "service",
      prices: [{ id: "test_price", amount: 1000, currency: "usd", interval: "month" }]
    }]
  };
  const result = client.updateStripeConfig(config2);

  check(result.data, {
    "update name: status is 200": (d) => d.status === 200,
    "update name: has changes.updated": (d) => {
      return d.data?.changes?.updated?.length > 0;
    },
    "update name: action is updated": (d) => {
      const updated = d.data?.changes?.updated || [];
      return updated.some(p => p.action === "updated");
    }
  });

  // Verify via GET
  const getResult = client.getStripeConfigAdmin();
  check(getResult.data, {
    "update name: GET shows new name": (d) => {
      return d.data?.config?.products?.[0]?.name === "Updated Name";
    }
  });

  client.archiveAllStripeConfig();
}
```

#### Test: idempotentConfigPush

```typescript
/**
 * Pushing identical config twice should return "no change was made".
 *
 * Steps:
 * 1. Create config
 * 2. Push exact same config again
 * 3. Verify response message is "no change was made"
 * 4. Verify no changes in response
 */
export async function idempotentConfigPush() {
  const client = createClient();
  client.archiveAllStripeConfig();

  const config = {
    version: "v1.0.0",
    products: [{
      id: "test_product",
      name: "Test Product",
      type: "service",
      prices: [{ id: "test_price", amount: 1000, currency: "usd", interval: "month" }]
    }]
  };

  // First push
  client.updateStripeConfig(config);

  // Second push (identical)
  const result = client.updateStripeConfig(config);

  check(result.data, {
    "idempotent: status is 200": (d) => d.status === 200,
    "idempotent: message is no change": (d) => {
      return d.data?.message === "no change was made";
    }
  });

  client.archiveAllStripeConfig();
}
```

---

### 02-meters.ts - Meter Tests

**Purpose**: Test billing meter CRUD and meter-price associations.

#### Test Functions

```typescript
export async function createConfigWithMeters()
export async function verifyMeterHasStripeID()
export async function verifyMeteredPriceReferencesCorrectMeter()
export async function removeMeter()
export async function meterValidationErrors()
```

#### Test: createConfigWithMeters

```typescript
/**
 * Create config with meters and metered prices.
 *
 * Steps:
 * 1. Create config with meter and metered price
 * 2. Verify meter in changes.meters.created
 * 3. Verify meter has stripe_id populated
 * 4. GET config and verify meter structure
 */
export async function createConfigWithMeters() {
  const client = createClient();
  client.archiveAllStripeConfig();

  const config = {
    version: "v1.0.0",
    meters: [{
      id: "api_calls",
      display_name: "API Calls",
      event_name: "api_call_event",
      default_aggregation: { formula: "sum" }
    }],
    products: [{
      id: "api_product",
      name: "API Usage",
      type: "service",
      prices: [{
        id: "api_price",
        amount: 10,
        currency: "usd",
        interval: "month",
        usage_type: "metered",
        meter: "api_calls",
        billing_scheme: "per_unit"
      }]
    }]
  };

  const result = client.updateStripeConfig(config);

  check(result.data, {
    "create meters: status is 200": (d) => d.status === 200,
    "create meters: meter was created": (d) => {
      return d.data?.changes?.meters?.created?.length > 0;
    },
    "create meters: meter has stripe_id": (d) => {
      const meters = d.data?.changes?.meters?.created || [];
      return meters[0]?.stripe_id?.startsWith("mtr_");
    }
  });

  client.archiveAllStripeConfig();
}
```

---

### 03-validation.ts - Validation Error Tests

**Purpose**: Verify validator rejects invalid configs with appropriate errors.

#### Test Functions

```typescript
// Product validation
export async function rejectMissingProductID()
export async function rejectMissingProductName()
export async function rejectProductWithNoPrices()

// Price validation
export async function rejectMissingPriceID()
export async function rejectNegativeAmount()
export async function rejectInvalidCurrency()
export async function rejectInvalidInterval()
export async function rejectMeteredWithoutInterval()
export async function rejectMeteredWithoutMeter()

// Tiered validation
export async function rejectTieredWithPerUnitScheme()
export async function rejectTieredWithoutTiersMode()
export async function rejectTieredWithoutTiers()
export async function rejectAmountOnTieredPrice()

// Meter validation
export async function rejectMissingMeterID()
export async function rejectMissingMeterDisplayName()
export async function rejectMissingMeterEventName()
export async function rejectInvalidAggregationFormula()
export async function rejectPriceReferencingNonExistentMeter()

// Config structure validation
export async function rejectMissingVersion()
export async function rejectMissingProducts()
```

#### Test: rejectMissingProductID

```typescript
/**
 * Config with product missing ID should return 400.
 */
export async function rejectMissingProductID() {
  const client = createClient();

  const config = {
    version: "v1.0.0",
    products: [{
      // id: missing
      name: "Test Product",
      type: "service",
      prices: [{ id: "test_price", amount: 1000, currency: "usd", interval: "month" }]
    }]
  };

  const result = client.updateStripeConfig(config);

  check(result.data, {
    "missing product ID: status is 400": (d) => d.status === 400,
    "missing product ID: error mentions product": (d) => {
      const error = d.error || "";
      return error.toLowerCase().includes("product") && error.toLowerCase().includes("id");
    }
  });
}
```

#### Test: rejectMeteredWithoutMeter

```typescript
/**
 * Metered price without meter reference should return 400.
 */
export async function rejectMeteredWithoutMeter() {
  const client = createClient();

  const config = {
    version: "v1.0.0",
    products: [{
      id: "test_product",
      name: "Test Product",
      type: "service",
      prices: [{
        id: "test_price",
        amount: 10,
        currency: "usd",
        interval: "month",
        usage_type: "metered",
        billing_scheme: "per_unit"
        // meter: missing
      }]
    }]
  };

  const result = client.updateStripeConfig(config);

  check(result.data, {
    "metered without meter: status is 400": (d) => d.status === 400,
    "metered without meter: error mentions meter": (d) => {
      const error = d.error || "";
      return error.toLowerCase().includes("meter");
    }
  });
}
```

#### Test: rejectPriceReferencingNonExistentMeter

```typescript
/**
 * Price referencing a meter that doesn't exist should return 400.
 */
export async function rejectPriceReferencingNonExistentMeter() {
  const client = createClient();

  const config = {
    version: "v1.0.0",
    meters: [], // No meters defined
    products: [{
      id: "test_product",
      name: "Test Product",
      type: "service",
      prices: [{
        id: "test_price",
        amount: 10,
        currency: "usd",
        interval: "month",
        usage_type: "metered",
        meter: "non_existent_meter", // References meter that doesn't exist
        billing_scheme: "per_unit"
      }]
    }]
  };

  const result = client.updateStripeConfig(config);

  check(result.data, {
    "non-existent meter ref: status is 400": (d) => d.status === 400,
    "non-existent meter ref: error mentions meter": (d) => {
      const error = d.error || "";
      return error.includes("non_existent_meter") || error.includes("undefined meter");
    }
  });
}
```

---

### 04-differ.ts - Diff/Change Detection Tests

**Purpose**: Verify the differ correctly identifies new, updated, and archived resources.

#### Test Functions

```typescript
export async function detectNewProduct()
export async function detectNewPrice()
export async function detectNewMeter()
export async function detectProductUpdate()
export async function detectProductTypeChange()
export async function detectRemovedProduct()
export async function detectRemovedPrice()
export async function detectRemovedMeter()
export async function priceAmountChangeTriggersRecreation()
export async function priceCurrencyChangeTriggersRecreation()
export async function priceIntervalChangeTriggersRecreation()
```

#### Test: detectNewProduct

```typescript
/**
 * Adding a new product to existing config should appear in changes.created.
 */
export async function detectNewProduct() {
  const client = createClient();
  client.archiveAllStripeConfig();

  // Create initial config with one product
  const config1 = {
    version: "v1.0.0",
    products: [{
      id: "product_a",
      name: "Product A",
      type: "service",
      prices: [{ id: "price_a", amount: 1000, currency: "usd", interval: "month" }]
    }]
  };
  client.updateStripeConfig(config1);

  // Add second product
  const config2 = {
    version: "v1.0.1",
    products: [
      {
        id: "product_a",
        name: "Product A",
        type: "service",
        prices: [{ id: "price_a", amount: 1000, currency: "usd", interval: "month" }]
      },
      {
        id: "product_b",
        name: "Product B",
        type: "service",
        prices: [{ id: "price_b", amount: 2000, currency: "usd", interval: "month" }]
      }
    ]
  };
  const result = client.updateStripeConfig(config2);

  check(result.data, {
    "detect new product: status is 200": (d) => d.status === 200,
    "detect new product: product_b in created": (d) => {
      const created = d.data?.changes?.created || [];
      return created.some(p => p.product_id === "product_b");
    },
    "detect new product: product_a not in created": (d) => {
      const created = d.data?.changes?.created || [];
      return !created.some(p => p.product_id === "product_a");
    }
  });

  client.archiveAllStripeConfig();
}
```

#### Test: priceAmountChangeTriggersRecreation

```typescript
/**
 * Changing a price's amount (immutable in Stripe) should archive old and create new.
 */
export async function priceAmountChangeTriggersRecreation() {
  const client = createClient();
  client.archiveAllStripeConfig();

  // Create initial config
  const config1 = {
    version: "v1.0.0",
    products: [{
      id: "test_product",
      name: "Test Product",
      type: "service",
      prices: [{ id: "test_price", amount: 1000, currency: "usd", interval: "month" }]
    }]
  };
  client.updateStripeConfig(config1);

  // Change price amount
  const config2 = {
    version: "v1.0.1",
    products: [{
      id: "test_product",
      name: "Test Product",
      type: "service",
      prices: [{ id: "test_price", amount: 2000, currency: "usd", interval: "month" }]
    }]
  };
  const result = client.updateStripeConfig(config2);

  check(result.data, {
    "price recreation: status is 200": (d) => d.status === 200,
    "price recreation: product in updated": (d) => {
      const updated = d.data?.changes?.updated || [];
      return updated.some(p => p.product_id === "test_product");
    },
    "price recreation: details mention archived": (d) => {
      const updated = d.data?.changes?.updated || [];
      const product = updated.find(p => p.product_id === "test_product");
      const details = product?.details || [];
      return details.some(dt => dt.toLowerCase().includes("archived"));
    },
    "price recreation: details mention created": (d) => {
      const updated = d.data?.changes?.updated || [];
      const product = updated.find(p => p.product_id === "test_product");
      const details = product?.details || [];
      return details.some(dt => dt.toLowerCase().includes("created"));
    }
  });

  client.archiveAllStripeConfig();
}
```

---

### 05-id-mapping.ts - ID Mapping Tests

**Purpose**: Test Stripe ID to config ID conversion and migration support.

#### Test Functions

```typescript
export async function convertStripeIDToConfigID()
export async function convertNonExistentStripeID()
export async function migrationWithStripeID()
export async function migrationSkipsExistingMapping()
export async function freeProductLocalOnly()
export async function freePriceLocalOnly()
export async function unarchiveExistingProduct()
```

#### Test: convertStripeIDToConfigID

```typescript
/**
 * After creating a product, should be able to convert its Stripe ID back to config ID.
 */
export async function convertStripeIDToConfigID() {
  const client = createClient();
  client.archiveAllStripeConfig();

  // Create config
  const config = {
    version: "v1.0.0",
    products: [{
      id: "test_product",
      name: "Test Product",
      type: "service",
      prices: [{ id: "test_price", amount: 1000, currency: "usd", interval: "month" }]
    }]
  };
  client.updateStripeConfig(config);

  // Get config to find Stripe IDs
  const getResult = client.getStripeConfigAdmin();
  const product = getResult.data?.data?.config?.products?.[0];
  const stripeProductId = product?.stripe_id;

  if (!stripeProductId) {
    console.error("No stripe_id found on product");
    return;
  }

  // Convert Stripe ID to config ID
  const convertResult = client.convertStripeIDToConfigID(stripeProductId);

  check(convertResult.data, {
    "convert ID: status is 200": (d) => d.status === 200,
    "convert ID: returns correct config_id": (d) => {
      return d.data?.config_id === "test_product";
    },
    "convert ID: returns correct item_type": (d) => {
      return d.data?.item_type === "product";
    }
  });

  client.archiveAllStripeConfig();
}
```

#### Test: migrationWithStripeID

```typescript
/**
 * Config with stripe_id should link to existing Stripe resource, not create new.
 */
export async function migrationWithStripeID() {
  const client = createClient();
  client.archiveAllStripeConfig();

  // First, create a product normally to get a Stripe ID
  const config1 = {
    version: "v1.0.0",
    products: [{
      id: "original_product",
      name: "Original Product",
      type: "service",
      prices: [{ id: "original_price", amount: 1000, currency: "usd", interval: "month" }]
    }]
  };
  client.updateStripeConfig(config1);

  // Get the Stripe IDs
  const getResult = client.getStripeConfigAdmin();
  const stripeProductId = getResult.data?.data?.config?.products?.[0]?.stripe_id;
  const stripePriceId = getResult.data?.data?.config?.products?.[0]?.prices?.[0]?.stripe_id;

  // Archive (but don't delete from Stripe)
  client.archiveAllStripeConfig();

  // Now create new config with stripe_id pointing to existing resources
  const config2 = {
    version: "v1.0.0",
    products: [{
      id: "new_config_id",
      name: "Linked Product",
      type: "service",
      stripe_id: stripeProductId, // Link to existing
      prices: [{
        id: "new_price_id",
        amount: 1000,
        currency: "usd",
        interval: "month",
        stripe_id: stripePriceId // Link to existing
      }]
    }]
  };
  const result = client.updateStripeConfig(config2);

  check(result.data, {
    "migration: status is 200": (d) => d.status === 200,
    "migration: action is linked": (d) => {
      const created = d.data?.changes?.created || [];
      return created.some(p => p.action === "linked");
    }
  });

  client.archiveAllStripeConfig();
}
```

#### Test: freeProductLocalOnly

```typescript
/**
 * Product with id="free" should not make Stripe API calls.
 */
export async function freeProductLocalOnly() {
  const client = createClient();
  client.archiveAllStripeConfig();

  const config = {
    version: "v1.0.0",
    products: [{
      id: "free",
      name: "Free Tier",
      type: "service",
      prices: [{ id: "free", amount: 0, currency: "usd", interval: "month" }]
    }]
  };
  const result = client.updateStripeConfig(config);

  check(result.data, {
    "free product: status is 200": (d) => d.status === 200,
    "free product: action is created_local": (d) => {
      const created = d.data?.changes?.created || [];
      return created.some(p => p.action === "created_local");
    }
  });

  // Verify no stripe_id on free product
  const getResult = client.getStripeConfigAdmin();
  check(getResult.data, {
    "free product: no stripe_id": (d) => {
      const product = d.data?.config?.products?.find(p => p.id === "free");
      return product?.stripe_id === null || product?.stripe_id === undefined;
    }
  });

  client.archiveAllStripeConfig();
}
```

---

### 06-admin.ts - Admin Endpoint Tests

**Purpose**: Test admin-specific endpoints like pull, archive-all, and history.

#### Test Functions

```typescript
// Pull config
export async function pullConfigFromStripe()
export async function pullConfigNormalizesIDs()
export async function pullConfigExcludesProductsWithoutPrices()

// Archive all
export async function archiveAllArchivesMeters()
export async function archiveAllArchivesPrices()
export async function archiveAllArchivesProducts()
export async function archiveAllCreatesEmptyConfig()
export async function archiveAllHandlesPartialFailures()

// Config history
export async function getConfigHistoryPagination()
export async function getConfigHistoryLimit()
export async function getConfigHistoryOffset()
export async function getConfigHistoryEmptyLimit()
export async function getConfigHistoryInvalidLimit()
export async function getConfigHistoryLimitExceedsMax()
export async function getConfigHistoryUnknownParam()

// Validate config
export async function validateValidConfig()
export async function validateInvalidConfig()

// Get schema
export async function getSchema()
```

#### Test: getConfigHistoryPagination

```typescript
/**
 * Config history should support pagination with limit and offset.
 */
export async function getConfigHistoryPagination() {
  const client = createClient();
  client.archiveAllStripeConfig();

  // Create multiple configs to have history
  for (let i = 1; i <= 5; i++) {
    client.updateStripeConfig({
      version: `v1.0.${i}`,
      products: [{
        id: `product_${i}`,
        name: `Product ${i}`,
        type: "service",
        prices: [{ id: `price_${i}`, amount: 1000 * i, currency: "usd", interval: "month" }]
      }]
    });
  }

  // Get first page
  const page1 = client.getStripeConfigHistory({ limit: 2, offset: 0 });

  check(page1.data, {
    "history page1: status is 200": (d) => d.status === 200,
    "history page1: returns 2 items": (d) => {
      return d.data?.configs?.length === 2;
    },
    "history page1: has pagination": (d) => {
      return d.data?.pagination?.total >= 5;
    },
    "history page1: has_next is true": (d) => {
      return d.data?.pagination?.has_next === true;
    }
  });

  // Get second page
  const page2 = client.getStripeConfigHistory({ limit: 2, offset: 2 });

  check(page2.data, {
    "history page2: status is 200": (d) => d.status === 200,
    "history page2: returns 2 items": (d) => {
      return d.data?.configs?.length === 2;
    },
    "history page2: has_prev is true": (d) => {
      return d.data?.pagination?.has_prev === true;
    }
  });

  client.archiveAllStripeConfig();
}
```

#### Test: getConfigHistoryInvalidLimit

```typescript
/**
 * Invalid limit parameter should return 400.
 */
export async function getConfigHistoryInvalidLimit() {
  const client = createClient();

  // Negative limit
  const result = client.getStripeConfigHistory({ limit: -1 });

  check(result.data, {
    "invalid limit: status is 400": (d) => d.status === 400
  });
}
```

---

### 07-lookups.ts - Resource Lookup Tests

**Purpose**: Test individual resource lookup endpoints.

#### Test Functions

```typescript
export async function getPriceByID()
export async function getPriceByIDNotFound()
export async function getProductByID()
export async function getProductByIDNotFound()
export async function getMeterByID()
export async function getMeterByIDNotFound()
export async function publicConfigFiltersPrivatePrices()
export async function adminConfigIncludesAllPrices()
```

#### Test: getPriceByID

```typescript
/**
 * Get price by config ID should return price with product context.
 */
export async function getPriceByID() {
  const client = createClient();
  client.archiveAllStripeConfig();

  const config = {
    version: "v1.0.0",
    products: [{
      id: "test_product",
      name: "Test Product",
      type: "service",
      prices: [{ id: "test_price", amount: 1000, currency: "usd", interval: "month" }]
    }]
  };
  client.updateStripeConfig(config);

  const result = client.getPriceByID("test_price");

  check(result.data, {
    "get price: status is 200": (d) => d.status === 200,
    "get price: returns price": (d) => {
      return d.data?.price?.id === "test_price";
    },
    "get price: returns parent product": (d) => {
      return d.data?.product?.id === "test_product";
    },
    "get price: price has stripe_id": (d) => {
      return d.data?.price?.stripe_id != null;
    }
  });

  client.archiveAllStripeConfig();
}
```

#### Test: publicConfigFiltersPrivatePrices

```typescript
/**
 * Public config endpoint should exclude prices where public=false.
 */
export async function publicConfigFiltersPrivatePrices() {
  const client = createClient();
  client.archiveAllStripeConfig();

  const config = {
    version: "v1.0.0",
    products: [{
      id: "test_product",
      name: "Test Product",
      type: "service",
      prices: [
        { id: "public_price", amount: 1000, currency: "usd", interval: "month", public: true },
        { id: "private_price", amount: 500, currency: "usd", interval: "month", public: false }
      ]
    }]
  };
  client.updateStripeConfig(config);

  // Public endpoint
  const publicResult = client.getStripeConfig();

  check(publicResult.data, {
    "public config: status is 200": (d) => d.status === 200,
    "public config: has public_price": (d) => {
      const prices = d.data?.config?.products?.[0]?.prices || [];
      return prices.some(p => p.id === "public_price");
    },
    "public config: excludes private_price": (d) => {
      const prices = d.data?.config?.products?.[0]?.prices || [];
      return !prices.some(p => p.id === "private_price");
    }
  });

  // Admin endpoint
  const adminResult = client.getStripeConfigAdmin();

  check(adminResult.data, {
    "admin config: has both prices": (d) => {
      const prices = d.data?.config?.products?.[0]?.prices || [];
      return prices.length === 2;
    }
  });

  client.archiveAllStripeConfig();
}
```

---

### 08-tiered.ts - Tiered Pricing Tests

**Purpose**: Test tiered pricing (graduated and volume) creation and retrieval.

#### Test Functions

```typescript
export async function createGraduatedTieredPrice()
export async function createVolumeTieredPrice()
export async function verifyTiersStructure()
export async function verifyInfinityTier()
export async function pullConfigPreservesTiers()
```

#### Test: createGraduatedTieredPrice

```typescript
/**
 * Create tiered price with graduated tiers_mode.
 */
export async function createGraduatedTieredPrice() {
  const client = createClient();
  client.archiveAllStripeConfig();

  const config = {
    version: "v1.0.0",
    meters: [{
      id: "usage_meter",
      display_name: "Usage",
      event_name: "usage_event",
      default_aggregation: { formula: "sum" }
    }],
    products: [{
      id: "tiered_product",
      name: "Tiered Product",
      type: "service",
      prices: [{
        id: "tiered_price",
        currency: "usd",
        interval: "month",
        usage_type: "metered",
        meter: "usage_meter",
        billing_scheme: "tiered",
        tiers_mode: "graduated",
        tiers: [
          { up_to: 100, unit_amount: 10, flat_amount: null },
          { up_to: 1000, unit_amount: 8, flat_amount: null },
          { up_to: "inf", unit_amount: 5, flat_amount: null }
        ]
      }]
    }]
  };

  const result = client.updateStripeConfig(config);

  check(result.data, {
    "tiered: status is 200": (d) => d.status === 200
  });

  // Verify via GET
  const getResult = client.getStripeConfigAdmin();

  check(getResult.data, {
    "tiered: has billing_scheme tiered": (d) => {
      const price = d.data?.config?.products?.[0]?.prices?.[0];
      return price?.billing_scheme === "tiered";
    },
    "tiered: has tiers_mode graduated": (d) => {
      const price = d.data?.config?.products?.[0]?.prices?.[0];
      return price?.tiers_mode === "graduated";
    },
    "tiered: has 3 tiers": (d) => {
      const price = d.data?.config?.products?.[0]?.prices?.[0];
      return price?.tiers?.length === 3;
    },
    "tiered: last tier is inf": (d) => {
      const price = d.data?.config?.products?.[0]?.prices?.[0];
      return price?.tiers?.[2]?.up_to === "inf";
    }
  });

  client.archiveAllStripeConfig();
}
```

---

## Patterns and Conventions

### Test Function Structure

```typescript
export async function testName() {
  const client = createClient();

  // Setup - clean slate
  client.archiveAllStripeConfig();

  // Arrange - create test data
  const config = { ... };

  // Act - perform operation
  const result = client.someOperation(config);

  // Assert - verify results using result.data (type-safe)
  check(result.data, {
    "descriptive check name": (d) => d.status === 200,
    // ... more checks
  });

  // Cleanup
  client.archiveAllStripeConfig();
}
```

### Naming Conventions

- Test functions: `camelCase` describing what's being tested
- Check names: `"context: assertion"` format (e.g., `"create config: status is 200"`)
- Config IDs: `snake_case` (e.g., `basic_monthly`, `api_requests`)

### Common Patterns

**IMPORTANT: Always use `result.data` for checks (type-safe pattern):**

```typescript
// CORRECT - Use result.data for type safety
check(result.data, {
  "operation: status is 200": (d) => d.status === 200,
  "operation: has expected field": (d) => {
    return d.data?.config?.products?.[0]?.name === "Expected Name";
  }
});

// INCORRECT - Don't use result.response for checks
// check(result.response, { ... })
```

**Error handling:**
```typescript
if (result.data.status !== 200) {
  logError("operationName", result.response);
  return;
}
```

**Accessing response data:**
```typescript
// For success responses, data is in result.data.data
const products = result.data.data?.config?.products || [];

// For error responses, error message is in result.data.error
const errorMessage = result.data.error || "Unknown error";
```

### SDK Type Handling

**CRITICAL: Do NOT use `as any` type casts in tests.**

The SDK provides typed responses generated from the OpenAPI spec. Tests should rely completely on these types. If you encounter a type error when accessing response fields:

1. **Investigate the cause** - Do NOT just add `as any` to make it compile
2. **Check the OpenAPI spec** - The API response schema may be incomplete or incorrect
   - Location: `public/apps/api/docs/openapi.yaml` (or `info.yaml` source files)
   - Look for the endpoint's response schema definition
3. **Check the handler implementation** - Verify what the handler actually returns
   - Location: `public/apps/api/internal/handlers/v1/`
   - Compare the actual response structure to the OpenAPI spec
4. **Fix the source** - If the OpenAPI spec is wrong, fix it and regenerate the SDK:
   ```bash
   cd public && bun run generate:sdk
   ```
5. **Document the issue** - If you cannot fix it immediately, create a TODO comment explaining the type mismatch

**Response types by endpoint:**

| Endpoint | Return Type | `data` Type |
|----------|-------------|-------------|
| `getStripeConfig()` | `GetStripeConfig200` | `StripeConfigResponse` |
| `getStripeConfigAdmin()` | `GetStripeConfigAdmin200` | `StripeConfigResponse` |
| `updateStripeConfig()` | `UpdateStripeConfig200` | `StripeConfigUpdateResponse` |
| `archiveAllStripeConfig()` | `ArchiveAllStripeConfig200` | `ArchiveAllResponse` |
| `getStripeConfigHistory()` | `GetStripeConfigHistory200` | `ConfigHistoryResponse` |
| `getPriceByID()` | `GetPriceByID200` | `PriceResponse` |
| `getProductByID()` | `GetProductByID200` | `ProductResponse` |

**Key types for `updateStripeConfig` response:**
- `StripeConfigUpdateResponse.message` - Status message (e.g., "no change was made")
- `StripeConfigUpdateResponse.changes` - `StripeConfigChanges` object
- `StripeConfigChanges.created` / `.updated` / `.archived` - Arrays of `ProductChange`
- `StripeConfigChanges.meters` - `MeterChanges` object with `.created` / `.updated` / `.archived`
- `ProductChange.product_id`, `.product_name`, `.action`, `.stripe_id`, `.details`

### Index File Structure

```typescript
// index.ts
export * from "./01-crud";
export * from "./02-meters";
export * from "./03-validation";
export * from "./04-differ";
export * from "./05-id-mapping";
export * from "./06-admin";
export * from "./07-lookups";
export * from "./08-tiered";

// Default export runs all tests
export default function() {
  // Import and run all test functions
}
```

---

## Running Tests

```bash
# From project root
cd public

# Run all stripe-config tests
bun run test:api:integration:local -- tests/api/k6/stripe-config/index.ts

# Run specific test file
bun run test:api:integration:local -- tests/api/k6/stripe-config/01-crud.ts

# With environment variables
STRIPE_SECRET_KEY=sk_test_... API_URL=http://localhost:8080 bun run test:api:integration:local
```

---

## Checklist Summary

### Tests to Port from Go (9 tests)
- [ ] Create simple config
- [ ] Create multiple plans config
- [ ] Create metered billing config
- [ ] Create tiered pricing config
- [ ] Create enterprise complex config
- [ ] Verify config retrieval
- [ ] Archive all config
- [ ] Verify empty after archive
- [ ] Meter-price association validation

### New Tests Required (86 tests)

**01-crud.ts (10 tests)**
- [ ] Update product name
- [ ] Update product description
- [ ] Update product type (triggers recreate)
- [ ] Add new product
- [ ] Remove product
- [ ] Add new price
- [ ] Remove price
- [ ] Modify price (triggers recreation)
- [ ] Idempotent config push
- [ ] Get public vs admin config difference

**02-meters.ts (6 tests)**
- [ ] Create config with meters
- [ ] Verify meter has stripe_id
- [ ] Verify metered price references correct meter
- [ ] Remove meter
- [ ] Meter validation - invalid aggregation
- [ ] Meter validation - price references non-existent meter

**03-validation.ts (20 tests)**
- [ ] Reject missing product ID
- [ ] Reject missing product name
- [ ] Reject product with no prices
- [ ] Reject missing price ID
- [ ] Reject negative amount
- [ ] Reject invalid currency
- [ ] Reject invalid interval
- [ ] Reject metered without interval
- [ ] Reject metered without meter
- [ ] Reject tiered with per_unit scheme
- [ ] Reject tiered without tiers_mode
- [ ] Reject tiered without tiers
- [ ] Reject amount on tiered price
- [ ] Reject missing meter ID
- [ ] Reject missing meter display_name
- [ ] Reject missing meter event_name
- [ ] Reject invalid aggregation formula
- [ ] Reject missing version
- [ ] Reject missing products field
- [ ] Reject null products array

**04-differ.ts (12 tests)**
- [ ] Detect new product
- [ ] Detect new price
- [ ] Detect new meter
- [ ] Detect product name update
- [ ] Detect product description update
- [ ] Detect product type change (recreate)
- [ ] Detect removed product
- [ ] Detect removed price
- [ ] Detect removed meter
- [ ] Price amount change triggers recreation
- [ ] Price currency change triggers recreation
- [ ] Price interval change triggers recreation

**05-id-mapping.ts (10 tests)**
- [ ] Convert Stripe ID to config ID
- [ ] Convert non-existent Stripe ID (404)
- [ ] Migration with stripe_id in config
- [ ] Migration skips existing mapping
- [ ] Free product local only
- [ ] Free price local only
- [ ] Unarchive existing product
- [ ] ID conversion returns correct item_type
- [ ] ID mapping history count
- [ ] Multiple configs same resource

**06-admin.ts (15 tests)**
- [ ] Pull config from Stripe
- [ ] Pull config normalizes IDs
- [ ] Pull config excludes products without prices
- [ ] Archive all archives meters
- [ ] Archive all archives prices
- [ ] Archive all archives products
- [ ] Archive all creates empty config
- [ ] Archive all handles partial failures
- [ ] Config history pagination
- [ ] Config history limit
- [ ] Config history offset
- [ ] Config history empty limit (400)
- [ ] Config history invalid limit (400)
- [ ] Config history limit exceeds max (400)
- [ ] Config history unknown param (400)

**07-lookups.ts (9 tests)**
- [ ] Get price by ID
- [ ] Get price by ID not found
- [ ] Get product by ID
- [ ] Get product by ID not found
- [ ] Get meter by ID
- [ ] Get meter by ID not found
- [ ] Public config filters private prices
- [ ] Admin config includes all prices
- [ ] Products with no public prices excluded from public config

**08-tiered.ts (6 tests)**
- [ ] Create graduated tiered price
- [ ] Create volume tiered price
- [ ] Verify tiers structure preserved
- [ ] Verify infinity tier handling
- [ ] Pull config preserves tiers
- [ ] Tiers_mode correctly set

---

## Notes for Implementers

1. **Always clean up**: Start and end tests with `archiveAllStripeConfig()` to ensure isolation.

2. **Use real Stripe API**: These tests hit the actual Stripe test mode API. Ensure `STRIPE_SECRET_KEY` is set.

3. **Check both response and data**: Always verify HTTP status AND response body structure.

4. **Handle async carefully**: k6 handles async differently than Node.js. The SDK methods are synchronous in k6.

5. **Reference existing tests**: Look at `tests/api/k6/payments/03-webhook-config.ts` for patterns on validation testing.

6. **Stripe rate limits**: Be mindful of Stripe rate limits when running full test suite. Add small delays if needed.
