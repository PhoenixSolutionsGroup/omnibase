import { authorization } from "./01-authorization";
import { crossTenantIsolation } from "./02-cross-tenant-isolation";

export async function SecurityTests() {
  await authorization();
  await crossTenantIsolation();
}
