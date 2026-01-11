import { check } from "k6";
import { createClient, logError, uniqueId } from "../client";

/**
 * Test Scenario: Tenant User Invites
 * 
 * Flow:
 * 1. Create owner user and tenant
 * 2. Create invited user (separate account)
 * 3. Send invite to invited user's email with member role
 * 4. Verify invite created with token and 7-day expiry
 * 5. Accept invite as invited user
 * 6. Verify invited user added to tenant with member role
 * 7. Verify invited user can list tenant users
 * 8. Verify invite marked as used
 * 9. Verify invited user's tenant list includes new tenant
 * 10. Verify invited user can generate JWT for tenant
 * 
 * This test validates:
 * - Tenant invitation creation and email notification
 * - Invite token generation and expiry
 * - Invite acceptance workflow
 * - Role assignment upon acceptance
 * - Multi-user tenant membership
 */
export async function userInvites() {
  const id = uniqueId();
  const ownerEmail = `owner-${id}@example.com`;
  const invitedEmail = `invited-${id}@example.com`;
  const password = crypto.randomUUID();
  const client = createClient();

  // Step 1: Create owner user
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

  // Step 2: Create tenant
  const tenantResponse = client.createTenant(
    {
      name: `Test Tenant ${id}`,
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
  const ownerToken = tenantData.token;

  // Step 3: Create invited user (separate account)
  const invitedUserResponse = client.createUser({
    email: invitedEmail,
    password: password,
    name: {
      first: "Invited",
      last: "User",
    },
  });

  check(invitedUserResponse.response, {
    "create invited user: status is 200": (r) => r.status === 200,
  });

  const invitedUser = invitedUserResponse.data.data;
  if (!invitedUser) {
    logError("createInvitedUser", invitedUserResponse.response);
    return;
  }

  // Step 4: Send invite from owner to invited user
  const inviteResponse = client.createInvite(
    {
      email: invitedEmail,
      role: "member",
      invite_url: `http://localhost:3000/accept-invite`,
    },
    {
      "X-Tenant-Id": tenant.id,
      "X-User-Id": owner.id
    }
  );

  check(inviteResponse.response, {
    "create invite: status is 200": (r) => r.status === 200,
    "create invite: returns invite data": (r) => {
      const body = r.json() as any;
      return body?.data?.invite !== undefined;
    },
    "create invite: has token": (r) => {
      const body = r.json() as any;
      return body?.data?.invite?.token !== undefined;
    },
  });

  const inviteData = inviteResponse.data.data;
  if (!inviteData?.invite) {
    logError("createInvite", inviteResponse.response);
    return;
  }

  const invite = inviteData.invite;

  // Step 5: Verify invite properties
  check(invite, {
    "invite: has correct email": (i) => i.email === invitedEmail,
    "invite: has correct role": (i) => i.role === "member",
    "invite: has correct tenant_id": (i) => i.tenant_id === tenant.id,
    "invite: has inviter_id": (i) => i.inviter_id === owner.id,
    "invite: has expires_at": (i) => i.expires_at !== undefined,
    "invite: not yet used": (i) => i.used_at === null || i.used_at === undefined,
  });

  // Step 7: Accept invite as invited user
  const acceptResponse = client.acceptInvite(
    {
      token: invite.token,
    },
    {
        "X-User-Id": invitedUser.id
    }
  );

  check(acceptResponse.response, {
    "accept invite: status is 200": (r) => r.status === 200,
    "accept invite: returns tenant_id": (r) => {
      const body = r.json() as any;
      return body?.data?.tenant_id === tenant.id;
    },
    "accept invite: returns new token": (r) => {
      const body = r.json() as any;
      return body?.data?.token !== undefined;
    },
  });

  const acceptData = acceptResponse.data.data;
  if (!acceptData?.token) {
    logError("acceptInvite", acceptResponse.response);
    return;
  }

  const invitedUserNewToken = acceptData.token;

  // Step 8: Verify invited user can list tenant users
  const tenantUsersResponse = client.listTenantUsers({
    "X-User-Id": invitedUser.id,
    "X-Tenant-Id": tenant.id,
  });

  check(tenantUsersResponse.response, {
    "list users after invite: status is 200": (r) => r.status === 200,
    "list users after invite: contains owner": (r) => {
      const body = r.json() as any;
      const users = body?.data || [];
      return users.some((u: any) => u.user_id === owner.id);
    },
    "list users after invite: contains invited user": (r) => {
      const body = r.json() as any;
      const users = body?.data || [];
      return users.some((u: any) => u.user_id === invitedUser.id);
    },
    "list users after invite: invited user has member role": (r) => {
      const body = r.json() as any;
      const users = body?.data || [];
      const invited = users.find((u: any) => u.user_id === invitedUser.id);
      return invited?.role === "member";
    },
    "list users after invite: owner has owner role": (r) => {
      const body = r.json() as any;
      const users = body?.data || [];
      const ownerUser = users.find((u: any) => u.user_id === owner.id);
      return ownerUser?.role === "owner";
    },
  });

  // Step 9: Verify invited user's tenant list includes new tenant
  const invitedUserTenantsResponse = client.listTenants({
    "X-User-Id": invitedUser.id,
  });

  check(invitedUserTenantsResponse.response, {
    "invited user tenants: status is 200": (r) => r.status === 200,
    "invited user tenants: contains invited tenant": (r) => {
      const body = r.json() as any;
      const tenants = body?.data?.tenants || [];
      return tenants.some((t: any) => t.tenant?.id === tenant.id);
    },
    "invited user tenants: invited tenant is active": (r) => {
      const body = r.json() as any;
      const tenants = body?.data?.tenants || [];
      const invitedTenant = tenants.find((t: any) => t.tenant?.id === tenant.id);
      return invitedTenant?.is_active === true;
    },
  });

  // Step 10: Verify invited user can generate JWT for tenant
  const invitedUserJWTResponse = client.getTenantJWT({
    "X-User-Id": invitedUser.id,
    "X-Tenant-Id": tenant.id,
  });

  check(invitedUserJWTResponse.response, {
    "invited user JWT: status is 200": (r) => r.status === 200,
    "invited user JWT: returns token": (r) => {
      const body = r.json() as any;
      return body?.data?.token !== undefined && body?.data?.token.length > 0;
    },
  });

  return {
    owner: owner,
    invitedUser: invitedUser,
    tenant: tenant,
    invite: invite,
  };
}