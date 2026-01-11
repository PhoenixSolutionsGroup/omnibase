import { check } from "k6";
import { createClient, logError, uniqueId } from "../client";

/**
 * Test Scenario: RBAC Permission Enforcement
 *
 * Flow:
 * 1. Create owner user and tenant
 * 2. Create member user
 * 3. Create restrictive custom role with ONLY "tenant#can_view_users"
 * 4. Invite member user with custom role
 * 5. Accept invite as member
 * 6. Test permission check API - verify member has view_users permission
 * 7. Test permission check API - verify member lacks invite_user permission
 * 8. Attempt to list users as member (should SUCCEED - has permission)
 * 9. Attempt to create invite as member (should FAIL 403 - no permission)
 * 10. Attempt to delete tenant as member (should FAIL 403 - no permission)
 * 11. Update role to add "tenant#invite_user" permission
 * 12. Wait for permission propagation
 * 13. Test permission check API - verify member now has invite_user permission
 * 14. Attempt to create invite as member (should SUCCEED - now has permission)
 * 15. Verify invite created successfully
 * 16. Update role to remove "tenant#invite_user" permission
 * 17. Wait for permission propagation
 * 18. Test permission check API - verify permission revoked
 * 19. Attempt to create another invite as member (should FAIL 403 - permission revoked)
 * 20. Create role with NO permissions
 * 21. Update member to no-permission role
 * 22. Test permission check API - verify all permissions denied
 * 23. Attempt any operation as member (should FAIL 403 - no permissions)
 *
 * This test validates:
 * - Permission check API returns correct results
 * - Users with permission can perform actions (200)
 * - Users without permission are denied (403)
 * - Permission updates propagate to Keto
 * - Permission enforcement is real-time
 * - Custom roles properly restrict access
 * - Permission denials return appropriate error messages
 */
export async function rbacEnforcement() {
  const id = uniqueId();
  const ownerEmail = `owner-${id}@example.com`;
  const memberEmail = `member-${id}@example.com`;
  const password = crypto.randomUUID();
  const client = createClient();

  // Step 1: Create owner user and tenant
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
      name: `RBAC Test Tenant ${id}`,
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

  // Step 2: Create member user
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

  // Step 3: Create restrictive custom role with ONLY view_users permission
  const restrictedRoleName = `viewer_only_${id}`;
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
    "create restricted role: has correct permissions": (r) => {
      const body = r.json() as any;
      const permissions = body?.data?.permissions || [];
      return (
        permissions.length === 1 && permissions.includes("Tenant#view_users")
      );
    },
  });

  const restrictedRole = createRestrictedRoleResponse.data.data;
  if (!restrictedRole) {
    logError("createRestrictedRole", createRestrictedRoleResponse.response);
    return;
  }

  // Step 4-5: Invite member user with restricted role and accept
  const inviteResponse = client.createInvite(
    {
      email: memberEmail,
      role: restrictedRoleName,
      invite_url: `http://localhost:3000/accept-invite`,
    },
    {
      "X-Tenant-Id": tenant.id,
      "X-User-Id": owner.id,
    }
  );

  check(inviteResponse.response, {
    "create invite with restricted role: status is 200": (r) =>
      r.status === 200,
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

  // Step 6: Test permission check API - verify member has view_users permission
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
    "permission check: member has view_users": (r) => {
      const body = r.json() as any;
      return r.status === 200 && body?.data?.allowed === true;
    },
  });

  // Step 7: Test permission check API - verify member lacks invite_user permission
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
    "permission check: member lacks invite_user initially": (r) => {
      const body = r.json() as any;
      return r.status === 200 && body?.data?.allowed === false;
    },
  });

  // Step 8: Attempt to list users as member (should SUCCEED - has permission)
  const listUsersSuccessResponse = client.listTenantUsers({
    "X-User-Id": member.id,
    "X-Tenant-Id": tenant.id,
  });

  check(listUsersSuccessResponse.response, {
    "list users as member: status is 200": (r) => r.status === 200,
    "list users as member: returns user list": (r) => {
      const body = r.json() as any;
      const users = body?.data || [];
      return users.length >= 2; // Should have at least owner and member
    },
  });

  // Step 9: Attempt to create invite as member (should FAIL 403 - no permission)
  const createInviteFailResponse = client.createInvite(
    {
      email: `another-${id}@example.com`,
      role: "member",
      invite_url: `http://localhost:3000/accept-invite`,
    },
    {
      "X-Tenant-Id": tenant.id,
      "X-User-Id": member.id,
    }
  );

  check(createInviteFailResponse.response, {
    "create invite without permission: status is 403": (r) => r.status === 403,
    "create invite without permission: error message mentions permissions": (
      r
    ) => {
      const body = r.json() as any;
      const errorMsg = (body?.error || "").toLowerCase();
      return errorMsg.includes("permission") || errorMsg.includes("forbidden");
    },
  });

  // Step 10: Attempt to delete tenant as member (should FAIL 403 - no permission)
  const deleteTenantFailResponse = client.deleteTenant({
    "X-User-Id": member.id,
    "X-Tenant-Id": tenant.id,
  });

  check(deleteTenantFailResponse.response, {
    "delete tenant without permission: status is 403": (r) => r.status === 403,
    "delete tenant without permission: error message mentions permissions": (
      r
    ) => {
      const body = r.json() as any;
      const errorMsg = (body?.error || "").toLowerCase();
      return errorMsg.includes("permission") || errorMsg.includes("forbidden");
    },
  });

  // Step 11: Update role to add invite_user permission
  const updateRoleAddPermissionResponse = client.updateRole(
    restrictedRole.id,
    {
      permissions: ["Tenant#view_users", "Tenant#invite_user"],
    },
    {
      "X-Tenant-Id": tenant.id,
      "X-User-Id": owner.id,
    }
  );

  check(updateRoleAddPermissionResponse.response, {
    "update role add permission: status is 200": (r) => r.status === 200,
    "update role add permission: has both permissions": (r) => {
      const body = r.json() as any;
      const permissions = body?.data?.permissions || [];
      return (
        permissions.length === 2 &&
        permissions.includes("Tenant#view_users") &&
        permissions.includes("Tenant#invite_user")
      );
    },
  });

  // Step 13: Test permission check API - verify member now has invite_user permission
  const checkInviteUserAfterResponse = client.checkPermission({
    namespace: "Tenant",
    object: tenant.id,
    relation: "invite_user",
    subject_set: {
      namespace: "User",
      object: member.id,
      relation: "",
    },
  });

  check(checkInviteUserAfterResponse.response, {
    "permission check: member now has invite_user": (r) => {
      const body = r.json() as any;
      return r.status === 200 && body?.data?.allowed === true;
    },
  });

  // Step 14: Attempt to create invite as member (should SUCCEED - now has permission)
  const createInviteSuccessResponse = client.createInvite(
    {
      email: `invited-${id}@example.com`,
      role: "member",
      invite_url: `http://localhost:3000/accept-invite`,
    },
    {
      "X-Tenant-Id": tenant.id,
      "X-User-Id": member.id,
    }
  );

  check(createInviteSuccessResponse.response, {
    "create invite with permission: status is 200": (r) => r.status === 200,
    "create invite with permission: returns invite data": (r) => {
      const body = r.json() as any;
      return body?.data?.invite !== undefined;
    },
  });

  // Step 15: Verify invite created successfully
  const createdInvite = createInviteSuccessResponse.data.data;
  check(createdInvite, {
    "created invite: has correct email": (d) =>
      d?.invite?.email === `invited-${id}@example.com`,
    "created invite: has token": (d) => d?.invite?.token !== undefined,
  });

  // Step 16: Update role to remove invite_user permission
  const updateRoleRemovePermissionResponse = client.updateRole(
    restrictedRole.id,
    {
      permissions: ["Tenant#view_users"],
    },
    {
      "X-Tenant-Id": tenant.id,
      "X-User-Id": owner.id,
    }
  );

  check(updateRoleRemovePermissionResponse.response, {
    "update role remove permission: status is 200": (r) => r.status === 200,
    "update role remove permission: only has view_users": (r) => {
      const body = r.json() as any;
      const permissions = body?.data?.permissions || [];
      return (
        permissions.length === 1 && permissions.includes("Tenant#view_users")
      );
    },
  });

  // Step 18: Test permission check API - verify permission revoked
  const checkInviteUserRevokedResponse = client.checkPermission({
    namespace: "Tenant",
    object: tenant.id,
    relation: "invite_user",
    subject_set: {
      namespace: "User",
      object: member.id,
      relation: "",
    },
  });

  check(checkInviteUserRevokedResponse.response, {
    "permission check: invite_user permission revoked": (r) => {
      const body = r.json() as any;
      return r.status === 200 && body?.data?.allowed === false;
    },
  });

  // Step 19: Attempt to create another invite (should FAIL 403 - permission revoked)
  const createInviteRevokedResponse = client.createInvite(
    {
      email: `another-invite-${id}@example.com`,
      role: "member",
      invite_url: `http://localhost:3000/accept-invite`,
    },
    {
      "X-Tenant-Id": tenant.id,
      "X-User-Id": member.id,
    }
  );

  check(createInviteRevokedResponse.response, {
    "create invite after revoke: status is 403": (r) => r.status === 403,
    "create invite after revoke: permission denied": (r) => {
      const body = r.json() as any;
      const errorMsg = (body?.error || "").toLowerCase();
      return errorMsg.includes("permission") || errorMsg.includes("forbidden");
    },
  });

  // Step 20: Create role with NO permissions
  const noPermissionsRoleName = `no_permissions_${id}`;
  const createNoPermRoleResponse = client.createRole(
    {
      role_name: noPermissionsRoleName,
      permissions: ["Tenant#placeholder_permission"], // Need at least one permission per schema
    },
    {
      "X-User-Id": owner.id,
      "X-Tenant-Id": tenant.id,
    }
  );

  check(createNoPermRoleResponse.response, {
    "create no-permission role: status is 200": (r) => r.status === 200,
  });

  const noPermRole = createNoPermRoleResponse.data.data;
  if (!noPermRole) {
    logError("createNoPermRole", createNoPermRoleResponse.response);
    return;
  }

  // Step 21: Update member to no-permission role
  const assignNoPermRoleResponse = client.updateTenantUserRole(
    {
      role: noPermissionsRoleName,
      user_id: member.id,
    },
    {
      "X-Tenant-Id": tenant.id,
      "X-User-Id": owner.id,
    }
  );

  check(assignNoPermRoleResponse.response, {
    "assign no-permission role: status is 200": (r) => r.status === 200,
  });

  // Step 22: Test permission check API - verify all standard permissions denied
  const checkViewUsersNoPermResponse = client.checkPermission({
    namespace: "Tenant",
    object: tenant.id,
    relation: "view_users",
    subject_set: {
      namespace: "User",
      object: member.id,
      relation: "",
    },
  });

  check(checkViewUsersNoPermResponse.response, {
    "permission check no-perm role: view_users denied": (r) => {
      const body = r.json() as any;
      return r.status === 200 && body?.data?.allowed === false;
    },
  });

  const checkInviteUserNoPermResponse = client.checkPermission({
    namespace: "Tenant",
    object: tenant.id,
    relation: "invite_user",
    subject_set: {
      namespace: "User",
      object: member.id,
      relation: "",
    },
  });

  check(checkInviteUserNoPermResponse.response, {
    "permission check no-perm role: invite_user denied": (r) => {
      const body = r.json() as any;
      return r.status === 200 && body?.data?.allowed === false;
    },
  });

  // Step 23: Attempt any operation as member (should FAIL 403 - no permissions)
  const listUsersNoPermResponse = client.listTenantUsers({
    "X-User-Id": member.id,
    "X-Tenant-Id": tenant.id,
  });

  check(listUsersNoPermResponse.response, {
    "list users with no-perm role: status is 403": (r) => r.status === 403,
    "list users with no-perm role: permission denied": (r) => {
      const body = r.json() as any;
      const errorMsg = (body?.error || "").toLowerCase();
      return errorMsg.includes("permission") || errorMsg.includes("forbidden");
    },
  });

  return {
    owner: owner,
    member: member,
    tenant: tenant,
    restrictedRole: restrictedRole,
    noPermRole: noPermRole,
  };
}
