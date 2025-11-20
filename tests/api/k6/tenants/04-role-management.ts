import { check } from "k6";
import { createClient } from "../client";

/**
 * Test Scenario: Role Management
 * 
 * Flow:
 * 1. Create owner user and tenant
 * 2. Create member user
 * 3. List initial roles (verify system roles exist: owner, admin, member)
 * 4. Create custom role with specific permissions
 * 5. Verify custom role created successfully
 * 6. Invite member user to tenant with custom role
 * 7. Accept invite and verify custom role assigned
 * 8. Update custom role permissions
 * 9. Verify permission changes reflected
 * 10. Delete custom role
 * 11. Verify role deleted and cleanup successful
 * 
 * This test validates:
 * - System role availability
 * - Custom role creation with permissions
 * - Role assignment to users
 * - Role permission updates
 * - Role deletion and cleanup
 * - RBAC flexibility and permission management
 */
export async function roleManagement() {
  const timestamp = Date.now();
  const ownerEmail = `owner-${timestamp}@example.com`;
  const memberEmail = `member-${timestamp}@example.com`;
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
    console.error("Owner creation failed");
    return;
  }

  const tenantResponse = client.createTenant(
    {
      name: `Test Tenant ${timestamp}`,
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
  const ownerToken = tenantData.token;

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
    console.error("Member creation failed");
    return;
  }

  // Step 3: List initial roles (verify system roles exist)
  const initialRolesResponse = client.listRoles({
    "X-Tenant-Id": owner.id
  });

  check(initialRolesResponse.response, {
    "list roles: status is 200": (r) => r.status === 200,
    "list roles: contains system roles": (r) => {
      const body = r.json() as any;
      const roles = body?.data?.roles || [];
      const roleNames = roles.map((role: any) => role.role_name);
      return (
        roleNames.includes("owner") &&
        roleNames.includes("admin") &&
        roleNames.includes("member")
      );
    },
  });

  // Step 4: Create custom role with specific permissions
  const customRoleName = `custom_role_${timestamp}`;
  const customRolePermissions = [
    "tenant#can_view_users",
    "tenant#can_invite_users",
  ];

  const createRoleResponse = client.createRole(
    {
      role_name: customRoleName,
      permissions: customRolePermissions,
    },
    {
      "X-User-Id": owner.id,
      "X-Tenant-Id": tenant.id
    }
  );

  check(createRoleResponse.response, {
    "create role: status is 200": (r) => r.status === 200,
    "create role: returns role data": (r) => {
      const body = r.json() as any;
      return body?.data?.role_name === customRoleName;
    },
    "create role: has correct permissions": (r) => {
      const body = r.json() as any;
      const permissions = body?.data?.permissions || [];
      return (
        permissions.length === customRolePermissions.length &&
        customRolePermissions.every((p: string) => permissions.includes(p))
      );
    },
  });

  const customRole = createRoleResponse.data.data;
  if (!customRole) {
    console.error("Custom role creation failed");
    return;
  }

  // Step 5: Verify custom role appears in role list
  const rolesAfterCreateResponse = client.listRoles({
    "X-Tenant-Id": tenant.id
  });

  check(rolesAfterCreateResponse.response, {
    "roles after create: status is 200": (r) => r.status === 200,
    "roles after create: contains custom role": (r) => {
      const body = r.json() as any;
      const roles = body?.data?.roles || [];
      return roles.some((role: any) => role.role_name === customRoleName);
    },
  });

  // Step 6: Invite member user with custom role
  const inviteResponse = client.createInvite(
    {
      email: memberEmail,
      role: customRoleName,
      invite_url: `http://localhost:3000/accept-invite`,
    },
    {
      "X-Tenant-Id": tenant.id,
      "X-User-Id": owner.id,
    }
  );

  check(inviteResponse.response, {
    "create invite with custom role: status is 200": (r) => r.status === 200,
    "create invite with custom role: has correct role": (r) => {
      const body = r.json() as any;
      return body?.data?.invite?.role === customRoleName;
    },
  });

  const inviteData = inviteResponse.data.data;
  if (!inviteData?.invite) {
    console.error("Invite creation failed");
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

  // Step 8: Verify member has custom role
  const tenantUsersResponse = client.listTenantUsers({
    "X-User-Id": owner.id,
    "X-Tenant-Id": tenant.id,
  });

  check(tenantUsersResponse.response, {
    "list users after invite: status is 200": (r) => r.status === 200,
    "list users after invite: member has custom role": (r) => {
      const body = r.json() as any;
      const users = body?.data || [];
      const memberUser = users.find((u: any) => u.user_id === member.id);
      return memberUser?.role === customRoleName;
    },
  });

  // Step 9: Update custom role permissions
  const updatedPermissions = [
    "tenant:projects#view",
    "tenant:projects#create",
    "tenant:projects#edit",
    "tenant:projects#delete",
  ];

  const updateRoleResponse = client.updateRole(
    customRole.id,
    {
      permissions: updatedPermissions,
    },
    {
      "X-Tenant-Id": tenant.id,
      "X-User-Id": owner.id
    }
  );

  check(updateRoleResponse.response, {
    "update role: status is 200": (r) => r.status === 200,
    "update role: has updated permissions": (r) => {
      const body = r.json() as any;
      const permissions = body?.data?.permissions || [];
      return (
        permissions.length === updatedPermissions.length &&
        updatedPermissions.every((p: string) => permissions.includes(p))
      );
    },
  });

  // Step 10: Verify updated role in role list
  const rolesAfterUpdateResponse = client.listRoles({
    "X-Tenant-Id": tenant.id
  });

  check(rolesAfterUpdateResponse.response, {
    "roles after update: status is 200": (r) => r.status === 200,
    "roles after update: custom role has new permissions": (r) => {
      const body = r.json() as any;
      const roles = body?.data?.roles || [];
      const role = roles.find((r: any) => r.role_name === customRoleName);
      const permissions = role?.permissions || [];
      return (
        permissions.length === updatedPermissions.length &&
        updatedPermissions.every((p: string) => permissions.includes(p))
      );
    },
  });

  // Step 11: Delete custom role
  const deleteRoleResponse = client.deleteRole(customRole.id, {
    "X-Tenant-Id": tenant.id,
    "X-User-Id": owner.id
  });

  check(deleteRoleResponse.response, {
    "delete role: status is 200": (r) => r.status === 200,
  });

  // Step 12: Verify role deleted from list
  const rolesAfterDeleteResponse = client.listRoles({
    "X-Tenant-Id": tenant.id
  });

  check(rolesAfterDeleteResponse.response, {
    "roles after delete: status is 200": (r) => r.status === 200,
    "roles after delete: custom role removed": (r) => {
      const body = r.json() as any;
      const roles = body?.data?.roles || [];
      return !roles.some((role: any) => role.role_name === customRoleName);
    },
  });

  return {
    owner: owner,
    member: member,
    tenant: tenant,
    customRole: customRole,
  };
}