import { omnibase } from "@/lib/server";
import React from "react";
import { UserInvite, RoleCreator } from "@omnibase/shadcn";
import { getAllProjects } from "@/utils/get-project";

export default async function Page() {
  const roles = await omnibase.permissions.roles.list();
  const definitions = await omnibase.permissions.roles.getDefinitions();

  const projects = await getAllProjects();

  return (
    <div className="flex h-full w-full flex-col items-center my-8 gap-y-8">
      <UserInvite
        roles={roles.map((r) => r.role_name)}
        onInvite={async (data) => {
          "use server";
          const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL!;
          await omnibase.tenants.invites.create({
            email: data.email,
            invite_url: `${websiteUrl}/auth/onboarding`,
            role: data.role,
          });
        }}
      />
      <RoleCreator
        definitions={definitions}
        roles={roles}
        onRoleCreate={async (role) => {
          "use server";
          await omnibase.permissions.roles.create(role);
        }}
        onRoleUpdate={async (role) => {
          "use server";
          await omnibase.permissions.roles.update(role.role_id, role);
        }}
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
