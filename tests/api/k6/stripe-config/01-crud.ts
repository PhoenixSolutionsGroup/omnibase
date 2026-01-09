import { check, sleep } from "k6";
import { createClient, logError } from "../client";
import type { StripeConfigUpdateRequest } from "../sdk";

/**
 * Stripe Config CRUD Tests
 *
 * Tests the basic create, read, update, and archive operations for Stripe configurations.
 * These tests port the existing Go integration tests and add new coverage.
 *
 * Prerequisites:
 * - API running at API_URL (default: http://localhost:8080)
 * - Valid STRIPE_SECRET_KEY environment variable
 * - X-Service-Key header for authentication
 */

// ============================================================================
// BASIC CRUD (ported from Go tests)
// ============================================================================

/**
 * Create a simple config with one product and one price.
 * Verifies the config is created in Stripe and response structure is correct.
 */
export function createSimpleConfig() {
  const client = createClient();

  // Clean slate
  client.archiveAllStripeConfig();

  const config: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    products: [
      {
        id: "test_product",
        name: "Test Product",
        description: "A test product for k6 tests",
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
    "create config: status is 200": (d) => d.status === 200,
    "create config: has changes.created": (d) => {
      return (d.data?.changes?.created?.length ?? 0) > 0;
    },
    "create config: product was created": (d) => {
      const created = d.data?.changes?.created ?? [];
      return created.some((p) => p.product_id === "test_product");
    },
    "create config: action is created": (d) => {
      const created = d.data?.changes?.created ?? [];
      const product = created.find((p) => p.product_id === "test_product");
      return product?.action === "created";
    },
  });

  if (result.data.status !== 200) {
    logError("createSimpleConfig", result.response);
  }

  // Cleanup
  client.archiveAllStripeConfig();
}

/**
 * Verify config retrieval after creation.
 * Tests both public and admin endpoints.
 */
export function getConfigAfterCreate() {
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
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
  };

  client.updateStripeConfig(config);
  // Test admin endpoint (full config)
  const adminResult = client.getStripeConfigAdmin();

  check(adminResult.data, {
    "get admin config: status is 200": (d) => d.status === 200,
    "get admin config: has products": (d) => {
      const products = d.data?.config?.products ?? [];
      return products.length > 0;
    },
    "get admin config: product has correct id": (d) => {
      const products = d.data?.config?.products ?? [];
      return products.some((p) => p.id === "test_product");
    },
    "get admin config: product has stripe_id": (d) => {
      const products = d.data?.config?.products ?? [];
      const product = products.find((p) => p.id === "test_product");
      return product?.stripe_id != null;
    },
    "get admin config: price has stripe_id": (d) => {
      const products = d.data?.config?.products ?? [];
      const product = products.find((p) => p.id === "test_product");
      const price = product?.prices?.[0];
      return price?.stripe_id != null;
    },
  });

  // Test public endpoint
  const publicResult = client.getStripeConfig();

  check(publicResult.data, {
    "get public config: status is 200": (d) => d.status === 200,
    "get public config: has products": (d) => {
      const products = d.data?.config?.products ?? [];
      return products.length > 0;
    },
  });

  client.archiveAllStripeConfig();
}

/**
 * Archive all config and verify empty state.
 */
export function archiveAllConfig() {
  const client = createClient();

  // First create something to archive
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
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
  };

  client.updateStripeConfig(config);
  // Now archive
  const archiveResult = client.archiveAllStripeConfig();

  check(archiveResult.data, {
    "archive all: status is 200": (d) => d.status === 200,
    "archive all: has archived_items": (d) => {
      return Array.isArray(d.data?.archived_items);
    },
    "archive all: total_archived >= 0": (d) => {
      return typeof d.data?.total_archived === "number";
    },
  });

  // Verify empty config
  const getResult = client.getStripeConfigAdmin();

  check(getResult.data, {
    "after archive: config has no products": (d) => {
      const products = d.data?.config?.products ?? [];
      return products.length === 0;
    },
  });
}

// ============================================================================
// PUBLIC VS ADMIN CONFIG
// ============================================================================

/**
 * Test that public config filters out private prices.
 */
export function publicConfigFiltersPrivatePrices() {
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
            id: "public_price",
            amount: 1000,
            currency: "usd",
            interval: "month",
            public: true,
          },
          {
            id: "private_price",
            amount: 500,
            currency: "usd",
            interval: "month",
            public: false,
          },
        ],
      },
    ],
  };
  client.updateStripeConfig(config);
  // Public endpoint should exclude private prices
  const publicResult = client.getStripeConfig();

  check(publicResult.data, {
    "public config: status is 200": (d) => d.status === 200,
    "public config: has public_price": (d) => {
      const products = d.data?.config?.products ?? [];
      const prices = products[0]?.prices ?? [];
      return prices.some((p) => p.id === "public_price");
    },
    "public config: excludes private_price": (d) => {
      const products = d.data?.config?.products ?? [];
      const prices = products[0]?.prices ?? [];
      return !prices.some((p) => p.id === "private_price");
    },
  });

  // Admin endpoint should include all prices
  const adminResult = client.getStripeConfigAdmin();

  check(adminResult.data, {
    "admin config: has both prices": (d) => {
      const products = d.data?.config?.products ?? [];
      const prices = products[0]?.prices ?? [];
      return prices.length === 2;
    },
  });

  client.archiveAllStripeConfig();
}
