import type { OmnibaseClient } from "../client";
import type { ApiResponse } from "../types";

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
 * @since 0.6.0
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
 * @since 0.6.0
 * @public
 * @group Tenant Management
 */
export type DeleteTenantResponse = ApiResponse<{
  /** Confirmation message indicating successful deletion */
  message: string;
}>;

/**
 * Response structure for tenant creation operations
 *
 * Contains the newly created tenant information along with an authentication
 * token that provides Row-Level Security (RLS) access to the tenant's data.
 * The token should be stored securely and used for subsequent API calls
 * that require tenant-specific access.
 *
 * @example
 * ```typescript
 * const response: CreateTenantResponse = {
 *   data: {
 *     tenant: {
 *       id: 'tenant_123',
 *       name: 'My Company',
 *       stripe_customer_id: 'cus_abc123'
 *     },
 *     message: 'Tenant created successfully',
 *     token: 'eyJhbGciOiJIUzI1NiIs...'
 *   },
 *   status: 201
 * };
 * ```
 *
 * @since 0.6.0
 * @public
 * @group Tenant Management
 */
export type CreateTenantResponse = ApiResponse<{
  /** The newly created tenant object */
  tenant: Tenant;
  /** Success message confirming tenant creation */
  message: string;
  /** JWT token for RLS policies specific to the active tenant */
  token: string;
}>;

/**
 * Tenant entity structure that maps to the database schema
 *
 * Represents a tenant in the multi-tenant system with billing integration
 * via Stripe. Each tenant can have multiple users with different roles
 * and maintains its own isolated data through RLS policies.
 *
 * @example
 * ```typescript
 * const tenant: Tenant = {
 *   id: 'tenant_abc123',
 *   name: 'Acme Corporation',
 *   stripe_customer_id: 'cus_stripe123',
 *   type: 'business',
 *   created_at: '2024-01-15T10:30:00Z',
 *   updated_at: '2024-01-15T10:30:00Z'
 * };
 * ```
 *
 * @since 0.6.0
 * @public
 * @group Tenant Management
 */
export type Tenant = {
  /** Unique identifier for the tenant */
  id: string;
  /** Display name of the tenant organization */
  name: string;
  /** Associated Stripe customer ID for billing */
  stripe_customer_id: string;
  /** Type of tenant (e.g., 'individual', 'organization') */
  type: string;
  /** ISO 8601 timestamp when the tenant was created */
  created_at: string;
  /** ISO 8601 timestamp when the tenant was last updated */
  updated_at: string;
};

/**
 * Required data for creating a new tenant
 *
 * Contains the essential information needed to establish a new tenant
 * in the system, including billing setup and initial user assignment.
 *
 * @example
 * ```typescript
 * const tenantData: CreateTenantRequest = {
 *   name: 'My New Company',
 *   billing_email: 'billing@mynewcompany.com',
 *   user_id: 'user_abc123'
 * };
 * ```
 *
 * @since 0.6.0
 * @public
 * @group Tenant Management
 */
export type CreateTenantRequest = {
  /** Name of the tenant organization */
  name: string;
  /** Email address for billing notifications */
  billing_email: string;
  /** ID of the user who will own the tenant */
  user_id: string;
};

/**
 * Tenant management operations handler
 *
 * This class provides core tenant lifecycle management operations including
 * creation, deletion, and active tenant switching. It handles all the fundamental
 * operations needed to manage tenants in a multi-tenant application with
 * integrated billing and row-level security.
 *
 * The manager handles:
 * - Tenant creation with Stripe billing integration
 * - Secure tenant deletion with data cleanup
 * - Active tenant switching with JWT token management
 * - User permission validation for all operations
 *
 * All operations are performed within the authenticated user context and
 * respect tenant ownership and permission rules.
 *
 * @example
 * ```typescript
 * const tenantManager = new TenantManger(omnibaseClient);
 *
 * // Create a new tenant
 * const tenant = await tenantManager.createTenant({
 *   name: 'Acme Corp',
 *   billing_email: 'billing@acme.com',
 *   user_id: 'user_123'
 * });
 *
 * // Switch to the new tenant
 * await tenantManager.switchActiveTenant(tenant.data.tenant.id);
 *
 * // Delete tenant (owner only)
 * await tenantManager.deleteTenant(tenant.data.tenant.id);
 * ```
 *
 * @since 0.6.0
 * @public
 * @group Tenant Management
 */
export class TenantManger {
  /**
   * Creates a new TenantManger instance
   *
   * Initializes the manager with the provided Omnibase client for making
   * authenticated API requests to tenant management endpoints.
   *
   * @param omnibaseClient - Configured Omnibase client instance
   *
   * @group Tenant Management
   */
  constructor(private omnibaseClient: OmnibaseClient) {}

  /**
   * Creates a new tenant in the multi-tenant system
   *
   * Establishes a new tenant with integrated Stripe billing setup and assigns
   * the specified user as the tenant owner. The operation creates the necessary
   * database records and returns a JWT token that enables Row-Level Security
   * access to the tenant's isolated data.
   *
   * The function automatically handles Stripe customer creation for billing
   * integration and sets up the initial tenant configuration. The returned
   * token should be stored securely for subsequent API calls.
   *
   * @param tenantData - Configuration object for the new tenant
   * @param tenantData.name - Display name for the tenant organization
   * @param tenantData.billing_email - Email address for Stripe billing notifications
   * @param tenantData.user_id - Unique identifier of the user who will own this tenant
   *
   * @returns Promise resolving to the created tenant with authentication token
   *
   * @throws {Error} When required fields (name, user_id) are missing or empty
   * @throws {Error} When the API request fails due to network issues
   * @throws {Error} When the server returns an error response (4xx, 5xx status codes)
   *
   * @example
   * ```typescript
   * const newTenant = await tenantManager.createTenant({
   *   name: 'Acme Corporation',
   *   billing_email: 'billing@acme.com',
   *   user_id: 'user_123'
   * });
   *
   * console.log(`Tenant created: ${newTenant.data.tenant.id}`);
   * ```
   *
   * @since 0.6.0
   * @public
   * @group Tenant Management
   */
  async createTenant(
    tenantData: CreateTenantRequest
  ): Promise<CreateTenantResponse> {
    if (!tenantData.name || !tenantData.user_id) {
      throw new Error("Name and user_id are required");
    }

    try {
      const response = await this.omnibaseClient.fetch(`/api/v1/tenants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tenantData),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(
          `Failed to create tenant: ${response.status} - ${errorData}`
        );
      }

      const data = await response.json();
      return data as CreateTenantResponse;
    } catch (error) {
      console.error("Error creating tenant:", error);
      throw error;
    }
  }

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
   * @throws {Error} When the tenantId parameter is missing or empty
   * @throws {Error} When the user is not authenticated
   * @throws {Error} When the user is not an owner of the specified tenant
   * @throws {Error} When the tenant doesn't exist or is not accessible
   * @throws {Error} When the API request fails due to network issues
   * @throws {Error} When the server returns an error response (4xx, 5xx status codes)
   *
   * @example
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
   *     const result = await tenantManager.deleteTenant(tenantToDelete);
   *     console.log(result.data.message);
   *
   *     // Redirect user away from deleted tenant
   *     window.location.href = '/dashboard';
   *   } catch (error) {
   *     console.error('Failed to delete tenant:', error);
   *   }
   * }
   * ```
   *
   * @since 0.6.0
   * @public
   * @group Tenant Management
   */
  async deleteTenant(tenantId: string): Promise<DeleteTenantResponse> {
    if (!tenantId) {
      throw new Error("Tenant ID is required");
    }

    try {
      const response = await this.omnibaseClient.fetch(
        `/api/v1/tenants/${tenantId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

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
   * @throws {Error} When the tenantId parameter is missing or empty
   * @throws {Error} When the user doesn't have access to the specified tenant
   * @throws {Error} When the user is not authenticated
   * @throws {Error} When the specified tenant doesn't exist
   * @throws {Error} When the API request fails due to network issues
   * @throws {Error} When the server returns an error response (4xx, 5xx status codes)
   *
   * @example
   * ```typescript
   * const result = await tenantManager.switchActiveTenant('tenant_xyz789');
   *
   * // Store the new token for future requests
   * console.log(`Switched to tenant. New token: ${result.data.token}`);
   *
   * // Now all API calls will be in the context of tenant_xyz789
   * const tenantData = await getCurrentTenantData();
   * ```
   *
   * @since 0.6.0
   * @public
   * @group Tenant Management
   */
  async switchActiveTenant(
    tenantId: string
  ): Promise<SwitchActiveTenantResponse> {
    if (!tenantId) {
      throw new Error("Tenant ID is required");
    }

    const requestBody = {
      tenant_id: tenantId,
    };

    try {
      const response = await this.omnibaseClient.fetch(
        `/api/v1/tenants/switch-active`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
          credentials: "include",
        }
      );

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
}
