import type { OmnibaseClient } from "../client";

export interface UploadOptions {
  /**
   * Custom metadata to attach to the file
   * This will be stored in the JSONB metadata column
   */
  metadata?: Record<string, any>;
}

export interface UploadResult {
  /**
   * Pre-signed URL for uploading the file
   */
  upload_url: string;
  /**
   * Full path where the file will be stored (includes tenant_id prefix)
   */
  path: string;
}

export interface DownloadResult {
  /**
   * Pre-signed URL for downloading the file
   */
  download_url: string;
}

/**
 * Storage bucket for file operations
 */
export class Bucket {
  constructor(private client: OmnibaseClient, private name: string) {}

  /**
   * Upload a file to the bucket
   *
   * @param path - Path within the bucket (will be prefixed with tenant_id)
   * @param file - File or Blob to upload
   * @param options - Upload options including custom metadata
   *
   * @example
   * ```typescript
   * const result = await storage.bucket('user-uploads').upload(
   *   'documents/report.pdf',
   *   file,
   *   {
   *     metadata: {
   *       department: 'engineering',
   *       project: 'Q4-review',
   *       tags: ['important', 'quarterly']
   *     }
   *   }
   * );
   *
   * // Upload file to S3 using pre-signed URL
   * await fetch(result.upload_url, {
   *   method: 'PUT',
   *   body: file
   * });
   * ```
   */
  async upload(
    path: string,
    file: File | Blob,
    options?: UploadOptions
  ): Promise<UploadResult> {
    // Build metadata object with file info + custom metadata
    const metadata: Record<string, any> = {
      // File metadata
      filename: file instanceof File ? file.name : "blob",
      size: file.size,
      mime_type: file.type,
      uploaded_at: new Date().toISOString(),

      // Merge custom metadata
      ...(options?.metadata || {}),
    };

    // Request pre-signed upload URL from API
    const response = await this.client.fetch("/api/v1/storage/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bucket: this.name,
        path,
        metadata,
      }),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Upload failed" }));
      throw new Error((error as any).error || "Failed to get upload URL");
    }

    const responseData = (await response.json()) as { data: UploadResult };
    const result = responseData.data;

    // Upload file to S3 using pre-signed URL
    const uploadResponse = await fetch(result.upload_url, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    if (!uploadResponse.ok) {
      throw new Error("Failed to upload file to storage");
    }

    return result;
  }

  /**
   * Download a file from the bucket
   *
   * @param path - Path to the file (including tenant_id prefix)
   *
   * @example
   * ```typescript
   * const { download_url } = await storage.bucket('user-uploads')
   *   .download('tenant-123/documents/report.pdf');
   *
   * // Download the file
   * const response = await fetch(download_url);
   * const blob = await response.blob();
   * ```
   */
  async download(path: string): Promise<DownloadResult> {
    const response = await this.client.fetch("/api/v1/storage/download", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bucket: this.name,
        path,
      }),
    });

    if (!response.ok) {
      const error = (await response
        .json()
        .catch(() => ({ error: "Download failed" }))) as { error?: string };
      throw new Error(error.error || "Failed to get download URL");
    }

    const responseData = (await response.json()) as { data: DownloadResult };
    return responseData.data;
  }

  /**
   * Delete a file from the bucket
   *
   * @param path - Path to the file (including tenant_id prefix)
   *
   * @example
   * ```typescript
   * await storage.bucket('user-uploads')
   *   .delete('tenant-123/documents/report.pdf');
   * ```
   */
  async delete(path: string): Promise<void> {
    const response = await this.client.fetch("/api/v1/storage/object", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bucket: this.name,
        path,
      }),
    });

    if (!response.ok) {
      const error = (await response
        .json()
        .catch(() => ({ error: "Delete failed" }))) as { error?: string };
      throw new Error(error.error || "Failed to delete file");
    }
  }
}

/**
 * Storage client for file operations
 *
 * @example
 * ```typescript
 * const storage = omnibase.storage();
 *
 * // Upload with metadata
 * await storage.bucket('documents').upload(
 *   'report.pdf',
 *   file,
 *   {
 *     metadata: {
 *       department: 'engineering',
 *       project: 'Q4-review'
 *     }
 *   }
 * );
 * ```
 */
export class StorageClient {
  constructor(private client: OmnibaseClient) {}

  /**
   * Get a bucket reference for file operations
   *
   * @param name - Bucket name (e.g., 'public', 'user-uploads', 'avatars')
   */
  bucket(name: string): Bucket {
    return new Bucket(this.client, name);
  }
}
