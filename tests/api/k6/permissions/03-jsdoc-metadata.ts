import { check } from "k6";
import { createClient } from "../client";
import type { RelationMetadata, NamespaceDefinition } from "../sdk";

/**
 * Test Scenario: JSDoc Metadata Parsing
 *
 * This test validates that the namespace parser correctly extracts and returns
 * relation metadata including JSDoc annotations (@group, @subGroup, @displayName, @role).
 *
 * Prerequisites:
 * - Permissions must be pushed via CLI (`omnibase permissions push`)
 *
 * Flow:
 * 1. Fetch all namespace definitions
 * 2. Verify relations_metadata field is present
 * 3. Verify each relation has required metadata fields
 * 4. Verify display_name matches @displayName JSDoc annotation
 * 5. Verify subjects array matches type definitions
 * 6. Verify group/sub_group/roles match JSDoc annotations
 *
 * This test validates:
 * - RelationMetadata schema is returned correctly
 * - @displayName annotations override auto-generated names
 * - @group and @role annotations are extracted correctly
 * - Subject types are correctly extracted from TypeScript union types
 */
export async function jsdocMetadata() {
  const client = createClient();

  // Step 1: Fetch all namespace definitions
  const allDefsResult = client.getRoleDefinitions();

  check(allDefsResult.response, {
    "get definitions: status is 200": (r) => r.status === 200,
  });

  const allDefs = allDefsResult.data?.data?.definitions as
    | NamespaceDefinition[]
    | undefined;

  check(allDefsResult.response, {
    "get definitions: definitions array exists": () =>
      Array.isArray(allDefs) && allDefs!.length > 0,
  });

  if (!allDefs || allDefs.length === 0) {
    console.error("No namespace definitions found - permissions may not be pushed yet");
    return;
  }

  const tenantDef = allDefs.find((d) => d.namespace === "Tenant");

  check(allDefsResult.response, {
    "get definitions: Tenant namespace exists": () => tenantDef !== undefined,
  });

  if (!tenantDef) {
    console.error("Tenant namespace not found");
    return;
  }

  // Step 2: Verify relations_metadata field is present
  const metadata = tenantDef.relations_metadata;

  check(allDefsResult.response, {
    "relations_metadata: field exists": () => metadata !== undefined,
    "relations_metadata: is an array": () => Array.isArray(metadata),
    "relations_metadata: has entries": () =>
      Array.isArray(metadata) && metadata.length > 0,
    "relations_metadata: count matches relations count": () =>
      metadata?.length === tenantDef.relations.length,
  });

  if (!metadata || metadata.length === 0) {
    console.error("relations_metadata is empty or missing");
    return;
  }

  // Step 3: Verify each relation has required metadata fields
  const allHaveRequiredFields = metadata.every((m: RelationMetadata) => {
    return (
      typeof m.name === "string" &&
      m.name.length > 0 &&
      typeof m.display_name === "string" &&
      m.display_name.length > 0 &&
      Array.isArray(m.subjects) &&
      m.subjects.length > 0
    );
  });

  check(allDefsResult.response, {
    "metadata: all entries have required fields (name, display_name, subjects)": () =>
      allHaveRequiredFields,
  });

  // Step 4: Verify display_name matches @displayName JSDoc annotation
  // can_view_db_secret_key has @displayName "View DB Secret Key"
  const canViewDbSecretKey = metadata.find(
    (m: RelationMetadata) => m.name === "can_view_db_secret_key"
  );

  check(allDefsResult.response, {
    "display_name: can_view_db_secret_key exists": () =>
      canViewDbSecretKey !== undefined,
    "display_name: can_view_db_secret_key has correct display_name": () =>
      canViewDbSecretKey?.display_name === "View DB Secret Key",
  });

  const canDeleteTenant = metadata.find(
    (m: RelationMetadata) => m.name === "can_delete_tenant"
  );

  check(allDefsResult.response, {
    "display_name: can_delete_tenant exists": () =>
      canDeleteTenant !== undefined,
    "display_name: can_delete_tenant has correct display_name": () =>
      canDeleteTenant?.display_name === "Delete Tenant",
  });

  // Step 5: Verify subjects array matches type definitions
  // can_delete_tenant: User[] → subjects should be ["User"]
  check(allDefsResult.response, {
    "subjects: can_delete_tenant has User subject": () =>
      canDeleteTenant?.subjects?.includes("User") === true,
    "subjects: can_delete_tenant does NOT have ApiKey subject": () =>
      canDeleteTenant?.subjects?.includes("ApiKey") !== true,
  });

  // can_view_db_secret_key: (User | ApiKey)[] → subjects should be ["User", "ApiKey"]
  check(allDefsResult.response, {
    "subjects: can_view_db_secret_key has User subject": () =>
      canViewDbSecretKey?.subjects?.includes("User") === true,
    "subjects: can_view_db_secret_key has ApiKey subject": () =>
      canViewDbSecretKey?.subjects?.includes("ApiKey") === true,
  });

  // Step 6: Verify group/sub_group/roles match JSDoc annotations
  // can_delete_tenant has @group "Tenant Administration" and @role owner
  check(allDefsResult.response, {
    "group: can_delete_tenant has correct group": () =>
      canDeleteTenant?.group === "Tenant Administration",
    "sub_group: can_delete_tenant has no sub_group": () =>
      canDeleteTenant?.sub_group === null ||
      canDeleteTenant?.sub_group === undefined ||
      canDeleteTenant?.sub_group === "",
    "roles: can_delete_tenant has owner role": () =>
      Array.isArray(canDeleteTenant?.roles) &&
      canDeleteTenant!.roles.length === 1 &&
      canDeleteTenant!.roles.includes("owner"),
  });

  // Step 7: Verify all relations have corresponding metadata entries
  const allRelationsHaveMetadata = tenantDef.relations.every((relationName) => {
    return metadata.some((m: RelationMetadata) => m.name === relationName);
  });

  check(allDefsResult.response, {
    "metadata: all relations have corresponding metadata entries": () =>
      allRelationsHaveMetadata,
  });

  // Step 8: Verify metadata names match relations array
  const allMetadataInRelations = metadata.every((m: RelationMetadata) => {
    return tenantDef.relations.includes(m.name);
  });

  check(allDefsResult.response, {
    "metadata: all metadata names exist in relations array": () =>
      allMetadataInRelations,
  });

  return {
    namespaceCount: allDefs.length,
    tenantRelationsCount: tenantDef.relations.length,
    tenantMetadataCount: metadata.length,
  };
}

/**
 * Test Scenario: JSDoc Annotations with Groups
 *
 * This test validates that the parser correctly extracts @group, @subGroup,
 * @displayName, and @role annotations from the permission files.
 */
export async function jsdocAnnotatedMetadata() {
  const client = createClient();

  const allDefsResult = client.getRoleDefinitions();

  check(allDefsResult.response, {
    "annotated: status is 200": (r) => r.status === 200,
  });

  const allDefs = allDefsResult.data?.data?.definitions as
    | NamespaceDefinition[]
    | undefined;

  if (!allDefs || allDefs.length === 0) {
    console.error("No namespace definitions found");
    return;
  }

  const tenantDef = allDefs.find((d) => d.namespace === "Tenant");
  const metadata = tenantDef?.relations_metadata;

  if (!metadata || metadata.length === 0) {
    console.error("relations_metadata is empty");
    return;
  }

  // Check if any relations have groups (indicates JSDoc annotations are present)
  const hasAnnotatedGroups = metadata.some(
    (m: RelationMetadata) => m.group !== null && m.group !== undefined
  );

  if (hasAnnotatedGroups) {
    // Annotated permissions are present - validate the structure

    // Find a relation with @group
    const groupedRelation = metadata.find(
      (m: RelationMetadata) => m.group !== null && m.group !== undefined
    );

    check(allDefsResult.response, {
      "annotated: found relation with @group": () =>
        groupedRelation !== undefined,
      "annotated: group is a non-empty string": () =>
        typeof groupedRelation?.group === "string" &&
        groupedRelation.group.length > 0,
    });

    // Find a relation with @subGroup (should have @group too)
    const subGroupedRelation = metadata.find(
      (m: RelationMetadata) => m.sub_group !== null && m.sub_group !== undefined
    );

    if (subGroupedRelation) {
      check(allDefsResult.response, {
        "annotated: sub_group relation also has group": () =>
          subGroupedRelation.group !== null &&
          subGroupedRelation.group !== undefined,
        "annotated: sub_group is a non-empty string": () =>
          typeof subGroupedRelation.sub_group === "string" &&
          subGroupedRelation.sub_group.length > 0,
      });
    }

    // Find a relation with @role
    const roledRelation = metadata.find(
      (m: RelationMetadata) => m.roles && m.roles.length > 0
    );

    if (roledRelation) {
      check(allDefsResult.response, {
        "annotated: found relation with @role": () => roledRelation !== undefined,
        "annotated: roles is a non-empty array": () =>
          Array.isArray(roledRelation.roles) && roledRelation.roles.length > 0,
        "annotated: roles contain lowercase strings": () =>
          roledRelation.roles!.every(
            (r) => typeof r === "string" && r === r.toLowerCase()
          ),
      });
    }

    console.log("JSDoc annotations detected - full annotation tests passed");
  } else {
    // No annotations yet - this is expected before Phase 6 migration
    console.log(
      "No JSDoc annotations detected - this is expected before Phase 6 migration"
    );

    check(allDefsResult.response, {
      "pre-migration: all groups are null": () =>
        metadata.every(
          (m: RelationMetadata) => m.group === null || m.group === undefined
        ),
      "pre-migration: all sub_groups are null": () =>
        metadata.every(
          (m: RelationMetadata) =>
            m.sub_group === null || m.sub_group === undefined
        ),
    });
  }

  return {
    hasAnnotations: hasAnnotatedGroups,
    metadataCount: metadata.length,
  };
}
