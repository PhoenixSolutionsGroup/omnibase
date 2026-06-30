import { check, sleep } from "k6";
import { createClient, logError } from "../client";
import type { ErrorResponse, StripeConfigUpdateRequest } from "../sdk";

/**
 * Stripe Config Admin Endpoint Tests
 *
 * Tests admin-specific endpoints like pull, archive-all, history, validate, and schema.
 *
 * Prerequisites:
 * - API running at API_URL (default: http://localhost:8080)
 * - Valid STRIPE_SECRET_KEY environment variable
 * - X-Service-Key header for authentication
 */

// ============================================================================
// PULL CONFIG FROM STRIPE
// ============================================================================

/**
 * Pull config from Stripe API and verify structure.
 */
export function pullConfigFromStripe() {
  const client = createClient();
  client.archiveAllStripeConfig();
  // First create a config so there's something to pull
  const config: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    products: [
      {
        id: "pull_test_product",
        name: "Pull Test Product",
        type: "service",
        prices: [
          {
            id: "pull_test_price",
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
  };
  client.updateStripeConfig(config);
  // Pull config from Stripe
  const result = client.pullStripeConfig();

  check(result.data, {
    "pull config: status is 200": (d) => d.status === 200,
    "pull config: has products": (d) => {
      const products = d.data?.products ?? [];
      return products.length > 0;
    },
    "pull config: products have stripe_id": (d) => {
      const products = d.data?.products ?? [];
      return products.every((p) => p.stripe_id != null);
    },
  });

  if (result.data.status !== 200) {
    logError("pullConfigFromStripe", result.response);
  }

  client.archiveAllStripeConfig();
}

/**
 * Pulled config should normalize IDs to snake_case.
 */
export function pullConfigNormalizesIDs() {
  const client = createClient();
  client.archiveAllStripeConfig();
  // Create a config with specific ID
  const config: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    products: [
      {
        id: "test_product_id",
        name: "Test Product",
        type: "service",
        prices: [
          {
            id: "test_price_id",
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
  };
  client.updateStripeConfig(config);
  // Pull config
  const result = client.pullStripeConfig();

  check(result.data, {
    "pull normalize: status is 200": (d) => d.status === 200,
    "pull normalize: product IDs are valid": (d) => {
      const products = d.data?.products ?? [];
      // IDs should be normalized (not raw Stripe IDs)
      return products.every((p) => {
        const id = p.id ?? "";
        return id.length > 0 && !id.startsWith("prod_");
      });
    },
  });

  client.archiveAllStripeConfig();
}

/**
 * Pulled config should exclude products that have no active prices.
 */
export function pullConfigExcludesProductsWithoutPrices() {
  const client = createClient();

  // Pull config - products without prices should be excluded
  const result = client.pullStripeConfig();

  check(result.data, {
    "pull exclude: status is 200": (d) => d.status === 200,
    "pull exclude: all products have prices": (d) => {
      const products = d.data?.products ?? [];
      return products.every((p) => (p.prices?.length ?? 0) > 0);
    },
  });
}

// ============================================================================
// ARCHIVE ALL
// ============================================================================

/**
 * Archive all should archive meters.
 */
export function archiveAllArchivesMeters() {
  const client = createClient();
  client.archiveAllStripeConfig();
  // Create config with meters
  const config: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    meters: [
      {
        id: "archive_test_meter",
        display_name: "Archive Test Meter",
        event_name: "archive_test_event",
        default_aggregation: { formula: "sum" },
      },
    ],
    products: [
      {
        id: "archive_test_product",
        name: "Archive Test Product",
        type: "service",
        prices: [
          {
            id: "archive_test_price",
            amount: 10,
            currency: "usd",
            interval: "month",
            usage_type: "metered",
            meter: "archive_test_meter",
            billing_scheme: "per_unit",
          },
        ],
      },
    ],
  };
  client.updateStripeConfig(config);
  // Archive all
  const result = client.archiveAllStripeConfig();

  check(result.data, {
    "archive meters: status is 200": (d) => d.status === 200,
    "archive meters: has archived_items": (d) => {
      return Array.isArray(d.data?.archived_items);
    },
    "archive meters: archived meter": (d) => {
      const items = d.data?.archived_items ?? [];
      return items.some((item) => item.includes("meter"));
    },
  });

  if (result.data.status !== 200) {
    logError("archiveAllArchivesMeters", result.response);
  }
}

/**
 * Archive all should archive prices.
 */
export function archiveAllArchivesPrices() {
  const client = createClient();
  client.archiveAllStripeConfig();
  // Create config
  const config: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    products: [
      {
        id: "archive_price_product",
        name: "Archive Price Product",
        type: "service",
        prices: [
          {
            id: "archive_test_price",
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
  };
  client.updateStripeConfig(config);
  // Archive all
  const result = client.archiveAllStripeConfig();

  check(result.data, {
    "archive prices: status is 200": (d) => d.status === 200,
    "archive prices: archived price": (d) => {
      const items = d.data?.archived_items ?? [];
      return items.some((item) => item.includes("price"));
    },
  });
}

/**
 * Archive all should archive products.
 */
export function archiveAllArchivesProducts() {
  const client = createClient();
  client.archiveAllStripeConfig();
  // Create config
  const config: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    products: [
      {
        id: "archive_product_test",
        name: "Archive Product Test",
        type: "service",
        prices: [
          {
            id: "archive_product_price",
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
  };
  client.updateStripeConfig(config);
  // Archive all
  const result = client.archiveAllStripeConfig();

  check(result.data, {
    "archive products: status is 200": (d) => d.status === 200,
    "archive products: archived product": (d) => {
      const items = d.data?.archived_items ?? [];
      return items.some((item) => item.includes("product"));
    },
  });
}

/**
 * Archive all should result in empty config.
 */
export function archiveAllCreatesEmptyConfig() {
  const client = createClient();

  // Create config first
  const config: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    products: [
      {
        id: "empty_test_product",
        name: "Empty Test Product",
        type: "service",
        prices: [
          {
            id: "empty_test_price",
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
  };
  client.updateStripeConfig(config);
  // Archive all
  client.archiveAllStripeConfig();
  // Verify empty config
  const getResult = client.getStripeConfigAdmin();

  check(getResult.data, {
    "empty config: status is 200": (d) => d.status === 200,
    "empty config: no products": (d) => {
      const products = d.data?.config?.products ?? [];
      return products.length === 0;
    },
    "empty config: no meters": (d) => {
      const meters = d.data?.config?.meters ?? [];
      return meters.length === 0;
    },
  });
}

/**
 * Archive all should handle partial failures gracefully.
 */
export function archiveAllHandlesPartialFailures() {
  const client = createClient();
  client.archiveAllStripeConfig();
  // Create config
  const config: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    products: [
      {
        id: "partial_test_product",
        name: "Partial Test Product",
        type: "service",
        prices: [
          {
            id: "partial_test_price",
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
  };
  client.updateStripeConfig(config);
  // Archive all - should complete even if some items fail
  const result = client.archiveAllStripeConfig();

  check(result.data, {
    "partial failures: status is 200": (d) => d.status === 200,
    "partial failures: has total_archived": (d) => {
      return typeof d.data?.total_archived === "number";
    },
    "partial failures: has total_errors": (d) => {
      return typeof d.data?.total_errors === "number";
    },
  });
}

// ============================================================================
// CONFIG HISTORY
// ============================================================================

/**
 * Config history should support pagination with limit and offset.
 */
export function getConfigHistoryPagination() {
  const client = createClient();
  client.archiveAllStripeConfig();
  // Create multiple configs to have history
  for (let i = 1; i <= 5; i++) {
    const config: StripeConfigUpdateRequest = {
      version: `v1.0.${i}`,
      products: [
        {
          id: `history_product_${i}`,
          name: `History Product ${i}`,
          type: "service",
          prices: [
            {
              id: `history_price_${i}`,
              amount: 1000 * i,
              currency: "usd",
              interval: "month",
            },
          ],
        },
      ],
    };
    client.updateStripeConfig(config);
    sleep(0.5);
  }

  // Get first page
  const page1 = client.getStripeConfigHistory({ limit: 2, offset: 0 });

  check(page1.data, {
    "history page1: status is 200": (d) => d.status === 200,
    "history page1: returns 2 items": (d) => {
      return d.data?.configs?.length === 2;
    },
    "history page1: has pagination": (d) => {
      return d.data?.pagination?.total != null;
    },
    "history page1: has_next is true": (d) => {
      return d.data?.pagination?.has_next === true;
    },
  });

  if (page1.data.status !== 200) {
    logError("getConfigHistoryPagination page1", page1.response);
  }

  // Get second page
  const page2 = client.getStripeConfigHistory({ limit: 2, offset: 2 });

  check(page2.data, {
    "history page2: status is 200": (d) => d.status === 200,
    "history page2: returns items": (d) => {
      return (d.data?.configs?.length ?? 0) > 0;
    },
    "history page2: has_prev is true": (d) => {
      return d.data?.pagination?.has_prev === true;
    },
  });

  client.archiveAllStripeConfig();
}

/**
 * Config history limit parameter works correctly.
 */
export function getConfigHistoryLimit() {
  const client = createClient();
  client.archiveAllStripeConfig();
  // Create configs
  for (let i = 1; i <= 3; i++) {
    const config: StripeConfigUpdateRequest = {
      version: `v1.0.${i}`,
      products: [
        {
          id: `limit_product_${i}`,
          name: `Limit Product ${i}`,
          type: "service",
          prices: [
            {
              id: `limit_price_${i}`,
              amount: 1000,
              currency: "usd",
              interval: "month",
            },
          ],
        },
      ],
    };
    client.updateStripeConfig(config);
    sleep(0.5);
  }

  // Get with limit=1
  const result = client.getStripeConfigHistory({ limit: 1 });

  check(result.data, {
    "history limit: status is 200": (d) => d.status === 200,
    "history limit: returns exactly 1 item": (d) => {
      return d.data?.configs?.length === 1;
    },
  });

  client.archiveAllStripeConfig();
}

/**
 * Config history offset parameter works correctly.
 */
export function getConfigHistoryOffset() {
  const client = createClient();
  client.archiveAllStripeConfig();
  // Create configs
  for (let i = 1; i <= 4; i++) {
    const config: StripeConfigUpdateRequest = {
      version: `v1.0.${i}`,
      products: [
        {
          id: `offset_product_${i}`,
          name: `Offset Product ${i}`,
          type: "service",
          prices: [
            {
              id: `offset_price_${i}`,
              amount: 1000,
              currency: "usd",
              interval: "month",
            },
          ],
        },
      ],
    };
    client.updateStripeConfig(config);
    sleep(0.5);
  }

  // Get with offset=2
  const result = client.getStripeConfigHistory({ limit: 10, offset: 2 });

  check(result.data, {
    "history offset: status is 200": (d) => d.status === 200,
    "history offset: skipped first 2": (d) => {
      // Should return remaining configs after skipping first 2
      const total = d.data?.pagination?.total ?? 0;
      const returned = d.data?.configs?.length ?? 0;
      return returned <= total - 2;
    },
  });

  client.archiveAllStripeConfig();
}

/**
 * Invalid limit parameter should return 400.
 */
export function getConfigHistoryInvalidLimit() {
  const client = createClient();

  // Negative limit
  const result = client.getStripeConfigHistory({ limit: -1 });

  check(result.data, {
    "invalid limit: status is 400": (d) => d.status === 400,
  });
}

/**
 * Limit exceeding maximum should return 400 or be capped.
 */
export function getConfigHistoryLimitExceedsMax() {
  const client = createClient();

  // Very large limit
  const result = client.getStripeConfigHistory({ limit: 10000 });

  check(result.data, {
    "limit exceeds max: returns response": (d) => {
      // May return 400 or cap to max
      return d.status === 200 || d.status === 400;
    },
  });
}

// ============================================================================
// VALIDATE CONFIG
// ============================================================================

/**
 * Validate a valid config should return success.
 * Go returns: {status: 200, data: ""} on success
 */
export function validateValidConfig() {
  const client = createClient();

  const config: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    products: [
      {
        id: "valid_product",
        name: "Valid Product",
        type: "service",
        prices: [
          {
            id: "valid_price",
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
  };

  const result = client.validateStripeConfig(config);

  check(result.data, {
    "validate valid: status is 200": (d) => d.status === 200,
    // On success, data is empty string ""
    "validate valid: data is empty string": (d) => d.data === "",
  });

  if (result.data.status !== 200) {
    logError("validateValidConfig", result.response);
  }
}

/**
 * Validate an invalid config should return validation errors.
 * On error, Go returns: {status: 400, error: "..."} (BadRequest response)
 */
export function validateInvalidConfig() {
  const client = createClient();

  // Config with missing required fields - cast to bypass TypeScript
  const config = {
    version: "v1.0.0",
    products: [
      {
        // missing id
        name: "Invalid Product",
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
  } as unknown as StripeConfigUpdateRequest;

  const result = client.validateStripeConfig(config);

  // Error responses have different shape: {status: 400, error: "..."}
  // Cast to any since SDK types success response only
  const data = result.data as unknown as ErrorResponse;

  check(data, {
    "validate invalid: status is 400": (d) => d.status === 400,
    "validate invalid: has error": (d) => d.error != null && d.error.length > 0,
  });
}

// ============================================================================
// GET SCHEMA
// ============================================================================

/**
 * Get JSON schema for config validation.
 * Note: This endpoint returns raw JSON schema without SuccessResponse wrapper.
 * Go uses ctx.JSON() directly, not handlers.NewSuccessResponse().
 */
export function getSchema() {
  const client = createClient();

  const result = client.getStripeConfigSchema();

  // The schema is returned directly without wrapper
  // result.data IS the schema object itself
  check(result.response, {
    "get schema: HTTP status is 200": (r) => r.status === 200,
  });

  check(result.data, {
    // Schema is returned directly, not wrapped in {status, data}
    "get schema: has $schema": (d) => d.$schema != null,
    "get schema: has definitions": (d) => d.definitions != null,
    "get schema: has properties": (d) => d.properties != null,
  });

  if (result.response.status !== 200) {
    logError("getSchema", result.response);
  }
}
