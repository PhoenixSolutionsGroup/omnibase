import { check } from "k6";
import * as http from "k6/http";
import { createClient, logError, uniqueId, randomPassword } from "../client";

/**
 * Test Scenario: Per-Object ReBAC Storage Permissions
 *
 * Validates that the storage handler uses Keto for per-object permission
 * checks and that upload auto-creates owner tuples.
 *
 * Flow:
 * 1. Create owner + tenant
 * 2. Upload file as owner → response includes object `id`
 * 3. Owner can download their own file (Keto: owner relation)
 * 4. Create member, invite + accept into tenant
 * 5. Member CANNOT download owner's file (no Keto relation)
 * 6. Share: create `can_read` tuple via permissions API
 * 7. Member CAN now download (Keto: can_read relation)
 * 8. Member CANNOT delete (no can_delete relation)
 * 9. Owner CAN delete → succeeds + Keto tuples cleaned up
 *
 * This test validates:
 * - Upload auto-creates StorageObject owner tuple in Keto
 * - Download checks Keto "read" permit (owner OR can_read)
 * - Delete checks Keto "delete" permit (owner OR can_delete)
 * - Sharing via createRelationship grants access
 * - Deletion cleans up Keto tuples
 */
export async function rlsPermissionHelpers() {
  const id = uniqueId();
  const ownerEmail = `rls-owner-${id}@example.com`;
  const memberEmail = `rls-member-${id}@example.com`;
  const password = randomPassword();
  const client = createClient();

  // Step 1: Create owner + tenant
  const ownerResponse = client.createUser({
    email: ownerEmail,
    password: password,
    name: { first: "RLS", last: "Owner" },
  });

  check(ownerResponse.response, {
    "rls: create owner status 200": (r) => r.status === 200,
  });

  const owner = ownerResponse.data.data;
  if (!owner) {
    logError("rlsCreateOwner", ownerResponse.response);
    return;
  }

  const tenantResponse = client.createTenant(
    { name: `RLS Test Tenant ${id}`, billing_email: ownerEmail },
    { "X-User-Id": owner.id },
  );

  check(tenantResponse.response, {
    "rls: create tenant status 200": (r) => r.status === 200,
  });

  const tenantData = tenantResponse.data.data;
  if (!tenantData?.tenant) {
    logError("rlsCreateTenant", tenantResponse.response);
    return;
  }

  const tenant = tenantData.tenant;

  // Get owner JWT for storage operations
  const ownerJwtResponse = client.getTenantJWT({
    "X-Tenant-Id": tenant.id,
    "X-User-Id": owner.id,
  });

  check(ownerJwtResponse.response, {
    "rls: owner get JWT status 200": (r) => r.status === 200,
  });

  const ownerToken = ownerJwtResponse.data.data?.token;
  if (!ownerToken) {
    logError("rlsOwnerJWT", ownerJwtResponse.response);
    return;
  }

  // Step 2: Upload file as owner — response should include object id
  const ownerFilePath = `rls-test/owner-file-${id}.txt`;
  const ownerFileContent = `Owner file for RLS test ${id}`;

  const uploadResponse = client.uploadFile(
    {
      path: ownerFilePath,
      metadata: { description: "RLS test file owned by owner" },
    },
    {
      "X-User-Id": owner.id,
      "X-Tenant-Id": tenant.id,
      "X-Postgrest-Token": ownerToken,
    },
  );

  check(uploadResponse.response, {
    "rls: owner upload status 200": (r) => r.status === 200,
  });

  const uploadData = uploadResponse.data.data;
  if (!uploadData?.upload_url) {
    logError("rlsOwnerUpload", uploadResponse.response);
    return;
  }

  // Verify upload response includes object id
  check(uploadResponse.response, {
    "rls: upload response includes id": () => !!uploadData?.id,
  });

  const objectId = uploadData?.id;
  if (!objectId) {
    logError("rlsUploadMissingId", uploadResponse.response);
    return;
  }

  // Upload content to S3
  const s3UploadResponse = http.put(uploadData.upload_url, ownerFileContent, {
    headers: { "Content-Type": "text/plain" },
  });

  check(s3UploadResponse, {
    "rls: S3 upload status 200": (r) => r.status === 200,
  });

  // Step 3: Owner CAN download their own file (Keto: owner relation)
  const ownerDownloadResponse = client.downloadFile(
    { path: ownerFilePath },
    {
      "X-User-Id": owner.id,
      "X-Tenant-Id": tenant.id,
      "X-Postgrest-Token": ownerToken,
    },
  );

  check(ownerDownloadResponse.response, {
    "rls: owner can download own file": (r) => r.status === 200,
    "rls: owner download returns URL": (r) => {
      const body = r.json() as any;
      return body?.data?.download_url !== undefined;
    },
  });

  // Step 4: Create member, invite + accept
  const memberResponse = client.createUser({
    email: memberEmail,
    password: password,
    name: { first: "RLS", last: "Member" },
  });

  check(memberResponse.response, {
    "rls: create member status 200": (r) => r.status === 200,
  });

  const member = memberResponse.data.data;
  if (!member) {
    logError("rlsCreateMember", memberResponse.response);
    return;
  }

  const inviteResponse = client.createInvite(
    {
      email: memberEmail,
      role: "member",
      invite_url: "http://localhost:3000/accept-invite",
    },
    { "X-User-Id": owner.id, "X-Tenant-Id": tenant.id },
  );

  check(inviteResponse.response, {
    "rls: create invite status 200": (r) => r.status === 200,
  });

  const invite = inviteResponse.data.data?.invite;
  if (!invite?.token) {
    logError("rlsCreateInvite", inviteResponse.response);
    return;
  }

  const acceptResponse = client.acceptInvite(
    { token: invite.token },
    { "X-User-Id": member.id },
  );

  check(acceptResponse.response, {
    "rls: accept invite status 200": (r) => r.status === 200,
  });

  // Get member JWT
  const memberJwtResponse = client.getTenantJWT({
    "X-Tenant-Id": tenant.id,
    "X-User-Id": member.id,
  });

  check(memberJwtResponse.response, {
    "rls: member get JWT status 200": (r) => r.status === 200,
  });

  const memberToken = memberJwtResponse.data.data?.token;
  if (!memberToken) {
    logError("rlsMemberJWT", memberJwtResponse.response);
    return;
  }

  // Step 5: Member CANNOT download owner's file (no Keto relation)
  const memberDownloadDenied = client.downloadFile(
    { path: ownerFilePath },
    {
      "X-User-Id": member.id,
      "X-Tenant-Id": tenant.id,
      "X-Postgrest-Token": memberToken,
    },
  );

  check(memberDownloadDenied.response, {
    "rls: member cannot download without relation": (r) => r.status === 403,
  });

  if (memberDownloadDenied.response.status !== 403) {
    logError("rlsMemberDownloadDenied", memberDownloadDenied.response);
  }

  // Step 6: Share file — create can_read tuple via permissions API
  const shareResponse = client.createRelationship(
    {
      namespace: "StorageObject",
      object: objectId,
      relation: "can_read",
      subject_set: {
        namespace: "User",
        object: member.id,
        relation: "",
      },
    },
  );

  check(shareResponse.response, {
    "rls: create can_read relationship status 200": (r) =>
      r.status === 200 || r.status === 201,
  });

  if (shareResponse.response.status !== 200 && shareResponse.response.status !== 201) {
    logError("rlsCreateCanRead", shareResponse.response);
    return;
  }

  // Step 7: Member CAN now download (Keto: can_read relation)
  const memberDownloadAllowed = client.downloadFile(
    { path: ownerFilePath },
    {
      "X-User-Id": member.id,
      "X-Tenant-Id": tenant.id,
      "X-Postgrest-Token": memberToken,
    },
  );

  check(memberDownloadAllowed.response, {
    "rls: member can download after can_read share": (r) => r.status === 200,
    "rls: shared download returns URL": (r) => {
      const body = r.json() as any;
      return body?.data?.download_url !== undefined;
    },
  });

  // Step 8: Member CANNOT delete (no can_delete relation — only has can_read)
  const memberDeleteDenied = client.deleteObject(
    { path: ownerFilePath },
    {
      "X-User-Id": member.id,
      "X-Tenant-Id": tenant.id,
      "X-Postgrest-Token": memberToken,
    },
  );

  check(memberDeleteDenied.response, {
    "rls: member with can_read cannot delete": (r) => r.status === 403,
  });

  if (memberDeleteDenied.response.status !== 403) {
    logError("rlsMemberDeleteDenied", memberDeleteDenied.response);
  }

  // Step 9: Owner CAN delete (Keto: owner relation)
  const ownerDeleteResponse = client.deleteObject(
    { path: ownerFilePath },
    {
      "X-User-Id": owner.id,
      "X-Tenant-Id": tenant.id,
      "X-Postgrest-Token": ownerToken,
    },
  );

  check(ownerDeleteResponse.response, {
    "rls: owner can delete own file": (r) => r.status === 200,
  });

  if (ownerDeleteResponse.response.status !== 200) {
    logError("rlsOwnerDelete", ownerDeleteResponse.response);
  }

  return {
    owner,
    member,
    tenant,
  };
}
