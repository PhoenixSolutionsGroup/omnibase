import { check, sleep } from "k6";
import { createClient, logError } from "../client";
import {
  MeterDefaultAggregationFormula,
  type StripeConfigUpdateRequest,
} from "../sdk";

/**
 * Stripe Config Differ Tests
 *
 * Tests that the differ correctly identifies new, updated, and archived resources.
 * Verifies that the change detection logic properly categorizes modifications
 * and handles immutable price fields (which require archive + create).
 *
 * Prerequisites:
 * - API running at API_URL (default: http://localhost:8080)
 * - Valid STRIPE_SECRET_KEY environment variable
 * - X-Service-Key header for authentication
 */

// ============================================================================
// DETECT NEW RESOURCES TESTS
// ============================================================================

/**
 * Adding a new product to existing config should appear in changes.created.
 */
export function detectNewProduct() {
  const client = createClient();
  client.archiveAllStripeConfig();
  // Create initial config with one product
  const config1: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    products: [
      {
        id: "product_a",
        name: "Product A",
        type: "service",
        prices: [
          { id: "price_a", amount: 1000, currency: "usd", interval: "month" },
        ],
      },
    ],
  };
  client.updateStripeConfig(config1);
  // Add second product
  const config2: StripeConfigUpdateRequest = {
    version: "v1.0.1",
    products: [
      {
        id: "product_a",
        name: "Product A",
        type: "service",
        prices: [
          { id: "price_a", amount: 1000, currency: "usd", interval: "month" },
        ],
      },
      {
        id: "product_b",
        name: "Product B",
        type: "service",
        prices: [
          { id: "price_b", amount: 2000, currency: "usd", interval: "month" },
        ],
      },
    ],
  };
  const result = client.updateStripeConfig(config2);

  check(result.data, {
    "detect new product: status is 200": (d) => d.status === 200,
    "detect new product: product_b in created": (d) => {
      const created = d.data?.changes?.created ?? [];
      return created.some((p) => p.product_id === "product_b");
    },
    "detect new product: product_a not in created": (d) => {
      const created = d.data?.changes?.created ?? [];
      return !created.some((p) => p.product_id === "product_a");
    },
    "detect new product: product_b action is created": (d) => {
      const created = d.data?.changes?.created ?? [];
      const productB = created.find((p) => p.product_id === "product_b");
      return productB?.action === "created";
    },
  });

  if (result.data.status !== 200) {
    logError("detectNewProduct", result.response);
  }

  client.archiveAllStripeConfig();
}

/**
 * Adding a new price to existing product should appear in changes.
 */
export function detectNewPrice() {
  const client = createClient();
  client.archiveAllStripeConfig();
  // Create initial config with one price
  const config1: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    products: [
      {
        id: "test_product",
        name: "Test Product",
        type: "service",
        prices: [
          {
            id: "monthly_price",
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
  };
  client.updateStripeConfig(config1);
  // Add annual price
  const config2: StripeConfigUpdateRequest = {
    version: "v1.0.1",
    products: [
      {
        id: "test_product",
        name: "Test Product",
        type: "service",
        prices: [
          {
            id: "monthly_price",
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
          {
            id: "annual_price",
            amount: 10000,
            currency: "usd",
            interval: "year",
          },
        ],
      },
    ],
  };
  const result = client.updateStripeConfig(config2);

  check(result.data, {
    "detect new price: status is 200": (d) => d.status === 200,
    "detect new price: product in updated": (d) => {
      const updated = d.data?.changes?.updated ?? [];
      return updated.some((p) => p.product_id === "test_product");
    },
    "detect new price: details mention new price": (d) => {
      const updated = d.data?.changes?.updated ?? [];
      const product = updated.find((p) => p.product_id === "test_product");
      const details = product?.details ?? [];
      return details.some(
        (dt) =>
          dt.toLowerCase().includes("created") &&
          dt.toLowerCase().includes("annual_price")
      );
    },
  });

  if (result.data.status !== 200) {
    logError("detectNewPrice", result.response);
  }

  client.archiveAllStripeConfig();
}

/**
 * Adding a new meter to existing config should appear in changes.meters.created.
 */
export function detectNewMeter() {
  const client = createClient();
  client.archiveAllStripeConfig();
  // Create initial config with one meter
  const config1: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    meters: [
      {
        id: "meter_a",
        display_name: "Meter A",
        event_name: "event_a",
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
            id: "price_a",
            amount: 0.01,
            currency: "usd",
            interval: "month",
            usage_type: "metered",
            meter: "meter_a",
            billing_scheme: "per_unit",
          },
        ],
      },
    ],
  };
  client.updateStripeConfig(config1);
  // Add second meter
  const config2: StripeConfigUpdateRequest = {
    version: "v1.0.1",
    meters: [
      {
        id: "meter_a",
        display_name: "Meter A",
        event_name: "event_a",
        default_aggregation: { formula: MeterDefaultAggregationFormula.sum },
      },
      {
        id: "meter_b",
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
            id: "price_a",
            amount: 0.01,
            currency: "usd",
            interval: "month",
            usage_type: "metered",
            meter: "meter_a",
            billing_scheme: "per_unit",
          },
          {
            id: "price_b",
            amount: 0.02,
            currency: "usd",
            interval: "month",
            usage_type: "metered",
            meter: "meter_b",
            billing_scheme: "per_unit",
          },
        ],
      },
    ],
  };
  const result = client.updateStripeConfig(config2);

  check(result.data, {
    "detect new meter: status is 200": (d) => d.status === 200,
    "detect new meter: meter_b in meters.created": (d) => {
      const created = d.data?.changes?.meters?.created ?? [];
      return created.some((m) => m.meter_id === "meter_b");
    },
    "detect new meter: meter_a not in meters.created": (d) => {
      const created = d.data?.changes?.meters?.created ?? [];
      return !created.some((m) => m.meter_id === "meter_a");
    },
  });

  if (result.data.status !== 200) {
    logError("detectNewMeter", result.response);
  }

  client.archiveAllStripeConfig();
}

// ============================================================================
// DETECT UPDATES TESTS
// ============================================================================

/**
 * Updating a product's name (mutable field) should appear in changes.updated.
 */
export function detectProductNameUpdate() {
  const client = createClient();
  client.archiveAllStripeConfig();
  // Create initial config
  const config1: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    products: [
      {
        id: "test_product",
        name: "Original Name",
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
  client.updateStripeConfig(config1);
  // Update name
  const config2: StripeConfigUpdateRequest = {
    version: "v1.0.1",
    products: [
      {
        id: "test_product",
        name: "Updated Name",
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
  const result = client.updateStripeConfig(config2);

  check(result.data, {
    "detect name update: status is 200": (d) => d.status === 200,
    "detect name update: product in updated": (d) => {
      const updated = d.data?.changes?.updated ?? [];
      return updated.some((p) => p.product_id === "test_product");
    },
    "detect name update: action is updated": (d) => {
      const updated = d.data?.changes?.updated ?? [];
      const product = updated.find((p) => p.product_id === "test_product");
      return product?.action === "updated";
    },
    "detect name update: not in created": (d) => {
      const created = d.data?.changes?.created ?? [];
      return !created.some((p) => p.product_id === "test_product");
    },
  });

  // Verify via GET
  const getResult = client.getStripeConfigAdmin();
  check(getResult.data, {
    "detect name update: GET shows new name": (d) => {
      return d.data?.config?.products?.[0]?.name === "Updated Name";
    },
  });

  client.archiveAllStripeConfig();
}

/**
 * Updating a product's description should appear in changes.updated.
 */
export function detectProductDescriptionUpdate() {
  const client = createClient();
  client.archiveAllStripeConfig();
  // Create initial config
  const config1: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    products: [
      {
        id: "test_product",
        name: "Test Product",
        description: "Original description",
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
  client.updateStripeConfig(config1);
  // Update description
  const config2: StripeConfigUpdateRequest = {
    version: "v1.0.1",
    products: [
      {
        id: "test_product",
        name: "Test Product",
        description: "Updated description",
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
  const result = client.updateStripeConfig(config2);

  check(result.data, {
    "detect description update: status is 200": (d) => d.status === 200,
    "detect description update: product in updated": (d) => {
      const updated = d.data?.changes?.updated ?? [];
      return updated.some((p) => p.product_id === "test_product");
    },
  });

  // Verify via GET
  const getResult = client.getStripeConfigAdmin();
  check(getResult.data, {
    "detect description update: GET shows new description": (d) => {
      return (
        d.data?.config?.products?.[0]?.description === "Updated description"
      );
    },
  });

  client.archiveAllStripeConfig();
}

// ============================================================================
// DETECT REMOVED RESOURCES TESTS
// ============================================================================

/**
 * Removing a product should appear in changes.archived.
 */
export function detectRemovedProduct() {
  const client = createClient();
  client.archiveAllStripeConfig();
  // Create initial config with two products
  const config1: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    products: [
      {
        id: "product_a",
        name: "Product A",
        type: "service",
        prices: [
          { id: "price_a", amount: 1000, currency: "usd", interval: "month" },
        ],
      },
      {
        id: "product_b",
        name: "Product B",
        type: "service",
        prices: [
          { id: "price_b", amount: 2000, currency: "usd", interval: "month" },
        ],
      },
    ],
  };
  client.updateStripeConfig(config1);
  // Remove product_b
  const config2: StripeConfigUpdateRequest = {
    version: "v1.0.1",
    products: [
      {
        id: "product_a",
        name: "Product A",
        type: "service",
        prices: [
          { id: "price_a", amount: 1000, currency: "usd", interval: "month" },
        ],
      },
    ],
  };
  const result = client.updateStripeConfig(config2);

  check(result.data, {
    "detect removed product: status is 200": (d) => d.status === 200,
    "detect removed product: product_b in archived": (d) => {
      const archived = d.data?.changes?.archived ?? [];
      return archived.some((p) => p.product_id === "product_b");
    },
    "detect removed product: product_a not in archived": (d) => {
      const archived = d.data?.changes?.archived ?? [];
      return !archived.some((p) => p.product_id === "product_a");
    },
  });

  // Verify via GET
  const getResult = client.getStripeConfigAdmin();
  check(getResult.data, {
    "detect removed product: GET has only product_a": (d) => {
      const products = d.data?.config?.products ?? [];
      return products.length === 1 && products[0]?.id === "product_a";
    },
  });

  client.archiveAllStripeConfig();
}

/**
 * Removing a price should appear in changes.
 */
export function detectRemovedPrice() {
  const client = createClient();
  client.archiveAllStripeConfig();
  // Create initial config with two prices
  const config1: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    products: [
      {
        id: "test_product",
        name: "Test Product",
        type: "service",
        prices: [
          {
            id: "monthly_price",
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
          {
            id: "annual_price",
            amount: 10000,
            currency: "usd",
            interval: "year",
          },
        ],
      },
    ],
  };
  client.updateStripeConfig(config1);
  // Remove annual price
  const config2: StripeConfigUpdateRequest = {
    version: "v1.0.1",
    products: [
      {
        id: "test_product",
        name: "Test Product",
        type: "service",
        prices: [
          {
            id: "monthly_price",
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
  };
  const result = client.updateStripeConfig(config2);

  check(result.data, {
    "detect removed price: status is 200": (d) => d.status === 200,
    "detect removed price: product in updated": (d) => {
      const updated = d.data?.changes?.updated ?? [];
      return updated.some((p) => p.product_id === "test_product");
    },
    "detect removed price: details mention archived price": (d) => {
      const updated = d.data?.changes?.updated ?? [];
      const product = updated.find((p) => p.product_id === "test_product");
      const details = product?.details ?? [];
      return details.some(
        (dt) =>
          dt.toLowerCase().includes("archived") &&
          dt.toLowerCase().includes("annual_price")
      );
    },
  });

  // Verify via GET
  const getResult = client.getStripeConfigAdmin();
  check(getResult.data, {
    "detect removed price: GET has only monthly price": (d) => {
      const prices = d.data?.config?.products?.[0]?.prices ?? [];
      return prices.length === 1 && prices[0]?.id === "monthly_price";
    },
  });

  client.archiveAllStripeConfig();
}

/**
 * Removing a meter should appear in changes.meters.archived.
 */
export function detectRemovedMeter() {
  const client = createClient();
  client.archiveAllStripeConfig();
  // Create initial config with two meters
  const config1: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    meters: [
      {
        id: "meter_a",
        display_name: "Meter A",
        event_name: "event_a",
        default_aggregation: { formula: MeterDefaultAggregationFormula.sum },
      },
      {
        id: "meter_b",
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
            id: "price_a",
            amount: 0.01,
            currency: "usd",
            interval: "month",
            usage_type: "metered",
            meter: "meter_a",
            billing_scheme: "per_unit",
          },
          {
            id: "price_b",
            amount: 0.02,
            currency: "usd",
            interval: "month",
            usage_type: "metered",
            meter: "meter_b",
            billing_scheme: "per_unit",
          },
        ],
      },
    ],
  };
  client.updateStripeConfig(config1);
  // Remove meter_b and its price
  const config2: StripeConfigUpdateRequest = {
    version: "v1.0.1",
    meters: [
      {
        id: "meter_a",
        display_name: "Meter A",
        event_name: "event_a",
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
            id: "price_a",
            amount: 0.01,
            currency: "usd",
            interval: "month",
            usage_type: "metered",
            meter: "meter_a",
            billing_scheme: "per_unit",
          },
        ],
      },
    ],
  };
  const result = client.updateStripeConfig(config2);

  check(result.data, {
    "detect removed meter: status is 200": (d) => d.status === 200,
    "detect removed meter: meter_b in meters.archived": (d) => {
      const archived = d.data?.changes?.meters?.archived ?? [];
      return archived.some((m) => m.meter_id === "meter_b");
    },
    "detect removed meter: meter_a not in meters.archived": (d) => {
      const archived = d.data?.changes?.meters?.archived ?? [];
      return !archived.some((m) => m.meter_id === "meter_a");
    },
  });

  // Verify via GET
  const getResult = client.getStripeConfigAdmin();
  check(getResult.data, {
    "detect removed meter: GET has only meter_a": (d) => {
      const meters = d.data?.config?.meters ?? [];
      return meters.length === 1 && meters[0]?.id === "meter_a";
    },
  });

  client.archiveAllStripeConfig();
}

// ============================================================================
// PRICE RECREATION TESTS (Immutable Fields)
// ============================================================================

/**
 * Changing a price's amount (immutable in Stripe) should archive old and create new.
 */
export function priceAmountChangeTriggersRecreation() {
  const client = createClient();
  client.archiveAllStripeConfig();
  // Create initial config
  const config1: StripeConfigUpdateRequest = {
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
  client.updateStripeConfig(config1);
  // Get original stripe_id
  const originalConfig = client.getStripeConfigAdmin();
  const originalStripeId =
    originalConfig.data?.data?.config?.products?.[0]?.prices?.[0]?.stripe_id;

  // Change price amount
  const config2: StripeConfigUpdateRequest = {
    version: "v1.0.1",
    products: [
      {
        id: "test_product",
        name: "Test Product",
        type: "service",
        prices: [
          {
            id: "test_price",
            amount: 2000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
  };
  const result = client.updateStripeConfig(config2);

  check(result.data, {
    "price amount change: status is 200": (d) => d.status === 200,
    "price amount change: product in updated": (d) => {
      const updated = d.data?.changes?.updated ?? [];
      return updated.some((p) => p.product_id === "test_product");
    },
    "price amount change: details mention archived": (d) => {
      const updated = d.data?.changes?.updated ?? [];
      const product = updated.find((p) => p.product_id === "test_product");
      const details = product?.details ?? [];
      return details.some((dt) => dt.toLowerCase().includes("archived"));
    },
    "price amount change: details mention created": (d) => {
      const updated = d.data?.changes?.updated ?? [];
      const product = updated.find((p) => p.product_id === "test_product");
      const details = product?.details ?? [];
      return details.some((dt) => dt.toLowerCase().includes("created"));
    },
  });

  // Verify stripe_id changed
  const newConfig = client.getStripeConfigAdmin();
  const newStripeId =
    newConfig.data?.data?.config?.products?.[0]?.prices?.[0]?.stripe_id;

  check(newConfig.data, {
    "price amount change: stripe_id changed": () => {
      return Boolean(
        originalStripeId && newStripeId && originalStripeId !== newStripeId
      );
    },
    "price amount change: new amount is 2000": (d) => {
      return d.data?.config?.products?.[0]?.prices?.[0]?.amount === 2000;
    },
  });

  client.archiveAllStripeConfig();
}

/**
 * Changing a price's currency (immutable in Stripe) should archive old and create new.
 */
export function priceCurrencyChangeTriggersRecreation() {
  const client = createClient();
  client.archiveAllStripeConfig();
  // Create initial config
  const config1: StripeConfigUpdateRequest = {
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
  client.updateStripeConfig(config1);
  // Get original stripe_id
  const originalConfig = client.getStripeConfigAdmin();
  const originalStripeId =
    originalConfig.data?.data?.config?.products?.[0]?.prices?.[0]?.stripe_id;

  // Change currency
  const config2: StripeConfigUpdateRequest = {
    version: "v1.0.1",
    products: [
      {
        id: "test_product",
        name: "Test Product",
        type: "service",
        prices: [
          {
            id: "test_price",
            amount: 1000,
            currency: "eur",
            interval: "month",
          },
        ],
      },
    ],
  };
  const result = client.updateStripeConfig(config2);

  check(result.data, {
    "price currency change: status is 200": (d) => d.status === 200,
    "price currency change: product in updated": (d) => {
      const updated = d.data?.changes?.updated ?? [];
      return updated.some((p) => p.product_id === "test_product");
    },
  });

  // Verify stripe_id changed
  const newConfig = client.getStripeConfigAdmin();
  const newStripeId =
    newConfig.data?.data?.config?.products?.[0]?.prices?.[0]?.stripe_id;

  check(newConfig.data, {
    "price currency change: stripe_id changed": () => {
      return Boolean(
        originalStripeId && newStripeId && originalStripeId !== newStripeId
      );
    },
    "price currency change: new currency is eur": (d) => {
      return d.data?.config?.products?.[0]?.prices?.[0]?.currency === "eur";
    },
  });

  client.archiveAllStripeConfig();
}

/**
 * Changing a price's interval (immutable in Stripe) should archive old and create new.
 */
export function priceIntervalChangeTriggersRecreation() {
  const client = createClient();
  client.archiveAllStripeConfig();
  // Create initial config with monthly price
  const config1: StripeConfigUpdateRequest = {
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
  client.updateStripeConfig(config1);
  // Get original stripe_id
  const originalConfig = client.getStripeConfigAdmin();
  const originalStripeId =
    originalConfig.data?.data?.config?.products?.[0]?.prices?.[0]?.stripe_id;

  // Change to annual interval
  const config2: StripeConfigUpdateRequest = {
    version: "v1.0.1",
    products: [
      {
        id: "test_product",
        name: "Test Product",
        type: "service",
        prices: [
          { id: "test_price", amount: 1000, currency: "usd", interval: "year" },
        ],
      },
    ],
  };
  const result = client.updateStripeConfig(config2);

  check(result.data, {
    "price interval change: status is 200": (d) => d.status === 200,
    "price interval change: product in updated": (d) => {
      const updated = d.data?.changes?.updated ?? [];
      return updated.some((p) => p.product_id === "test_product");
    },
  });

  // Verify stripe_id changed
  const newConfig = client.getStripeConfigAdmin();
  const newStripeId =
    newConfig.data?.data?.config?.products?.[0]?.prices?.[0]?.stripe_id;

  check(newConfig.data, {
    "price interval change: stripe_id changed": () => {
      return Boolean(
        originalStripeId && newStripeId && originalStripeId !== newStripeId
      );
    },
    "price interval change: new interval is year": (d) => {
      return d.data?.config?.products?.[0]?.prices?.[0]?.interval === "year";
    },
  });

  client.archiveAllStripeConfig();
}

/**
 * Changing usage_type from licensed to metered should archive and create new price.
 */
export function priceUsageTypeChangeTriggersRecreation() {
  const client = createClient();
  client.archiveAllStripeConfig();
  // Create initial config with licensed price
  const config1: StripeConfigUpdateRequest = {
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
            amount: 1000,
            currency: "usd",
            interval: "month",
            usage_type: "licensed",
          },
        ],
      },
    ],
  };
  client.updateStripeConfig(config1);
  // Get original stripe_id
  const originalConfig = client.getStripeConfigAdmin();
  const originalStripeId =
    originalConfig.data?.data?.config?.products?.[0]?.prices?.[0]?.stripe_id;

  // Change to metered
  const config2: StripeConfigUpdateRequest = {
    version: "v1.0.1",
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
            amount: 0.01,
            currency: "usd",
            interval: "month",
            usage_type: "metered",
            meter: "test_meter",
            billing_scheme: "per_unit",
          },
        ],
      },
    ],
  };
  const result = client.updateStripeConfig(config2);

  check(result.data, {
    "price usage_type change: status is 200": (d) => d.status === 200,
    "price usage_type change: product in updated": (d) => {
      const updated = d.data?.changes?.updated ?? [];
      return updated.some((p) => p.product_id === "test_product");
    },
  });

  // Verify stripe_id changed
  const newConfig = client.getStripeConfigAdmin();
  const newStripeId =
    newConfig.data?.data?.config?.products?.[0]?.prices?.[0]?.stripe_id;

  check(newConfig.data, {
    "price usage_type change: stripe_id changed": () => {
      return Boolean(
        originalStripeId && newStripeId && originalStripeId !== newStripeId
      );
    },
    "price usage_type change: new usage_type is metered": (d) => {
      return (
        d.data?.config?.products?.[0]?.prices?.[0]?.usage_type === "metered"
      );
    },
  });

  client.archiveAllStripeConfig();
}

// ============================================================================
// NO CHANGE DETECTION TESTS
// ============================================================================

/**
 * Identical config push should return "no change was made".
 */
export function noChangeOnIdenticalConfig() {
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

  // First push
  client.updateStripeConfig(config);
  // Second push (identical)
  const result = client.updateStripeConfig(config);

  check(result.data, {
    "no change: status is 200": (d) => d.status === 200,
    "no change: message indicates no change": (d) => {
      return d.data?.message === "no change was made";
    },
    "no change: no created changes": (d) => {
      return (d.data?.changes?.created?.length ?? 0) === 0;
    },
    "no change: no updated changes": (d) => {
      return (d.data?.changes?.updated?.length ?? 0) === 0;
    },
    "no change: no archived changes": (d) => {
      return (d.data?.changes?.archived?.length ?? 0) === 0;
    },
  });

  client.archiveAllStripeConfig();
}

/**
 * Only version change (no actual changes) should return "no change was made".
 */
export function noChangeOnVersionOnlyUpdate() {
  const client = createClient();
  client.archiveAllStripeConfig();
  // Create initial config
  const config1: StripeConfigUpdateRequest = {
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
  client.updateStripeConfig(config1);
  // Update only version
  const config2: StripeConfigUpdateRequest = {
    version: "v1.0.1", // Only this changed
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
  const result = client.updateStripeConfig(config2);

  check(result.data, {
    "version only: status is 200": (d) => d.status === 200,
    "version only: message indicates no change": (d) => {
      return d.data?.message === "no change was made";
    },
  });

  client.archiveAllStripeConfig();
}
