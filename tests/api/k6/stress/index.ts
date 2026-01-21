import { check } from "k6";
import http from "k6/http";
import { createClient, uniqueId, logError } from "../client";
import { getMyUser, getMySecondUser } from "../shared-users";
import type { SetupData } from "../shared-users";

/**
 * 1. TENANT LIFECYCLE
 * Creates tenant, lists users, gets JWT, lists tenants.
 * Uses pre-created user (avoids bcrypt).
 */
export function stressTenantLifecycle(data: SetupData) {
  const user = getMyUser(data);
  const client = createClient();
  const id = uniqueId();

  // Create tenant (fast - no bcrypt)
  const tenantResponse = client.createTenant(
    {
      name: `Stress Tenant ${id}`,
      billing_email: user.email,
    },
    {
      "X-User-Id": user.id,
    },
  );

  check(tenantResponse.response, {
    "tenant lifecycle - create: status 200": (r) => r.status === 200,
  });

  const tenantData = tenantResponse.data.data;
  if (!tenantData?.tenant) return null;

  const tenant = tenantData.tenant;

  // List tenant users
  const usersResponse = client.listTenantUsers({
    "X-User-Id": user.id,
    "X-Tenant-Id": tenant.id,
  });

  check(usersResponse.response, {
    "tenant lifecycle - list users: status 200": (r) => r.status === 200,
  });

  // Get JWT
  const jwtResponse = client.getTenantJWT({
    "X-Tenant-Id": tenant.id,
    "X-User-Id": user.id,
  });

  check(jwtResponse.response, {
    "tenant lifecycle - get JWT: status 200": (r) => r.status === 200,
  });

  // List user's tenants
  const tenantsListResponse = client.listTenants({
    "X-User-Id": user.id,
  });

  check(tenantsListResponse.response, {
    "tenant lifecycle - list tenants: status 200": (r) => r.status === 200,
  });

  return { tenant, token: jwtResponse.data.data?.token };
}

/**
 * 2. PERMISSIONS
 * Tests permission checks via Keto.
 * Creates roles, checks permissions, updates roles.
 */
export function stressPermissions(data: SetupData) {
  const user = getMyUser(data);
  const client = createClient();
  const id = uniqueId();

  // Create tenant for permission tests
  const tenantResponse = client.createTenant(
    {
      name: `Stress Perm Tenant ${id}`,
      billing_email: user.email,
    },
    {
      "X-User-Id": user.id,
    },
  );

  check(tenantResponse.response, {
    "permissions - create tenant: status 200": (r) => r.status === 200,
  });

  const tenantData = tenantResponse.data.data;
  if (!tenantData?.tenant) return;

  const tenant = tenantData.tenant;

  // Check owner has delete_tenant permission
  const checkOwnerPermResponse = client.checkPermission({
    namespace: "Tenant",
    object: tenant.id,
    relation: "delete_tenant",
    subject_set: {
      namespace: "User",
      object: user.id,
      relation: "",
    },
  });

  check(checkOwnerPermResponse.response, {
    "permissions - owner check: status 200": (r) => r.status === 200,
    "permissions - owner check: allowed true": (r) => {
      const body = r.json() as any;
      return body?.data?.allowed === true;
    },
  });

  // Create a custom role
  const roleName = `stress_role_${id}`;
  const createRoleResponse = client.createRole(
    {
      role_name: roleName,
      permissions: ["Tenant#view_users"],
    },
    {
      "X-User-Id": user.id,
      "X-Tenant-Id": tenant.id,
    },
  );

  check(createRoleResponse.response, {
    "permissions - create role: status 200": (r) => r.status === 200,
  });

  const role = createRoleResponse.data.data;
  if (!role) return;

  // Update role to add permission
  const updateRoleResponse = client.updateRole(
    role.id,
    {
      permissions: ["Tenant#view_users", "Tenant#invite_user"],
    },
    {
      "X-Tenant-Id": tenant.id,
      "X-User-Id": user.id,
    },
  );

  check(updateRoleResponse.response, {
    "permissions - update role: status 200": (r) => r.status === 200,
  });

  // List roles
  const listRolesResponse = client.listRoles({
    "X-Tenant-Id": tenant.id,
  });

  check(listRolesResponse.response, {
    "permissions - list roles: status 200": (r) => r.status === 200,
  });
}

/**
 * 3. DATABASE CONNECTIONS
 * Tests database connectivity via multiple rapid queries.
 * Stresses the PgBouncer connection pool.
 */
export function stressDatabaseConnections(data: SetupData) {
  const user = getMyUser(data);
  const client = createClient();
  const id = uniqueId();

  // Create tenant
  const tenantResponse = client.createTenant(
    {
      name: `Stress DB Tenant ${id}`,
      billing_email: user.email,
    },
    {
      "X-User-Id": user.id,
    },
  );

  check(tenantResponse.response, {
    "database - create tenant: status 200": (r) => r.status === 200,
  });

  const tenantData = tenantResponse.data.data;
  if (!tenantData?.tenant) return;

  const tenant = tenantData.tenant;

  // Multiple rapid-fire queries to stress connection pool
  for (let i = 0; i < 3; i++) {
    const listResponse = client.listTenantUsers({
      "X-User-Id": user.id,
      "X-Tenant-Id": tenant.id,
    });

    const passed = check(listResponse.response, {
      [`database - rapid query ${i + 1}: status 200`]: (r) => r.status === 200,
    });

    if (!passed) {
      logError(`database-rapid-query-${i + 1}`, listResponse.response);
    }
  }

  // Test tenant listing (different query pattern)
  const tenantsResponse = client.listTenants({
    "X-User-Id": user.id,
  });

  check(tenantsResponse.response, {
    "database - list tenants: status 200": (r) => r.status === 200,
  });

  // Get JWT multiple times (exercises different code paths)
  for (let i = 0; i < 3; i++) {
    const jwtResponse = client.getTenantJWT({
      "X-Tenant-Id": tenant.id,
      "X-User-Id": user.id,
    });

    check(jwtResponse.response, {
      [`database - get JWT ${i + 1}: status 200`]: (r) => r.status === 200,
    });
  }
}

/**
 * 4. STORAGE
 * Tests MinIO storage operations.
 * Upload, download, delete files.
 */
export function stressStorage(data: SetupData) {
  const user = getMyUser(data);
  const client = createClient();
  const id = uniqueId();

  // Create tenant for storage tests
  const tenantResponse = client.createTenant(
    {
      name: `Stress Storage Tenant ${id}`,
      billing_email: user.email,
    },
    {
      "X-User-Id": user.id,
    },
  );

  check(tenantResponse.response, {
    "storage - create tenant: status 200": (r) => r.status === 200,
  });

  const tenantData = tenantResponse.data.data;
  if (!tenantData?.tenant) return;

  const tenant = tenantData.tenant;

  // Get PostgREST token for storage operations
  const jwtResponse = client.getTenantJWT({
    "X-Tenant-Id": tenant.id,
    "X-User-Id": user.id,
  });

  const token = jwtResponse.data.data?.token;
  if (!token) return;

  // Upload file
  const filePath = `stress-test/file-${id}.txt`;
  const fileContent = `Stress test content ${id}`;

  const uploadResponse = client.uploadFile(
    {
      path: filePath,
      metadata: { test: "stress" },
    },
    {
      "X-User-Id": user.id,
      "X-Tenant-Id": tenant.id,
      "X-Postgrest-Token": token,
    },
  );

  check(uploadResponse.response, {
    "storage - upload request: status 200": (r) => r.status === 200,
  });

  const uploadData = uploadResponse.data.data;
  if (!uploadData?.upload_url) return;

  // Upload to presigned URL
  const s3UploadResponse = http.put(uploadData.upload_url, fileContent, {
    headers: { "Content-Type": "text/plain" },
  });

  check(s3UploadResponse, {
    "storage - S3 upload: status 200": (r) => r.status === 200,
  });

  // Download file
  const downloadResponse = client.downloadFile(
    { path: filePath },
    {
      "X-User-Id": user.id,
      "X-Tenant-Id": tenant.id,
      "X-Postgrest-Token": token,
    },
  );

  check(downloadResponse.response, {
    "storage - download request: status 200": (r) => r.status === 200,
  });

  const downloadData = downloadResponse.data.data;
  if (downloadData?.download_url) {
    const s3DownloadResponse = http.get(downloadData.download_url);

    check(s3DownloadResponse, {
      "storage - S3 download: status 200": (r) => r.status === 200,
      "storage - content matches": (r) => r.body === fileContent,
    });
  }

  // Delete file
  const deleteResponse = client.deleteObject(
    { path: filePath },
    {
      "X-User-Id": user.id,
      "X-Tenant-Id": tenant.id,
      "X-Postgrest-Token": token,
    },
  );

  check(deleteResponse.response, {
    "storage - delete: status 200": (r) => r.status === 200,
  });
}

/**
 * CROSS-TENANT ISOLATION (security)
 * Verifies users can't access other tenants' data.
 */
export function stressCrossTenantIsolation(data: SetupData) {
  const userA = getMyUser(data);
  const userB = getMySecondUser(data);
  const client = createClient();
  const id = uniqueId();

  // Create tenant A
  const tenantAResponse = client.createTenant(
    {
      name: `Stress Isolation A ${id}`,
      billing_email: userA.email,
    },
    {
      "X-User-Id": userA.id,
    },
  );

  check(tenantAResponse.response, {
    "isolation - create tenant A: status 200": (r) => r.status === 200,
  });

  const tenantAData = tenantAResponse.data.data;
  if (!tenantAData?.tenant) return;
  const tenantA = tenantAData.tenant;

  // Create tenant B
  const tenantBResponse = client.createTenant(
    {
      name: `Stress Isolation B ${id}`,
      billing_email: userB.email,
    },
    {
      "X-User-Id": userB.id,
    },
  );

  check(tenantBResponse.response, {
    "isolation - create tenant B: status 200": (r) => r.status === 200,
  });

  const tenantBData = tenantBResponse.data.data;
  if (!tenantBData?.tenant) return;
  const tenantB = tenantBData.tenant;

  // User A tries to access Tenant B (should fail)
  const crossAccessResponse = client.listTenantUsers({
    "X-User-Id": userA.id,
    "X-Tenant-Id": tenantB.id,
  });

  check(crossAccessResponse.response, {
    "isolation - cross access: status 403": (r) => r.status === 403,
  });

  // Verify users can access their own tenants
  const userAOwnResponse = client.listTenantUsers({
    "X-User-Id": userA.id,
    "X-Tenant-Id": tenantA.id,
  });

  const passed = check(userAOwnResponse.response, {
    "isolation - user A own tenant: status 200": (r) => r.status === 200,
  });

  if (!passed) {
    logError("isolation-userA-own-tenant", userAOwnResponse.response);
  }
}

/**
 * Main stress test function - runs all stress tests.
 */
export function runStressTests(data: SetupData) {
  stressTenantLifecycle(data);
  stressPermissions(data);
  stressDatabaseConnections(data);
  stressStorage(data);
  stressCrossTenantIsolation(data);
}
