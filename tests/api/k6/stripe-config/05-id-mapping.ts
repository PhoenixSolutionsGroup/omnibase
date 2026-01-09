import { check, sleep } from "k6";
import { createClient, logError } from "../client";
import type { StripeConfigUpdateRequest } from "../sdk";

/**
 * Stripe Config ID Mapping Tests
 *
 * Tests Stripe ID to config ID conversion, migration support, and local-only resources.
 *
 * Prerequisites:
 * - API running at API_URL (default: http://localhost:8080)
 * - Valid STRIPE_SECRET_KEY environment variable
 * - X-Service-Key header for authentication
 */

// ============================================================================
// STRIPE ID CONVERSION
// ============================================================================

/**
 * After creating a product, should be able to convert its Stripe ID back to config ID.
 */
export function convertStripeIDToConfigID() {
  const client = createClient();
  client.archiveAllStripeConfig();
  // Create config
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
  // Get config to find Stripe IDs
  const getResult = client.getStripeConfigAdmin();
  const products = getResult.data?.data?.config?.products ?? [];
  const product = products.find((p) => p.id === "test_product");
  const stripeProductId = product?.stripe_id;

  if (!stripeProductId) {
    console.error("No stripe_id found on product");
    client.archiveAllStripeConfig();
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
    },
  });

  if (convertResult.data.status !== 200) {
    logError("convertStripeIDToConfigID", convertResult.response);
  }

  client.archiveAllStripeConfig();
}

/**
 * Converting a non-existent Stripe ID should return 404.
 */
export function convertNonExistentStripeID() {
  const client = createClient();

  // Try to convert a fake Stripe ID
  const convertResult = client.convertStripeIDToConfigID(
    "prod_nonexistent12345"
  );

  check(convertResult.data, {
    "non-existent ID: status is 404": (d) => d.status === 404,
  });
}

// ============================================================================
// MIGRATION SUPPORT
// ============================================================================

/**
 * Config with stripe_id should link to existing Stripe resource, not create new.
 */
export function migrationWithStripeID() {
  const client = createClient();
  client.archiveAllStripeConfig();
  // First, create a product normally to get a Stripe ID
  const config1: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    products: [
      {
        id: "original_product",
        name: "Original Product",
        type: "service",
        prices: [
          {
            id: "original_price",
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
  };
  client.updateStripeConfig(config1);
  // Get the Stripe IDs
  const getResult = client.getStripeConfigAdmin();
  const products = getResult.data?.data?.config?.products ?? [];
  const product = products.find((p) => p.id === "original_product");
  const stripeProductId = product?.stripe_id;
  const stripePriceId = product?.prices?.[0]?.stripe_id;

  if (!stripeProductId || !stripePriceId) {
    console.error("Missing stripe_id on product or price");
    client.archiveAllStripeConfig();
    return;
  }

  // Archive (but don't delete from Stripe)
  client.archiveAllStripeConfig();
  // Now create new config with stripe_id pointing to existing resources
  const config2: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    products: [
      {
        id: "new_config_id",
        name: "Linked Product",
        type: "service",
        stripe_id: stripeProductId, // Link to existing
        prices: [
          {
            id: "new_price_id",
            amount: 1000,
            currency: "usd",
            interval: "month",
            stripe_id: stripePriceId, // Link to existing
          },
        ],
      },
    ],
  };
  const result = client.updateStripeConfig(config2);

  check(result.data, {
    "migration: status is 200": (d) => d.status === 200,
    "migration: action is linked": (d) => {
      const created = d.data?.changes?.created ?? [];
      return created.some((p) => p.action === "linked");
    },
  });

  if (result.data.status !== 200) {
    logError("migrationWithStripeID", result.response);
  }

  client.archiveAllStripeConfig();
}

/**
 * Migration should skip if mapping already exists for the stripe_id.
 */
export function migrationSkipsExistingMapping() {
  const client = createClient();
  client.archiveAllStripeConfig();
  // Create a product normally
  const config1: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    products: [
      {
        id: "existing_product",
        name: "Existing Product",
        type: "service",
        prices: [
          {
            id: "existing_price",
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
  };
  client.updateStripeConfig(config1);
  // Get the Stripe ID
  const getResult = client.getStripeConfigAdmin();
  const products = getResult.data?.data?.config?.products ?? [];
  const product = products.find((p) => p.id === "existing_product");
  const stripeProductId = product?.stripe_id;

  if (!stripeProductId) {
    console.error("No stripe_id found on product");
    client.archiveAllStripeConfig();
    return;
  }

  // Try to create another config with same stripe_id (mapping already exists)
  const config2: StripeConfigUpdateRequest = {
    version: "v1.0.1",
    products: [
      {
        id: "existing_product",
        name: "Existing Product Updated",
        type: "service",
        stripe_id: stripeProductId, // Already mapped
        prices: [
          {
            id: "existing_price",
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
    "skip existing: status is 200": (d) => d.status === 200,
    "skip existing: product in updated not created": (d) => {
      const created = d.data?.changes?.created ?? [];
      const updated = d.data?.changes?.updated ?? [];
      // Should be an update, not a new creation with "linked" action
      const wasCreated = created.some(
        (p) => p.product_id === "existing_product"
      );
      const wasUpdated = updated.some(
        (p) => p.product_id === "existing_product"
      );
      return wasUpdated || !wasCreated;
    },
  });

  client.archiveAllStripeConfig();
}

// ============================================================================
// FREE TIER (LOCAL ONLY)
// ============================================================================

/**
 * Product with id="free" should not make Stripe API calls.
 */
export function freeProductLocalOnly() {
  const client = createClient();
  client.archiveAllStripeConfig();
  const config: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    products: [
      {
        id: "free",
        name: "Free Tier",
        type: "service",
        prices: [
          {
            id: "free",
            amount: 0,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
  };
  const result = client.updateStripeConfig(config);

  check(result.data, {
    "free product: status is 200": (d) => d.status === 200,
    "free product: action is created_local": (d) => {
      const created = d.data?.changes?.created ?? [];
      return created.some((p) => p.action === "created_local");
    },
  });

  if (result.data.status !== 200) {
    logError("freeProductLocalOnly", result.response);
  }

  // Verify no stripe_id on free product
  const getResult = client.getStripeConfigAdmin();
  check(getResult.data, {
    "free product: no stripe_id": (d) => {
      const products = d.data?.config?.products ?? [];
      const product = products.find((p) => p.id === "free");
      return product?.stripe_id == null || product?.stripe_id === "";
    },
  });

  client.archiveAllStripeConfig();
}

/**
 * Price with id="free" should not make Stripe API calls.
 */
export function freePriceLocalOnly() {
  const client = createClient();
  client.archiveAllStripeConfig();
  const config: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    products: [
      {
        id: "basic_product",
        name: "Basic Product",
        type: "service",
        prices: [
          {
            id: "free",
            amount: 0,
            currency: "usd",
            interval: "month",
          },
          {
            id: "paid_price",
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
    "free price: status is 200": (d) => d.status === 200,
  });

  if (result.data.status !== 200) {
    logError("freePriceLocalOnly", result.response);
  }

  // Verify free price has no stripe_id but paid price does
  const getResult = client.getStripeConfigAdmin();
  check(getResult.data, {
    "free price: free has no stripe_id": (d) => {
      const products = d.data?.config?.products ?? [];
      const product = products.find((p) => p.id === "basic_product");
      const freePrice = product?.prices?.find((p) => p.id === "free");
      return freePrice?.stripe_id == null || freePrice?.stripe_id === "";
    },
    "free price: paid has stripe_id": (d) => {
      const products = d.data?.config?.products ?? [];
      const product = products.find((p) => p.id === "basic_product");
      const paidPrice = product?.prices?.find((p) => p.id === "paid_price");
      return paidPrice?.stripe_id != null && paidPrice?.stripe_id !== "";
    },
  });

  client.archiveAllStripeConfig();
}

// ============================================================================
// UNARCHIVE SUPPORT
// ============================================================================

/**
 * Re-adding a previously archived product should unarchive it in Stripe.
 */
export function unarchiveExistingProduct() {
  const client = createClient();
  client.archiveAllStripeConfig();
  // Create initial product
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
  // Get the Stripe ID
  const getResult1 = client.getStripeConfigAdmin();
  const products1 = getResult1.data?.data?.config?.products ?? [];
  const product1 = products1.find((p) => p.id === "test_product");
  const originalStripeProductId = product1?.stripe_id;

  if (!originalStripeProductId) {
    console.error("No stripe_id found on product");
    client.archiveAllStripeConfig();
    return;
  }

  // Remove the product (archives in Stripe)
  const config2: StripeConfigUpdateRequest = {
    version: "v1.0.1",
    products: [],
  };
  client.updateStripeConfig(config2);
  // Re-add the same product
  const config3: StripeConfigUpdateRequest = {
    version: "v1.0.2",
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
  const result = client.updateStripeConfig(config3);

  check(result.data, {
    "unarchive: status is 200": (d) => d.status === 200,
    "unarchive: product was created or unarchived": (d) => {
      const created = d.data?.changes?.created ?? [];
      return created.some((p) => p.product_id === "test_product");
    },
  });

  if (result.data.status !== 200) {
    logError("unarchiveExistingProduct", result.response);
  }

  // Verify the product is back with same or new stripe_id
  const getResult2 = client.getStripeConfigAdmin();
  check(getResult2.data, {
    "unarchive: product exists after re-add": (d) => {
      const products = d.data?.config?.products ?? [];
      return products.some((p) => p.id === "test_product");
    },
    "unarchive: product has stripe_id": (d) => {
      const products = d.data?.config?.products ?? [];
      const product = products.find((p) => p.id === "test_product");
      return product?.stripe_id != null && product?.stripe_id !== "";
    },
  });

  client.archiveAllStripeConfig();
}

// ============================================================================
// PRICE ID CONVERSION
// ============================================================================

/**
 * Convert price Stripe ID to config ID.
 */
export function convertPriceStripeIDToConfigID() {
  const client = createClient();
  client.archiveAllStripeConfig();
  // Create config
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
  // Get config to find Stripe IDs
  const getResult = client.getStripeConfigAdmin();
  const products = getResult.data?.data?.config?.products ?? [];
  const product = products.find((p) => p.id === "test_product");
  const stripePriceId = product?.prices?.[0]?.stripe_id;

  if (!stripePriceId) {
    console.error("No stripe_id found on price");
    client.archiveAllStripeConfig();
    return;
  }

  // Convert Stripe ID to config ID
  const convertResult = client.convertStripeIDToConfigID(stripePriceId);

  check(convertResult.data, {
    "convert price ID: status is 200": (d) => d.status === 200,
    "convert price ID: returns correct config_id": (d) => {
      return d.data?.config_id === "test_price";
    },
    "convert price ID: returns correct item_type": (d) => {
      return d.data?.item_type === "price";
    },
  });

  client.archiveAllStripeConfig();
}
