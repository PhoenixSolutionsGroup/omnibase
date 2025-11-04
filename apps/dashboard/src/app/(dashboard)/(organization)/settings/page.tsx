import { omnibase } from "@/lib/server";
import { UserViewer } from "@omnibase/shadcn";
import React from "react";
import { DeleteSection } from "./delete-section";

export default async function page() {
  const users = await omnibase.tenants.user.getAll();
  const roles = await omnibase.permissions.roles.list();

  return (
    <div className="flex h-full w-full flex-col items-center my-8 gap-y-8">
      <UserViewer
        availableRoles={roles.map((r) => r.role_name)}
        users={users.data!}
        canEditUsers={true}
        onRemoveUser={async (user_id) => {
          "use server";
          await omnibase.tenants.user.remove({ user_id });
        }}
        onRoleUpdate={async (user_id, role) => {
          "use server";
          await omnibase.tenants.user.updateRole({
            role: role,
            user_id: user_id,
          });
        }}
      />
      <DeleteSection
        onDeleteTenant={async () => {
          "use server";
          await omnibase.tenants.manage.deleteTenant();
        }}
      />
    </div>
  );
}
