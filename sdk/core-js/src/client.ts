import { PaymentHandler } from "./payments";
import { PermissionsClient } from "./permissions";
import { StorageClient } from "./storage";
import { TenantHandler } from "./tenants";

export type OmnibaseClientConfig = {
  api_url: string;
  fetch?: (endpoint: string, options: RequestInit) => Promise<Response>;
};

export class OmnibaseClient {
  constructor(private config: OmnibaseClientConfig) {
    this.permissions = new PermissionsClient(this.config.api_url, this);
  }

  /**
   * Main payment handler for all payment-related operations
   *
   * This class serves as the central coordinator for all payment functionality,
   * providing access to checkout sessions, billing configuration, customer portals,
   * and usage tracking. It handles the low-level HTTP communication with the
   * payment API and delegates specific operations to specialized managers.
   *
   * The handler automatically manages authentication, request formatting, and
   * provides a consistent interface across all payment operations.
   *
   * @example
   * ```typescript
   * // Create a checkout session (mode auto-detected from price)
   * const checkout = await omnibase.payments.checkout.createSession({
   *   price_id: 'price_123',
   *   success_url: 'https://app.com/success',
   *   cancel_url: 'https://app.com/cancel'
   * });
   *
   * // Get available products
   * const products = await omnibase.payments.config.getAvailableProducts();
   * ```
   */
  public readonly payments = new PaymentHandler(this);

  /**
   * Main tenant management handler
   *
   * This is the primary entry point for all tenant-related operations in the
   * Omnibase SDK. It provides a unified interface to tenant management,
   * user management, and invitation functionality through dedicated manager instances.
   *
   * The handler follows the composition pattern, combining specialized managers
   * for different aspects of tenant functionality:
   * - `manage`: Core tenant operations (create, delete, switch)
   * - `invites`: User invitation management (create, accept)
   * - `user`: Tenant user operations (remove, update role)
   *
   * All operations are performed within the context of the authenticated user
   * and respect tenant-level permissions and row-level security policies.
   *
   * @example
   * ```typescript
   * // Create a new tenant
   * const tenant = await omnibase.tenants.manage.createTenant({
   *   name: 'My Company',
   *   billing_email: 'billing@company.com',
   *   user_id: 'user_123'
   * });
   *
   * // Invite users to the tenant
   * const invite = await omnibase.tenants.invites.create({
   *   email: 'colleague@company.com',
   *   role: 'member',
   *   invite_url: 'https://yourapp.com/accept-invite'
   * });
   *
   * // Switch to the new tenant
   * await omnibase.tenants.manage.switchActiveTenant(tenant.data.tenant.id);
   * ```
   *
   * @since 0.6.0
   * @public
   * @group Tenant Management
   */
  public readonly tenants = new TenantHandler(this);

  /**
   * Client for managing permissions and relationships using Ory Keto
   *
   * This client provides access to Ory Keto's permission system, allowing you to
   * create, manage, and check relationships between subjects and objects. It handles
   * both read operations (permission checks) and write operations (relationship management).
   *
   * The client automatically configures separate endpoints for read and write operations
   * to optimize performance and security by following Ory Keto's recommended architecture.
   *
   * @example
   * ```typescript
   * // Check if a user can view a tenant
   * const canView = await omnibase.permissions.permissions.checkPermission(
   *   undefined,
   *   {
   *     namespace: 'Tenant',
   *     object: 'tenant_123',
   *     relation: 'view',
   *     subjectId: 'user_456'
   *   }
   * );
   *
   * if (canView.data.allowed) {
   *   console.log('User can view the tenant');
   * }
   *
   * // Create a relationship making a user an owner of a tenant
   * await omnibase.permissions.relationships.createRelationship(
   *   undefined,
   *   {
   *     namespace: 'Tenant',
   *     object: 'tenant_123',
   *     relation: 'owners',
   *     subjectId: 'user_456'
   *   }
   * );
   * ```
   *
   * @since 0.6.0
   * @public
   * @group Permissions
   */
  public readonly permissions: PermissionsClient;

  /**
   * Storage client for file upload/download operations
   *
   * @example
   * ```typescript
   * // Upload with metadata
   * await omnibase.storage.bucket('documents').upload(
   *   'report.pdf',
   *   file,
   *   { metadata: { department: 'engineering' } }
   * );
   * ```
   */
  public storage = new StorageClient(this);

  async fetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
    if (this.config.fetch)
      return this.config.fetch(this.config.api_url + endpoint, options);
    return fetch(this.config.api_url + endpoint, {
      ...options,
      credentials: "include",
    });
  }
}
