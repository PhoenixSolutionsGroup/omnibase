import { PaymentTests, EnterprisePricingTests } from "./payments";
import { PermissionTests } from "./permissions";
import { SecurityTests } from "./security";
import { StorageTests } from "./storage";
import { TenantTests } from "./tenants";
import { StripeConfigTests } from "./stripe-config";

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

  // Performance scenarios - run with: K6_SCENARIO=payments_perf
  // payments_perf: {
  //   executor: "ramping-vus",
  //   stages: [
  //     { duration: "30s", target: 10 },
  //     { duration: "1m", target: 10 },
  //     { duration: "30s", target: 0 },
  //   ],
  //   exec: "paymentsLoadTest",
  // },
};

// Filter scenarios based on K6_SCENARIO env var (if set)
// Default to only running integration (not both which causes race conditions)
const selectedScenario = __ENV.K6_SCENARIO;
const scenarios = selectedScenario
  ? { [selectedScenario]: allScenarios[selectedScenario] }
  : { integration: allScenarios.integration };

export const options = {
  scenarios,
  thresholds: {
    checks: ["rate==1"], // All checks must pass
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
