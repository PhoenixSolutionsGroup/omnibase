import { checkPermissions } from "./01-check-permissions";
import { subjectRelationsFilter } from "./02-subject-relations-filter";

export async function PermissionTests() {
  await checkPermissions();
  await subjectRelationsFilter();
}
