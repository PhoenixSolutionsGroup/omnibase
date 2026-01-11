import React from "react";
import { UserInvite, RoleCreator } from "@omnibase/shadcn";
import { getAllProjects } from "@/utils/get-project";
import { getOmnibaseConfiguration } from "@/lib/server";
import { CreateInviteRequest, V1TenantsApi } from "@omnibase/core-js";

async function inviteUser(invite: CreateInviteRequest) {
  "use server";
  const data = invite.createTenantUserInviteRequest;
  const config = await getOmnibaseConfiguration();
  const client = new V1TenantsApi(config);
  const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL!;

  await client.createInvite({
    createTenantUserInviteRequest: {
      email: data.email,
      role: data.role,
      inviteUrl: `${websiteUrl}/auth/onboarding`,
    },
  });
}

async function createRole(role: { role_name: string; permissions: string[] }) {
  "use server";
  const config = await getOmnibaseConfiguration();
  const client = new V1TenantsApi(config);
  await client.createRole({
    createRoleRequest: {
      permissions: role.permissions,
      roleName: role.role_name,
    },
  });
}

async function updateRole(role: { role_id: string; permissions: string[] }) {
  "use server";
  const config = await getOmnibaseConfiguration();
  const client = new V1TenantsApi(config);
  await client.updateRole({
    roleId: role.role_id,
    updateRoleRequest: {
      permissions: role.permissions,
    },
  });
}

export default async function Page() {
  const config = await getOmnibaseConfiguration();
  const client = new V1TenantsApi(config);

  const { data: rolesData } = await client.listRoles();
  if (!rolesData) {
    return;
  }

  const { data: definitionsData } = await client.getRoleDefinitions({
    subject: "User",
  });
  if (!definitionsData) {
    return;
  }

  const projects = await getAllProjects();

  return (
    <div className="flex h-full w-full flex-col items-center my-8 gap-y-8">
      <UserInvite
        roles={rolesData.roles.map((r) => r.roleName)}
        onInvite={inviteUser}
      />
      <RoleCreator
        definitions={definitionsData.definitions}
        roles={rolesData.roles}
        onRoleCreate={createRole}
        onRoleUpdate={updateRole}
        namespaceMap={{
          project:
            projects?.map((p) => ({
              id: p.id,
              label: p.name,
            })) || [],
        }}
      />
    </div>
  );
}
