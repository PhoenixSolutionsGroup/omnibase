import { checkPermissions } from "./01-check-permissions";

export async function PermissionTests() {
  await checkPermissions();
}
