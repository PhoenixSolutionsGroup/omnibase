import { check } from "k6";
import { createClient, logError } from "../client";
import {
  CouponDuration,
  type StripeConfigUpdateRequest,
} from "../sdk";

/**
 * Stripe Config Coupon and Promotion Code Tests
 *
 * Tests coupon and promotion code CRUD operations, validation,
 * and cascade behavior when coupons are recreated.
 *
 * Prerequisites:
 * - API running at API_URL (default: http://localhost:8080)
 * - Valid STRIPE_SECRET_KEY environment variable
 * - X-Service-Key header for authentication
 */

// ============================================================================
// COUPON CRUD TESTS
// ============================================================================

/**
 * Create config with a percent-off coupon.
 */
export function createConfigWithPercentOffCoupon() {
  const client = createClient();
  client.archiveAllStripeConfig();
  const config: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    products: [
      {
        id: "basic_product",
        name: "Basic Plan",
        type: "service",
        prices: [
          {
            id: "basic_price",
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
    coupons: [
      {
        id: "percent_coupon",
        name: "20% Off",
        percent_off: 20,
        duration: CouponDuration.once,
      },
    ],
  };

  const result = client.updateStripeConfig(config);

  check(result.data, {
    "create percent coupon: status is 200": (d) => d.status === 200,
    "create percent coupon: coupon was created": (d) => {
      return (d.data?.changes?.coupons?.created?.length ?? 0) > 0;
    },
    "create percent coupon: coupon has correct id": (d) => {
      const coupons = d.data?.changes?.coupons?.created ?? [];
      return coupons.some((c) => c.coupon_id === "percent_coupon");
    },
    "create percent coupon: coupon action is created": (d) => {
      const coupons = d.data?.changes?.coupons?.created ?? [];
      return coupons.some((c) => c.action === "created");
    },
  });

  if (result.data.status !== 200) {
    logError("createConfigWithPercentOffCoupon", result.response);
  }

  client.archiveAllStripeConfig();
}

/**
 * Create config with an amount-off coupon.
 * Note: amount_off coupons cannot use 'forever' duration (Stripe restriction)
 */
export function createConfigWithAmountOffCoupon() {
  const client = createClient();
  client.archiveAllStripeConfig();
  const config: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    products: [
      {
        id: "basic_product",
        name: "Basic Plan",
        type: "service",
        prices: [
          {
            id: "basic_price",
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
    coupons: [
      {
        id: "amount_coupon",
        name: "$5 Off",
        amount_off: 500,
        currency: "usd",
        duration: CouponDuration.once, // amount_off coupons cannot use 'forever'
      },
    ],
  };

  const result = client.updateStripeConfig(config);

  check(result.data, {
    "create amount coupon: status is 200": (d) => d.status === 200,
    "create amount coupon: coupon was created": (d) => {
      return (d.data?.changes?.coupons?.created?.length ?? 0) > 0;
    },
    "create amount coupon: coupon has correct id": (d) => {
      const coupons = d.data?.changes?.coupons?.created ?? [];
      return coupons.some((c) => c.coupon_id === "amount_coupon");
    },
  });

  if (result.data.status !== 200) {
    logError("createConfigWithAmountOffCoupon", result.response);
  }

  client.archiveAllStripeConfig();
}

/**
 * Create config with a repeating duration coupon.
 */
export function createConfigWithRepeatingCoupon() {
  const client = createClient();
  client.archiveAllStripeConfig();
  const config: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    products: [
      {
        id: "basic_product",
        name: "Basic Plan",
        type: "service",
        prices: [
          {
            id: "basic_price",
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
    coupons: [
      {
        id: "repeating_coupon",
        name: "3 Months 15% Off",
        percent_off: 15,
        duration: CouponDuration.repeating,
        duration_in_months: 3,
      },
    ],
  };

  const result = client.updateStripeConfig(config);

  check(result.data, {
    "create repeating coupon: status is 200": (d) => d.status === 200,
    "create repeating coupon: coupon was created": (d) => {
      return (d.data?.changes?.coupons?.created?.length ?? 0) > 0;
    },
  });

  // Verify via GET
  const getResult = client.getStripeConfigAdmin();
  check(getResult.data, {
    "repeating coupon: config has coupon": (d) => {
      const coupons = d.data?.config?.coupons ?? [];
      return coupons.length > 0;
    },
    "repeating coupon: coupon has correct duration_in_months": (d) => {
      const coupons = d.data?.config?.coupons ?? [];
      const coupon = coupons.find((c) => c.id === "repeating_coupon");
      return coupon?.duration_in_months === 3;
    },
  });

  if (result.data.status !== 200) {
    logError("createConfigWithRepeatingCoupon", result.response);
  }

  client.archiveAllStripeConfig();
}

/**
 * Verify coupon has stripe_id populated after creation.
 */
export function verifyCouponHasStripeID() {
  const client = createClient();
  client.archiveAllStripeConfig();
  const config: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    products: [
      {
        id: "basic_product",
        name: "Basic Plan",
        type: "service",
        prices: [
          {
            id: "basic_price",
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
    coupons: [
      {
        id: "stripe_id_test_coupon",
        name: "Test Coupon",
        percent_off: 10,
        duration: CouponDuration.once,
      },
    ],
  };

  client.updateStripeConfig(config);
  const getResult = client.getStripeConfigAdmin();

  check(getResult.data, {
    "coupon stripe_id: status is 200": (d) => d.status === 200,
    "coupon stripe_id: config has coupons": (d) => {
      const coupons = d.data?.config?.coupons ?? [];
      return coupons.length > 0;
    },
    "coupon stripe_id: coupon has stripe_id": (d) => {
      const coupons = d.data?.config?.coupons ?? [];
      const coupon = coupons.find((c) => c.id === "stripe_id_test_coupon");
      return coupon?.stripe_id != null && coupon.stripe_id.length > 0;
    },
  });

  client.archiveAllStripeConfig();
}

/**
 * Create coupon with applies_to restricting to specific products.
 */
export function createCouponWithAppliesTo() {
  const client = createClient();
  client.archiveAllStripeConfig();
  const config: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    products: [
      {
        id: "pro_plan",
        name: "Pro Plan",
        type: "service",
        prices: [
          {
            id: "pro_price",
            amount: 2000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
      {
        id: "enterprise_plan",
        name: "Enterprise Plan",
        type: "service",
        prices: [
          {
            id: "enterprise_price",
            amount: 5000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
    coupons: [
      {
        id: "pro_only_coupon",
        name: "Pro Plan Discount",
        percent_off: 25,
        duration: CouponDuration.once,
        applies_to: ["pro_plan"],
      },
    ],
  };

  const result = client.updateStripeConfig(config);

  check(result.data, {
    "applies_to coupon: status is 200": (d) => d.status === 200,
    "applies_to coupon: coupon was created": (d) => {
      return (d.data?.changes?.coupons?.created?.length ?? 0) > 0;
    },
  });

  if (result.data.status !== 200) {
    logError("createCouponWithAppliesTo", result.response);
  }

  client.archiveAllStripeConfig();
}

// ============================================================================
// PROMOTION CODE CRUD TESTS
// ============================================================================

/**
 * Create config with a promotion code.
 */
export function createConfigWithPromotionCode() {
  const client = createClient();
  client.archiveAllStripeConfig();
  const config: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    products: [
      {
        id: "basic_product",
        name: "Basic Plan",
        type: "service",
        prices: [
          {
            id: "basic_price",
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
    coupons: [
      {
        id: "launch_coupon",
        name: "Launch Discount",
        percent_off: 20,
        duration: CouponDuration.once,
      },
    ],
    promotion_codes: [
      {
        id: "promo_launch",
        code: "LAUNCH20",
        coupon: "launch_coupon",
      },
    ],
  };

  const result = client.updateStripeConfig(config);

  check(result.data, {
    "create promo code: status is 200": (d) => d.status === 200,
    "create promo code: coupon was created": (d) => {
      return (d.data?.changes?.coupons?.created?.length ?? 0) > 0;
    },
    "create promo code: promo code was created": (d) => {
      return (d.data?.changes?.promotion_codes?.created?.length ?? 0) > 0;
    },
    "create promo code: promo has correct id": (d) => {
      const promos = d.data?.changes?.promotion_codes?.created ?? [];
      return promos.some((p) => p.promo_id === "promo_launch");
    },
    "create promo code: promo has correct code": (d) => {
      const promos = d.data?.changes?.promotion_codes?.created ?? [];
      return promos.some((p) => p.code === "LAUNCH20");
    },
  });

  if (result.data.status !== 200) {
    logError("createConfigWithPromotionCode", result.response);
  }

  client.archiveAllStripeConfig();
}

/**
 * Verify promotion code has stripe_id populated after creation.
 */
export function verifyPromotionCodeHasStripeID() {
  const client = createClient();
  client.archiveAllStripeConfig();
  const config: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    products: [
      {
        id: "basic_product",
        name: "Basic Plan",
        type: "service",
        prices: [
          {
            id: "basic_price",
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
    coupons: [
      {
        id: "test_coupon",
        name: "Test",
        percent_off: 10,
        duration: CouponDuration.once,
      },
    ],
    promotion_codes: [
      {
        id: "test_promo",
        code: "TEST10",
        coupon: "test_coupon",
      },
    ],
  };

  client.updateStripeConfig(config);
  const getResult = client.getStripeConfigAdmin();

  check(getResult.data, {
    "promo stripe_id: status is 200": (d) => d.status === 200,
    "promo stripe_id: config has promotion codes": (d) => {
      const promos = d.data?.config?.promotion_codes ?? [];
      return promos.length > 0;
    },
    "promo stripe_id: promo has stripe_id": (d) => {
      const promos = d.data?.config?.promotion_codes ?? [];
      const promo = promos.find((p) => p.id === "test_promo");
      return promo?.stripe_id != null && promo.stripe_id.length > 0;
    },
    "promo stripe_id: promo references correct coupon": (d) => {
      const promos = d.data?.config?.promotion_codes ?? [];
      const promo = promos.find((p) => p.id === "test_promo");
      return promo?.coupon === "test_coupon";
    },
  });

  client.archiveAllStripeConfig();
}

/**
 * Create promotion code with restrictions.
 */
export function createPromotionCodeWithRestrictions() {
  const client = createClient();
  client.archiveAllStripeConfig();
  const config: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    products: [
      {
        id: "basic_product",
        name: "Basic Plan",
        type: "service",
        prices: [
          {
            id: "basic_price",
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
    coupons: [
      {
        id: "restricted_coupon",
        name: "Restricted Coupon",
        percent_off: 30,
        duration: CouponDuration.once,
      },
    ],
    promotion_codes: [
      {
        id: "restricted_promo",
        code: "NEWUSER30",
        coupon: "restricted_coupon",
        first_time_transaction: true,
        minimum_amount: 5000,
        minimum_amount_currency: "usd",
        max_redemptions: 100,
      },
    ],
  };

  const result = client.updateStripeConfig(config);

  check(result.data, {
    "restricted promo: status is 200": (d) => d.status === 200,
    "restricted promo: promo was created": (d) => {
      return (d.data?.changes?.promotion_codes?.created?.length ?? 0) > 0;
    },
  });

  if (result.data.status !== 200) {
    logError("createPromotionCodeWithRestrictions", result.response);
  }

  client.archiveAllStripeConfig();
}

/**
 * Create multiple promotion codes for the same coupon.
 */
export function createMultiplePromoCodesForSameCoupon() {
  const client = createClient();
  client.archiveAllStripeConfig();
  const config: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    products: [
      {
        id: "basic_product",
        name: "Basic Plan",
        type: "service",
        prices: [
          {
            id: "basic_price",
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
    coupons: [
      {
        id: "shared_coupon",
        name: "Shared Discount",
        percent_off: 15,
        duration: CouponDuration.once,
      },
    ],
    promotion_codes: [
      {
        id: "promo_a",
        code: "SAVEA15",
        coupon: "shared_coupon",
      },
      {
        id: "promo_b",
        code: "SAVEB15",
        coupon: "shared_coupon",
      },
    ],
  };

  const result = client.updateStripeConfig(config);

  check(result.data, {
    "multiple promos: status is 200": (d) => d.status === 200,
    "multiple promos: 2 promo codes created": (d) => {
      const promos = d.data?.changes?.promotion_codes?.created ?? [];
      return promos.length === 2;
    },
  });

  if (result.data.status !== 200) {
    logError("createMultiplePromoCodesForSameCoupon", result.response);
  }

  client.archiveAllStripeConfig();
}

// ============================================================================
// COUPON VALIDATION TESTS
// ============================================================================

/**
 * Test that coupon with both percent_off and amount_off fails validation.
 */
export function rejectCouponWithBothDiscountTypes() {
  const client = createClient();
  client.archiveAllStripeConfig();
  const config: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    products: [
      {
        id: "basic_product",
        name: "Basic Plan",
        type: "service",
        prices: [
          {
            id: "basic_price",
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
    coupons: [
      {
        id: "invalid_coupon",
        name: "Invalid",
        percent_off: 20,
        amount_off: 500,
        currency: "usd",
        duration: CouponDuration.once,
      },
    ],
  };

  const result = client.updateStripeConfig(config);

  check(result.data, {
    "both discount types: status is 400": (d) => d.status === 400,
  });

  client.archiveAllStripeConfig();
}

/**
 * Test that coupon without discount type fails validation.
 */
export function rejectCouponWithNoDiscountType() {
  const client = createClient();
  client.archiveAllStripeConfig();
  const config: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    products: [
      {
        id: "basic_product",
        name: "Basic Plan",
        type: "service",
        prices: [
          {
            id: "basic_price",
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
    coupons: [
      {
        id: "no_discount_coupon",
        name: "No Discount",
        duration: CouponDuration.once,
      },
    ],
  };

  const result = client.updateStripeConfig(config);

  check(result.data, {
    "no discount type: status is 400": (d) => d.status === 400,
  });

  client.archiveAllStripeConfig();
}

/**
 * Test that percent_off outside 0-100 range fails validation.
 */
export function rejectInvalidPercentOff() {
  const client = createClient();
  client.archiveAllStripeConfig();
  const config: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    products: [
      {
        id: "basic_product",
        name: "Basic Plan",
        type: "service",
        prices: [
          {
            id: "basic_price",
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
    coupons: [
      {
        id: "invalid_percent_coupon",
        name: "Over 100%",
        percent_off: 150,
        duration: CouponDuration.once,
      },
    ],
  };

  const result = client.updateStripeConfig(config);

  check(result.data, {
    "invalid percent_off: status is 400": (d) => d.status === 400,
  });

  client.archiveAllStripeConfig();
}

/**
 * Test that amount_off without currency fails validation.
 */
export function rejectAmountOffWithoutCurrency() {
  const client = createClient();
  client.archiveAllStripeConfig();
  const config: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    products: [
      {
        id: "basic_product",
        name: "Basic Plan",
        type: "service",
        prices: [
          {
            id: "basic_price",
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
    coupons: [
      {
        id: "no_currency_coupon",
        name: "No Currency",
        amount_off: 500,
        duration: CouponDuration.once,
      },
    ],
  };

  const result = client.updateStripeConfig(config);

  check(result.data, {
    "amount_off without currency: status is 400": (d) => d.status === 400,
  });

  client.archiveAllStripeConfig();
}

/**
 * Test that amount_off with forever duration fails validation.
 * Stripe restriction: 'forever' duration is only allowed with percent_off coupons.
 */
export function rejectAmountOffWithForeverDuration() {
  const client = createClient();
  client.archiveAllStripeConfig();
  const config: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    products: [
      {
        id: "basic_product",
        name: "Basic Plan",
        type: "service",
        prices: [
          {
            id: "basic_price",
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
    coupons: [
      {
        id: "forever_amount_coupon",
        name: "Forever Amount Off",
        amount_off: 500,
        currency: "usd",
        duration: CouponDuration.forever,
      },
    ],
  };

  const result = client.updateStripeConfig(config);

  check(result.data, {
    "amount_off with forever duration: status is 400": (d) => d.status === 400,
  });

  client.archiveAllStripeConfig();
}

/**
 * Test that repeating duration without duration_in_months fails validation.
 */
export function rejectRepeatingWithoutDurationInMonths() {
  const client = createClient();
  client.archiveAllStripeConfig();
  const config: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    products: [
      {
        id: "basic_product",
        name: "Basic Plan",
        type: "service",
        prices: [
          {
            id: "basic_price",
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
    coupons: [
      {
        id: "repeating_no_months",
        name: "Repeating No Months",
        percent_off: 20,
        duration: CouponDuration.repeating,
      },
    ],
  };

  const result = client.updateStripeConfig(config);

  check(result.data, {
    "repeating without duration_in_months: status is 400": (d) =>
      d.status === 400,
  });

  client.archiveAllStripeConfig();
}

/**
 * Test that coupon with applies_to referencing non-existent product fails.
 */
export function rejectCouponWithInvalidAppliesTo() {
  const client = createClient();
  client.archiveAllStripeConfig();
  const config: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    products: [
      {
        id: "basic_product",
        name: "Basic Plan",
        type: "service",
        prices: [
          {
            id: "basic_price",
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
    coupons: [
      {
        id: "invalid_applies_to",
        name: "Invalid Applies To",
        percent_off: 20,
        duration: CouponDuration.once,
        applies_to: ["nonexistent_product"],
      },
    ],
  };

  const result = client.updateStripeConfig(config);

  check(result.data, {
    "invalid applies_to: status is 400": (d) => d.status === 400,
  });

  client.archiveAllStripeConfig();
}

/**
 * Test duplicate coupon IDs fail validation.
 */
export function rejectDuplicateCouponIDs() {
  const client = createClient();
  client.archiveAllStripeConfig();
  const config: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    products: [
      {
        id: "basic_product",
        name: "Basic Plan",
        type: "service",
        prices: [
          {
            id: "basic_price",
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
    coupons: [
      {
        id: "dup_coupon",
        name: "First",
        percent_off: 10,
        duration: CouponDuration.once,
      },
      {
        id: "dup_coupon",
        name: "Second",
        percent_off: 20,
        duration: CouponDuration.once,
      },
    ],
  };

  const result = client.updateStripeConfig(config);

  check(result.data, {
    "duplicate coupon IDs: status is 400": (d) => d.status === 400,
  });

  client.archiveAllStripeConfig();
}

// ============================================================================
// PROMOTION CODE VALIDATION TESTS
// ============================================================================

/**
 * Test that promotion code without coupon reference fails validation.
 */
export function rejectPromoCodeWithoutCouponRef() {
  const client = createClient();
  client.archiveAllStripeConfig();
  const config = {
    version: "v1.0.0",
    products: [
      {
        id: "basic_product",
        name: "Basic Plan",
        type: "service",
        prices: [
          {
            id: "basic_price",
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
    promotion_codes: [
      {
        id: "promo_no_coupon",
        code: "NOCOUPON",
        coupon: "",
      },
    ],
  };

  const result = client.updateStripeConfig(
    config as unknown as StripeConfigUpdateRequest
  );

  check(result.data, {
    "promo without coupon ref: status is 400": (d) => d.status === 400,
  });

  client.archiveAllStripeConfig();
}

/**
 * Test that promotion code referencing non-existent coupon fails validation.
 */
export function rejectPromoCodeWithInvalidCouponRef() {
  const client = createClient();
  client.archiveAllStripeConfig();
  const config: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    products: [
      {
        id: "basic_product",
        name: "Basic Plan",
        type: "service",
        prices: [
          {
            id: "basic_price",
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
    coupons: [
      {
        id: "existing_coupon",
        name: "Existing",
        percent_off: 10,
        duration: CouponDuration.once,
      },
    ],
    promotion_codes: [
      {
        id: "promo_bad_ref",
        code: "BADREF",
        coupon: "nonexistent_coupon",
      },
    ],
  };

  const result = client.updateStripeConfig(config);

  check(result.data, {
    "promo with invalid coupon ref: status is 400": (d) => d.status === 400,
  });

  client.archiveAllStripeConfig();
}

/**
 * Test duplicate promotion code IDs fail validation.
 */
export function rejectDuplicatePromoCodeIDs() {
  const client = createClient();
  client.archiveAllStripeConfig();
  const config: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    products: [
      {
        id: "basic_product",
        name: "Basic Plan",
        type: "service",
        prices: [
          {
            id: "basic_price",
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
    coupons: [
      {
        id: "test_coupon",
        name: "Test",
        percent_off: 10,
        duration: CouponDuration.once,
      },
    ],
    promotion_codes: [
      {
        id: "dup_promo",
        code: "CODE1",
        coupon: "test_coupon",
      },
      {
        id: "dup_promo",
        code: "CODE2",
        coupon: "test_coupon",
      },
    ],
  };

  const result = client.updateStripeConfig(config);

  check(result.data, {
    "duplicate promo IDs: status is 400": (d) => d.status === 400,
  });

  client.archiveAllStripeConfig();
}

/**
 * Test duplicate promotion codes fail validation.
 */
export function rejectDuplicatePromoCodes() {
  const client = createClient();
  client.archiveAllStripeConfig();
  const config: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    products: [
      {
        id: "basic_product",
        name: "Basic Plan",
        type: "service",
        prices: [
          {
            id: "basic_price",
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
    coupons: [
      {
        id: "test_coupon",
        name: "Test",
        percent_off: 10,
        duration: CouponDuration.once,
      },
    ],
    promotion_codes: [
      {
        id: "promo_1",
        code: "SAMECODE",
        coupon: "test_coupon",
      },
      {
        id: "promo_2",
        code: "SAMECODE",
        coupon: "test_coupon",
      },
    ],
  };

  const result = client.updateStripeConfig(config);

  check(result.data, {
    "duplicate promo codes: status is 400": (d) => d.status === 400,
  });

  client.archiveAllStripeConfig();
}

// ============================================================================
// DIFF AND UPDATE TESTS
// ============================================================================

/**
 * Test updating coupon mutable fields (name, metadata).
 */
export function updateCouponMutableFields() {
  const client = createClient();
  client.archiveAllStripeConfig();

  // Create initial config
  const config1: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    products: [
      {
        id: "basic_product",
        name: "Basic Plan",
        type: "service",
        prices: [
          {
            id: "basic_price",
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
    coupons: [
      {
        id: "update_test_coupon",
        name: "Original Name",
        percent_off: 20,
        duration: CouponDuration.once,
        metadata: { version: "1" },
      },
    ],
  };

  client.updateStripeConfig(config1);

  // Update mutable fields
  const config2: StripeConfigUpdateRequest = {
    version: "v1.0.1",
    products: [
      {
        id: "basic_product",
        name: "Basic Plan",
        type: "service",
        prices: [
          {
            id: "basic_price",
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
    coupons: [
      {
        id: "update_test_coupon",
        name: "Updated Name",
        percent_off: 20,
        duration: CouponDuration.once,
        metadata: { version: "2" },
      },
    ],
  };

  const result = client.updateStripeConfig(config2);

  check(result.data, {
    "update mutable: status is 200": (d) => d.status === 200,
    "update mutable: coupon was updated": (d) => {
      return (d.data?.changes?.coupons?.updated?.length ?? 0) > 0;
    },
  });

  client.archiveAllStripeConfig();
}

/**
 * Test that changing immutable coupon fields triggers recreation.
 */
export function couponImmutableFieldChangeTriggersRecreation() {
  const client = createClient();
  client.archiveAllStripeConfig();

  // Create initial config
  const config1: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    products: [
      {
        id: "basic_product",
        name: "Basic Plan",
        type: "service",
        prices: [
          {
            id: "basic_price",
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
    coupons: [
      {
        id: "recreate_coupon",
        name: "Test Coupon",
        percent_off: 20,
        duration: CouponDuration.once,
      },
    ],
  };

  client.updateStripeConfig(config1);

  // Change immutable field (percent_off)
  const config2: StripeConfigUpdateRequest = {
    version: "v1.0.1",
    products: [
      {
        id: "basic_product",
        name: "Basic Plan",
        type: "service",
        prices: [
          {
            id: "basic_price",
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
    coupons: [
      {
        id: "recreate_coupon",
        name: "Test Coupon",
        percent_off: 30, // Changed from 20 to 30
        duration: CouponDuration.once,
      },
    ],
  };

  const result = client.updateStripeConfig(config2);

  check(result.data, {
    "recreate coupon: status is 200": (d) => d.status === 200,
    "recreate coupon: coupon was updated (recreated)": (d) => {
      return (d.data?.changes?.coupons?.updated?.length ?? 0) > 0;
    },
    "recreate coupon: action is recreated": (d) => {
      const updated = d.data?.changes?.coupons?.updated ?? [];
      return updated.some((c) => c.action === "recreated");
    },
  });

  client.archiveAllStripeConfig();
}

/**
 * Test removing a coupon.
 */
export function removeCoupon() {
  const client = createClient();
  client.archiveAllStripeConfig();

  // Create with coupon
  const config1: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    products: [
      {
        id: "basic_product",
        name: "Basic Plan",
        type: "service",
        prices: [
          {
            id: "basic_price",
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
    coupons: [
      {
        id: "remove_coupon",
        name: "To Remove",
        percent_off: 10,
        duration: CouponDuration.once,
      },
    ],
  };

  client.updateStripeConfig(config1);

  // Remove coupon
  const config2: StripeConfigUpdateRequest = {
    version: "v1.0.1",
    products: [
      {
        id: "basic_product",
        name: "Basic Plan",
        type: "service",
        prices: [
          {
            id: "basic_price",
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
    coupons: [],
  };

  const result = client.updateStripeConfig(config2);

  check(result.data, {
    "remove coupon: status is 200": (d) => d.status === 200,
    "remove coupon: coupon was archived": (d) => {
      return (d.data?.changes?.coupons?.archived?.length ?? 0) > 0;
    },
    "remove coupon: archived coupon has correct id": (d) => {
      const archived = d.data?.changes?.coupons?.archived ?? [];
      return archived.some((c) => c.coupon_id === "remove_coupon");
    },
  });

  client.archiveAllStripeConfig();
}

/**
 * Test updating promotion code mutable fields (active, metadata).
 */
export function updatePromoCodeMutableFields() {
  const client = createClient();
  client.archiveAllStripeConfig();

  // Create initial config
  const config1: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    products: [
      {
        id: "basic_product",
        name: "Basic Plan",
        type: "service",
        prices: [
          {
            id: "basic_price",
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
    coupons: [
      {
        id: "promo_update_coupon",
        name: "Coupon",
        percent_off: 10,
        duration: CouponDuration.once,
      },
    ],
    promotion_codes: [
      {
        id: "update_promo",
        code: "UPDATE10",
        coupon: "promo_update_coupon",
        active: true,
        metadata: { version: "1" },
      },
    ],
  };

  client.updateStripeConfig(config1);

  // Update mutable fields
  const config2: StripeConfigUpdateRequest = {
    version: "v1.0.1",
    products: [
      {
        id: "basic_product",
        name: "Basic Plan",
        type: "service",
        prices: [
          {
            id: "basic_price",
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
    coupons: [
      {
        id: "promo_update_coupon",
        name: "Coupon",
        percent_off: 10,
        duration: CouponDuration.once,
      },
    ],
    promotion_codes: [
      {
        id: "update_promo",
        code: "UPDATE10",
        coupon: "promo_update_coupon",
        active: false, // Changed
        metadata: { version: "2" },
      },
    ],
  };

  const result = client.updateStripeConfig(config2);

  check(result.data, {
    "update promo mutable: status is 200": (d) => d.status === 200,
    "update promo mutable: promo was updated": (d) => {
      return (d.data?.changes?.promotion_codes?.updated?.length ?? 0) > 0;
    },
  });

  client.archiveAllStripeConfig();
}

/**
 * Test deactivating a promotion code.
 */
export function deactivatePromotionCode() {
  const client = createClient();
  client.archiveAllStripeConfig();

  // Create with promo
  const config1: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    products: [
      {
        id: "basic_product",
        name: "Basic Plan",
        type: "service",
        prices: [
          {
            id: "basic_price",
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
    coupons: [
      {
        id: "deactivate_coupon",
        name: "Coupon",
        percent_off: 10,
        duration: CouponDuration.once,
      },
    ],
    promotion_codes: [
      {
        id: "deactivate_promo",
        code: "DEACTIVATE",
        coupon: "deactivate_coupon",
      },
    ],
  };

  client.updateStripeConfig(config1);

  // Remove promo (deactivate)
  const config2: StripeConfigUpdateRequest = {
    version: "v1.0.1",
    products: [
      {
        id: "basic_product",
        name: "Basic Plan",
        type: "service",
        prices: [
          {
            id: "basic_price",
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
    coupons: [
      {
        id: "deactivate_coupon",
        name: "Coupon",
        percent_off: 10,
        duration: CouponDuration.once,
      },
    ],
    promotion_codes: [],
  };

  const result = client.updateStripeConfig(config2);

  check(result.data, {
    "deactivate promo: status is 200": (d) => d.status === 200,
    "deactivate promo: promo was deactivated": (d) => {
      return (d.data?.changes?.promotion_codes?.deactivated?.length ?? 0) > 0;
    },
    "deactivate promo: deactivated promo has correct id": (d) => {
      const deactivated = d.data?.changes?.promotion_codes?.deactivated ?? [];
      return deactivated.some((p) => p.promo_id === "deactivate_promo");
    },
  });

  client.archiveAllStripeConfig();
}

// ============================================================================
// CASCADE TESTS
// ============================================================================

/**
 * Test that deleting a coupon also deactivates its promotion codes.
 */
export function deleteCouponCascadesToPromos() {
  const client = createClient();
  client.archiveAllStripeConfig();

  // Create with coupon and promo
  const config1: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    products: [
      {
        id: "basic_product",
        name: "Basic Plan",
        type: "service",
        prices: [
          {
            id: "basic_price",
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
    coupons: [
      {
        id: "cascade_coupon",
        name: "Cascade Test",
        percent_off: 15,
        duration: CouponDuration.once,
      },
    ],
    promotion_codes: [
      {
        id: "cascade_promo",
        code: "CASCADE",
        coupon: "cascade_coupon",
      },
    ],
  };

  client.updateStripeConfig(config1);

  // Remove both coupon and promo
  const config2: StripeConfigUpdateRequest = {
    version: "v1.0.1",
    products: [
      {
        id: "basic_product",
        name: "Basic Plan",
        type: "service",
        prices: [
          {
            id: "basic_price",
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
    coupons: [],
    promotion_codes: [],
  };

  const result = client.updateStripeConfig(config2);

  check(result.data, {
    "cascade delete: status is 200": (d) => d.status === 200,
    "cascade delete: promo was deactivated": (d) => {
      return (d.data?.changes?.promotion_codes?.deactivated?.length ?? 0) > 0;
    },
    "cascade delete: coupon was archived": (d) => {
      return (d.data?.changes?.coupons?.archived?.length ?? 0) > 0;
    },
  });

  client.archiveAllStripeConfig();
}

/**
 * Test that recreating a coupon also recreates its promotion codes.
 */
export function recreateCouponCascadesToPromos() {
  const client = createClient();
  client.archiveAllStripeConfig();

  // Create with coupon and promo
  const config1: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    products: [
      {
        id: "basic_product",
        name: "Basic Plan",
        type: "service",
        prices: [
          {
            id: "basic_price",
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
    coupons: [
      {
        id: "cascade_recreate_coupon",
        name: "Cascade Recreate",
        percent_off: 20,
        duration: CouponDuration.once,
      },
    ],
    promotion_codes: [
      {
        id: "cascade_recreate_promo",
        code: "CASCADEREC",
        coupon: "cascade_recreate_coupon",
      },
    ],
  };

  client.updateStripeConfig(config1);

  // Change immutable field on coupon
  const config2: StripeConfigUpdateRequest = {
    version: "v1.0.1",
    products: [
      {
        id: "basic_product",
        name: "Basic Plan",
        type: "service",
        prices: [
          {
            id: "basic_price",
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
    coupons: [
      {
        id: "cascade_recreate_coupon",
        name: "Cascade Recreate",
        percent_off: 25, // Changed
        duration: CouponDuration.once,
      },
    ],
    promotion_codes: [
      {
        id: "cascade_recreate_promo",
        code: "CASCADEREC",
        coupon: "cascade_recreate_coupon",
      },
    ],
  };

  const result = client.updateStripeConfig(config2);

  check(result.data, {
    "cascade recreate: status is 200": (d) => d.status === 200,
    "cascade recreate: coupon was recreated": (d) => {
      const updated = d.data?.changes?.coupons?.updated ?? [];
      return updated.some((c) => c.action === "recreated");
    },
    "cascade recreate: promo was also updated": (d) => {
      return (d.data?.changes?.promotion_codes?.updated?.length ?? 0) > 0;
    },
  });

  client.archiveAllStripeConfig();
}

// ============================================================================
// PULL CONFIG TESTS
// ============================================================================

/**
 * Test that pullConfig includes coupons and promotion codes.
 */
export function pullConfigIncludesCouponsAndPromos() {
  const client = createClient();
  client.archiveAllStripeConfig();

  // Create config with coupons and promos
  const config: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    products: [
      {
        id: "pull_test_product",
        name: "Pull Test",
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
    coupons: [
      {
        id: "pull_test_coupon",
        name: "Pull Test Coupon",
        percent_off: 10,
        duration: CouponDuration.once,
      },
    ],
    promotion_codes: [
      {
        id: "pull_test_promo",
        code: "PULLTEST",
        coupon: "pull_test_coupon",
      },
    ],
  };

  client.updateStripeConfig(config);

  // Pull config from Stripe
  const pullResult = client.pullStripeConfig();

  check(pullResult.data, {
    "pull config: status is 200": (d) => d.status === 200,
    "pull config: has coupons": (d) => {
      const coupons = d.data?.coupons ?? [];
      return coupons.length > 0;
    },
    "pull config: has promotion codes": (d) => {
      const promos = d.data?.promotion_codes ?? [];
      return promos.length > 0;
    },
  });

  client.archiveAllStripeConfig();
}

// ============================================================================
// NO CHANGE TESTS
// ============================================================================

/**
 * Test no change when coupons/promos config is identical.
 */
export function noChangeOnIdenticalCouponsPromos() {
  const client = createClient();
  client.archiveAllStripeConfig();

  const config: StripeConfigUpdateRequest = {
    version: "v1.0.0",
    products: [
      {
        id: "basic_product",
        name: "Basic Plan",
        type: "service",
        prices: [
          {
            id: "basic_price",
            amount: 1000,
            currency: "usd",
            interval: "month",
          },
        ],
      },
    ],
    coupons: [
      {
        id: "no_change_coupon",
        name: "No Change",
        percent_off: 10,
        duration: CouponDuration.once,
      },
    ],
    promotion_codes: [
      {
        id: "no_change_promo",
        code: "NOCHANGE",
        coupon: "no_change_coupon",
      },
    ],
  };

  // First update
  client.updateStripeConfig(config);

  // Same update again
  const result = client.updateStripeConfig(config);

  check(result.data, {
    "no change: status is 200": (d) => d.status === 200,
    "no change: message indicates no change": (d) => {
      return d.data?.message?.includes("no change") ?? false;
    },
  });

  client.archiveAllStripeConfig();
}
