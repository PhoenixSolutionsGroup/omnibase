import { check } from "k6";
import { createClient } from "../client";

/**
 * Test Scenario: Complete Tenant Creation Lifecycle
 * 
 * Flow:
 * 1. Create user with unique email
 * 2. Create tenant with billing_email (triggers Stripe customer creation)
 * 3. Verify tenant created successfully with Stripe customer ID
 * 4. Verify tenant is active for user
 * 5. Verify user is assigned owner role
 * 6. List tenant users and verify owner exists
 * 7. Get tenant JWT and verify it works
 * 
 * This test validates the complete tenant onboarding flow including:
 * - User creation
 * - Tenant creation with Stripe integration
 * - Automatic owner role assignment
 * - Active tenant context setting
 */
export async function createTenant() {
  const timestamp = Date.now();
  const email = `test-${timestamp}@example.com`;
  const password = crypto.randomUUID();
  const client = createClient()

  // Step 1: Create user
  const authResponse = client.createUser({
    email: email,
    password: password,
    name: {
      first: "Test",
      last: "User",
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
    console.error("User creation failed");
    return;
  }


  // Step 2: Create tenant with billing_email (triggers Stripe customer creation)
  const tenantResponse = client.createTenant(
    {
      name: `Test Organization ${timestamp}`,
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
    "create tenant: returns JWT token": (r) => {
      const body = r.json() as any;
      return body?.data?.token !== undefined;
    },
  });

  const tenantData = tenantResponse.data.data;
  if (!tenantData?.tenant) {
    console.error("Tenant creation failed");
    return;
  }

  const tenant = tenantData.tenant;
  const tenantToken = tenantData.token;

  // Step 3: Verify Stripe customer created (without calling Stripe API)
  check(tenant, {
    "create tenant: has stripe_customer_id": (t) => {
      return t.stripe_customer_id !== null && t.stripe_customer_id !== undefined;
    },
    "create tenant: has correct name": (t) => {
      return t.name === `Test Organization ${timestamp}`;
    },
    "create tenant: has tenant_id": (t) => {
      return t.id !== undefined && t.id.length > 0;
    },
  });



  // Step 4: List tenant users and verify owner role assigned
  const usersResponse = client.listTenantUsers({
    "X-User-Id": user.id,
    "X-Tenant-Id": tenant.id,
  });


  check(usersResponse.response, {
    "list users: status is 200": (r) => r.status === 200,
    "list users: contains creator": (r) => {
      const body = r.json() as any;
      const users = body?.data || [];
      return users.some((u: any) => u.user_id === user.id);
    },
    "list users: creator has owner role": (r) => {
      const body = r.json() as any;
      const users = body?.data || [];
      const creator = users.find((u: any) => u.user_id === user.id);
      return creator?.role === "owner";
    },
  });

  // Step 5: Verify tenant JWT generation works
  const jwtResponse = client.getTenantJWT({
    "X-Tenant-Id": tenant.id,
    "X-User-Id": user.id,
  });

  check(jwtResponse.response, {
    "tenant JWT: status is 200": (r) => r.status === 200,
    "tenant JWT: returns token": (r) => {
      const body = r.json() as any;
      return body?.data?.token !== undefined && body?.data?.token.length > 0;
    },
  });

  // Step 7: List user's tenants and verify new tenant appears
  const tenantsListResponse = client.listTenants({
    "X-User-Id": user.id
  });

  check(tenantsListResponse.response, {
    "list tenants: status is 200": (r) => r.status === 200,
    "list tenants: contains new tenant": (r) => {
      const body = r.json() as any;
      const tenants = body?.data?.tenants || [];
      return tenants.some((t: any) => t.tenant?.id === tenant.id);
    },
    "list tenants: new tenant is active": (r) => {
      const body = r.json() as any;
      const tenants = body?.data?.tenants || [];
      const newTenant = tenants.find((t: any) => t.tenant?.id === tenant.id);
      return newTenant?.is_active === true;
    },
  });

  return {
    user: user,
    tenant: tenant,
    token: tenantToken,
  };
}
