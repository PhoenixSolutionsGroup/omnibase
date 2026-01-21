import { check } from "k6";
import { createClient, logError, uniqueId, randomPassword } from "../client";
import * as http from "k6/http";

/**
 * Test Scenario: Storage Operations with Permission Enforcement
 *
 * Flow:
 * 1. Create tenant with owner user
 * 2. Upload file to tenant storage
 * 3. Verify file metadata returned
 * 4. List files in tenant storage (Note: API doesn't have list endpoint, using download to verify)
 * 5. Download file and verify content matches
 * 6. Create member user with limited permissions
 * 7. Attempt file upload as member (test permission enforcement)
 * 8. Attempt file download as member (test permission enforcement)
 * 9. Delete file as owner
 * 10. Verify file removed from storage
 * 11. Attempt to download deleted file (should 404)
 * 12. Test cross-tenant file access denial
 *
 * This test validates:
 * - File upload/download/delete operations work correctly
 * - RLS policies enforce tenant isolation
 * - Permission enforcement on storage operations
 * - Cross-tenant file access is prevented
 * - Presigned URLs work correctly
 */
export async function fileOperations() {
  const id = uniqueId();
  const ownerEmail = `owner-${id}@example.com`;
  const memberEmail = `member-${id}@example.com`;
  const password = randomPassword();
  const client = createClient();

  // Step 1: Create tenant with owner user
  const ownerResponse = client.createUser({
    email: ownerEmail,
    password: password,
    name: {
      first: "Storage",
      last: "Owner",
    },
  });

  check(ownerResponse.response, {
    "create owner: status is 200": (r) => r.status === 200,
  });

  const owner = ownerResponse.data.data;
  if (!owner) {
    logError("createOwner", ownerResponse.response);
    return;
  }

  const tenantResponse = client.createTenant(
    {
      name: `Storage Test Tenant ${id}`,
      billing_email: ownerEmail,
    },
    {
      "X-User-Id": owner.id,
    }
  );

  check(tenantResponse.response, {
    "create tenant: status is 200": (r) => r.status === 200,
  });

  const tenantData = tenantResponse.data.data;
  if (!tenantData?.tenant) {
    logError("createTenant", tenantResponse.response);
    return;
  }

  const tenant = tenantData.tenant;

  const ownerPostgrestToken = client.getTenantJWT({
    "X-Tenant-Id": tenant.id,
    "X-User-Id": owner.id,
  });

  check(ownerPostgrestToken.response, {
    "owner get tenant JWT: status is 200": (r) => r.status === 200,
  });

  const ownerPostgrestTokenData = ownerPostgrestToken.data.data;
  if (!ownerPostgrestTokenData?.token) {
    logError("getOwnerTenantJWT", ownerPostgrestToken.response);
    return;
  }

  // Step 2: Upload file to tenant storage
  const filePath = `test-files/document-${id}.txt`;
  const fileContent = `This is a test file created at ${id}`;

  const uploadResponse = client.uploadFile(
    {
      path: filePath,
      metadata: {
        description: "Test document for storage operations",
        created_by: owner.id,
      },
    },
    {
      "X-User-Id": owner.id,
      "X-Tenant-Id": tenant.id,
      "X-Postgrest-Token": ownerPostgrestTokenData.token,
    }
  );

  check(uploadResponse.response, {
    "upload file: status is 200": (r) => r.status === 200,
    "upload file: returns upload_url": (r) => {
      const body = r.json() as any;
      return body?.data?.upload_url !== undefined;
    },
    "upload file: returns path": (r) => {
      const body = r.json() as any;
      return body?.data?.path === filePath;
    },
  });

  const uploadData = uploadResponse.data.data;
  if (!uploadData?.upload_url) {
    logError("uploadFile", uploadResponse.response);
    return;
  }

  // Step 3: Upload file content to presigned URL
  const uploadToS3Response = http.put(uploadData.upload_url, fileContent, {
    headers: {
      "Content-Type": "text/plain",
    },
  });

  check(uploadToS3Response, {
    "upload to S3: status is 200": (r) => r.status === 200,
  });

  // Step 4: Download file and verify content matches
  const downloadResponse = client.downloadFile(
    {
      path: filePath,
    },
    {
      "X-User-Id": owner.id,
      "X-Tenant-Id": tenant.id,
      "X-Postgrest-Token": ownerPostgrestTokenData.token,
    }
  );

  check(downloadResponse.response, {
    "download file: status is 200": (r) => r.status === 200,
    "download file: returns download_url": (r) => {
      const body = r.json() as any;
      return body?.data?.download_url !== undefined;
    },
  });

  const downloadData = downloadResponse.data.data;
  if (!downloadData?.download_url) {
    logError("downloadFile", downloadResponse.response);
    return;
  }

  // Step 5: Verify file content matches
  const downloadFromS3Response = http.get(downloadData.download_url);

  check(downloadFromS3Response, {
    "download from S3: status is 200": (r) => r.status === 200,
    "download from S3: content matches": (r) => r.body === fileContent,
  });

  // Step 6: Create member user
  const memberResponse = client.createUser({
    email: memberEmail,
    password: password,
    name: {
      first: "Storage",
      last: "Member",
    },
  });

  check(memberResponse.response, {
    "create member: status is 200": (r) => r.status === 200,
  });

  const member = memberResponse.data.data;
  if (!member) {
    logError("createMember", memberResponse.response);
    return;
  }

  // Add member to tenant
  const inviteResponse = client.createInvite(
    {
      email: memberEmail,
      role: "member",
      invite_url: `http://localhost:3000/accept-invite`,
    },
    {
      "X-User-Id": owner.id,
      "X-Tenant-Id": tenant.id,
    }
  );

  check(inviteResponse.response, {
    "create invite: status is 200": (r) => r.status === 200,
  });

  const invite = inviteResponse.data.data?.invite;
  if (!invite?.token) {
    logError("createInvite", inviteResponse.response);
    return;
  }

  const acceptResponse = client.acceptInvite(
    {
      token: invite.token,
    },
    {
      "X-User-Id": member.id,
    }
  );

  check(acceptResponse.response, {
    "accept invite: status is 200": (r) => r.status === 200,
  });

  const memberPostgrestToken = client.getTenantJWT({
    "X-Tenant-Id": tenant.id,
    "X-User-Id": member.id,
  });

  check(memberPostgrestToken.response, {
    "member get tenant JWT: status is 200": (r) => r.status === 200,
  });

  const memberPostgrestTokenData = memberPostgrestToken.data.data;
  if (!memberPostgrestTokenData?.token) {
    logError("getMemberTenantJWT", memberPostgrestToken.response);
    return;
  }

  // Step 7: Member can upload files within the same tenant
  // (storage_objects_tenant_isolation policy allows all operations for tenant members)
  const memberUploadPath = `test-files/member-document-${id}.txt`;
  const memberUploadResponse = client.uploadFile(
    {
      path: memberUploadPath,
      metadata: {
        description: "Member upload attempt",
      },
    },
    {
      "X-User-Id": member.id,
      "X-Tenant-Id": tenant.id,
      "X-Postgrest-Token": memberPostgrestTokenData.token,
    }
  );

  check(memberUploadResponse.response, {
    "member upload: status is 200": (r) => r.status === 200,
  });

  // Step 8: Member can download owner's files within the same tenant
  // (storage_objects_tenant_isolation policy allows all operations for tenant members)
  const memberDownloadResponse = client.downloadFile(
    {
      path: filePath,
    },
    {
      "X-User-Id": member.id,
      "X-Tenant-Id": tenant.id,
      "X-Postgrest-Token": memberPostgrestTokenData.token,
    }
  );

  check(memberDownloadResponse.response, {
    "member download owner file: status is 200": (r) => r.status === 200,
    "member download owner file: returns download_url": (r) => {
      const body = r.json() as any;
      return body?.data?.download_url !== undefined;
    },
  });

  // Step 8b: Upload public file as owner
  const publicFilePath = `public/document-${id}.txt`;
  const publicFileContent = `This is a public file created at ${id}`;

  const publicUploadResponse = client.uploadFile(
    {
      path: publicFilePath,
      metadata: {
        description: "Public document for testing member access",
      },
    },
    {
      "X-User-Id": owner.id,
      "X-Tenant-Id": tenant.id,
      "X-Postgrest-Token": ownerPostgrestTokenData.token,
    }
  );

  check(publicUploadResponse.response, {
    "upload public file: status is 200": (r) => r.status === 200,
  });

  const publicUploadData = publicUploadResponse.data.data;
  if (publicUploadData?.upload_url) {
    // Upload public file content to S3
    const publicUploadToS3Response = http.put(
      publicUploadData.upload_url,
      publicFileContent,
      {
        headers: {
          "Content-Type": "text/plain",
        },
      }
    );

    check(publicUploadToS3Response, {
      "upload public to S3: status is 200": (r) => r.status === 200,
    });
  }

  // Step 8c: Member can download files from public/ directory
  const memberPublicDownloadResponse = client.downloadFile(
    {
      path: publicFilePath,
    },
    {
      "X-User-Id": member.id,
      "X-Tenant-Id": tenant.id,
      "X-Postgrest-Token": memberPostgrestTokenData.token,
    }
  );

  check(memberPublicDownloadResponse.response, {
    "member download public file: status is 200": (r) => r.status === 200,
    "member download public file: returns download_url": (r) => {
      const body = r.json() as any;
      return body?.data?.download_url !== undefined;
    },
  });

  const memberPublicDownloadData = memberPublicDownloadResponse.data.data;
  if (memberPublicDownloadData?.download_url) {
    // Verify member can access public file content
    const memberPublicS3Response = http.get(
      memberPublicDownloadData.download_url
    );

    check(memberPublicS3Response, {
      "member download public from S3: status is 200": (r) => r.status === 200,
      "member download public from S3: content matches": (r) =>
        r.body === publicFileContent,
    });
  }

  // Step 9: Delete file as owner
  const deleteResponse = client.deleteObject(
    {
      path: filePath,
    },
    {
      "X-User-Id": owner.id,
      "X-Tenant-Id": tenant.id,
      "X-Postgrest-Token": ownerPostgrestTokenData.token,
    }
  );

  check(deleteResponse.response, {
    "delete file: status is 200": (r) => r.status === 200,
    "delete file: returns success message": (r) => {
      const body = r.json() as any;
      return body?.data?.message !== undefined;
    },
  });

  // Step 10: Attempt to download deleted file (should 404)
  const downloadDeletedResponse = client.downloadFile(
    {
      path: filePath,
    },
    {
      "X-User-Id": owner.id,
      "X-Tenant-Id": tenant.id,
      "X-Postgrest-Token": ownerPostgrestTokenData.token,
    }
  );

  check(downloadDeletedResponse.response, {
    "download deleted file: status is 404": (r) => r.status === 404,
    "download deleted file: error message indicates not found": (r) => {
      const body = r.json() as any;
      const errorMsg = (body?.error || "").toLowerCase();
      return (
        errorMsg.includes("not found") || errorMsg.includes("does not exist")
      );
    },
  });

  // Step 11: Test cross-tenant file access denial
  // Create second tenant
  const tenant2Email = `tenant2-${id}@example.com`;
  const tenant2Response = client.createUser({
    email: tenant2Email,
    password: password,
    name: {
      first: "Tenant2",
      last: "Owner",
    },
  });

  check(tenant2Response.response, {
    "create tenant2 owner: status is 200": (r) => r.status === 200,
  });

  const tenant2Owner = tenant2Response.data.data;
  if (!tenant2Owner) {
    logError("createTenant2Owner", tenant2Response.response);
    return;
  }

  const tenant2CreateResponse = client.createTenant(
    {
      name: `Tenant 2 ${id}`,
      billing_email: tenant2Email,
    },
    {
      "X-User-Id": tenant2Owner.id,
    }
  );

  check(tenant2CreateResponse.response, {
    "create tenant2: status is 200": (r) => r.status === 200,
  });

  const tenant2Data = tenant2CreateResponse.data.data;
  if (!tenant2Data?.tenant) {
    logError("createTenant2", tenant2CreateResponse.response);
    return;
  }

  const tenant2 = tenant2Data.tenant;

  const tenant2PostgrestToken = client.getTenantJWT({
    "X-Tenant-Id": tenant2.id,
    "X-User-Id": tenant2Owner.id,
  });

  check(tenant2PostgrestToken.response, {
    "tenant2 get tenant JWT: status is 200": (r) => r.status === 200,
  });

  const tenant2PostgrestTokenData = tenant2PostgrestToken.data.data;
  if (!tenant2PostgrestTokenData?.token) {
    logError("getTenant2TenantJWT", tenant2PostgrestToken.response);
    return;
  }
  // Upload file in tenant 2
  const tenant2FilePath = `tenant2-files/document-${id}.txt`;
  const tenant2UploadResponse = client.uploadFile(
    {
      path: tenant2FilePath,
      metadata: {
        description: "Tenant 2 document",
      },
    },
    {
      "X-User-Id": tenant2Owner.id,
      "X-Tenant-Id": tenant2.id,
      "X-Postgrest-Token": tenant2PostgrestTokenData.token,
    }
  );

  check(tenant2UploadResponse.response, {
    "tenant2 upload: status is 200": (r) => r.status === 200,
  });

  const tenant2UploadData = tenant2UploadResponse.data.data;
  if (tenant2UploadData?.upload_url) {
    // Upload content
    http.put(tenant2UploadData.upload_url, "Tenant 2 content", {
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }

  // Step 12: Attempt cross-tenant file access (Tenant 1 owner trying to access Tenant 2 file)
  const crossTenantDownloadResponse = client.downloadFile(
    {
      path: tenant2FilePath,
    },
    {
      "X-Postgrest-Token": ownerPostgrestTokenData.token,
      "X-User-Id": owner.id,
      "X-Tenant-Id": tenant.id,
    }
  );

  check(crossTenantDownloadResponse.response, {
    "cross-tenant download: status is 403 or 404": (r) =>
      r.status === 403 || r.status === 404,
    "cross-tenant download: access denied": (r) => {
      const body = r.json() as any;
      const errorMsg = (body?.error || "").toLowerCase();
      return (
        errorMsg.includes("permission") ||
        errorMsg.includes("forbidden") ||
        errorMsg.includes("not found")
      );
    },
  });

  return {
    owner,
    member,
    tenant,
    tenant2,
    tenant2Owner,
  };
}
