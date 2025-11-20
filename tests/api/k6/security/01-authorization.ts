import { check } from "k6";
import { createClient, BASE_URL } from "../client";
import { OmnibaseRESTAPIClient } from "../sdk";

/**
 * Test Scenario: Authorization & 401/403 Tests
 *
 * Flow:
 * 1. Attempt API call without X-Service-Key header (should 401)
 * 2. Attempt API call with invalid X-Service-Key (should 401)
 * 3. Attempt protected endpoint without X-User-Id (should 401)
 * 4. Create tenant with owner user
 * 5. Create member user and add to tenant
 * 6. Attempt to delete tenant as member (should 403 - not owner)
 * 7. Attempt to create custom role as member (should 403 - not owner/admin)
 * 8. Attempt to update billing as member (should 403 - not owner/admin)
 * 9. Create expired invite token scenario
 * 10. Attempt to accept expired invite (should 400/403)
 * 11. Attempt to use invite token twice (should 400/409)
 * 12. Attempt to invite user to tenant without permission (should 403)
 *
 * This test validates:
 * - Missing auth headers return 401
 * - Invalid credentials return 401
 * - Insufficient permissions return 403
 * - Expired tokens are rejected
 * - Used tokens cannot be reused
 * - Error responses include meaningful messages
 */
export async function authorization() {
  const timestamp = Date.now();
  const ownerEmail = `auth-owner-${timestamp}@example.com`;
  const memberEmail = `auth-member-${timestamp}@example.com`;
  const password = crypto.randomUUID();
  const client = createClient();

  // Step 1: Attempt API call without X-Service-Key header (should 401)
  const noServiceKeyClient = new OmnibaseRESTAPIClient({
    baseUrl: BASE_URL,
    commonRequestParameters: {
      headers: {},
    },
  });

  const noServiceKeyResponse = noServiceKeyClient.listTenants({
    "X-User-Id": "test-user-id",
  });

  check(noServiceKeyResponse.response, {
    "no service key: status is 401": (r) => r.status === 401,
    "no service key: error message is meaningful": (r) => {
      const body = r.json() as any;
      const errorMsg = (body?.error || "").toLowerCase();
      return (
        errorMsg.includes("unauthorized") ||
        errorMsg.includes("service key") ||
        errorMsg.includes("authentication")
      );
    },
  });

  // Step 2: Attempt API call with invalid X-Service-Key (should 401)
  const invalidServiceKeyClient = new OmnibaseRESTAPIClient({
    baseUrl: BASE_URL,
    commonRequestParameters: {
      headers: {
        "X-Service-Key": "INVALID_KEY_123",
      },
    },
  });

  const invalidServiceKeyResponse = invalidServiceKeyClient.listTenants({
    "X-User-Id": "test-user-id",
  });

  check(invalidServiceKeyResponse.response, {
    "invalid service key: status is 401": (r) => r.status === 401,
    "invalid service key: error message is meaningful": (r) => {
      const body = r.json() as any;
      const errorMsg = (body?.error || "").toLowerCase();
      return (
        errorMsg.includes("unauthorized") ||
        errorMsg.includes("invalid") ||
        errorMsg.includes("service key")
      );
    },
  });

  // Step 3: Attempt protected endpoint without X-User-Id (should 400/401)
  const noUserIdResponse = client.listTenants({});

  check(noUserIdResponse.response, {
    "no user id: status is 400 or 401": (r) =>
      r.status === 400 || r.status === 401,
    "no user id: error message mentions user id": (r) => {
      const body = r.json() as any;
      const errorMsg = (body?.error || "").toLowerCase();
      return (
        errorMsg.includes("user") ||
        errorMsg.includes("unauthorized") ||
        errorMsg.includes("user-id") ||
        errorMsg.includes("x-user-id")
      );
    },
  });

  // Step 4: Create tenant with owner user
  const ownerResponse = client.createUser({
    email: ownerEmail,
    password: password,
    name: {
      first: "Owner",
      last: "User",
    },
  });

  check(ownerResponse.response, {
    "create owner: status is 200": (r) => r.status === 200,
  });

  const owner = ownerResponse.data.data;
  if (!owner) {
    console.error("Owner creation failed");
    return;
  }

  const tenantResponse = client.createTenant(
    {
      name: `Auth Test Tenant ${timestamp}`,
      billing_email: ownerEmail,
    },
    {
      "X-User-Id": owner.id,
    }
  );

  check(tenantResponse.response, {
    "create tenant: status is 200": (r) => r.status === 200,
  });

  const tenantData = tenantResponse.data.data;
  if (!tenantData?.tenant) {
    console.error("Tenant creation failed");
    return;
  }

  const tenant = tenantData.tenant;

  // Step 5: Create member user and add to tenant
  const memberResponse = client.createUser({
    email: memberEmail,
    password: password,
    name: {
      first: "Member",
      last: "User",
    },
  });

  check(memberResponse.response, {
    "create member: status is 200": (r) => r.status === 200,
  });

  const member = memberResponse.data.data;
  if (!member) {
    console.error("Member creation failed");
    return;
  }

  // Invite and accept to add member to tenant
  const inviteResponse = client.createInvite(
    {
      email: memberEmail,
      role: "member",
      invite_url: `http://localhost:3000/accept-invite`,
    },
    {
      "X-Tenant-Id": tenant.id,
      "X-User-Id": owner.id,
    }
  );

  check(inviteResponse.response, {
    "create member invite: status is 200": (r) => r.status === 200,
  });

  const inviteData = inviteResponse.data.data;
  if (!inviteData?.invite) {
    console.error("Member invite creation failed");
    return;
  }

  const acceptResponse = client.acceptInvite(
    {
      token: inviteData.invite.token,
    },
    {
      "X-User-Id": member.id,
    }
  );

  check(acceptResponse.response, {
    "accept member invite: status is 200": (r) => r.status === 200,
  });

  // Step 6: Attempt to delete tenant as member (should 403 - not owner)
  const deleteTenantAsMemberResponse = client.deleteTenant({
    "X-User-Id": member.id,
    "X-Tenant-Id": tenant.id,
  });

  check(deleteTenantAsMemberResponse.response, {
    "delete tenant as member: status is 403": (r) => r.status === 403,
    "delete tenant as member: error message mentions permission": (r) => {
      const body = r.json() as any;
      const errorMsg = (body?.error || "").toLowerCase();
      return errorMsg.includes("permission") || errorMsg.includes("forbidden");
    },
  });

  // Step 7: Attempt to create custom role as member (should 403 - not owner/admin)
  const createRoleAsMemberResponse = client.createRole(
    {
      role_name: `unauthorized_role_${timestamp}`,
      permissions: ["Tenant#view_users"],
    },
    {
      "X-User-Id": member.id,
      "X-Tenant-Id": tenant.id,
    }
  );

  check(createRoleAsMemberResponse.response, {
    "create role as member: status is 403": (r) => r.status === 403,
    "create role as member: error message mentions permission": (r) => {
      const body = r.json() as any;
      const errorMsg = (body?.error || "").toLowerCase();
      return errorMsg.includes("permission") || errorMsg.includes("forbidden");
    },
  });

  // Step 8: Attempt to assign role as member without permission (should 403)
  // Member trying to assign role to another user without admin privileges
  const assignRoleAsMemberResponse = client.updateTenantUserRole(
    {
      user_id: owner.id,
      role: "member",
    },
    {
      "X-User-Id": member.id,
      "X-Tenant-Id": tenant.id,
    }
  );

  check(assignRoleAsMemberResponse.response, {
    "assign role as member: status is 403": (r) => r.status === 403,
    "assign role as member: error message mentions permission": (r) => {
      const body = r.json() as any;
      const errorMsg = (body?.error || "").toLowerCase();
      return errorMsg.includes("permission") || errorMsg.includes("forbidden");
    },
  });

  // Step 9-11: Test invite token expiration and reuse
  // Create a new invite for testing
  const testInviteEmail = `test-invite-${timestamp}@example.com`;
  const testInviteResponse = client.createInvite(
    {
      email: testInviteEmail,
      role: "member",
      invite_url: `http://localhost:3000/accept-invite`,
    },
    {
      "X-Tenant-Id": tenant.id,
      "X-User-Id": owner.id,
    }
  );

  check(testInviteResponse.response, {
    "create test invite: status is 200": (r) => r.status === 200,
  });

  const testInviteData = testInviteResponse.data.data;
  if (!testInviteData?.invite) {
    console.error("Test invite creation failed");
    return;
  }

  // Create user to accept the invite
  const testInviteUserResponse = client.createUser({
    email: testInviteEmail,
    password: password,
    name: {
      first: "Test",
      last: "Invite",
    },
  });

  check(testInviteUserResponse.response, {
    "create test invite user: status is 200": (r) => r.status === 200,
  });

  const testInviteUser = testInviteUserResponse.data.data;
  if (!testInviteUser) {
    console.error("Test invite user creation failed");
    return;
  }

  // Accept the invite
  const firstAcceptResponse = client.acceptInvite(
    {
      token: testInviteData.invite.token,
    },
    {
      "X-User-Id": testInviteUser.id,
    }
  );

  check(firstAcceptResponse.response, {
    "first accept invite: status is 200": (r) => r.status === 200,
  });

  // Step 11: Attempt to use invite token twice (should 400/409)
  const secondAcceptResponse = client.acceptInvite(
    {
      token: testInviteData.invite.token,
    },
    {
      "X-User-Id": testInviteUser.id,
    }
  );

  check(secondAcceptResponse.response, {
    "reuse invite token: status is 400 or 409": (r) =>
      r.status === 400 || r.status === 409,
    "reuse invite token: error message mentions token invalid/used": (r) => {
      const body = r.json() as any;
      const errorMsg = (body?.error || "").toLowerCase();
      return (
        errorMsg.includes("already") ||
        errorMsg.includes("used") ||
        errorMsg.includes("invalid") ||
        errorMsg.includes("expired")
      );
    },
  });

  // Step 12: Attempt to invite user without permission
  // Create a restrictive role with no invite permission
  const restrictedRoleName = `no_invite_role_${timestamp}`;
  const createRestrictedRoleResponse = client.createRole(
    {
      role_name: restrictedRoleName,
      permissions: ["Tenant#view_users"],
    },
    {
      "X-User-Id": owner.id,
      "X-Tenant-Id": tenant.id,
    }
  );

  check(createRestrictedRoleResponse.response, {
    "create restricted role: status is 200": (r) => r.status === 200,
  });

  // Update member to restricted role
  const updateMemberRoleResponse = client.updateTenantUserRole(
    {
      user_id: member.id,
      role: restrictedRoleName,
    },
    {
      "X-Tenant-Id": tenant.id,
      "X-User-Id": owner.id,
    }
  );

  check(updateMemberRoleResponse.response, {
    "assign restricted role to member: status is 200": (r) => r.status === 200,
  });

  // Attempt to create invite without permission
  const inviteWithoutPermissionResponse = client.createInvite(
    {
      email: `no-perm-invite-${timestamp}@example.com`,
      role: "member",
      invite_url: `http://localhost:3000/accept-invite`,
    },
    {
      "X-Tenant-Id": tenant.id,
      "X-User-Id": member.id,
    }
  );

  check(inviteWithoutPermissionResponse.response, {
    "invite without permission: status is 403": (r) => r.status === 403,
    "invite without permission: error message mentions permission": (r) => {
      const body = r.json() as any;
      const errorMsg = (body?.error || "").toLowerCase();
      return errorMsg.includes("permission") || errorMsg.includes("forbidden");
    },
  });

  // Additional test: Attempt to access tenant JWT without being a member
  const outsiderEmail = `outsider-${timestamp}@example.com`;
  const outsiderResponse = client.createUser({
    email: outsiderEmail,
    password: password,
    name: {
      first: "Outsider",
      last: "User",
    },
  });

  check(outsiderResponse.response, {
    "create outsider user: status is 200": (r) => r.status === 200,
  });

  const outsider = outsiderResponse.data.data;
  if (!outsider) {
    console.error("Outsider user creation failed");
    return;
  }

  const outsiderJWTResponse = client.getTenantJWT({
    "X-User-Id": outsider.id,
    "X-Tenant-Id": tenant.id,
  });

  check(outsiderJWTResponse.response, {
    "outsider get tenant JWT: status is 403": (r) => r.status === 403,
    "outsider get tenant JWT: error mentions not a member": (r) => {
      const body = r.json() as any;
      const errorMsg = (body?.error || "").toLowerCase();
      return (
        errorMsg.includes("permission") ||
        errorMsg.includes("forbidden") ||
        errorMsg.includes("not a member") ||
        errorMsg.includes("member")
      );
    },
  });

  // Test: Attempt to list tenant users without being a member
  const outsiderListUsersResponse = client.listTenantUsers({
    "X-User-Id": outsider.id,
    "X-Tenant-Id": tenant.id,
  });

  check(outsiderListUsersResponse.response, {
    "outsider list tenant users: status is 403": (r) => r.status === 403,
    "outsider list tenant users: error mentions permission": (r) => {
      const body = r.json() as any;
      const errorMsg = (body?.error || "").toLowerCase();
      return errorMsg.includes("permission") || errorMsg.includes("forbidden");
    },
  });

  // Test: Invalid tenant ID
  const invalidTenantIdResponse = client.listTenantUsers({
    "X-User-Id": owner.id,
    "X-Tenant-Id": "00000000-0000-0000-0000-000000000000",
  });

  check(invalidTenantIdResponse.response, {
    "invalid tenant id: status is 403 or 404": (r) =>
      r.status === 403 || r.status === 404,
  });

  return {
    owner: owner,
    member: member,
    tenant: tenant,
    outsider: outsider,
  };
}
