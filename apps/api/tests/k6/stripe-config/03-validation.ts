import { check, sleep } from "k6";
import { createClient } from "../client";
import {
  MeterDefaultAggregationFormula,
  type StripeConfigUpdateRequest,
} from "../sdk";

/**
 * Stripe Config Validation Tests
 *
 * Tests that the validator correctly rejects invalid configs with appropriate errors.
 * Covers product, price, meter, tiered pricing, and config structure validation.
 *
 * Prerequisites:
 * - API running at API_URL (default: http://localhost:8080)
 * - Valid STRIPE_SECRET_KEY environment variable
 * - X-Service-Key header for authentication
 */

// ============================================================================
// PRODUCT VALIDATION TESTS
// ============================================================================

/**
 * Config with product missing ID should return 400.
 */
export function rejectMissingProductID() {
  const client = createClient();
  client.archiveAllStripeConfig();
  // We need to construct a config that bypasses TypeScript checks
  // since StripeConfigUpdateRequest requires id
  const config = {
    version: "v1.0.0",
    products: [
      {
        // id: missing
        name: "Test Product",
        type: "service",
        prices: [
          {
            id: "test_price",
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
  };

  const result = client.updateStripeConfig(
    config as unknown as StripeConfigUpdateRequest
  );

  check(result.data, {
    "missing product ID: status is 400": (d) => d.status === 400,
  });

  client.archiveAllStripeConfig();
}

/**
 * Config with product missing name should return 400.
 */
export function rejectMissingProductName() {
  const client = createClient();
  client.archiveAllStripeConfig();
  const config = {
    version: "v1.0.0",
    products: [
      {
        id: "test_product",
        // name: missing
        type: "service",
        prices: [
          {
            id: "test_price",
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
  };

  const result = client.updateStripeConfig(
    config as unknown as StripeConfigUpdateRequest
  );

  check(result.data, {
    "missing product name: status is 400": (d) => d.status === 400,
  });

  client.archiveAllStripeConfig();
}

/**
 * Config with product that has empty name should return 400.
 */
export function rejectEmptyProductName() {
  const client = createClient();
  client.archiveAllStripeConfig();
  const config: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    products: [
      {
        id: "test_product",
        name: "", // Empty name
        type: "service",
        prices: [
          {
            id: "test_price",
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
  };

  const result = client.updateStripeConfig(config);

  check(result.data, {
    "empty product name: status is 400": (d) => d.status === 400,
  });

  client.archiveAllStripeConfig();
}

/**
 * Config with product that has no prices should return 400.
 */
export function rejectProductWithNoPrices() {
  const client = createClient();
  client.archiveAllStripeConfig();
  const config = {
    version: "v1.0.0",
    products: [
      {
        id: "test_product",
        name: "Test Product",
        type: "service",
        prices: [], // No prices
      },
    ],
  };

  const result = client.updateStripeConfig(
    config as unknown as StripeConfigUpdateRequest
  );

  check(result.data, {
    "product with no prices: status is 400": (d) => d.status === 400,
  });

  client.archiveAllStripeConfig();
}

// ============================================================================
// PRICE VALIDATION TESTS
// ============================================================================

/**
 * Config with price missing ID should return 400.
 */
export function rejectMissingPriceID() {
  const client = createClient();
  client.archiveAllStripeConfig();
  const config = {
    version: "v1.0.0",
    products: [
      {
        id: "test_product",
        name: "Test Product",
        type: "service",
        prices: [
          {
            // id: missing
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
  };

  const result = client.updateStripeConfig(
    config as unknown as StripeConfigUpdateRequest
  );

  check(result.data, {
    "missing price ID: status is 400": (d) => d.status === 400,
  });

  client.archiveAllStripeConfig();
}

/**
 * Config with price having empty ID should return 400.
 */
export function rejectEmptyPriceID() {
  const client = createClient();
  client.archiveAllStripeConfig();
  const config: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    products: [
      {
        id: "test_product",
        name: "Test Product",
        type: "service",
        prices: [
          {
            id: "", // Empty ID
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
  };

  const result = client.updateStripeConfig(config);

  check(result.data, {
    "empty price ID: status is 400": (d) => d.status === 400,
  });

  client.archiveAllStripeConfig();
}

/**
 * Config with negative price amount should return 400.
 */
export function rejectNegativeAmount() {
  const client = createClient();
  client.archiveAllStripeConfig();
  const config: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    products: [
      {
        id: "test_product",
        name: "Test Product",
        type: "service",
        prices: [
          {
            id: "test_price",
            amount: -100, // Negative amount
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
  };

  const result = client.updateStripeConfig(config);

  check(result.data, {
    "negative amount: status is 400": (d) => d.status === 400,
  });

  client.archiveAllStripeConfig();
}

/**
 * Config with invalid currency should return 400.
 */
export function rejectInvalidCurrency() {
  const client = createClient();
  client.archiveAllStripeConfig();
  const config = {
    version: "v1.0.0",
    products: [
      {
        id: "test_product",
        name: "Test Product",
        type: "service",
        prices: [
          {
            id: "test_price",
            amount: 1000,
            currency: "invalid_currency", // Invalid currency
            interval: "month",
          },
        ],
      },
    ],
  };

  const result = client.updateStripeConfig(
    config as unknown as StripeConfigUpdateRequest
  );

  check(result.data, {
    "invalid currency: status is 400": (d) => d.status === 400,
  });

  client.archiveAllStripeConfig();
}

/**
 * Config with invalid billing interval should return 400.
 */
export function rejectInvalidInterval() {
  const client = createClient();
  client.archiveAllStripeConfig();
  const config = {
    version: "v1.0.0",
    products: [
      {
        id: "test_product",
        name: "Test Product",
        type: "service",
        prices: [
          {
            id: "test_price",
            amount: 1000,
            currency: "usd",
            interval: "invalid_interval", // Invalid interval
          },
        ],
      },
    ],
  };

  const result = client.updateStripeConfig(
    config as unknown as StripeConfigUpdateRequest
  );

  check(result.data, {
    "invalid interval: status is 400": (d) => d.status === 400,
  });

  client.archiveAllStripeConfig();
}

// ============================================================================
// TIERED PRICING VALIDATION TESTS
// ============================================================================

/**
 * Tiered price with billing_scheme="per_unit" should return 400.
 */
export function rejectTieredWithPerUnitScheme() {
  const client = createClient();
  client.archiveAllStripeConfig();
  const config: any = {
    version: "v1.0.0",
    meters: [
      {
        id: "test_meter",
        display_name: "Test Meter",
        event_name: "test_event",
        default_aggregation: { formula: MeterDefaultAggregationFormula.sum },
      },
    ],
    products: [
      {
        id: "test_product",
        name: "Test Product",
        type: "service",
        prices: [
          {
            id: "test_price",
            currency: "usd",
            interval: "month",
            usage_type: "metered",
            meter: "test_meter",
            billing_scheme: "per_unit", // Should be "tiered" for tiered prices
            tiers_mode: "graduated",
            tiers: [
              { up_to: 100, unit_amount: 10 },
              { up_to: "inf", unit_amount: 5 },
            ],
          },
        ],
      },
    ],
  };

  const result = client.updateStripeConfig(config);

  check(result.data, {
    "tiered with per_unit scheme: status is 400": (d) => d.status === 400,
  });

  client.archiveAllStripeConfig();
}

/**
 * Tiered price without tiers_mode should return 400.
 */
export function rejectTieredWithoutTiersMode() {
  const client = createClient();
  client.archiveAllStripeConfig();
  const config = {
    version: "v1.0.0",
    meters: [
      {
        id: "test_meter",
        display_name: "Test Meter",
        event_name: "test_event",
        default_aggregation: { formula: "sum" },
      },
    ],
    products: [
      {
        id: "test_product",
        name: "Test Product",
        type: "service",
        prices: [
          {
            id: "test_price",
            currency: "usd",
            interval: "month",
            usage_type: "metered",
            meter: "test_meter",
            billing_scheme: "tiered",
            // tiers_mode: missing
            tiers: [
              { up_to: 100, unit_amount: 10 },
              { up_to: "inf", unit_amount: 5 },
            ],
          },
        ],
      },
    ],
  };

  const result = client.updateStripeConfig(
    config as unknown as StripeConfigUpdateRequest
  );

  check(result.data, {
    "tiered without tiers_mode: status is 400": (d) => d.status === 400,
  });

  client.archiveAllStripeConfig();
}

/**
 * Tiered price without tiers array should return 400.
 */
export function rejectTieredWithoutTiers() {
  const client = createClient();
  client.archiveAllStripeConfig();
  const config = {
    version: "v1.0.0",
    meters: [
      {
        id: "test_meter",
        display_name: "Test Meter",
        event_name: "test_event",
        default_aggregation: { formula: "sum" },
      },
    ],
    products: [
      {
        id: "test_product",
        name: "Test Product",
        type: "service",
        prices: [
          {
            id: "test_price",
            currency: "usd",
            interval: "month",
            usage_type: "metered",
            meter: "test_meter",
            billing_scheme: "tiered",
            tiers_mode: "graduated",
            // tiers: missing
          },
        ],
      },
    ],
  };

  const result = client.updateStripeConfig(
    config as unknown as StripeConfigUpdateRequest
  );

  check(result.data, {
    "tiered without tiers: status is 400": (d) => d.status === 400,
  });

  client.archiveAllStripeConfig();
}

/**
 * Tiered price with empty tiers array should return 400.
 */
export function rejectTieredWithEmptyTiers() {
  const client = createClient();
  client.archiveAllStripeConfig();
  const config = {
    version: "v1.0.0",
    meters: [
      {
        id: "test_meter",
        display_name: "Test Meter",
        event_name: "test_event",
        default_aggregation: { formula: "sum" },
      },
    ],
    products: [
      {
        id: "test_product",
        name: "Test Product",
        type: "service",
        prices: [
          {
            id: "test_price",
            currency: "usd",
            interval: "month",
            usage_type: "metered",
            meter: "test_meter",
            billing_scheme: "tiered",
            tiers_mode: "graduated",
            tiers: [], // Empty tiers
          },
        ],
      },
    ],
  };

  const result = client.updateStripeConfig(
    config as unknown as StripeConfigUpdateRequest
  );

  check(result.data, {
    "tiered with empty tiers: status is 400": (d) => d.status === 400,
  });

  client.archiveAllStripeConfig();
}

/**
 * Tiered price with amount field should return 400.
 * Tiered prices should not have amount - they use tiers instead.
 */
export function rejectAmountOnTieredPrice() {
  const client = createClient();
  client.archiveAllStripeConfig();
  const config = {
    version: "v1.0.0",
    meters: [
      {
        id: "test_meter",
        display_name: "Test Meter",
        event_name: "test_event",
        default_aggregation: { formula: "sum" },
      },
    ],
    products: [
      {
        id: "test_product",
        name: "Test Product",
        type: "service",
        prices: [
          {
            id: "test_price",
            amount: 1000, // Should not be present on tiered prices
            currency: "usd",
            interval: "month",
            usage_type: "metered",
            meter: "test_meter",
            billing_scheme: "tiered",
            tiers_mode: "graduated",
            tiers: [
              { up_to: 100, unit_amount: 10 },
              { up_to: "inf", unit_amount: 5 },
            ],
          },
        ],
      },
    ],
  };

  const result = client.updateStripeConfig(
    config as unknown as StripeConfigUpdateRequest
  );

  check(result.data, {
    "tiered with amount: status is 400": (d) => d.status === 400,
  });

  client.archiveAllStripeConfig();
}

/**
 * Tiered price without final "inf" tier should return 400.
 */
export function rejectTieredWithoutInfTier() {
  const client = createClient();
  client.archiveAllStripeConfig();
  const config = {
    version: "v1.0.0",
    meters: [
      {
        id: "test_meter",
        display_name: "Test Meter",
        event_name: "test_event",
        default_aggregation: { formula: "sum" },
      },
    ],
    products: [
      {
        id: "test_product",
        name: "Test Product",
        type: "service",
        prices: [
          {
            id: "test_price",
            currency: "usd",
            interval: "month",
            usage_type: "metered",
            meter: "test_meter",
            billing_scheme: "tiered",
            tiers_mode: "graduated",
            tiers: [
              { up_to: 100, unit_amount: 10 },
              { up_to: 1000, unit_amount: 5 }, // No "inf" tier
            ],
          },
        ],
      },
    ],
  };

  const result = client.updateStripeConfig(
    config as unknown as StripeConfigUpdateRequest
  );

  check(result.data, {
    "tiered without inf tier: status is 400": (d) => d.status === 400,
  });

  client.archiveAllStripeConfig();
}

// ============================================================================
// METER VALIDATION TESTS (Additional to 02-meters.ts)
// ============================================================================

/**
 * Meter with invalid aggregation formula should return 400.
 */
export function rejectInvalidAggregationFormula() {
  const client = createClient();
  client.archiveAllStripeConfig();
  const config = {
    version: "v1.0.0",
    meters: [
      {
        id: "test_meter",
        display_name: "Test Meter",
        event_name: "test_event",
        default_aggregation: { formula: "invalid_formula" }, // Invalid
      },
    ],
    products: [
      {
        id: "test_product",
        name: "Test Product",
        type: "service",
        prices: [
          {
            id: "test_price",
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
  };

  const result = client.updateStripeConfig(
    config as unknown as StripeConfigUpdateRequest
  );

  check(result.data, {
    "invalid aggregation formula: status is 400": (d) => d.status === 400,
  });

  client.archiveAllStripeConfig();
}

/**
 * Meter missing default_aggregation should return 400.
 */
export function rejectMeterWithoutAggregation() {
  const client = createClient();
  client.archiveAllStripeConfig();
  const config = {
    version: "v1.0.0",
    meters: [
      {
        id: "test_meter",
        display_name: "Test Meter",
        event_name: "test_event",
        // default_aggregation: missing
      },
    ],
    products: [
      {
        id: "test_product",
        name: "Test Product",
        type: "service",
        prices: [
          {
            id: "test_price",
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
  };

  const result = client.updateStripeConfig(
    config as unknown as StripeConfigUpdateRequest
  );

  check(result.data, {
    "meter without aggregation: status is 400": (d) => d.status === 400,
  });

  client.archiveAllStripeConfig();
}

// ============================================================================
// CONFIG STRUCTURE VALIDATION TESTS
// ============================================================================

/**
 * Config missing version should return 400.
 */
export function rejectMissingVersion() {
  const client = createClient();
  client.archiveAllStripeConfig();
  const config = {
    // version: missing
    products: [
      {
        id: "test_product",
        name: "Test Product",
        type: "service",
        prices: [
          {
            id: "test_price",
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
  };

  const result = client.updateStripeConfig(
    config as unknown as StripeConfigUpdateRequest
  );

  check(result.data, {
    "missing version: status is 400": (d) => d.status === 400,
  });

  client.archiveAllStripeConfig();
}

/**
 * Config with empty version should return 400.
 */
export function rejectEmptyVersion() {
  const client = createClient();
  client.archiveAllStripeConfig();
  const config: StripeConfigUpdateRequest = {
    version: "", // Empty version
    products: [
      {
        id: "test_product",
        name: "Test Product",
        type: "service",
        prices: [
          {
            id: "test_price",
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
  };

  const result = client.updateStripeConfig(config);

  check(result.data, {
    "empty version: status is 400": (d) => d.status === 400,
  });

  client.archiveAllStripeConfig();
}

/**
 * Config missing products field should return 400.
 */
export function rejectMissingProducts() {
  const client = createClient();
  client.archiveAllStripeConfig();
  const config = {
    version: "v1.0.0",
    // products: missing
  };

  const result = client.updateStripeConfig(
    config as unknown as StripeConfigUpdateRequest
  );

  check(result.data, {
    "missing products: status is 400": (d) => d.status === 400,
  });

  client.archiveAllStripeConfig();
}

/**
 * Config with null products should return 400.
 */
export function rejectNullProducts() {
  const client = createClient();
  client.archiveAllStripeConfig();
  const config = {
    version: "v1.0.0",
    products: null, // Null products
  };

  const result = client.updateStripeConfig(
    config as unknown as StripeConfigUpdateRequest
  );

  check(result.data, {
    "null products: status is 400": (d) => d.status === 400,
  });

  client.archiveAllStripeConfig();
}

/**
 * Config with empty products array should return 200 (valid but no-op).
 */
export function acceptEmptyProducts() {
  const client = createClient();
  client.archiveAllStripeConfig();
  const config: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    products: [], // Empty products - valid, just does nothing
  };

  const result = client.updateStripeConfig(config);

  check(result.data, {
    "empty products: status is 200": (d) => d.status === 200,
  });

  client.archiveAllStripeConfig();
}

// ============================================================================
// DUPLICATE ID VALIDATION TESTS
// ============================================================================

/**
 * Config with duplicate product IDs should return 400.
 */
export function rejectDuplicateProductIDs() {
  const client = createClient();
  client.archiveAllStripeConfig();
  const config: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    products: [
      {
        id: "duplicate_id", // Duplicate
        name: "Product A",
        type: "service",
        prices: [
          { id: "price_a", amount: 1000, currency: "usd", interval: "month" },
        ],
      },
      {
        id: "duplicate_id", // Duplicate
        name: "Product B",
        type: "service",
        prices: [
          { id: "price_b", amount: 2000, currency: "usd", interval: "month" },
        ],
      },
    ],
  };

  const result = client.updateStripeConfig(config);

  check(result.data, {
    "duplicate product IDs: status is 400": (d) => d.status === 400,
  });

  client.archiveAllStripeConfig();
}

/**
 * Config with duplicate price IDs should return 400.
 */
export function rejectDuplicatePriceIDs() {
  const client = createClient();
  client.archiveAllStripeConfig();
  const config: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    products: [
      {
        id: "test_product",
        name: "Test Product",
        type: "service",
        prices: [
          {
            id: "duplicate_price", // Duplicate
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
          {
            id: "duplicate_price", // Duplicate
            amount: 2000,
            currency: "usd",
            interval: "year",
          },
        ],
      },
    ],
  };

  const result = client.updateStripeConfig(config);

  check(result.data, {
    "duplicate price IDs: status is 400": (d) => d.status === 400,
  });

  client.archiveAllStripeConfig();
}

/**
 * Config with duplicate meter IDs should return 400.
 */
export function rejectDuplicateMeterIDs() {
  const client = createClient();
  client.archiveAllStripeConfig();
  const config: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    meters: [
      {
        id: "duplicate_meter", // Duplicate
        display_name: "Meter A",
        event_name: "event_a",
        default_aggregation: { formula: MeterDefaultAggregationFormula.sum },
      },
      {
        id: "duplicate_meter", // Duplicate
        display_name: "Meter B",
        event_name: "event_b",
        default_aggregation: { formula: MeterDefaultAggregationFormula.sum },
      },
    ],
    products: [
      {
        id: "test_product",
        name: "Test Product",
        type: "service",
        prices: [
          {
            id: "test_price",
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
  };

  const result = client.updateStripeConfig(config);

  check(result.data, {
    "duplicate meter IDs: status is 400": (d) => d.status === 400,
  });

  client.archiveAllStripeConfig();
}
