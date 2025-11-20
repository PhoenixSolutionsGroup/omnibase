import React from "react";
import { UserInvite, RoleCreator } from "@omnibase/shadcn";
import { getAllProjects } from "@/utils/get-project";
import { createTenantsServerClient } from "@/lib/server";

async function inviteUser(data: { email: string; role: string }) {
  "use server";
  const client = await createTenantsServerClient();
  const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL!;

  await client.createInvite({
    request: {
      email: data.email,
      role: data.role,
      inviteUrl: `${websiteUrl}/auth/onboarding`,
    },
  });
}

async function createRole(role: { role_name: string; permissions: any }) {
  "use server";
  const client = await createTenantsServerClient();
  await client.createRole({
    request: {
      permissions: role.permissions,
      roleName: role.role_name,
    },
  });
}

async function updateRole(role: { role_id: string; permissions: any }) {
  "use server";
  const client = await createTenantsServerClient();
  await client.updateRole({
    roleId: role.role_id,
    request: {
      permissions: role.permissions,
    },
  });
}

export default async function Page() {
  const client = await createTenantsServerClient();

  const { data: rolesData } = await client.listRoles();
  if (!rolesData) {
    return;
  }

  const { data: definitionsData } = await client.getRoleDefinitions();
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
