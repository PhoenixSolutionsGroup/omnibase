import { check } from "k6";
import { createClient } from "../client";

/**
 * Test Scenario: Multi-Tenant User Journey & Switching
 * 
 * Flow:
 * 1. Create user
 * 2. Create first tenant
 * 3. Create second tenant  
 * 4. Verify both tenants exist in user's tenant list
 * 5. Verify second tenant is active (last created)
 * 6. Switch to first tenant
 * 7. Verify active tenant changed
 * 8. Verify JWT token contains correct tenant context
 * 9. Switch back to second tenant
 * 10. Verify token updates correctly
 * 
 * This test validates:
 * - Multi-tenant membership for single user
 * - Tenant switching functionality
 * - Active tenant tracking
 * - JWT token updates with tenant context
 */
export async function multiTenantSwitching() {
  const timestamp = Date.now();
  const email = `test-${timestamp}@example.com`;
  const password = crypto.randomUUID();
  const client = createClient();

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

  // Step 2: Create first tenant
  const tenant1Response = client.createTenant(
    {
      name: `Tenant One ${timestamp}`,
      billing_email: email,
    },
    {
      "X-User-Id": user.id,
    }
  );

  check(tenant1Response.response, {
    "create tenant 1: status is 200": (r) => r.status === 200,
    "create tenant 1: returns tenant data": (r) => {
      const body = r.json() as any;
      return body?.data?.tenant !== undefined;
    },
    "create tenant 1: returns JWT token": (r) => {
      const body = r.json() as any;
      return body?.data?.token !== undefined;
    },
  });

  const tenant1Data = tenant1Response.data.data;
  if (!tenant1Data?.tenant) {
    console.error("Tenant 1 creation failed");
    return;
  }

  const tenant1 = tenant1Data.tenant;
  const tenant1Token = tenant1Data.token;

  // Step 3: Create second tenant (should become active)
  const tenant2Response = client.createTenant(
    {
      name: `Tenant Two ${timestamp}`,
      billing_email: email,
    },
    {
      "X-User-Id": user.id,
    }
  );

  check(tenant2Response.response, {
    "create tenant 2: status is 200": (r) => r.status === 200,
    "create tenant 2: returns tenant data": (r) => {
      const body = r.json() as any;
      return body?.data?.tenant !== undefined;
    },
  });

  const tenant2Data = tenant2Response.data.data;
  if (!tenant2Data?.tenant) {
    console.error("Tenant 2 creation failed");
    return;
  }

  const tenant2 = tenant2Data.tenant;
  const tenant2Token = tenant2Data.token;

  // Step 4: List tenants and verify both exist
  const tenantsListResponse = client.listTenants({
    "X-User-Id": user.id,
  });

  check(tenantsListResponse.response, {
    "list tenants: status is 200": (r) => r.status === 200,
    "list tenants: contains tenant 1": (r) => {
      const body = r.json() as any;
      const tenants = body?.data?.tenants || [];
      return tenants.some((t: any) => t.tenant?.id === tenant1.id);
    },
    "list tenants: contains tenant 2": (r) => {
      const body = r.json() as any;
      const tenants = body?.data?.tenants || [];
      return tenants.some((t: any) => t.tenant?.id === tenant2.id);
    },
    "list tenants: has exactly 2 tenants": (r) => {
      const body = r.json() as any;
      const tenants = body?.data?.tenants || [];
      return tenants.length === 2;
    },
  });

  // Step 5: Verify tenant 2 is active (last created)
  check(tenantsListResponse.response, {
    "initial state: tenant 2 is active": (r) => {
      const body = r.json() as any;
      const tenants = body?.data?.tenants || [];
      const t2 = tenants.find((t: any) => t.tenant?.id === tenant2.id);
      return t2?.is_active === true;
    },
    "initial state: tenant 1 is not active": (r) => {
      const body = r.json() as any;
      const tenants = body?.data?.tenants || [];
      const t1 = tenants.find((t: any) => t.tenant?.id === tenant1.id);
      return t1?.is_active === false;
    },
  });

  // Step 6: Switch to first tenant
  const switchToTenant1Response = client.switchActiveTenant(
    {
      tenant_id: tenant1.id,
    },
    {
        "X-User-Id": user.id
    }
  );

  check(switchToTenant1Response.response, {
    "switch to tenant 1: status is 200": (r) => r.status === 200,
    "switch to tenant 1: returns new token": (r) => {
      const body = r.json() as any;
      return body?.data?.token !== undefined;
    },
    "switch to tenant 1: token is different": (r) => {
      const body = r.json() as any;
      return body?.data?.token !== tenant2Token;
    },
  });

  const switchedToTenant1Data = switchToTenant1Response.data.data;
  if (!switchedToTenant1Data?.token) {
    console.error("Tenant switch failed");
    return;
  }

  const tenant1SwitchedToken = switchedToTenant1Data.token;

  // Step 7: Verify active tenant changed
  const tenantsListAfterSwitch = client.listTenants({
    "X-User-Id": user.id,
  });

  check(tenantsListAfterSwitch.response, {
    "after switch: status is 200": (r) => r.status === 200,
    "after switch: tenant 1 is active": (r) => {
      const body = r.json() as any;
      const tenants = body?.data?.tenants || [];
      const t1 = tenants.find((t: any) => t.tenant?.id === tenant1.id);
      return t1?.is_active === true;
    },
    "after switch: tenant 2 is not active": (r) => {
      const body = r.json() as any;
      const tenants = body?.data?.tenants || [];
      const t2 = tenants.find((t: any) => t.tenant?.id === tenant2.id);
      return t2?.is_active === false;
    },
  });

  // Step 8: Verify JWT generation works with new active tenant
  const jwt1Response = client.getTenantJWT({
    "X-User-Id": user.id,
    "X-Tenant-Id": tenant1.id,
  });

  check(jwt1Response.response, {
    "tenant 1 JWT: status is 200": (r) => r.status === 200,
    "tenant 1 JWT: returns token": (r) => {
      const body = r.json() as any;
      return body?.data?.token !== undefined && body?.data?.token.length > 0;
    },
  });

  // Step 9: Switch back to tenant 2
  const switchBackToTenant2Response = client.switchActiveTenant(
    {
      tenant_id: tenant2.id,
    },
    {
      "X-User-Id": user.id,
    }
  );

  check(switchBackToTenant2Response.response, {
    "switch back to tenant 2: status is 200": (r) => r.status === 200,
    "switch back to tenant 2: returns new token": (r) => {
      const body = r.json() as any;
      return body?.data?.token !== undefined;
    },
    "switch back to tenant 2: token different from tenant 1": (r) => {
      const body = r.json() as any;
      return body?.data?.token !== tenant1SwitchedToken;
    },
  });

  const switchedBackToTenant2Data = switchBackToTenant2Response.data.data;
  if (!switchedBackToTenant2Data?.token) {
    console.error("Switch back failed");
    return;
  }

  const tenant2SwitchedBackToken = switchedBackToTenant2Data.token;

  // Step 10: Verify active tenant is now tenant 2 again
  const tenantsListFinal = client.listTenants({
    "X-User-Id": user.id,
  });

  check(tenantsListFinal.response, {
    "final state: status is 200": (r) => r.status === 200,
    "final state: tenant 2 is active": (r) => {
      const body = r.json() as any;
      const tenants = body?.data?.tenants || [];
      const t2 = tenants.find((t: any) => t.tenant?.id === tenant2.id);
      return t2?.is_active === true;
    },
    "final state: tenant 1 is not active": (r) => {
      const body = r.json() as any;
      const tenants = body?.data?.tenants || [];
      const t1 = tenants.find((t: any) => t.tenant?.id === tenant1.id);
      return t1?.is_active === false;
    },
  });

  return {
    user: user,
    tenant1: tenant1,
    tenant2: tenant2,
    finalToken: tenant2SwitchedBackToken,
  };
}