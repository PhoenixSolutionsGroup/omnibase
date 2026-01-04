import { check } from "k6";
import { createClient, logError } from "../client";

/**
 * Test Scenario: Cross-Tenant Data Isolation
 *
 * Flow:
 * 1. Create User A with Tenant A
 * 2. Create User B with Tenant B
 * 3. User A attempts to list Tenant B's users with X-Tenant-Id: Tenant B (should FAIL 403)
 * 4. User A attempts to generate JWT for Tenant B (should FAIL 403)
 * 5. User B attempts to list Tenant A's users (should FAIL 403)
 * 6. Verify User A can only see Tenant A in their tenant list
 * 7. Verify User B can only see Tenant B in their tenant list
 * 8. Create role in Tenant A
 * 9. Verify role doesn't appear in Tenant B's role list
 * 10. Attempt cross-tenant role assignment (should FAIL)
 * 11. User A attempts to invite someone to Tenant B using Tenant B context (should FAIL)
 * 12. User A attempts to delete Tenant B (should FAIL 403)
 * 13. Verify User A can still access their own Tenant A successfully
 * 14. Verify User B can still access their own Tenant B successfully
 *
 * This test validates:
 * - Users cannot access other tenants' data
 * - Tenant context switching is enforced
 * - Role lists are tenant-scoped
 * - JWT tokens are tenant-scoped
 * - Database queries respect tenant_id filtering
 * - API returns 403 for cross-tenant access attempts
 * - Tenant isolation is maintained across all operations
 */
export async function crossTenantIsolation() {
  const timestamp = Date.now();
  const userAEmail = `user-a-${timestamp}@example.com`;
  const userBEmail = `user-b-${timestamp}@example.com`;
  const password = crypto.randomUUID();
  const client = createClient();

  // Step 1: Create User A with Tenant A
  const userAResponse = client.createUser({
    email: userAEmail,
    password: password,
    name: {
      first: "User",
      last: "A",
    },
  });

  check(userAResponse.response, {
    "create user A: status is 200": (r) => r.status === 200,
  });

  const userA = userAResponse.data.data;
  if (!userA) {
    logError("createUserA", userAResponse.response);
    return;
  }

  const tenantAResponse = client.createTenant(
    {
      name: `Tenant A ${timestamp}`,
      billing_email: userAEmail,
    },
    {
      "X-User-Id": userA.id,
    }
  );

  check(tenantAResponse.response, {
    "create tenant A: status is 200": (r) => r.status === 200,
  });

  const tenantAData = tenantAResponse.data.data;
  if (!tenantAData?.tenant) {
    logError("createTenantA", tenantAResponse.response);
    return;
  }

  const tenantA = tenantAData.tenant;

  // Step 2: Create User B with Tenant B
  const userBResponse = client.createUser({
    email: userBEmail,
    password: password,
    name: {
      first: "User",
      last: "B",
    },
  });

  check(userBResponse.response, {
    "create user B: status is 200": (r) => r.status === 200,
  });

  const userB = userBResponse.data.data;
  if (!userB) {
    logError("createUserB", userBResponse.response);
    return;
  }

  const tenantBResponse = client.createTenant(
    {
      name: `Tenant B ${timestamp}`,
      billing_email: userBEmail,
    },
    {
      "X-User-Id": userB.id,
    }
  );

  check(tenantBResponse.response, {
    "create tenant B: status is 200": (r) => r.status === 200,
  });

  const tenantBData = tenantBResponse.data.data;
  if (!tenantBData?.tenant) {
    logError("createTenantB", tenantBResponse.response);
    return;
  }

  const tenantB = tenantBData.tenant;

  // Step 3: User A attempts to list Tenant B's users (should FAIL 403)
  const userAAccessTenantBUsersResponse = client.listTenantUsers({
    "X-User-Id": userA.id,
    "X-Tenant-Id": tenantB.id,
  });

  check(userAAccessTenantBUsersResponse.response, {
    "user A access tenant B users: status is 403": (r) => r.status === 403,
    "user A access tenant B users: error mentions forbidden/permission": (
      r
    ) => {
      const body = r.json() as any;
      const errorMsg = (body?.error || "").toLowerCase();
      return errorMsg.includes("permission") || errorMsg.includes("forbidden");
    },
  });

  // Step 4: User A attempts to generate JWT for Tenant B (should FAIL 403)
  const userAGetTenantBJWTResponse = client.getTenantJWT({
    "X-User-Id": userA.id,
    "X-Tenant-Id": tenantB.id,
  });

  check(userAGetTenantBJWTResponse.response, {
    "user A get tenant B JWT: status is 403": (r) => r.status === 403,
  });

  // Step 6: User B attempts to list Tenant A's users (should FAIL 403)
  const userBAccessTenantAUsersResponse = client.listTenantUsers({
    "X-User-Id": userB.id,
    "X-Tenant-Id": tenantA.id,
  });

  check(userBAccessTenantAUsersResponse.response, {
    "user B access tenant A users: status is 403": (r) => r.status === 403,
    "user B access tenant A users: error mentions forbidden/permission": (
      r
    ) => {
      const body = r.json() as any;
      const errorMsg = (body?.error || "").toLowerCase();
      return errorMsg.includes("permission") || errorMsg.includes("forbidden");
    },
  });

  // Step 7: Verify User A can only see Tenant A in their tenant list
  const userATenantsListResponse = client.listTenants({
    "X-User-Id": userA.id,
  });

  check(userATenantsListResponse.response, {
    "user A list tenants: status is 200": (r) => r.status === 200,
    "user A list tenants: contains only tenant A": (r) => {
      const body = r.json() as any;
      const tenants = body?.data?.tenants || [];
      return tenants.length === 1 && tenants[0]?.tenant?.id === tenantA.id;
    },
    "user A list tenants: does not contain tenant B": (r) => {
      const body = r.json() as any;
      const tenants = body?.data?.tenants || [];
      return !tenants.some((t: any) => t.tenant?.id === tenantB.id);
    },
  });

  // Step 8: Verify User B can only see Tenant B in their tenant list
  const userBTenantsListResponse = client.listTenants({
    "X-User-Id": userB.id,
  });

  check(userBTenantsListResponse.response, {
    "user B list tenants: status is 200": (r) => r.status === 200,
    "user B list tenants: contains only tenant B": (r) => {
      const body = r.json() as any;
      const tenants = body?.data?.tenants || [];
      return tenants.length === 1 && tenants[0]?.tenant?.id === tenantB.id;
    },
    "user B list tenants: does not contain tenant A": (r) => {
      const body = r.json() as any;
      const tenants = body?.data?.tenants || [];
      return !tenants.some((t: any) => t.tenant?.id === tenantA.id);
    },
  });

  // Step 9: Create role in Tenant A
  const tenantARoleName = `tenant_a_role_${timestamp}`;
  const createTenantARoleResponse = client.createRole(
    {
      role_name: tenantARoleName,
      permissions: ["Tenant#view_users"],
    },
    {
      "X-User-Id": userA.id,
      "X-Tenant-Id": tenantA.id,
    }
  );

  check(createTenantARoleResponse.response, {
    "create role in tenant A: status is 200": (r) => r.status === 200,
  });

  const tenantARole = createTenantARoleResponse.data.data;
  if (!tenantARole) {
    logError("createTenantARole", createTenantARoleResponse.response);
    return;
  }

  // Step 9: Verify role doesn't appear in Tenant B's role list
  const tenantBRolesResponse = client.listRoles({
    "X-Tenant-Id": tenantB.id,
  });

  check(tenantBRolesResponse, {
    "tenant B list roles: status is 200": (r) => r.response.status === 200,
    "tenant B list roles: does not contain tenant A role": (r) => {
      const roles = r.data.data?.roles;
      return !roles?.some((role: any) => role.role_name === tenantARoleName);
    },
  });

  // Step 11: Attempt cross-tenant role assignment (User A tries to assign Tenant A role to User B in Tenant B context)
  const crossTenantRoleAssignResponse = client.updateTenantUserRole(
    {
      user_id: userB.id,
      role: tenantARoleName,
    },
    {
      "X-User-Id": userA.id,
      "X-Tenant-Id": tenantB.id,
    }
  );

  check(crossTenantRoleAssignResponse.response, {
    "cross-tenant role assignment: status is 403 or 400": (r) =>
      r.status === 403 || r.status === 400,
  });

  // Step 12: User A attempts to invite someone to Tenant A using Tenant B context (should FAIL)
  const crossTenantInviteResponse = client.createInvite(
    {
      email: `cross-tenant-${timestamp}@example.com`,
      role: "member",
      invite_url: `http://localhost:3000/accept-invite`,
    },
    {
      "X-User-Id": userA.id,
      "X-Tenant-Id": tenantB.id,
    }
  );

  check(crossTenantInviteResponse.response, {
    "cross-tenant invite attempt: status is 403": (r) => r.status === 403,
  });

  // Step 13: User A attempts to delete Tenant B (should FAIL 403)
  const userADeleteTenantBResponse = client.deleteTenant({
    "X-User-Id": userA.id,
    "X-Tenant-Id": tenantB.id,
  });

  check(userADeleteTenantBResponse.response, {
    "user A delete tenant B: status is 403": (r) => r.status === 403,
    "user A delete tenant B: error mentions forbidden/permission": (r) => {
      const body = r.json() as any;
      const errorMsg = (body?.error || "").toLowerCase();
      return errorMsg.includes("permission") || errorMsg.includes("forbidden");
    },
  });

  // Verify User A can still access their own tenant successfully
  const userAAccessTenantAUsersResponse = client.listTenantUsers({
    "X-User-Id": userA.id,
    "X-Tenant-Id": tenantA.id,
  });

  check(userAAccessTenantAUsersResponse.response, {
    "user A access own tenant A users: status is 200": (r) => r.status === 200,
    "user A access own tenant A users: contains user A": (r) => {
      const body = r.json() as any;
      const users = body?.data || [];
      return users.some((u: any) => u.user_id === userA.id);
    },
  });

  // Verify User B can still access their own tenant successfully
  const userBAccessTenantBUsersResponse = client.listTenantUsers({
    "X-User-Id": userB.id,
    "X-Tenant-Id": tenantB.id,
  });

  check(userBAccessTenantBUsersResponse.response, {
    "user B access own tenant B users: status is 200": (r) => r.status === 200,
    "user B access own tenant B users: contains user B": (r) => {
      const body = r.json() as any;
      const users = body?.data || [];
      return users.some((u: any) => u.user_id === userB.id);
    },
  });

  return {
    userA: userA,
    userB: userB,
    tenantA: tenantA,
    tenantB: tenantB,
    tenantARole: tenantARole,
  };
}
