import { checkPermissions } from "./01-check-permissions";
import { subjectRelationsFilter } from "./02-subject-relations-filter";
import { jsdocMetadata, jsdocAnnotatedMetadata } from "./03-jsdoc-metadata";

export async function PermissionTests() {
  await checkPermissions();
  await subjectRelationsFilter();
  await jsdocMetadata();
  await jsdocAnnotatedMetadata();
}
