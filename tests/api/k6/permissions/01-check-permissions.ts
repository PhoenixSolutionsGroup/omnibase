import { check } from "k6";
import { createClient, logError, uniqueId } from "../client";

/**
 * Test Scenario: Permission Check API
 *
 * Flow:
 * 1. Create tenant with owner user
 * 2. Create custom role "viewer" with ONLY "Tenant#view_users" permission
 * 3. Invite member with "viewer" role
 * 4. Accept invite as member
 * 5. Call checkPermission API for "Tenant#view_users" (should return true)
 * 6. Call checkPermission API for "Tenant#delete_tenant" (should return false)
 * 7. Call checkPermission API for "Tenant#invite_user" (should return false)
 * 8. Update role to add "Tenant#invite_user" permission
 * 9. Call checkPermission API for "Tenant#invite_user" (should return true now - tests permission propagation)
 * 10. Update role to remove "Tenant#invite_user" permission
 * 11. Call checkPermission API for "Tenant#invite_user" (should return false - tests permission revocation)
 * 12. Verify "Tenant#view_users" permission still works (retained permission)
 * 13. Test invalid permission string handling
 * 14. Test invalid user/tenant ID handling
 *
 * This test validates:
 * - checkPermission returns true for granted permissions
 * - checkPermission returns false for denied permissions
 * - Permission updates propagate immediately to user permissions
 * - Permission removal propagates immediately to user permissions
 * - API handles invalid permission strings gracefully
 * - Response format is consistent
 */
export async function checkPermissions() {
  const id = uniqueId();
  const ownerEmail = `perm-owner-${id}@example.com`;
  const memberEmail = `perm-member-${id}@example.com`;
  const password = crypto.randomUUID();
  const client = createClient();

  // Step 1: Create tenant with owner user
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
    logError("createOwner", ownerResponse.response);
    return;
  }

  const tenantResponse = client.createTenant(
    {
      name: `Permission Test Tenant ${id}`,
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
    logError("createTenant", tenantResponse.response);
    return;
  }

  const tenant = tenantData.tenant;

  // Step 2: Create custom role "viewer" with ONLY view_users permission
  const viewerRoleName = `viewer_${id}`;
  const createRoleResponse = client.createRole(
    {
      role_name: viewerRoleName,
      permissions: ["Tenant#view_users"],
    },
    {
      "X-User-Id": owner.id,
      "X-Tenant-Id": tenant.id,
    }
  );

  check(createRoleResponse.response, {
    "create viewer role: status is 200": (r) => r.status === 200,
    "create viewer role: has only view_users permission": (r) => {
      const body = r.json() as any;
      const permissions = body?.data?.permissions || [];
      return (
        permissions.length === 1 && permissions.includes("Tenant#view_users")
      );
    },
  });

  const viewerRole = createRoleResponse.data.data;
  if (!viewerRole) {
    logError("createViewerRole", createRoleResponse.response);
    return;
  }

  // Step 3-4: Create member user, invite, and accept
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
    logError("createMember", memberResponse.response);
    return;
  }

  const inviteResponse = client.createInvite(
    {
      email: memberEmail,
      role: viewerRoleName,
      invite_url: `http://localhost:3000/accept-invite`,
    },
    {
      "X-Tenant-Id": tenant.id,
      "X-User-Id": owner.id,
    }
  );

  check(inviteResponse.response, {
    "create invite: status is 200": (r) => r.status === 200,
  });

  const inviteData = inviteResponse.data.data;
  if (!inviteData?.invite) {
    logError("createInvite", inviteResponse.response);
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
    "accept invite: status is 200": (r) => r.status === 200,
  });

  // Step 5: Check permission for "view_users" (should return true)
  const checkViewUsersResponse = client.checkPermission({
    namespace: "Tenant",
    object: tenant.id,
    relation: "view_users",
    subject_set: {
      namespace: "User",
      object: member.id,
      relation: "",
    },
  });

  check(checkViewUsersResponse.response, {
    "check view_users permission: status is 200": (r) => r.status === 200,
    "check view_users permission: allowed is true": (r) => {
      const body = r.json() as any;
      return body?.data?.allowed === true;
    },
  });

  // Step 6: Check permission for "delete_tenant" (should return false)
  const checkDeleteTenantResponse = client.checkPermission({
    namespace: "Tenant",
    object: tenant.id,
    relation: "delete_tenant",
    subject_set: {
      namespace: "User",
      object: member.id,
      relation: "",
    },
  });

  check(checkDeleteTenantResponse.response, {
    "check delete_tenant permission: status is 200": (r) => r.status === 200,
    "check delete_tenant permission: allowed is false": (r) => {
      const body = r.json() as any;
      return body?.data?.allowed === false;
    },
  });

  // Step 7: Check permission for "invite_user" (should return false - not granted yet)
  const checkInviteUserBeforeResponse = client.checkPermission({
    namespace: "Tenant",
    object: tenant.id,
    relation: "invite_user",
    subject_set: {
      namespace: "User",
      object: member.id,
      relation: "",
    },
  });

  check(checkInviteUserBeforeResponse.response, {
    "check invite_user permission before grant: status is 200": (r) =>
      r.status === 200,
    "check invite_user permission before grant: allowed is false": (r) => {
      const body = r.json() as any;
      return body?.data?.allowed === false;
    },
  });

  // Step 8: Update role to add "invite_user" permission
  // THIS IS THE KEY TEST: Does updating the role propagate to the user's permissions?
  const updateRoleAddResponse = client.updateRole(
    viewerRole.id,
    {
      permissions: ["Tenant#view_users", "Tenant#invite_user"],
    },
    {
      "X-Tenant-Id": tenant.id,
      "X-User-Id": owner.id,
    }
  );

  check(updateRoleAddResponse.response, {
    "update role add invite_user: status is 200": (r) => r.status === 200,
    "update role add invite_user: has both permissions": (r) => {
      const body = r.json() as any;
      const permissions = body?.data?.permissions || [];
      return (
        permissions.length === 2 &&
        permissions.includes("Tenant#invite_user") &&
        permissions.includes("Tenant#view_users")
      );
    },
  });

  // Step 9: Check permission for "invite_user" again (should return true - permission propagated!)
  const checkInviteUserAfterAddResponse = client.checkPermission({
    namespace: "Tenant",
    object: tenant.id,
    relation: "invite_user",
    subject_set: {
      namespace: "User",
      object: member.id,
      relation: "",
    },
  });

  check(checkInviteUserAfterAddResponse.response, {
    "check invite_user after adding to role: status is 200": (r) =>
      r.status === 200,
    "check invite_user after adding to role: allowed is true": (r) => {
      const body = r.json() as any;
      return body?.data?.allowed === true;
    },
  });

  // Step 10: Update role to remove "invite_user" permission
  // THIS TESTS: Does removing a permission from a role revoke it from users?
  const updateRoleRemoveResponse = client.updateRole(
    viewerRole.id,
    {
      permissions: ["Tenant#view_users"],
    },
    {
      "X-Tenant-Id": tenant.id,
      "X-User-Id": owner.id,
    }
  );

  check(updateRoleRemoveResponse.response, {
    "update role remove invite_user: status is 200": (r) => r.status === 200,
    "update role remove invite_user: only has view_users": (r) => {
      const body = r.json() as any;
      const permissions = body?.data?.permissions || [];
      return (
        permissions.length === 1 && permissions.includes("Tenant#view_users")
      );
    },
  });

  // Step 11: Check permission for "invite_user" after removal (should return false - revoked!)
  const checkInviteUserAfterRemoveResponse = client.checkPermission({
    namespace: "Tenant",
    object: tenant.id,
    relation: "invite_user",
    subject_set: {
      namespace: "User",
      object: member.id,
      relation: "",
    },
  });

  check(checkInviteUserAfterRemoveResponse.response, {
    "check invite_user after removing from role: status is 200": (r) =>
      r.status === 200,
    "check invite_user after removing from role: allowed is false": (r) => {
      const body = r.json() as any;
      return body?.data?.allowed === false;
    },
  });

  // Step 12: Verify retained permission still works (view_users should still be allowed)
  const checkRetainedPermissionResponse = client.checkPermission({
    namespace: "Tenant",
    object: tenant.id,
    relation: "view_users",
    subject_set: {
      namespace: "User",
      object: member.id,
      relation: "",
    },
  });

  check(checkRetainedPermissionResponse.response, {
    "check retained view_users permission: status is 200": (r) =>
      r.status === 200,
    "check retained view_users permission: allowed is true": (r) => {
      const body = r.json() as any;
      return body?.data?.allowed === true;
    },
  });

  // Step 13: Test invalid permission string handling
  const checkInvalidPermissionResponse = client.checkPermission({
    namespace: "Tenant",
    object: tenant.id,
    relation: "invalid_permission_xyz",
    subject_set: {
      namespace: "User",
      object: owner.id,
      relation: "",
    },
  });

  check(checkInvalidPermissionResponse.response, {
    "check invalid permission: status is 200 or 400": (r) =>
      r.status === 200 || r.status === 400,
    "check invalid permission: allowed is false or error": (r) => {
      const body = r.json() as any;
      // Either returns allowed: false or returns an error
      return body?.data?.allowed === false || body?.error !== undefined;
    },
  });

  // Step 14: Test invalid tenant ID handling
  const checkInvalidTenantResponse = client.checkPermission({
    namespace: "Tenant",
    object: "00000000-0000-0000-0000-000000000000",
    relation: "view_users",
    subject_set: {
      namespace: "User",
      object: owner.id,
      relation: "",
    },
  });

  check(checkInvalidTenantResponse.response, {
    "check permission with invalid tenant: status is 200 or 404": (r) =>
      r.status === 200 || r.status === 404,
    "check permission with invalid tenant: allowed is false or error": (r) => {
      const body = r.json() as any;
      return body?.data?.allowed === false || body?.error !== undefined;
    },
  });

  // Test: Check owner permissions (should have all permissions)
  const checkOwnerDeleteTenantResponse = client.checkPermission({
    namespace: "Tenant",
    object: tenant.id,
    relation: "delete_tenant",
    subject_set: {
      namespace: "User",
      object: owner.id,
      relation: "",
    },
  });

  check(checkOwnerDeleteTenantResponse.response, {
    "check owner delete_tenant permission: status is 200": (r) =>
      r.status === 200,
    "check owner delete_tenant permission: allowed is true": (r) => {
      const body = r.json() as any;
      return body?.data?.allowed === true;
    },
  });

  // Test: Verify response format consistency
  const responseFormatCheck = client.checkPermission({
    namespace: "Tenant",
    object: tenant.id,
    relation: "view_users",
    subject_set: {
      namespace: "User",
      object: owner.id,
      relation: "",
    },
  });

  check(responseFormatCheck.response, {
    "response format: has data object": (r) => {
      const body = r.json() as any;
      return body?.data !== undefined;
    },
    "response format: data has allowed boolean": (r) => {
      const body = r.json() as any;
      return typeof body?.data?.allowed === "boolean";
    },
  });

  return {
    owner: owner,
    member: member,
    tenant: tenant,
    viewerRole: viewerRole,
  };
}
