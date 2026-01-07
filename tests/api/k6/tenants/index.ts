import { createTenant } from "./01-create-lifecycle";
import { multiTenantSwitching } from "./02-multi-tenant-switching";
import { userInvites } from "./03-user-invites";
import { roleManagement } from "./04-role-management";
import { tenantDeletion } from "./05-tenant-deletion";
import { rbacEnforcement } from "./06-rbac-enforcement";
import { tenantLookup } from "./07-tenant-lookup";

export async function TenantTests() {
  await createTenant();
  await multiTenantSwitching();
  await userInvites();
  await roleManagement();
  await tenantDeletion();
  await rbacEnforcement();
  await tenantLookup();
}
