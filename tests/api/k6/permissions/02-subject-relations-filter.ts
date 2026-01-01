import { check } from "k6";
import { createClient } from "../client";

/**
 * Test Scenario: Subject Relations Filter
 *
 * This test validates the subject filtering functionality for namespace definitions.
 * The API should return different relations based on which subject type (User, ApiKey, etc.)
 * can be granted those permissions.
 *
 * Prerequisites:
 * - Permissions must be pushed via CLI with union type relations like:
 *   - can_delete_tenant: User[]  (User only)
 *   - can_rotate_keys: (User | ApiKey)[]  (both User and ApiKey)
 *
 * Flow:
 * 1. Fetch all definitions (no filter)
 * 2. Verify Tenant namespace has both User-only and User|ApiKey relations
 * 3. Fetch definitions filtered by subject=ApiKey
 * 4. Verify only ApiKey-compatible relations are returned
 * 5. Fetch definitions filtered by subject=User
 * 6. Verify User-compatible relations are returned (includes both User-only and User|ApiKey)
 * 7. Fetch definitions with non-existent subject
 * 8. Verify empty or no results returned
 *
 * This test validates:
 * - subject_relations JSONB is correctly populated during permissions push
 * - Filtering by subject type works correctly
 * - Union type relations (User | ApiKey) appear for both subjects
 * - User-only relations only appear for User subject
 */

interface NamespaceDefinition {
  id: string;
  namespace: string;
  relations: string[];
  subject_relations?: Record<string, string[]>;
  updated_at: string;
}

export async function subjectRelationsFilter() {
  const client = createClient();

  // Step 1: Fetch all definitions (no filter)
  const allDefsResult = client.getRoleDefinitions();

  check(allDefsResult.response, {
    "get all definitions: status is 200": (r) => r.status === 200,
  });

  const allDefs = allDefsResult.data?.data?.definitions as
    | NamespaceDefinition[]
    | undefined;
  const tenantDef = allDefs?.find((d) => d.namespace === "Tenant");

  check(allDefsResult.response, {
    "get all definitions: Tenant namespace exists": () =>
      tenantDef !== undefined,
    "get all definitions: has relations array": () =>
      Array.isArray(tenantDef?.relations) && tenantDef!.relations.length > 0,
    "get all definitions: has subject_relations": () =>
      tenantDef?.subject_relations !== undefined,
  });

  if (!tenantDef) {
    console.error(
      "Tenant namespace not found - permissions may not be pushed yet"
    );
    return;
  }

  // Step 2: Verify subject_relations structure
  const subjectRelations = tenantDef.subject_relations || {};
  const userRelations = subjectRelations["User"] || [];
  const apiKeyRelations = subjectRelations["ApiKey"] || [];

  check(allDefsResult.response, {
    "subject_relations: User key exists": () => userRelations.length > 0,
    "subject_relations: User has can_delete_tenant": () =>
      userRelations.includes("can_delete_tenant"),
    "subject_relations: User has can_rotate_keys": () =>
      userRelations.includes("can_rotate_keys"),
  });

  // Only check ApiKey if permissions include union types
  if (apiKeyRelations.length > 0) {
    check(allDefsResult.response, {
      "subject_relations: ApiKey key exists": () => apiKeyRelations.length > 0,
      "subject_relations: ApiKey has can_rotate_keys": () =>
        apiKeyRelations.includes("can_rotate_keys"),
      "subject_relations: ApiKey does NOT have can_delete_tenant": () =>
        !apiKeyRelations.includes("can_delete_tenant"),
    });
  }

  // Step 3: Fetch definitions filtered by subject=ApiKey
  const apiKeyDefsResult = client.getRoleDefinitions({ subject: "ApiKey" });

  check(apiKeyDefsResult.response, {
    "get ApiKey definitions: status is 200": (r) => r.status === 200,
  });

  const apiKeyDefs = apiKeyDefsResult.data?.data?.definitions as
    | NamespaceDefinition[]
    | undefined;
  const apiKeyTenantDef = apiKeyDefs?.find((d) => d.namespace === "Tenant");

  if (apiKeyRelations.length > 0) {
    check(apiKeyDefsResult.response, {
      "ApiKey filter: Tenant namespace returned": () =>
        apiKeyTenantDef !== undefined,
      "ApiKey filter: has can_rotate_keys": () =>
        apiKeyTenantDef?.relations?.includes("can_rotate_keys") === true,
      "ApiKey filter: does NOT have can_delete_tenant": () =>
        apiKeyTenantDef?.relations?.includes("can_delete_tenant") !== true,
      "ApiKey filter: does NOT have can_invite_user": () =>
        apiKeyTenantDef?.relations?.includes("can_invite_user") !== true,
    });
  }

  // Step 4: Fetch definitions filtered by subject=User
  const userDefsResult = client.getRoleDefinitions({ subject: "User" });

  check(userDefsResult.response, {
    "get User definitions: status is 200": (r) => r.status === 200,
  });

  const userDefs = userDefsResult.data?.data?.definitions as
    | NamespaceDefinition[]
    | undefined;
  const userTenantDef = userDefs?.find((d) => d.namespace === "Tenant");

  check(userDefsResult.response, {
    "User filter: Tenant namespace returned": () => userTenantDef !== undefined,
    "User filter: has can_delete_tenant": () =>
      userTenantDef?.relations?.includes("can_delete_tenant") === true,
    "User filter: has can_invite_user": () =>
      userTenantDef?.relations?.includes("can_invite_user") === true,
    "User filter: has can_rotate_keys (shared with ApiKey)": () =>
      userTenantDef?.relations?.includes("can_rotate_keys") === true,
  });

  // Step 5: Fetch definitions with non-existent subject
  const unknownDefsResult = client.getRoleDefinitions({
    subject: "UnknownSubject",
  });

  check(unknownDefsResult.response, {
    "unknown subject filter: status is 200": (r) => r.status === 200,
    "unknown subject filter: returns empty or no Tenant": () => {
      const defs =
        (unknownDefsResult.data?.data?.definitions as
          | NamespaceDefinition[]
          | undefined) || [];
      const tenantFound = defs.find((d) => d.namespace === "Tenant");
      // Either Tenant not returned, or returned with empty relations
      return tenantFound === undefined || tenantFound.relations.length === 0;
    },
  });

  // Step 6: Verify relation counts make sense
  if (apiKeyTenantDef && userTenantDef) {
    check(allDefsResult.response, {
      "User has more or equal relations than ApiKey": () =>
        userTenantDef.relations.length >=
        (apiKeyTenantDef?.relations?.length || 0),
    });
  }

  return {
    allRelationsCount: tenantDef.relations.length,
    userRelationsCount: userTenantDef?.relations?.length || 0,
    apiKeyRelationsCount: apiKeyTenantDef?.relations?.length || 0,
  };
}
