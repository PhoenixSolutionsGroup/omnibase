import { PaymentTests } from "./payments";
import { PermissionTests } from "./permissions";
import { SecurityTests } from "./security";
import { StorageTests } from "./storage";
import { TenantTests } from "./tenants";

export default async function () {
  await TenantTests();
  await SecurityTests();
  await PermissionTests();
  await StorageTests();
  await PaymentTests();
}
