import { authorization } from "./01-authorization";
import { crossTenantIsolation } from "./02-cross-tenant-isolation";
import { rlsPermissionHelpers } from "./03-rls-permission-helpers";

export async function SecurityTests() {
  await authorization();
  await crossTenantIsolation();
  await rlsPermissionHelpers();
}
