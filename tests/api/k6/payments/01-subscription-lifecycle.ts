import { check, sleep } from "k6";
import http from "k6/http";
import { createClient, logError, uniqueId, randomPassword } from "../client";

/**
 * Test Scenario: Payment/Subscription Lifecycle
 *
 * **SETUP REQUIRED:**
 * This test attaches a Stripe test payment method to the customer before
 * creating subscriptions. It uses Stripe's test mode payment method.
 *
 * **Environment Variables Required:**
 * - STRIPE_SECRET_KEY: Your Stripe test mode secret key (sk_test_...)
 *
 * The test validates the complete subscription lifecycle:
 * - Stripe customer creation during tenant setup
 * - Attaching test payment method via Stripe API
 * - Subscription creation and management
 * - Billing status tracking
 * - Subscription cancellation
 *
 * Flow:
 * 1. Create tenant (Stripe customer auto-created)
 * 2. Verify Stripe customer ID exists
 * 3. Attach test payment method directly via Stripe API
 * 4. Add subscription for specific plan
 * 5. Get single subscription by plan ID (new endpoint)
 * 6. List all tenant subscriptions
 * 7. Verify billing status shows active
 * 8. Cancel subscription
 * 9. Verify subscription canceled status
 */
export async function subscriptionLifecycle() {
  const id = uniqueId();
  const email = `test-payment-${id}@example.com`;
  const password = randomPassword();
  const client = createClient();

  // Step 1: Create user
  const authResponse = client.createUser({
    email: email,
    password: password,
    name: {
      first: "Test",
      last: "Payment",
    },
  });

  check(authResponse.response, {
    "create user: status is 200": (r) => r.status === 200,
    "create user: returns user data": (r) => {
      const body = r.json() as any;
      return body?.data?.id !== undefined;
    },
  });

  const user = authResponse.data.data;
  if (!user) {
    logError("createUser", authResponse.response);
    return;
  }

  // Step 2: Create tenant with billing_email (triggers Stripe customer creation)
  const tenantResponse = client.createTenant(
    {
      name: `Payment Test Org ${id}`,
      billing_email: email,
    },
    {
      "X-User-Id": user.id,
    }
  );

  check(tenantResponse.response, {
    "create tenant: status is 200": (r) => r.status === 200,
    "create tenant: returns tenant data": (r) => {
      const body = r.json() as any;
      return body?.data?.tenant !== undefined;
    },
  });

  const tenantData = tenantResponse.data.data;
  if (!tenantData?.tenant) {
    logError("createTenant", tenantResponse.response);
    return;
  }

  const tenant = tenantData.tenant;

  // Step 3: Verify Stripe customer ID exists
  check(tenant, {
    "tenant: has stripe_customer_id": (t) => {
      return (
        t.stripe_customer_id !== null && t.stripe_customer_id !== undefined
      );
    },
  });

  if (!tenant.stripe_customer_id) {
    logError("stripeCustomerIdMissing", tenantResponse.response);
    return;
  }

  // Step 3a: Attach test payment method via Stripe API
  const stripeSecretKey = __ENV.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    return;
  }

  // Use Stripe's test payment method ID for Visa card
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

  check(attachPaymentMethodResponse, {
    "attach payment method: status is 200": (r) => r.status === 200,
    "attach payment method: returns payment method": (r) => {
      const body = r.json() as any;
      return body?.id !== undefined;
    },
  });

  if (attachPaymentMethodResponse.status !== 200) {
    console.error(
      "Failed to attach payment method:",
      attachPaymentMethodResponse.body
    );
    return;
  }

  const paymentMethod = attachPaymentMethodResponse.json() as any;

  // Set as default payment method for the customer
  const updateCustomerResponse = http.post(
    `https://api.stripe.com/v1/customers/${tenant.stripe_customer_id}`,
    `invoice_settings[default_payment_method]=${paymentMethod.id}`,
    {
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  check(updateCustomerResponse, {
    "set default payment method: status is 200": (r) => r.status === 200,
  });

  if (updateCustomerResponse.status !== 200) {
    console.error(
      "Failed to set default payment method:",
      updateCustomerResponse.body
    );
  }

  // Get Stripe configuration to find available plan IDs
  const stripeConfigResponse = client.getStripeConfig();

  check(stripeConfigResponse.response, {
    "get stripe config: status is 200": (r) => r.status === 200,
  });

  const stripeConfig = stripeConfigResponse.data.data;
  if (
    !stripeConfig?.config?.products ||
    stripeConfig.config.products.length === 0
  ) {
    console.error(
      "No Stripe products configured - skipping subscription tests"
    );
    return;
  }

  // Find a valid price ID from the configuration
  const firstProduct = stripeConfig.config.products[0];
  const firstPrice = firstProduct?.prices?.[0];

  if (!firstProduct || !firstPrice?.id) {
    console.error("No valid price ID found in Stripe configuration");
    return;
  }

  const planId = firstPrice.id;

  // Step 4: Add subscription for specific plan
  const addSubscriptionResponse = client.addSubscription(
    {
      plan_id: planId,
    },
    {
      headers: {
        "X-User-Id": user.id,
        "X-Tenant-Id": tenant.id,
      },
    }
  );

  check(addSubscriptionResponse.response, {
    "add subscription: status is 200": (r) => r.status === 200,
    "add subscription: returns subscription_id": (r) => {
      const body = r.json() as any;
      return body?.data?.subscription_id !== undefined;
    },
    "add subscription: status is active or trialing": (r) => {
      const body = r.json() as any;
      const status = body?.data?.status;
      return status === "active" || status === "trialing";
    },
  });

  const subscriptionData = addSubscriptionResponse.data.data;
  if (!subscriptionData?.subscription_id) {
    logError("addSubscription", addSubscriptionResponse.response);
    return;
  }

  // Step 5: Get single subscription by plan ID
  const getTenantSubscriptionResponse = client.getTenantSubscription(planId, {
    headers: {
      "X-User-Id": user.id,
      "X-Tenant-Id": tenant.id,
    },
  });

  check(getTenantSubscriptionResponse.response, {
    "get subscription: status is 200": (r) => r.status === 200,
    "get subscription: returns correct subscription_id": (r) => {
      const body = r.json() as any;
      return body?.data?.subscription_id === subscriptionData.subscription_id;
    },
    "get subscription: returns correct config_price_id": (r) => {
      const body = r.json() as any;
      return body?.data?.config_price_id === planId;
    },
    "get subscription: includes is_legacy_price field": (r) => {
      const body = r.json() as any;
      return body?.data?.is_legacy_price !== undefined;
    },
  });

  // Step 5a: Verify 404 for non-existent plan
  const notFoundResponse = client.getTenantSubscription("non_existent_plan", {
    headers: {
      "X-User-Id": user.id,
      "X-Tenant-Id": tenant.id,
    },
  });

  check(notFoundResponse.response, {
    "get non-existent subscription: returns 404": (r) => r.status === 404,
  });

  // Step 6: List all tenant subscriptions
  const listSubscriptionsResponse = client.listTenantSubscriptions({
    headers: {
      "X-User-Id": user.id,
      "X-Tenant-Id": tenant.id,
    },
  });

  check(listSubscriptionsResponse.response, {
    "list subscriptions: status is 200": (r) => r.status === 200,
    "list subscriptions: contains created subscription": (r) => {
      const body = r.json() as any;
      const subscriptions = body?.data || [];
      return subscriptions.some(
        (sub: any) => sub.subscription_id === subscriptionData.subscription_id
      );
    },
    "list subscriptions: subscription has correct plan": (r) => {
      const body = r.json() as any;
      const subscriptions = body?.data || [];
      const sub = subscriptions.find(
        (s: any) => s.subscription_id === subscriptionData.subscription_id
      );
      return sub?.config_price_id === planId;
    },
  });

  // Step 7: Verify billing status shows active
  const billingStatusResponse = client.getTenantBillingStatus({
    headers: {
      "X-User-Id": user.id,
      "X-Tenant-Id": tenant.id,
    },
  });

  check(billingStatusResponse.response, {
    "billing status: status is 200": (r) => r.status === 200,
    "billing status: is_active is true": (r) => {
      const body = r.json() as any;
      return body?.data?.is_active === true;
    },
  });

  // Step 8: Cancel subscription
  const cancelSubscriptionResponse = client.removeSubscription(
    {
      plan_id: planId,
    },
    {
      headers: {
        "X-User-Id": user.id,
        "X-Tenant-Id": tenant.id,
      },
    }
  );

  check(cancelSubscriptionResponse.response, {
    "cancel subscription: status is 200": (r) => r.status === 200,
    "cancel subscription: returns subscription_id": (r) => {
      const body = r.json() as any;
      return body?.data?.subscription_id !== undefined;
    },
  });

  // Step 9: Verify subscription canceled status
  const finalListResponse = client.listTenantSubscriptions({
    headers: {
      "X-User-Id": user.id,
      "X-Tenant-Id": tenant.id,
    },
  });

  check(finalListResponse.response, {
    "final subscriptions: status is 200": (r) => r.status === 200,
    "final subscriptions: subscription is canceled": (r) => {
      const body = r.json() as any;
      const subscriptions = body?.data || [];
      const sub = subscriptions.find(
        (s: any) => s.subscription_id === subscriptionData.subscription_id
      );
      return sub?.status === "canceled" || subscriptions.length === 0;
    },
  });

  return {
    user: user,
    tenant: tenant,
    subscription_tested: true,
  };
}

export default function () {
  subscriptionLifecycle();
}
