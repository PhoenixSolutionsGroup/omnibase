import { getOmnibaseConfiguration } from "@/lib/server";
import { UserViewer } from "@omnibase/shadcn";
import React from "react";
import { DeleteSection } from "./delete-section";
import { APIKeysSection } from "./api-keys-section";
import { listAPIKeys } from "./actions";
import {
  ListRolesByTenantRow,
  UserResponse,
  V1TenantsLifecycleApi,
  V1TenantsRolesApi,
  V1TenantsUsersApi,
} from "@omnibase/core-js";

async function removeUser(user_id: string) {
  "use server";
  const config = await getOmnibaseConfiguration();
  const client = new V1TenantsUsersApi(config);
  await client.removeTenantUser({
    deleteRequest: {
      userId: user_id,
    },
  });
}

async function updateUserRole(user_id: string, role: string) {
  "use server";
  const config = await getOmnibaseConfiguration();
  const client = new V1TenantsUsersApi(config);
  await client.updateTenantUserRole({
    updateUserRoleRequest: {
      role,
      userId: user_id,
    },
  });
}

async function deleteTenantAction() {
  "use server";
  const config = await getOmnibaseConfiguration();
  const client = new V1TenantsLifecycleApi(config);
  await client.deleteTenant();
}

export default async function page() {
  const config = await getOmnibaseConfiguration();
  const usersClient = new V1TenantsUsersApi(config);
  const rolesClient = new V1TenantsRolesApi(config);

  let users: UserResponse[] = [];
  let roles: ListRolesByTenantRow[] = [];
  try {
    users = await usersClient.listTenantUsers();
    roles = await rolesClient.listRoles();
  } catch (error) {}

  // Fetch API keys
  const apiKeysResponse = await listAPIKeys();

  return (
    <div className="flex h-full w-full flex-col items-center my-8 gap-y-8 max-w-5xl mx-auto px-4">
      <div className="w-full">
        <UserViewer
          availableRoles={roles.map((r) => r.roleName!) || []}
          users={users || []}
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
