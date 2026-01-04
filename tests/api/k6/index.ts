import { PaymentTests } from "./payments";
import { PermissionTests } from "./permissions";
import { SecurityTests } from "./security";
import { StorageTests } from "./storage";
import { TenantTests } from "./tenants";

export const options = {
  thresholds: {
    checks: ["rate==1"], // All checks must pass
  },
};

export default async function () {
  await TenantTests();
  await SecurityTests();
  await PermissionTests();
  await StorageTests();
  await PaymentTests();
}
