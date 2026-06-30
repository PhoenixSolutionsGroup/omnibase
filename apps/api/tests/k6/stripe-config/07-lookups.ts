import { check, sleep } from "k6";
import { createClient, logError } from "../client";
import type { ErrorResponse, StripeConfigUpdateRequest } from "../sdk";

/**
 * Stripe Config Resource Lookup Tests
 *
 * Tests individual resource lookup endpoints for prices, products, and meters.
 * Also tests public vs admin config filtering of enterprise prices.
 *
 * Prerequisites:
 * - API running at API_URL (default: http://localhost:8080)
 * - Valid STRIPE_SECRET_KEY environment variable
 * - X-Service-Key header for authentication
 */

// ============================================================================
// PRICE LOOKUPS
// ============================================================================

/**
 * Get price by config ID should return price with product context.
 */
export function getPriceByID() {
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
  const result = client.getPriceByID("test_price");

  check(result.data, {
    "get price: status is 200": (d) => d.status === 200,
    "get price: returns price": (d) => d.data?.price?.id === "test_price",
    "get price: returns parent product": (d) =>
      d.data?.product?.id === "test_product",
    "get price: price has stripe_id": (d) =>
      d.data?.price?.stripe_id != null && d.data?.price?.stripe_id !== "",
  });

  if (result.data.status !== 200) {
    logError("getPriceByID", result.response);
  }

  client.archiveAllStripeConfig();
}

/**
 * Get non-existent price should return 404.
 */
export function getPriceByIDNotFound() {
  const client = createClient();

  const result = client.getPriceByID("non_existent_price");

  // Error response has different shape
  const data = result.data as unknown as ErrorResponse;

  check(data, {
    "price not found: status is 404": (d) => d.status === 404,
    "price not found: has error": (d) => d.error != null && d.error.length > 0,
  });
}

// ============================================================================
// PRODUCT LOOKUPS
// ============================================================================

/**
 * Get product by config ID should return product with all prices.
 */
export function getProductByID() {
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
            id: "monthly_price",
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
          {
            id: "yearly_price",
            amount: 10000,
            currency: "usd",
            interval: "year",
          },
        ],
      },
    ],
  };
  client.updateStripeConfig(config);
  const result = client.getProductByID("test_product");

  check(result.data, {
    "get product: status is 200": (d) => d.status === 200,
    "get product: returns product": (d) =>
      d.data?.product?.id === "test_product",
    "get product: product has stripe_id": (d) =>
      d.data?.product?.stripe_id != null && d.data?.product?.stripe_id !== "",
    "get product: includes all prices": (d) =>
      (d.data?.product?.prices?.length ?? 0) === 2,
  });

  if (result.data.status !== 200) {
    logError("getProductByID", result.response);
  }

  client.archiveAllStripeConfig();
}

/**
 * Get non-existent product should return 404.
 */
export function getProductByIDNotFound() {
  const client = createClient();

  const result = client.getProductByID("non_existent_product");

  // Error response has different shape
  const data = result.data as unknown as ErrorResponse;

  check(data, {
    "product not found: status is 404": (d) => d.status === 404,
    "product not found: has error": (d) =>
      d.error != null && d.error.length > 0,
  });
}

// ============================================================================
// METER LOOKUPS
// ============================================================================

/**
 * Get meter by config ID should return meter with stripe_id.
 */
export function getMeterByID() {
  const client = createClient();
  client.archiveAllStripeConfig();
  const config: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    meters: [
      {
        id: "api_calls",
        display_name: "API Calls",
        event_name: "api_call",
        default_aggregation: { formula: "sum" },
      },
    ],
    products: [
      {
        id: "metered_product",
        name: "Metered Product",
        type: "service",
        prices: [
          {
            id: "metered_price",
            amount: 10,
            currency: "usd",
            interval: "month",
            usage_type: "metered",
            meter: "api_calls",
            billing_scheme: "per_unit",
          },
        ],
      },
    ],
  };
  client.updateStripeConfig(config);
  const result = client.getMeterByID("api_calls");

  check(result.data, {
    "get meter: status is 200": (d) => d.status === 200,
    "get meter: returns meter": (d) => d.data?.meter?.id === "api_calls",
    "get meter: has display_name": (d) =>
      d.data?.meter?.display_name === "API Calls",
    "get meter: has event_name": (d) =>
      d.data?.meter?.event_name === "api_call",
    "get meter: has stripe_id": (d) =>
      d.data?.meter?.stripe_id != null && d.data?.meter?.stripe_id !== "",
  });

  if (result.data.status !== 200) {
    logError("getMeterByID", result.response);
  }

  client.archiveAllStripeConfig();
}

/**
 * Get non-existent meter should return 404.
 */
export function getMeterByIDNotFound() {
  const client = createClient();

  const result = client.getMeterByID("non_existent_meter");

  // Error response has different shape
  const data = result.data as unknown as ErrorResponse;

  check(data, {
    "meter not found: status is 404": (d) => d.status === 404,
    "meter not found: has error": (d) => d.error != null && d.error.length > 0,
  });
}

// ============================================================================
// PUBLIC CONFIG EDGE CASES
// ============================================================================

/**
 * Products with only private prices should be excluded from public config.
 * Note: Basic public/admin filtering is tested in 01-crud.ts publicConfigFiltersPrivatePrices
 */
export function productsWithNoPublicPricesExcluded() {
  const client = createClient();
  client.archiveAllStripeConfig();
  const config: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    products: [
      {
        id: "public_product",
        name: "Public Product",
        type: "service",
        prices: [
          {
            id: "public_price",
            amount: 1000,
            currency: "usd",
            interval: "month",
            public: true,
          },
        ],
      },
      {
        id: "enterprise_only_product",
        name: "Enterprise Only Product",
        type: "service",
        prices: [
          {
            id: "enterprise_price",
            amount: 500,
            currency: "usd",
            interval: "month",
            public: false,
            enterprise_id: "acme_corp",
          },
        ],
      },
    ],
  };
  client.updateStripeConfig(config);
  // Get public config
  const result = client.getStripeConfig();

  check(result.data, {
    "exclude private only: status is 200": (d) => d.status === 200,
    "exclude private only: has public product": (d) => {
      const products = d.data?.config?.products ?? [];
      return products.some((p) => p.id === "public_product");
    },
    "exclude private only: excludes enterprise-only product": (d) => {
      const products = d.data?.config?.products ?? [];
      return !products.some((p) => p.id === "enterprise_only_product");
    },
  });

  if (result.data.status !== 200) {
    logError("productsWithNoPublicPricesExcluded", result.response);
  }

  client.archiveAllStripeConfig();
}
