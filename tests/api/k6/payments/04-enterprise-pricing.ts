import { check, sleep } from "k6";
import http from "k6/http";
import { createClient, logError, uniqueId, randomPassword } from "../client";

/**
 * Test Scenario: Enterprise Pricing Lifecycle
 *
 * **SETUP REQUIRED:**
 * This test requires the enterprise.config.json to be synced to Stripe before running.
 * The config includes both template-based and tenant-specific enterprise prices.
 *
 * **Environment Variables Required:**
 * - STRIPE_SECRET_KEY: Your Stripe test mode secret key (sk_test_...)
 *
 * The test validates:
 * - Fetching enterprise prices by template
 * - Fetching enterprise prices by enterprise_id
 * - Applying template-based enterprise pricing to a tenant
 * - Applying custom enterprise pricing to a tenant
 *
 * Flow:
 * 1. Verify enterprise prices exist for templates
 * 2. Verify enterprise prices exist for enterprise_id
 * 3. Create tenant with subscription
 * 4. Apply enterprise template pricing
 * 5. Verify tenant was updated
 * 6. Create second tenant
 * 7. Apply custom enterprise pricing
 * 8. Verify tenant was updated
 */
export async function enterprisePricingGetPrices() {
  const client = createClient();

  // Step 1: Get enterprise prices by template (tier1_10pct_off)
  const tier1Response = client.getEnterprisePricesByTemplate("tier1_10pct_off");

  check(tier1Response.response, {
    "get tier1 prices: status is 200": (r) => r.status === 200,
    "get tier1 prices: returns prices array": (r) => {
      const body = r.json() as any;
      return Array.isArray(body?.data?.prices);
    },
    "get tier1 prices: count matches prices length": (r) => {
      const body = r.json() as any;
      return body?.data?.count === body?.data?.prices?.length;
    },
  });

  const tier1Data = tier1Response.data?.data;
  if (!tier1Data?.prices) {
    logError("getEnterprisePricesTier1", tier1Response.response);
  }

  // Step 2: Get enterprise prices by template (tier2_25pct_off)
  const tier2Response = client.getEnterprisePricesByTemplate("tier2_25pct_off");

  check(tier2Response.response, {
    "get tier2 prices: status is 200": (r) => r.status === 200,
    "get tier2 prices: returns prices array": (r) => {
      const body = r.json() as any;
      return Array.isArray(body?.data?.prices);
    },
  });

  // Step 3: Get enterprise prices by enterprise_id (acme_corp)
  const acmeResponse = client.getEnterprisePricesByID("acme_corp");

  check(acmeResponse.data, {
    "get acme prices: status is 200": (r) => r.status === 200,
    "get acme prices: returns prices array": (r) => {
      return Array.isArray(r?.data?.prices);
    },
  });

  return {
    tier1_prices: tier1Data?.prices || [],
    tier2_count: tier2Response.data?.data?.count || 0,
    acme_count: acmeResponse.data?.data?.count || 0,
  };
}

export async function enterprisePricingApplyTemplate() {
  const id = uniqueId();
  const email = `test-enterprise-template-${id}@example.com`;
  const password = randomPassword();
  const client = createClient();

  // Step 1: Create user
  const authResponse = client.createUser({
    email: email,
    password: password,
    name: {
      first: "Enterprise",
      last: "Template",
    },
  });

  check(authResponse.response, {
    "create user: status is 200": (r) => r.status === 200,
  });

  const user = authResponse.data?.data;
  if (!user) {
    logError("createUser", authResponse.response);
    return;
  }

  // Step 2: Create tenant with billing email
  const tenantResponse = client.createTenant(
    {
      name: `Enterprise Template Test Org ${id}`,
      billing_email: email,
    },
    {
      "X-User-Id": user.id,
    }
  );

  check(tenantResponse.response, {
    "create tenant: status is 200": (r) => r.status === 200,
    "create tenant: has stripe_customer_id": (r) => {
      const body = r.json() as any;
      return body?.data?.tenant?.stripe_customer_id !== null;
    },
  });

  const tenant = tenantResponse.data?.data?.tenant;
  if (!tenant?.stripe_customer_id) {
    logError("createTenant", tenantResponse.response);
    return;
  }

  // Step 3: Attach payment method for subscription
  const stripeSecretKey = __ENV.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    console.warn("STRIPE_SECRET_KEY not set - skipping payment method setup");
    return;
  }

  const attachPaymentMethodResponse = http.post(
    `https://api.stripe.com/v1/payment_methods/pm_card_visa/attach`,
    `customer=${tenant.stripe_customer_id}`,
    {
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  if (attachPaymentMethodResponse.status !== 200) {
    console.error(
      "Failed to attach payment method:",
      attachPaymentMethodResponse.body
    );
    return;
  }

  const paymentMethod = attachPaymentMethodResponse.json() as any;

  // Set as default payment method
  http.post(
    `https://api.stripe.com/v1/customers/${tenant.stripe_customer_id}`,
    `invoice_settings[default_payment_method]=${paymentMethod.id}`,
    {
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  // Step 4: Get config to find base price
  const configResponse = client.getStripeConfigAdmin();
  const config = configResponse.data?.data?.config;

  if (!config?.products?.length) {
    console.warn("No products in config - skipping subscription creation");
    return;
  }

  // Find the base price (public, non-enterprise)
  let basePriceId: string | undefined;
  for (const product of config.products) {
    for (const price of product.prices || []) {
      if (
        price.public !== false &&
        !price.enterprise_template &&
        !price.enterprise_id &&
        price.id.includes("base")
      ) {
        basePriceId = price.id;
        break;
      }
    }
    if (basePriceId) break;
  }

  if (!basePriceId) {
    console.warn("No base price found - using first available price");
    basePriceId = config.products[0]?.prices?.[0]?.id;
  }

  if (!basePriceId) {
    console.error("No price available for subscription");
    return;
  }

  // Step 5: Create subscription with base price
  const subscriptionResponse = client.addSubscription(
    { plan_id: basePriceId },
    {
      headers: {
        "X-User-Id": user.id,
        "X-Tenant-Id": tenant.id,
      },
    }
  );

  check(subscriptionResponse.response, {
    "add subscription: status is 200": (r) => r.status === 200,
  });

  if (subscriptionResponse.response.status !== 200) {
    logError("addSubscription", subscriptionResponse.response);
    return;
  }

  // Step 6: Apply enterprise template pricing
  const applyTemplateResponse = client.applyEnterpriseTemplate({
    tenant_id: tenant.id,
    enterprise_template: "tier1_10pct_off",
  });

  check(applyTemplateResponse.response, {
    "apply template: status is 200": (r) => r.status === 200,
    "apply template: returns tenant_id": (r) => {
      const body = r.json() as any;
      return body?.data?.tenant_id === tenant.id;
    },
    "apply template: returns prices_swapped count": (r) => {
      const body = r.json() as any;
      return typeof body?.data?.prices_swapped === "number";
    },
  });

  if (applyTemplateResponse.response.status !== 200) {
    logError("applyEnterpriseTemplate", applyTemplateResponse.response);
  }

  // Step 7: Verify tenant was updated with enterprise_template
  const getTenantResponse = client.getTenantByID(tenant.id);

  check(getTenantResponse.data, {
    "get tenant: status is 200": (d) => d.status === 200,
    "get tenant: has enterprise_template": (d) => {
      return d.data?.tenant?.enterprise_template === "tier1_10pct_off";
    },
  });

  return {
    tenant_id: tenant.id,
    prices_swapped: applyTemplateResponse.data?.data?.prices_swapped || 0,
    swapped_details: applyTemplateResponse.data?.data?.swapped_details || [],
  };
}

export async function enterprisePricingApplyCustom() {
  const id = uniqueId();
  const email = `test-enterprise-custom-${id}@example.com`;
  const password = randomPassword();
  const client = createClient();

  // Step 1: Create user
  const authResponse = client.createUser({
    email: email,
    password: password,
    name: {
      first: "Enterprise",
      last: "Custom",
    },
  });

  check(authResponse.response, {
    "create user: status is 200": (r) => r.status === 200,
  });

  const user = authResponse.data?.data;
  if (!user) {
    logError("createUser", authResponse.response);
    return;
  }

  // Step 2: Create tenant with billing email
  const tenantResponse = client.createTenant(
    {
      name: `Enterprise Custom Test Org ${id}`,
      billing_email: email,
    },
    {
      "X-User-Id": user.id,
    }
  );

  check(tenantResponse.response, {
    "create tenant: status is 200": (r) => r.status === 200,
    "create tenant: has stripe_customer_id": (r) => {
      const body = r.json() as any;
      return body?.data?.tenant?.stripe_customer_id !== null;
    },
  });

  const tenant = tenantResponse.data?.data?.tenant;
  if (!tenant?.stripe_customer_id) {
    logError("createTenant", tenantResponse.response);
    return;
  }

  // Step 3: Attach payment method for subscription
  const stripeSecretKey = __ENV.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    console.warn("STRIPE_SECRET_KEY not set - skipping payment method setup");
    return;
  }

  const attachPaymentMethodResponse = http.post(
    `https://api.stripe.com/v1/payment_methods/pm_card_visa/attach`,
    `customer=${tenant.stripe_customer_id}`,
    {
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  if (attachPaymentMethodResponse.status !== 200) {
    console.error(
      "Failed to attach payment method:",
      attachPaymentMethodResponse.body
    );
    return;
  }

  const paymentMethod = attachPaymentMethodResponse.json() as any;

  // Set as default payment method
  http.post(
    `https://api.stripe.com/v1/customers/${tenant.stripe_customer_id}`,
    `invoice_settings[default_payment_method]=${paymentMethod.id}`,
    {
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  // Step 4: Get config to find base price
  const configResponse = client.getStripeConfigAdmin();
  const config = configResponse.data?.data?.config;

  if (!config?.products?.length) {
    console.warn("No products in config - skipping subscription creation");
    return;
  }

  // Find the base price (public, non-enterprise)
  let basePriceId: string | undefined;
  for (const product of config.products) {
    for (const price of product.prices || []) {
      if (
        price.public !== false &&
        !price.enterprise_template &&
        !price.enterprise_id &&
        price.id.includes("base")
      ) {
        basePriceId = price.id;
        break;
      }
    }
    if (basePriceId) break;
  }

  if (!basePriceId) {
    console.warn("No base price found - using first available price");
    basePriceId = config.products[0]?.prices?.[0]?.id;
  }

  if (!basePriceId) {
    console.error("No price available for subscription");
    return;
  }

  // Step 5: Create subscription with base price
  const subscriptionResponse = client.addSubscription(
    { plan_id: basePriceId },
    {
      headers: {
        "X-User-Id": user.id,
        "X-Tenant-Id": tenant.id,
      },
    }
  );

  check(subscriptionResponse.response, {
    "add subscription: status is 200": (r) => r.status === 200,
  });

  if (subscriptionResponse.response.status !== 200) {
    logError("addSubscription", subscriptionResponse.response);
    return;
  }

  // Step 6: Apply custom enterprise pricing (acme_corp)
  const applyCustomResponse = client.applyEnterpriseCustom({
    tenant_id: tenant.id,
    enterprise_id: "acme_corp",
  });

  check(applyCustomResponse.response, {
    "apply custom: status is 200": (r) => r.status === 200,
    "apply custom: returns tenant_id": (r) => {
      const body = r.json() as any;
      return body?.data?.tenant_id === tenant.id;
    },
    "apply custom: returns prices_swapped count": (r) => {
      const body = r.json() as any;
      return typeof body?.data?.prices_swapped === "number";
    },
  });

  if (applyCustomResponse.response.status !== 200) {
    logError("applyEnterpriseCustom", applyCustomResponse.response);
  }

  // Step 7: Verify tenant was updated with enterprise_id
  const getTenantResponse = client.getTenantByID(tenant.id);

  check(getTenantResponse.data, {
    "get tenant: status is 200": (d) => d.status === 200,
    "get tenant: has enterprise_id": (d) => {
      return d.data?.tenant.enterprise_id === "acme_corp";
    },
  });

  return {
    tenant_id: tenant.id,
    prices_swapped: applyCustomResponse.data?.data?.prices_swapped || 0,
    swapped_details: applyCustomResponse.data?.data?.swapped_details || [],
  };
}

export async function enterprisePricingValidation() {
  const client = createClient();

  // Test 1: Apply template with invalid tenant_id
  const invalidTenantResponse = client.applyEnterpriseTemplate({
    tenant_id: "00000000-0000-0000-0000-000000000000",
    enterprise_template: "tier1_10pct_off",
  });

  check(invalidTenantResponse.response, {
    "apply template invalid tenant: returns 404": (r) => r.status === 404,
  });

  // Test 2: Apply template with non-existent template
  // First we need a valid tenant - create one
  const id = uniqueId();
  const email = `test-enterprise-validation-${id}@example.com`;
  const password = randomPassword();

  const authResponse = client.createUser({
    email: email,
    password: password,
    name: {
      first: "Validation",
      last: "Test",
    },
  });

  const user = authResponse.data?.data;
  if (!user) {
    logError("createUser", authResponse.response);
    return;
  }

  const tenantResponse = client.createTenant(
    {
      name: `Validation Test Org ${id}`,
      billing_email: email,
    },
    {
      "X-User-Id": user.id,
    }
  );

  const tenant = tenantResponse.data?.data?.tenant;
  if (!tenant) {
    logError("createTenant", tenantResponse.response);
    return;
  }

  // Apply non-existent template
  const nonExistentTemplateResponse = client.applyEnterpriseTemplate({
    tenant_id: tenant.id,
    enterprise_template: "non_existent_template",
  });

  check(nonExistentTemplateResponse.response, {
    "apply non-existent template: returns 404": (r) => r.status === 404,
  });

  // Apply non-existent enterprise_id
  const nonExistentIdResponse = client.applyEnterpriseCustom({
    tenant_id: tenant.id,
    enterprise_id: "non_existent_corp",
  });

  check(nonExistentIdResponse.response, {
    "apply non-existent enterprise_id: returns 404": (r) => r.status === 404,
  });

  return { validation_tests_passed: true };
}

export default function () {
  enterprisePricingGetPrices();
  enterprisePricingApplyTemplate();
  enterprisePricingApplyCustom();
  enterprisePricingValidation();
}
