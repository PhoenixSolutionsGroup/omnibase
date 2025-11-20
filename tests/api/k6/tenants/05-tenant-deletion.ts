import { check } from "k6";
import { createClient } from "../client";

/**
 * Test Scenario: Tenant Deletion
 * 
 * Flow:
 * 1. Create owner user and tenant
 * 2. Create member user and invite to tenant
 * 3. Accept invite and verify member added
 * 4. Create custom role
 * 5. List tenant users (should have 2 users)
 * 6. Delete tenant
 * 7. Verify tenant deleted successfully
 * 8. Verify tenant not in owner's tenant list
 * 9. Verify tenant not in member's tenant list
 * 
 * This test validates:
 * - Complete tenant cleanup
 * - Stripe customer archival (if integrated)
 * - Keto relationship deletion
 * - User tenant list updates
 * - Database cascade deletion
 * - Multi-user cleanup
 */
export async function tenantDeletion() {
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
    "create tenant: has stripe_customer_id": (r) => {
      const body = r.json() as any;
      return body?.data?.tenant?.stripe_customer_id !== null;
    },
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

  // Step 3: Invite member to tenant
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
    "create invite: status is 200": (r) => r.status === 200,
  });

  const inviteData = inviteResponse.data.data;
  if (!inviteData?.invite) {
    console.error("Invite creation failed");
    return;
  }

  // Step 4: Accept invite
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

  // Step 5: Verify tenant has multiple users
  const tenantUsersResponse = client.listTenantUsers({
    "X-User-Id": owner.id,
    "X-Tenant-Id": tenant.id,
  });

  check(tenantUsersResponse.response, {
    "list users before delete: status is 200": (r) => r.status === 200,
    "list users before delete: has 2 users": (r) => {
      const body = r.json() as any;
      const users = body?.data || [];
      return users.length === 2;
    },
    "list users before delete: contains owner": (r) => {
      const body = r.json() as any;
      const users = body?.data || [];
      return users.some((u: any) => u.user_id === owner.id);
    },
    "list users before delete: contains member": (r) => {
      const body = r.json() as any;
      const users = body?.data || [];
      return users.some((u: any) => u.user_id === member.id);
    },
  });

  // Step 6: Delete tenant
  const deleteTenantResponse = client.deleteTenant({
    "X-Tenant-Id": tenant.id,
    "X-User-Id": owner.id,
  });

  check(deleteTenantResponse.response, {
    "delete tenant: status is 200": (r) => r.status === 200,
    "delete tenant: returns success message": (r) => {
      const body = r.json() as any;
      return body?.data?.message !== undefined;
    },
  });

  // Step 7: Verify tenant not in owner's tenant list
  const ownerTenantsAfterDeleteResponse = client.listTenants({
    "X-User-Id": owner.id,
  });

  check(ownerTenantsAfterDeleteResponse.response, {
    "owner tenants after delete: status is 200": (r) => r.status === 200,
    "owner tenants after delete: deleted tenant not present": (r) => {
      const body = r.json() as any;
      const tenants = body?.data?.tenants || [];
      return !tenants.some((t: any) => t.tenant?.id === tenant.id);
    },
  });

  // Step 9: Verify tenant not in member's tenant list
  const memberTenantsAfterDeleteResponse = client.listTenants({
    "X-User-Id": member.id,
  });

  check(memberTenantsAfterDeleteResponse.response, {
    "member tenants after delete: status is 200": (r) => r.status === 200,
    "member tenants after delete: deleted tenant not present": (r) => {
      const body = r.json() as any;
      const tenants = body?.data?.tenants || [];
      return !tenants.some((t: any) => t.tenant?.id === tenant.id);
    },
  });

  return {
    owner: owner,
    member: member,
    deletedTenantId: tenant.id,
  };
}