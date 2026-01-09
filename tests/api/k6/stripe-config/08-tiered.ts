import { check, sleep } from "k6";
import { createClient, logError } from "../client";
import type { StripeConfigUpdateRequest } from "../sdk";

/**
 * Stripe Config Tiered Pricing Tests
 *
 * Tests tiered pricing (graduated and volume) creation and retrieval.
 *
 * Prerequisites:
 * - API running at API_URL (default: http://localhost:8080)
 * - Valid STRIPE_SECRET_KEY environment variable
 * - X-Service-Key header for authentication
 */

// ============================================================================
// GRADUATED TIERED PRICING
// ============================================================================

/**
 * Create tiered price with graduated tiers_mode.
 * Graduated pricing charges each tier separately.
 */
export function createGraduatedTieredPrice() {
  const client = createClient();
  client.archiveAllStripeConfig();
  const config: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    meters: [
      {
        id: "usage_meter",
        display_name: "Usage",
        event_name: "usage_event",
        default_aggregation: { formula: "sum" },
      },
    ],
    products: [
      {
        id: "tiered_product",
        name: "Tiered Product",
        type: "service",
        prices: [
          {
            id: "graduated_price",
            currency: "usd",
            interval: "month",
            usage_type: "metered",
            meter: "usage_meter",
            billing_scheme: "tiered",
            tiers_mode: "graduated",
            tiers: [
              { up_to: 100, unit_amount: 10, flat_amount: 0 },
              { up_to: 1000, unit_amount: 8, flat_amount: 0 },
              { up_to: "inf", unit_amount: 5, flat_amount: 0 },
            ],
          },
        ],
      },
    ],
  };

  const result = client.updateStripeConfig(config);

  check(result.data, {
    "graduated tiered: status is 200": (d) => d.status === 200,
    "graduated tiered: created product": (d) => {
      const created = d.data?.changes?.created ?? [];
      return created.some((p) => p.product_id === "tiered_product");
    },
  });

  if (result.data.status !== 200) {
    logError("createGraduatedTieredPrice", result.response);
  }

  // Verify the config was saved correctly
  const getResult = client.getStripeConfigAdmin();

  check(getResult.data, {
    "graduated tiered: config has product": (d) => {
      const products = d.data?.config?.products ?? [];
      return products.some((p) => p.id === "tiered_product");
    },
    "graduated tiered: price has tiers_mode graduated": (d) => {
      const products = d.data?.config?.products ?? [];
      const product = products.find((p) => p.id === "tiered_product");
      const price = product?.prices?.[0];
      return price?.tiers_mode === "graduated";
    },
    "graduated tiered: price has 3 tiers": (d) => {
      const products = d.data?.config?.products ?? [];
      const product = products.find((p) => p.id === "tiered_product");
      const price = product?.prices?.[0];
      return price?.tiers?.length === 3;
    },
  });

  client.archiveAllStripeConfig();
}

// ============================================================================
// VOLUME TIERED PRICING
// ============================================================================

/**
 * Create tiered price with volume tiers_mode.
 * Volume pricing applies single tier rate to all units.
 */
export function createVolumeTieredPrice() {
  const client = createClient();
  client.archiveAllStripeConfig();
  const config: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    meters: [
      {
        id: "api_calls_meter",
        display_name: "API Calls",
        event_name: "api_call",
        default_aggregation: { formula: "count" },
      },
    ],
    products: [
      {
        id: "volume_product",
        name: "Volume Product",
        type: "service",
        prices: [
          {
            id: "volume_price",
            currency: "usd",
            interval: "month",
            usage_type: "metered",
            meter: "api_calls_meter",
            billing_scheme: "tiered",
            tiers_mode: "volume",
            tiers: [
              { up_to: 1000, unit_amount: 100, flat_amount: 0 },
              { up_to: 10000, unit_amount: 50, flat_amount: 0 },
              { up_to: "inf", unit_amount: 25, flat_amount: 0 },
            ],
          },
        ],
      },
    ],
  };

  const result = client.updateStripeConfig(config);

  check(result.data, {
    "volume tiered: status is 200": (d) => d.status === 200,
    "volume tiered: created product": (d) => {
      const created = d.data?.changes?.created ?? [];
      return created.some((p) => p.product_id === "volume_product");
    },
  });

  if (result.data.status !== 200) {
    logError("createVolumeTieredPrice", result.response);
  }

  // Verify the config was saved correctly
  const getResult = client.getStripeConfigAdmin();

  check(getResult.data, {
    "volume tiered: config has product": (d) => {
      const products = d.data?.config?.products ?? [];
      return products.some((p) => p.id === "volume_product");
    },
    "volume tiered: price has tiers_mode volume": (d) => {
      const products = d.data?.config?.products ?? [];
      const product = products.find((p) => p.id === "volume_product");
      const price = product?.prices?.[0];
      return price?.tiers_mode === "volume";
    },
  });

  client.archiveAllStripeConfig();
}

// ============================================================================
// TIERS STRUCTURE VERIFICATION
// ============================================================================

/**
 * Verify tiers structure is preserved correctly.
 */
export function verifyTiersStructure() {
  const client = createClient();
  client.archiveAllStripeConfig();
  const config: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    meters: [
      {
        id: "storage_meter",
        display_name: "Storage",
        event_name: "storage_used",
        default_aggregation: { formula: "sum" },
      },
    ],
    products: [
      {
        id: "storage_product",
        name: "Storage Product",
        type: "service",
        prices: [
          {
            id: "storage_price",
            currency: "usd",
            interval: "month",
            usage_type: "metered",
            meter: "storage_meter",
            billing_scheme: "tiered",
            tiers_mode: "graduated",
            tiers: [
              { up_to: 10, unit_amount: 500, flat_amount: 1000 },
              { up_to: 50, unit_amount: 400, flat_amount: 500 },
              { up_to: 100, unit_amount: 300, flat_amount: 0 },
              { up_to: "inf", unit_amount: 200, flat_amount: 0 },
            ],
          },
        ],
      },
    ],
  };

  client.updateStripeConfig(config);
  const getResult = client.getStripeConfigAdmin();

  check(getResult.data, {
    "tiers structure: status is 200": (d) => d.status === 200,
    "tiers structure: has 4 tiers": (d) => {
      const products = d.data?.config?.products ?? [];
      const product = products.find((p) => p.id === "storage_product");
      const price = product?.prices?.[0];
      return price?.tiers?.length === 4;
    },
    "tiers structure: first tier up_to is 10": (d) => {
      const products = d.data?.config?.products ?? [];
      const product = products.find((p) => p.id === "storage_product");
      const price = product?.prices?.[0];
      const tiers = price?.tiers ?? [];
      return tiers[0]?.up_to === 10;
    },
    "tiers structure: first tier has flat_amount": (d) => {
      const products = d.data?.config?.products ?? [];
      const product = products.find((p) => p.id === "storage_product");
      const price = product?.prices?.[0];
      const tiers = price?.tiers ?? [];
      return tiers[0]?.flat_amount === 1000;
    },
    "tiers structure: first tier has unit_amount": (d) => {
      const products = d.data?.config?.products ?? [];
      const product = products.find((p) => p.id === "storage_product");
      const price = product?.prices?.[0];
      const tiers = price?.tiers ?? [];
      return tiers[0]?.unit_amount === 500;
    },
  });

  client.archiveAllStripeConfig();
}

/**
 * Verify infinity tier handling - last tier must have up_to: "inf".
 */
export function verifyInfinityTier() {
  const client = createClient();
  client.archiveAllStripeConfig();
  const config: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    meters: [
      {
        id: "requests_meter",
        display_name: "Requests",
        event_name: "request",
        default_aggregation: { formula: "count" },
      },
    ],
    products: [
      {
        id: "requests_product",
        name: "Requests Product",
        type: "service",
        prices: [
          {
            id: "requests_price",
            currency: "usd",
            interval: "month",
            usage_type: "metered",
            meter: "requests_meter",
            billing_scheme: "tiered",
            tiers_mode: "graduated",
            tiers: [
              { up_to: 1000, unit_amount: 10 },
              { up_to: "inf", unit_amount: 5 },
            ],
          },
        ],
      },
    ],
  };

  client.updateStripeConfig(config);
  const getResult = client.getStripeConfigAdmin();

  check(getResult.data, {
    "infinity tier: status is 200": (d) => d.status === 200,
    "infinity tier: last tier is inf": (d) => {
      const products = d.data?.config?.products ?? [];
      const product = products.find((p) => p.id === "requests_product");
      const price = product?.prices?.[0];
      const tiers = price?.tiers ?? [];
      const lastTier = tiers[tiers.length - 1];
      // up_to can be "inf" string or null depending on API response
      return lastTier?.up_to === "inf" || lastTier?.up_to === null;
    },
  });

  client.archiveAllStripeConfig();
}

// ============================================================================
// PULL CONFIG PRESERVES TIERS
// ============================================================================

/**
 * Pull config should preserve tiered pricing structure.
 */
export function pullConfigPreservesTiers() {
  const client = createClient();
  client.archiveAllStripeConfig();
  // Create tiered config
  const config: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    meters: [
      {
        id: "pull_meter",
        display_name: "Pull Meter",
        event_name: "pull_event",
        default_aggregation: { formula: "sum" },
      },
    ],
    products: [
      {
        id: "pull_tiered_product",
        name: "Pull Tiered Product",
        type: "service",
        prices: [
          {
            id: "pull_tiered_price",
            currency: "usd",
            interval: "month",
            usage_type: "metered",
            meter: "pull_meter",
            billing_scheme: "tiered",
            tiers_mode: "graduated",
            tiers: [
              { up_to: 100, unit_amount: 10 },
              { up_to: 500, unit_amount: 8 },
              { up_to: "inf", unit_amount: 5 },
            ],
          },
        ],
      },
    ],
  };

  client.updateStripeConfig(config);
  // Pull config from Stripe
  const pullResult = client.pullStripeConfig();

  check(pullResult.data, {
    "pull preserves: status is 200": (d) => d.status === 200,
    "pull preserves: has products": (d) => {
      const products = d.data?.products ?? [];
      return products.length > 0;
    },
    "pull preserves: has tiered price": (d) => {
      const products = d.data?.products ?? [];
      // Find any product with tiered pricing
      return products.some((p) =>
        p.prices?.some((pr) => pr.billing_scheme === "tiered")
      );
    },
    "pull preserves: tiers exist": (d) => {
      const products = d.data?.products ?? [];
      const tieredProduct = products.find((p) =>
        p.prices?.some((pr) => pr.billing_scheme === "tiered")
      );
      const tieredPrice = tieredProduct?.prices?.find(
        (pr) => pr.billing_scheme === "tiered"
      );
      return (tieredPrice?.tiers?.length ?? 0) > 0;
    },
  });

  if (pullResult.data.status !== 200) {
    logError("pullConfigPreservesTiers", pullResult.response);
  }

  client.archiveAllStripeConfig();
}

/**
 * Verify tiers_mode is correctly set on retrieved config.
 */
export function tiersModeCorrectlySet() {
  const client = createClient();
  client.archiveAllStripeConfig();
  // Create both graduated and volume tiered prices
  const config: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    meters: [
      {
        id: "mode_meter",
        display_name: "Mode Meter",
        event_name: "mode_event",
        default_aggregation: { formula: "sum" },
      },
    ],
    products: [
      {
        id: "graduated_product",
        name: "Graduated Product",
        type: "service",
        prices: [
          {
            id: "graduated_mode_price",
            currency: "usd",
            interval: "month",
            usage_type: "metered",
            meter: "mode_meter",
            billing_scheme: "tiered",
            tiers_mode: "graduated",
            tiers: [
              { up_to: 100, unit_amount: 10 },
              { up_to: "inf", unit_amount: 5 },
            ],
          },
        ],
      },
      {
        id: "volume_product",
        name: "Volume Product",
        type: "service",
        prices: [
          {
            id: "volume_mode_price",
            currency: "usd",
            interval: "month",
            usage_type: "metered",
            meter: "mode_meter",
            billing_scheme: "tiered",
            tiers_mode: "volume",
            tiers: [
              { up_to: 100, unit_amount: 20 },
              { up_to: "inf", unit_amount: 10 },
            ],
          },
        ],
      },
    ],
  };

  client.updateStripeConfig(config);
  const getResult = client.getStripeConfigAdmin();

  check(getResult.data, {
    "tiers_mode: status is 200": (d) => d.status === 200,
    "tiers_mode: graduated price has correct mode": (d) => {
      const products = d.data?.config?.products ?? [];
      const product = products.find((p) => p.id === "graduated_product");
      const price = product?.prices?.[0];
      return price?.tiers_mode === "graduated";
    },
    "tiers_mode: volume price has correct mode": (d) => {
      const products = d.data?.config?.products ?? [];
      const product = products.find((p) => p.id === "volume_product");
      const price = product?.prices?.[0];
      return price?.tiers_mode === "volume";
    },
  });

  client.archiveAllStripeConfig();
}
