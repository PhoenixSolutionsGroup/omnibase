import { createTenantsServerClient } from "@/lib/server";
import { UserViewer } from "@omnibase/shadcn";
import React from "react";
import { DeleteSection } from "./delete-section";
import { APIKeysSection } from "./api-keys-section";
import { listAPIKeys } from "./actions";

async function removeUser(user_id: string) {
  "use server";
  const tenant = await createTenantsServerClient();
  await tenant.removeTenantUser({
    deleteTenantUserRequest: {
      userId: user_id,
    },
  });
}

async function updateUserRole(user_id: string, role: string) {
  "use server";
  const tenant = await createTenantsServerClient();
  await tenant.updateTenantUserRole({
    updateTenantUserRoleRequest: {
      role,
      userId: user_id,
    },
  });
}

async function deleteTenantAction() {
  "use server";
  const tenant = await createTenantsServerClient();
  await tenant.deleteTenant({});
}

export default async function page() {
  const tenant = await createTenantsServerClient();
  const { data: users } = await tenant.listTenantUsers();
  if (!users) {
    throw new Error("Failed to fetch tenant users");
  }

  const { data: roles } = await tenant.listRoles();
  if (!roles || !roles.roles) {
    throw new Error("Failed to fetch roles");
  }

  // Fetch API keys
  const apiKeysResponse = await listAPIKeys();

  return (
    <div className="flex h-full w-full flex-col items-center my-8 gap-y-8 max-w-5xl mx-auto px-4">
      <div className="w-full">
        <UserViewer
          availableRoles={roles.roles.map((r) => r.roleName!)}
          // users={users}
          users={[]}
          canEditUsers={true}
          onRemoveUser={removeUser}
          onRoleUpdate={updateUserRole}
        />
      </div>
      <div className="w-full">
        <APIKeysSection
          initialKeys={apiKeysResponse.api_keys}
          hasPermission={apiKeysResponse.hasPermission}
        />
      </div>
      <div className="w-full">
        <DeleteSection onDeleteTenant={deleteTenantAction} />
      </div>
    </div>
  );
}
