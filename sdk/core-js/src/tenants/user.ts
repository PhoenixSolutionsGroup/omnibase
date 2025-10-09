import type { OmnibaseClient } from "../client";
import type { ApiResponse } from "../types";

/**
 * Request parameters for removing a user from a tenant
 *
 * This interface defines the data required to remove a user from the active tenant.
 * The operation requires appropriate permissions and will fail if the user doesn't
 * have the necessary rights to remove users from the tenant.
 *
 * @example
 * ```typescript
 * const request: RemoveUserRequest = {
 *   user_id: 'user_abc123'
 * };
 * ```
 *
 * @since 1.0.0
 * @public
 * @group Tenant User Management
 */
export type RemoveUserRequest = {
  /** ID of the user being removed from the tenant */
  user_id: string;
};

/**
 * Manager for tenant user operations
 *
 * This class provides methods for managing users within a tenant, including
 * removing users from the active tenant. All operations are performed within
 * the context of the authenticated user and respect tenant-level permissions.
 *
 * User removal operations require appropriate permissions (typically admin or owner
 * role) and will fail if the requesting user doesn't have sufficient privileges.
 *
 * @example
 * ```typescript
 * import { OmnibaseClient } from '@omnibase/core-js';
 *
 * const client = new OmnibaseClient({ apiKey: 'your-api-key' });
 * const userManager = client.tenants.user;
 *
 * // Remove a user from the active tenant
 * await userManager.remove({ user_id: 'user_123' });
 * ```
 *
 * @since 1.0.0
 * @public
 * @group Tenant User Management
 */
export class TenantUserManager {
  /**
   * Creates a new tenant user manager
   *
   * @param omnibaseClient - Configured OmnibaseClient instance for API communication
   *
   * @group Tenant User Management
   */
  constructor(private omnibaseClient: OmnibaseClient) {}

  /**
   * Removes a user from the active tenant
   *
   * This method removes a specified user from the current active tenant. The operation
   * requires the requesting user to have appropriate permissions (admin or owner role).
   * The user being removed will lose access to the tenant and all its resources.
   *
   * Note: You cannot remove yourself from a tenant using this method. To leave a tenant,
   * use the appropriate leave or delete tenant operations instead.
   *
   * @param data - Request data containing the user ID to remove
   * @param data.user_id - ID of the user to remove from the tenant
   *
   * @returns Promise resolving to an API response confirming the removal
   *
   * @throws {Error} When user_id is not provided
   * @throws {Error} When the API request fails (includes status code and error details)
   * @throws {Error} When the user doesn't have permission to remove users
   * @throws {Error} When the specified user is not a member of the tenant
   *
   * @example
   * ```typescript
   * // Remove a user from the active tenant
   * try {
   *   await userManager.remove({ user_id: 'user_abc123' });
   *   console.log('User removed successfully');
   * } catch (error) {
   *   if (error.message.includes('403')) {
   *     console.error('Insufficient permissions to remove user');
   *   } else if (error.message.includes('404')) {
   *     console.error('User not found in tenant');
   *   } else {
   *     console.error('Failed to remove user:', error);
   *   }
   * }
   * ```
   *
   * @since 1.0.0
   * @public
   * @group Tenant User Management
   */
  async remove(data: RemoveUserRequest) {
    if (!data.user_id) {
      throw new Error("user_id is required");
    }

    const response = await this.omnibaseClient.fetch("/api/v1/tenants/users", {
      method: "DELETE",
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(
        `Failed to delete user from tenant: ${response.status} - ${errorData}`
      );
    }

    return (await response.json()) as ApiResponse<"">;
  }
}
