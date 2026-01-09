import { check, sleep } from "k6";
import { createClient, logError } from "../client";
import {
  MeterDefaultAggregationFormula,
  type StripeConfigUpdateRequest,
} from "../sdk";

/**
 * Stripe Config Meter Tests
 *
 * Tests billing meter CRUD and meter-price associations.
 * Meters are used for usage-based billing in Stripe.
 *
 * Prerequisites:
 * - API running at API_URL (default: http://localhost:8080)
 * - Valid STRIPE_SECRET_KEY environment variable
 * - X-Service-Key header for authentication
 */

// ============================================================================
// METER CRUD TESTS
// ============================================================================

/**
 * Create config with meters and metered prices.
 * Verifies meter creation in Stripe and response structure.
 */
export function createConfigWithMeters() {
  const client = createClient();
  client.archiveAllStripeConfig();
  const config: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    meters: [
      {
        id: "api_calls",
        display_name: "API Calls",
        event_name: "api_call_event",
        default_aggregation: { formula: "sum" },
      },
    ],
    products: [
      {
        id: "api_product",
        name: "API Usage",
        type: "service",
        prices: [
          {
            id: "api_price",
            amount: 0.01,
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

  const result = client.updateStripeConfig(config);

  check(result.data, {
    "create meters: status is 200": (d) => d.status === 200,
    "create meters: meter was created": (d) => {
      return (d.data?.changes?.meters?.created?.length ?? 0) > 0;
    },
    "create meters: meter has correct id": (d) => {
      const meters = d.data?.changes?.meters?.created ?? [];
      return meters.some((m) => m.meter_id === "api_calls");
    },
    "create meters: meter action is created": (d) => {
      const meters = d.data?.changes?.meters?.created ?? [];
      return meters.some((m) => m.action === "created");
    },
    "create meters: product was created": (d) => {
      const created = d.data?.changes?.created ?? [];
      return created.some((p) => p.product_id === "api_product");
    },
  });

  if (result.data.status !== 200) {
    logError("createConfigWithMeters", result.response);
  }

  client.archiveAllStripeConfig();
}

/**
 * Verify meter has stripe_id populated after creation.
 */
export function verifyMeterHasStripeID() {
  const client = createClient();
  client.archiveAllStripeConfig();
  const config: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    meters: [
      {
        id: "bandwidth_meter",
        display_name: "Bandwidth Usage",
        event_name: "bandwidth_event",
        default_aggregation: { formula: MeterDefaultAggregationFormula.sum },
      },
    ],
    products: [
      {
        id: "bandwidth_product",
        name: "Bandwidth",
        type: "service",
        prices: [
          {
            id: "bandwidth_price",
            amount: 0.001,
            currency: "usd",
            interval: "month",
            usage_type: "metered",
            meter: "bandwidth_meter",
            billing_scheme: "per_unit",
          },
        ],
      },
    ],
  };

  client.updateStripeConfig(config);
  // GET config and verify meter has stripe_id
  const getResult = client.getStripeConfigAdmin();

  check(getResult.data, {
    "meter stripe_id: status is 200": (d) => d.status === 200,
    "meter stripe_id: config has meters": (d) => {
      const meters = d.data?.config?.meters ?? [];
      return meters.length > 0;
    },
    "meter stripe_id: meter has stripe_id": (d) => {
      const meters = d.data?.config?.meters ?? [];
      const meter = meters.find((m) => m.id === "bandwidth_meter");
      return meter?.stripe_id != null && meter.stripe_id.startsWith("mtr_");
    },
    "meter stripe_id: meter has correct display_name": (d) => {
      const meters = d.data?.config?.meters ?? [];
      const meter = meters.find((m) => m.id === "bandwidth_meter");
      return meter?.display_name === "Bandwidth Usage";
    },
  });

  client.archiveAllStripeConfig();
}

/**
 * Verify metered price correctly references its meter.
 */
export function verifyMeteredPriceReferencesCorrectMeter() {
  const client = createClient();
  client.archiveAllStripeConfig();
  const config: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    meters: [
      {
        id: "storage_meter",
        display_name: "Storage GB",
        event_name: "storage_usage",
        default_aggregation: { formula: MeterDefaultAggregationFormula.sum },
      },
    ],
    products: [
      {
        id: "storage_product",
        name: "Cloud Storage",
        type: "service",
        prices: [
          {
            id: "storage_price",
            amount: 0.1,
            currency: "usd",
            interval: "month",
            usage_type: "metered",
            meter: "storage_meter",
            billing_scheme: "per_unit",
          },
        ],
      },
    ],
  };

  client.updateStripeConfig(config);
  const getResult = client.getStripeConfigAdmin();

  check(getResult.data, {
    "meter reference: status is 200": (d) => d.status === 200,
    "meter reference: price has meter field": (d) => {
      const products = d.data?.config?.products ?? [];
      const product = products.find((p) => p.id === "storage_product");
      const price = product?.prices?.[0];
      return price?.meter === "storage_meter";
    },
    "meter reference: price has usage_type metered": (d) => {
      const products = d.data?.config?.products ?? [];
      const product = products.find((p) => p.id === "storage_product");
      const price = product?.prices?.[0];
      return price?.usage_type === "metered";
    },
  });

  client.archiveAllStripeConfig();
}

/**
 * Test adding multiple meters to a config.
 */
export function createMultipleMeters() {
  const client = createClient();
  client.archiveAllStripeConfig();
  const config: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    meters: [
      {
        id: "requests_meter",
        display_name: "API Requests",
        event_name: "api_request",
        default_aggregation: { formula: MeterDefaultAggregationFormula.sum },
      },
      {
        id: "compute_meter",
        display_name: "Compute Hours",
        event_name: "compute_usage",
        default_aggregation: { formula: MeterDefaultAggregationFormula.sum },
      },
    ],
    products: [
      {
        id: "platform_product",
        name: "Platform Usage",
        type: "service",
        prices: [
          {
            id: "requests_price",
            amount: 0.001,
            currency: "usd",
            interval: "month",
            usage_type: "metered",
            meter: "requests_meter",
            billing_scheme: "per_unit",
          },
          {
            id: "compute_price",
            amount: 0.05,
            currency: "usd",
            interval: "month",
            usage_type: "metered",
            meter: "compute_meter",
            billing_scheme: "per_unit",
          },
        ],
      },
    ],
  };

  const result = client.updateStripeConfig(config);

  check(result.data, {
    "multiple meters: status is 200": (d) => d.status === 200,
    "multiple meters: 2 meters created": (d) => {
      const meters = d.data?.changes?.meters?.created ?? [];
      return meters.length === 2;
    },
    "multiple meters: requests_meter created": (d) => {
      const meters = d.data?.changes?.meters?.created ?? [];
      return meters.some((m) => m.meter_id === "requests_meter");
    },
    "multiple meters: compute_meter created": (d) => {
      const meters = d.data?.changes?.meters?.created ?? [];
      return meters.some((m) => m.meter_id === "compute_meter");
    },
  });

  // Verify via GET
  const getResult = client.getStripeConfigAdmin();
  check(getResult.data, {
    "multiple meters: config has 2 meters": (d) => {
      const meters = d.data?.config?.meters ?? [];
      return meters.length === 2;
    },
  });

  client.archiveAllStripeConfig();
}

// ============================================================================
// METER VALIDATION TESTS
// ============================================================================

/**
 * Test meter validation errors.
 */
export function meterValidationErrors() {
  const client = createClient();
  client.archiveAllStripeConfig();
  // Test: Missing meter ID
  const missingIdConfig: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    meters: [
      {
        id: "", // Empty ID
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
          },
        ],
      },
    ],
  };
  const missingIdResult = client.updateStripeConfig(missingIdConfig);

  check(missingIdResult.data, {
    "meter missing id: status is 400": (d) => d.status === 400,
  });

  // Test: Missing display_name
  const missingDisplayNameConfig: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    meters: [
      {
        id: "test_meter",
        display_name: "", // Empty display name
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
          },
        ],
      },
    ],
  };
  const missingDisplayNameResult = client.updateStripeConfig(
    missingDisplayNameConfig
  );

  check(missingDisplayNameResult.data, {
    "meter missing display_name: status is 400": (d) => d.status === 400,
  });

  // Test: Missing event_name
  const missingEventNameConfig: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    meters: [
      {
        id: "test_meter",
        display_name: "Test Meter",
        event_name: "", // Empty event name
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
  const missingEventNameResult = client.updateStripeConfig(
    missingEventNameConfig
  );

  check(missingEventNameResult.data, {
    "meter missing event_name: status is 400": (d) => d.status === 400,
  });

  client.archiveAllStripeConfig();
}

/**
 * Test that metered price without meter reference fails validation.
 */
export function meteredPriceWithoutMeterReference() {
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
            amount: 0.01,
            currency: "usd",
            interval: "month",
            usage_type: "metered",
            billing_scheme: "per_unit",
            // meter: missing - should fail validation
          },
        ],
      },
    ],
  };

  const result = client.updateStripeConfig(config);

  check(result.data, {
    "metered without meter: status is 400": (d) => d.status === 400,
  });

  client.archiveAllStripeConfig();
}

/**
 * Test that price referencing non-existent meter fails validation.
 */
export function priceReferencingNonExistentMeter() {
  const client = createClient();
  client.archiveAllStripeConfig();
  const config: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    meters: [], // No meters defined
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
            meter: "non_existent_meter", // References meter that doesn't exist
            billing_scheme: "per_unit",
          },
        ],
      },
    ],
  };

  const result = client.updateStripeConfig(config);

  check(result.data, {
    "non-existent meter ref: status is 400": (d) => d.status === 400,
  });

  client.archiveAllStripeConfig();
}
