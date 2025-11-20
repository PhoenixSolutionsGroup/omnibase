import { createTenant } from "./01-create-lifecycle";
import { multiTenantSwitching } from "./02-multi-tenant-switching";
import { userInvites } from "./03-user-invites";
import { roleManagement } from "./04-role-management";
import { tenantDeletion } from "./05-tenant-deletion";

export async function TenantTests() {
  await createTenant();
  await multiTenantSwitching();
  await userInvites();
  await roleManagement();
  await tenantDeletion();
}