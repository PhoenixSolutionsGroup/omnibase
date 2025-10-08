import type { ApiResponse } from "./types";

/**
 * Response structure for switching the active tenant
 *
 * Contains a new JWT token that includes the updated tenant context
 * and a confirmation message. The new token should replace the previous
 * token for all subsequent API calls to ensure requests are made within
 * the context of the newly active tenant.
 *
 * The token includes updated tenant-specific claims and permissions,
 * ensuring that row-level security policies are enforced correctly
 * for the new active tenant context.
 *
 * @example
 * ```typescript
 * const response: SwitchActiveTenantResponse = {
 *   data: {
 *     token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
 *     message: 'Active tenant switched successfully'
 *   },
 *   status: 200
 * };
 * ```
 *
 * @since 1.0.0
 * @public
 * @group Tenant Management
 */
export type SwitchActiveTenantResponse = ApiResponse<{
  /** New JWT token with updated tenant context */
  token: string;
  /** Success message confirming the tenant switch */
  message: string;
}>;

/**
 * Switches the user's active tenant context
 *
 * Changes the user's active tenant to the specified tenant ID, updating
 * their authentication context and permissions. This function is essential
 * for multi-tenant applications where users belong to multiple tenants
 * and need to switch between them.
 *
 * The function performs several operations:
 * - Validates that the user has access to the specified tenant
 * - Updates the user's active tenant in their session
 * - Generates a new JWT token with updated tenant claims
 * - Updates any cached tenant-specific data
 *
 * After switching tenants, all subsequent API calls will be made within
 * the context of the new active tenant, with row-level security policies
 * applied accordingly. The new JWT token should be used for all future
 * authenticated requests.
 *
 * @param tenantId - The ID of the tenant to switch to (must be a tenant the user belongs to)
 *
 * @returns Promise resolving to a new JWT token and success confirmation
 *
 * @throws {Error} When OMNIBASE_API_URL environment variable is not configured
 * @throws {Error} When the tenantId parameter is missing or empty
 * @throws {Error} When the user doesn't have access to the specified tenant
 * @throws {Error} When the user is not authenticated
 * @throws {Error} When the specified tenant doesn't exist
 * @throws {Error} When the API request fails due to network issues
 * @throws {Error} When the server returns an error response (4xx, 5xx status codes)
 *
 * @example
 * Basic tenant switching:
 * ```typescript
 * const result = await switchActiveTenant('tenant_xyz789');
 *
 * // Now all API calls will be in the context of tenant_xyz789
 * const tenantData = await getCurrentTenantData();
 * ```
 *
 * @example
 * Using with tenant-aware data fetching:
 * ```typescript
 * // Switch tenant and immediately fetch tenant-specific data
 * const switchAndLoadTenant = async (tenantId: string) => {
 *   try {
 *     // Switch to new tenant context
 *     const switchResult = await switchActiveTenant(tenantId);
 *
 *     // Update authentication token
 *     setAuthToken(switchResult.data.token);
 *
 *     // Fetch data in new tenant context
 *     const [tenantInfo, userPermissions, tenantSettings] = await Promise.all([
 *       getTenantInfo(),
 *       getUserPermissions(),
 *       getTenantSettings()
 *     ]);
 *
 *     return {
 *       tenant: tenantInfo,
 *       permissions: userPermissions,
 *       settings: tenantSettings
 *     };
 *   } catch (error) {
 *     console.error('Failed to switch tenant and load data:', error);
 *     throw error;
 *   }
 * };
 * ```
 *
 * @since 1.0.0
 * @public
 * @group Tenant Management
 */
export async function switchActiveTenant(
  tenantId: string
): Promise<SwitchActiveTenantResponse> {
  const baseUrl = process.env.OMNIBASE_API_URL;

  if (!baseUrl) {
    throw new Error("OMNIBASE_API_URL is not configured");
  }

  if (!tenantId) {
    throw new Error("Tenant ID is required");
  }

  const requestBody = {
    tenant_id: tenantId,
  };

  try {
    const response = await fetch(`${baseUrl}/api/v1/tenants/switch-active`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(
        `Failed to switch tenant: ${response.status} - ${errorData}`
      );
    }

    const data = await response.json();
    return data as SwitchActiveTenantResponse;
  } catch (error) {
    console.error("Error switching active tenant:", error);
    throw error;
  }
}
