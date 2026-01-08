import { check } from "k6";
import { createClient, logError } from "../client";

/**
 * Test Scenario: Tenant Lookup Endpoints
 *
 * Flow:
 * 1. Create a user and tenant (setup)
 * 2. Test GET /tenants/{tenant_id} - lookup by tenant ID
 * 3. Test GET /tenants/stripe-customer-id/{stripe_customer_id} - lookup by Stripe customer ID
 * 4. Verify error cases (invalid IDs, not found)
 *
 * This test validates the tenant resolution endpoints used for:
 * - Direct tenant lookup by ID
 * - Stripe webhook processing (lookup by Stripe customer ID)
 */
export async function tenantLookup() {
  const timestamp = Date.now();
  const email = `test-lookup-${timestamp}@example.com`;
  const password = crypto.randomUUID();
  const client = createClient();

  // Setup: Create user
  const authResponse = client.createUser({
    email: email,
    password: password,
    name: {
      first: "Test",
      last: "Lookup",
    },
  });

  check(authResponse.response, {
    "setup: create user status is 200": (r) => r.status === 200,
  });

  const user = authResponse.data?.data;
  if (!user) {
    logError("createUser", authResponse.response);
    return;
  }

  // Setup: Create tenant with billing_email (triggers Stripe customer creation)
  const tenantResponse = client.createTenant(
    {
      name: `Lookup Test Org ${timestamp}`,
      billing_email: email,
    },
    {
      "X-User-Id": user.id,
    }
  );

  check(tenantResponse.response, {
    "setup: create tenant status is 200": (r) => r.status === 200,
  });

  const tenantData = tenantResponse.data?.data;
  if (!tenantData?.tenant) {
    logError("createTenant", tenantResponse.response);
    return;
  }

  const tenant = tenantData.tenant;

  // Test 1: Get tenant by ID - success case
  const getByIdResponse = client.getTenantByID(tenant.id);

  check(getByIdResponse.response, {
    "get by ID: status is 200": (r) => r.status === 200,
    "get by ID: returns tenant data": (r) => {
      const body = r.json() as any;
      return body?.data?.tenant !== undefined;
    },
    "get by ID: returns correct tenant": (r) => {
      const body = r.json() as any;
      return body?.data?.tenant?.id === tenant.id;
    },
    "get by ID: returns correct name": (r) => {
      const body = r.json() as any;
      return body?.data?.tenant?.name === `Lookup Test Org ${timestamp}`;
    },
  });

  if (getByIdResponse.response.status !== 200) {
    logError("getTenantByID", getByIdResponse.response);
  }

  // Test 2: Get tenant by ID - invalid UUID
  const invalidIdResponse = client.getTenantByID("not-a-valid-uuid");

  check(invalidIdResponse.response, {
    "get by invalid ID: status is 400 or 404": (r) =>
      r.status === 400 || r.status === 404,
  });

  // Test 3: Get tenant by ID - non-existent tenant
  const nonExistentIdResponse = client.getTenantByID(
    "00000000-0000-0000-0000-000000000000"
  );

  check(nonExistentIdResponse.response, {
    "get by non-existent ID: status is 404": (r) => r.status === 404,
  });

  // Test 4: Get tenant by Stripe customer ID - success case
  if (tenant.stripe_customer_id) {
    const getByStripeIdResponse = client.getTenantByStripeCustomerID(
      tenant.stripe_customer_id
    );

    check(getByStripeIdResponse.response, {
      "get by Stripe ID: status is 200": (r) => r.status === 200,
      "get by Stripe ID: returns tenant data": (r) => {
        const body = r.json() as any;
        return body?.data?.tenant !== undefined;
      },
      "get by Stripe ID: returns correct tenant": (r) => {
        const body = r.json() as any;
        return body?.data?.tenant?.id === tenant.id;
      },
      "get by Stripe ID: returns matching stripe_customer_id": (r) => {
        const body = r.json() as any;
        return (
          body?.data?.tenant?.stripe_customer_id === tenant.stripe_customer_id
        );
      },
    });

    if (getByStripeIdResponse.response.status !== 200) {
      logError("getTenantByStripeCustomerID", getByStripeIdResponse.response);
    }
  }

  // Test 5: Get tenant by Stripe customer ID - non-existent
  const nonExistentStripeIdResponse = client.getTenantByStripeCustomerID(
    "cus_nonexistent123456"
  );

  check(nonExistentStripeIdResponse.response, {
    "get by non-existent Stripe ID: status is 404": (r) => r.status === 404,
  });

  return {
    user: user,
    tenant: tenant,
  };
}
