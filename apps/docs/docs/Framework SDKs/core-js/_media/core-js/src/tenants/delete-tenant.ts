import type { ApiResponse } from "./types";

/**
 * Response structure for deleting a tenant
 *
 * Contains a confirmation message indicating successful tenant deletion.
 * This response is only returned after the tenant and all associated data
 * have been permanently removed from the system.
 *
 * @example
 * ```typescript
 * const response: DeleteTenantResponse = {
 *   data: {
 *     message: 'Tenant deleted successfully'
 *   },
 *   status: 200
 * };
 * ```
 *
 * @since 1.0.0
 * @public
 * @group Tenant Management
 */
export type DeleteTenantResponse = ApiResponse<{
  /** Confirmation message indicating successful deletion */
  message: string;
}>;

/**
 * Permanently deletes a tenant and all associated data
 *
 * ⚠️ **WARNING: This operation is irreversible and will permanently delete:**
 * - The tenant record and all metadata
 * - All user memberships and invitations for this tenant
 * - All tenant-specific data protected by row-level security
 * - Any tenant-related billing information
 * - All tenant configuration and settings
 *
 * **Access Control:**
 * Only tenant owners can delete a tenant. This operation requires:
 * - User must be authenticated
 * - User must have 'owner' role for the specified tenant
 * - Tenant must exist and be accessible to the user
 *
 * **Security Considerations:**
 * - All tenant data is immediately and permanently removed
 * - Other tenant members lose access immediately
 * - Any active sessions for this tenant are invalidated
 * - Billing subscriptions are cancelled (if applicable)
 * - Audit logs for deletion are maintained for compliance
 *
 * @param tenantId - The unique identifier of the tenant to delete
 *
 * @returns Promise resolving to a confirmation message
 *
 * @throws {Error} When OMNIBASE_API_URL environment variable is not configured
 * @throws {Error} When the tenantId parameter is missing or empty
 * @throws {Error} When the user is not authenticated
 * @throws {Error} When the user is not an owner of the specified tenant
 * @throws {Error} When the tenant doesn't exist or is not accessible
 * @throws {Error} When the API request fails due to network issues
 * @throws {Error} When the server returns an error response (4xx, 5xx status codes)
 *
 * @example
 * Basic tenant deletion with confirmation:
 * ```typescript
 * const tenantToDelete = 'tenant_abc123';
 *
 * // Always confirm before deleting
 * const userConfirmed = confirm(
 *   'Are you sure you want to delete this tenant? This action cannot be undone.'
 * );
 *
 * if (userConfirmed) {
 *   try {
 *     const result = await deleteTenant(tenantToDelete);
 *     console.log(result.data.message); // "Tenant deleted successfully"
 *
 *     // Redirect user away from deleted tenant
 *     window.location.href = '/dashboard';
 *   } catch (error) {
 *     console.error('Failed to delete tenant:', error);
 *   }
 * }
 * ```
 *
 * @since 1.0.0
 * @public
 * @group Tenant Management
 */
export async function deleteTenant(
  tenantId: string
): Promise<DeleteTenantResponse> {
  const baseUrl = process.env.OMNIBASE_API_URL;

  if (!baseUrl) {
    throw new Error("OMNIBASE_API_URL is not configured");
  }

  if (!tenantId) {
    throw new Error("Tenant ID is required");
  }

  try {
    const response = await fetch(`${baseUrl}/api/v1/tenants/${tenantId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(
        `Failed to delete tenant: ${response.status} - ${errorData}`
      );
    }

    const data = await response.json();
    return data as DeleteTenantResponse;
  } catch (error) {
    console.error("Error deleting tenant:", error);
    throw error;
  }
}
