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
   * Full path where the file is stored
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
 * Storage client for file operations with path-based organization
 *
 * Users control the full file path and define RLS policies based on path patterns.
 * Common patterns:
 * - `public/*` - Public files
 * - `users/{user_id}/*` - User private files
 * - `teams/{team_id}/*` - Team shared files
 *
 * @example
 * ```typescript
 * const storage = omnibase.storage();
 *
 * // Upload to public directory
 * await storage.upload('public/images/avatar.png', file);
 *
 * // Upload to user private directory
 * await storage.upload('users/123/documents/report.pdf', file, {
 *   metadata: {
 *     department: 'engineering',
 *     confidential: true
 *   }
 * });
 *
 * // Download file
 * const { download_url } = await storage.download('public/images/avatar.png');
 *
 * // Delete file
 * await storage.delete('users/123/documents/report.pdf');
 * ```
 */
export class StorageClient {
  constructor(private client: OmnibaseClient) {}

  /**
   * Upload a file to storage
   *
   * @param path - Full path for the file (e.g., "public/images/avatar.png", "users/123/private/doc.pdf")
   * @param file - File or Blob to upload
   * @param options - Upload options including custom metadata
   *
   * @example
   * ```typescript
   * const result = await storage.upload(
   *   'public/avatars/user-123.png',
   *   file,
   *   {
   *     metadata: {
   *       userId: '123',
   *       uploadedBy: 'john@example.com',
   *       tags: ['profile', 'avatar']
   *     }
   *   }
   * );
   *
   * // File is automatically uploaded to S3 via the presigned URL
   * console.log('File uploaded to:', result.path);
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
   * Download a file from storage
   *
   * @param path - Full path to the file
   *
   * @example
   * ```typescript
   * const { download_url } = await storage.download('public/images/logo.png');
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
   * Delete a file from storage
   *
   * @param path - Full path to the file
   *
   * @example
   * ```typescript
   * await storage.delete('users/123/documents/old-report.pdf');
   * ```
   */
  async delete(path: string): Promise<void> {
    const response = await this.client.fetch("/api/v1/storage/object", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
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
