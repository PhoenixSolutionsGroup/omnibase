import React from "react";
import { UserInvite, RoleCreator } from "@omnibase/shadcn";
import { getAllProjects } from "@/utils/get-project";
import { getOmnibaseConfiguration } from "@/lib/server";
import {
  CreateInviteRequest,
  V1TenantsInvitesApi,
  V1TenantsRolesApi,
} from "@omnibase/core-js";

async function inviteUser(invite: CreateInviteRequest) {
  "use server";
  const data = invite.createRequest;
  const config = await getOmnibaseConfiguration();
  const client = new V1TenantsInvitesApi(config);
  const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL!;

  await client.createInvite({
    createRequest: {
      email: data.email,
      role: data.role,
      inviteUrl: `${websiteUrl}/auth/onboarding`,
    },
  });
}

async function createRole(role: { role_name: string; permissions: string[] }) {
  "use server";
  const config = await getOmnibaseConfiguration();
  const client = new V1TenantsRolesApi(config);
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
  const client = new V1TenantsRolesApi(config);
  await client.updateRole({
    roleId: role.role_id,
    updateRoleRequest: {
      permissions: role.permissions,
    },
  });
}

export default async function Page() {
  const config = await getOmnibaseConfiguration();
  const client = new V1TenantsRolesApi(config);

  const roles = await client.listRoles();
  const definitions = await client.listRoleDefinitions({ subject: "User" });

  const projects = await getAllProjects();

  return (
    <div className="flex h-full w-full flex-col items-center my-8 gap-y-8">
      <UserInvite
        roles={roles.map((r) => r.roleName)}
        onInvite={inviteUser}
      />
      <RoleCreator
        definitions={definitions}
        roles={roles}
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
