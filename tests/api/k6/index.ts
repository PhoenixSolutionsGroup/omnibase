import { PaymentTests, EnterprisePricingTests } from "./payments";
import { PermissionTests } from "./permissions";
import { SecurityTests } from "./security";
import { StorageTests } from "./storage";
import { TenantTests } from "./tenants";
import { StripeConfigTests } from "./stripe-config";
import { createSharedUsers } from "./shared-users";
import type { SetupData } from "./shared-users";
import { runStressTests } from "./stress";
import {
  createConfigWithPercentOffCoupon,
  createConfigWithAmountOffCoupon,
  createConfigWithRepeatingCoupon,
  verifyCouponHasStripeID,
  createCouponWithAppliesTo,
  createConfigWithPromotionCode,
  verifyPromotionCodeHasStripeID,
  createPromotionCodeWithRestrictions,
  createMultiplePromoCodesForSameCoupon,
  rejectCouponWithBothDiscountTypes,
  rejectCouponWithNoDiscountType,
  rejectInvalidPercentOff,
  rejectAmountOffWithoutCurrency,
  rejectAmountOffWithForeverDuration,
  rejectRepeatingWithoutDurationInMonths,
  rejectCouponWithInvalidAppliesTo,
  rejectDuplicateCouponIDs,
  rejectPromoCodeWithoutCouponRef,
  rejectPromoCodeWithInvalidCouponRef,
  rejectDuplicatePromoCodeIDs,
  rejectDuplicatePromoCodes,
  updateCouponMutableFields,
  couponImmutableFieldChangeTriggersRecreation,
  removeCoupon,
  updatePromoCodeMutableFields,
  deactivatePromotionCode,
  deleteCouponCascadesToPromos,
  recreateCouponCascadesToPromos,
  pullConfigIncludesCouponsAndPromos,
  noChangeOnIdenticalCouponsPromos,
} from "./stripe-config/09-coupons-promos";
// k6 environment variables
declare const __ENV: Record<string, string | undefined>;

// All available scenarios
const allScenarios: Record<string, object> = {
  integration: {
    executor: "per-vu-iterations",
    vus: 1,
    iterations: 1,
    exec: "integration",
  },
  stripe_config_tests: {
    executor: "per-vu-iterations",
    vus: 1,
    iterations: 1,
    exec: "stripeConfigTests",
  },
  coupon_promo_tests: {
    executor: "per-vu-iterations",
    vus: 1,
    iterations: 1,
    exec: "couponAndPromoTests",
  },

  // Performance scenario (excludes Stripe tests) - run with: K6_SCENARIO=perf
  perf: {
    executor: "ramping-vus",
    stages: [
      { duration: "30s", target: 10 },
      { duration: "1m", target: 20 },
      { duration: "2m", target: 20 },
      { duration: "30s", target: 0 },
    ],
    exec: "perfTestsNoStripe",
  },

  // Stress test scenario - finds breaking point with ramping arrival rate
  // Run with: K6_SCENARIO=stress
  stress: {
    executor: "ramping-arrival-rate",
    startRate: 1,
    timeUnit: "1s",
    preAllocatedVUs: 10,
    maxVUs: 20,
    stages: [
      { duration: "30s", target: 3 }, // Warm up to 10 req/s
      { duration: "2m", target: 5 }, // Temp
      { duration: "2m", target: 10 }, // Temp
      { duration: "2m", target: 20 }, // Temp
      // { duration: "1m", target: 50 }, // Ramp to 50 req/s
      // { duration: "2m", target: 100 }, // Push to 100 req/s
      // { duration: "2m", target: 200 }, // Push to 200 req/s
      // { duration: "2m", target: 300 }, // Push harder to find breaking point
      { duration: "1m", target: 0 }, // Cool down
    ],
    exec: "stressTest",
  },

  // Soak test - sustained load to find memory leaks
  // Run with: K6_SCENARIO=soak
  soak: {
    executor: "constant-arrival-rate",
    rate: 50,
    timeUnit: "1s",
    duration: "10m",
    preAllocatedVUs: 100,
    maxVUs: 200,
    exec: "stressTest",
  },
};

// Filter scenarios based on K6_SCENARIO env var (if set)
// Default to only running integration (not both which causes race conditions)
const selectedScenario = __ENV.K6_SCENARIO;
const scenarios = selectedScenario
  ? { [selectedScenario]: allScenarios[selectedScenario] }
  : { integration: allScenarios.integration };

export const options = {
  scenarios,
  setupTimeout: "5m", // User creation involves bcrypt hashing which is slow
  thresholds: {
    checks: ["rate==1"], // All checks must pass

    // Latency thresholds for perf scenario (local baseline + 20% margin)
    "http_req_duration{scenario:perf}": [
      "p(90)<370", // baseline: 305ms
      "p(95)<840", // baseline: 699ms
    ],

    // Stress test thresholds - update after baseline run
    "http_req_duration{scenario:stress}": [
      "p(95)<2000", // placeholder - update after baseline
    ],
  },
};

export async function integration() {
  await TenantTests();
  await SecurityTests();
  await PermissionTests();
  await StorageTests();
  await PaymentTests();
  await EnterprisePricingTests();
}

export async function stripeConfigTests() {
  await StripeConfigTests();
}

export async function perfTestsNoStripe() {
  await TenantTests();
  await SecurityTests();
  await PermissionTests();
  await StorageTests();
}

export function couponAndPromoTests() {
  // Coupon CRUD tests
  createConfigWithPercentOffCoupon();
  createConfigWithAmountOffCoupon();
  createConfigWithRepeatingCoupon();
  verifyCouponHasStripeID();
  createCouponWithAppliesTo();

  // Promotion code CRUD tests
  createConfigWithPromotionCode();
  verifyPromotionCodeHasStripeID();
  createPromotionCodeWithRestrictions();
  createMultiplePromoCodesForSameCoupon();

  // Coupon validation tests
  rejectCouponWithBothDiscountTypes();
  rejectCouponWithNoDiscountType();
  rejectInvalidPercentOff();
  rejectAmountOffWithoutCurrency();
  rejectAmountOffWithForeverDuration();
  rejectRepeatingWithoutDurationInMonths();
  rejectCouponWithInvalidAppliesTo();
  rejectDuplicateCouponIDs();

  // Promotion code validation tests
  rejectPromoCodeWithoutCouponRef();
  rejectPromoCodeWithInvalidCouponRef();
  rejectDuplicatePromoCodeIDs();
  rejectDuplicatePromoCodes();

  // Diff and update tests
  updateCouponMutableFields();
  couponImmutableFieldChangeTriggersRecreation();
  removeCoupon();
  updatePromoCodeMutableFields();
  deactivatePromotionCode();

  // Cascade tests
  deleteCouponCascadesToPromos();
  recreateCouponCascadesToPromos();

  // Pull config and no change tests
  pullConfigIncludesCouponsAndPromos();
  noChangeOnIdenticalCouponsPromos();
}

// Setup function - creates shared users BEFORE stress/soak tests run.
// This avoids bcrypt overhead during the actual test iterations.
// Returns data that is passed to stressTest() as the first argument.
export function setup(): SetupData | undefined {
  const scenario = __ENV.K6_SCENARIO;

  // Only create shared users for stress/soak scenarios
  if (scenario === "stress" || scenario === "soak") {
    // Get max VUs from scenario config (stress=50, soak=200)
    const maxVUs = scenario === "soak" ? 200 : 20;
    console.log(`[setup] Running ${scenario} scenario with max ${maxVUs} VUs`);
    return createSharedUsers(maxVUs);
  }

  // Other scenarios don't need pre-created users
  return undefined;
}

// Stress test function - uses pre-created users for high throughput
// The `data` parameter comes from setup() function
export function stressTest(data: SetupData) {
  if (!data || !data.users || data.users.length === 0) {
    console.error(
      "[stressTest] No setup data - falling back to original tests",
    );
    TenantTests();
    SecurityTests();
    return;
  }

  // Run stress-optimized tests that reuse pre-created users
  runStressTests(data);
}
