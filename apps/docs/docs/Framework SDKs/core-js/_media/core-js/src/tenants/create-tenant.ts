import type { ApiResponse } from "./types";

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
 * @since 1.0.0
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
 * @since 1.0.0
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
 * @since 1.0.0
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
 * @throws {Error} When OMNIBASE_API_URL environment variable is not configured
 * @throws {Error} When required fields (name, user_id) are missing or empty
 * @throws {Error} When the API request fails due to network issues
 * @throws {Error} When the server returns an error response (4xx, 5xx status codes)
 *
 * @example
 * Basic tenant creation:
 * ```typescript
 * const newTenant = await createTenant({
 *   name: 'Acme Corporation',
 *   billing_email: 'billing@acme.com',
 *   user_id: 'user_123'
 * });
 *
 * console.log(`Created tenant: ${newTenant.data.tenant.name}`);
 * // Store the token for authenticated requests
 * localStorage.setItem('tenant_token', newTenant.data.token);
 * ```
 *
 *
 * @since 1.0.0
 * @public
 * @group Tenant Management
 */
export async function createTenant(
  tenantData: CreateTenantRequest
): Promise<CreateTenantResponse> {
  const baseUrl = process.env.OMNIBASE_API_URL;

  if (!baseUrl) {
    throw new Error("OMNIBASE_API_URL is not configured");
  }

  if (!tenantData.name || !tenantData.user_id) {
    throw new Error("Name and user_id are required");
  }

  try {
    const response = await fetch(`${baseUrl}/api/v1/tenants`, {
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
