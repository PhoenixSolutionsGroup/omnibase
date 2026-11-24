import {
	type ListRolesByTenantRow,
	type UserResponse,
	V1TenantsLifecycleApi,
	V1TenantsRolesApi,
	V1TenantsUsersApi,
} from "@omnibase/core-js";
import { UserViewer } from "@omnibase/shadcn";
import { getOmnibaseConfiguration } from "@/lib/server";
import { getAllProjects } from "@/utils/get-project";
import { listAPIKeys } from "./actions";
import { APIKeysSection } from "./api-keys-section";
import { DeleteSection } from "./delete-section";

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

	const client = new V1TenantsRolesApi(config);
	const definitions = await client.listRoleDefinitions({ subject: "ApiKey" });
	const projects = await getAllProjects();

	const namespaceMap: Record<string, { id: string; label: string }[]> = {
		Project:
			projects?.map((p) => ({
				id: p.id,
				label: p.name,
			})) || [],
	};
	let users: UserResponse[] = [];
	let roles: ListRolesByTenantRow[] = [];
	try {
		users = await usersClient.listTenantUsers();
		roles = await rolesClient.listRoles();
	} catch (_error) {}

	// Fetch API keys
	const apiKeysResponse = await listAPIKeys();

	return (
		<div className="max-w-5xl  my-8 mx-auto">
			<div className="mx-16 space-y-4">
				<div className="flex flex-col md:flex-row items-start justify-between gap-3">
					<div>
						<h1 className="text-xl font-bold tracking-tight">Settings</h1>
						<p className="text-muted-foreground">
							Manage and monitor your organizations settings
						</p>
					</div>
				</div>
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
						definitions={definitions}
						namespaceMap={namespaceMap}
					/>
				</div>
				<div className="w-full">
					<DeleteSection onDeleteTenant={deleteTenantAction} />
				</div>
			</div>
		</div>
	);
}
