import type { OmnibaseClient } from "../client";
import { TenantInviteManager } from "./invites";
import { TenantManger } from "./management";
import { TenantSubscriptionManager } from "./subscriptions";
import { TenantUserManager } from "./user";

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
 * import { OmnibaseClient } from '@omnibase/core-js';
 * import { TenantHandler } from '@omnibase/core-js/tenants';
 *
 * const client = new OmnibaseClient({ apiKey: 'your-api-key' });
 * const tenantHandler = new TenantHandler(client);
 *
 * // Create a new tenant
 * const tenant = await tenantHandler.manage.createTenant({
 *   name: 'My Company',
 *   billing_email: 'billing@company.com',
 *   user_id: 'user_123'
 * });
 *
 * // Invite users to the tenant
 * const invite = await tenantHandler.invites.create({
 *   email: 'colleague@company.com',
 *   role: 'member',
 *   invite_url: 'https://yourapp.com/accept-invite'
 * });
 *
 * // Switch to the new tenant
 * await tenantHandler.manage.switchActiveTenant(tenant.data.tenant.id);
 * ```
 *
 * @since 0.6.0
 * @public
 * @group Tenant Management
 */
export class TenantHandler {
  /**
   * Creates a new TenantHandler instance
   *
   * Initializes the handler with the provided Omnibase client and sets up
   * the specialized manager instances for tenant and invitation operations.
   * The client is used for all underlying HTTP requests and authentication.
   *
   * @param omnibaseClient - Configured Omnibase client instance
   *
   * @example
   * ```typescript
   * const client = new OmnibaseClient({
   *   apiKey: 'your-api-key',
   *   baseURL: 'https://api.yourapp.com'
   * });
   * const tenantHandler = new TenantHandler(client);
   * ```
   *
   * @group Tenant Management
   */
  constructor(omnibaseClient: OmnibaseClient) {
    this.invites = new TenantInviteManager(omnibaseClient);
    this.manage = new TenantManger(omnibaseClient);
    this.subscriptions = new TenantSubscriptionManager(omnibaseClient);
    this.user = new TenantUserManager(omnibaseClient);
  }

  /**
   * Tenant user management operations
   *
   * Provides access to operations for managing users within tenants, including
   * removing users from the active tenant. All operations respect user permissions
   * and tenant ownership rules.
   *
   * @example
   * ```typescript
   * // Remove a user from the active tenant
   * await tenantHandler.user.remove({ user_id: 'user_123' });
   * ```
   *
   * @since 0.6.0
   * @group Tenant Management
   */
  public readonly user: TenantUserManager;

  /**
   * Core tenant management operations
   *
   * Provides access to tenant lifecycle operations including creation,
   * deletion, and active tenant switching. All operations respect user
   * permissions and tenant ownership rules.
   *
   * @example
   * ```typescript
   * // Create a new tenant
   * const tenant = await tenantHandler.manage.createTenant({
   *   name: 'New Company',
   *   billing_email: 'billing@newcompany.com',
   *   user_id: 'user_456'
   * });
   *
   * // Switch to the tenant
   * await tenantHandler.manage.switchActiveTenant(tenant.data.tenant.id);
   *
   * // Delete the tenant (owner only)
   * await tenantHandler.manage.deleteTenant(tenant.data.tenant.id);
   * ```
   */
  public readonly manage: TenantManger;

  /**
   * Tenant invitation management operations
   *
   * Provides access to user invitation functionality including creating
   * invitations for new users and accepting existing invitations.
   * Supports role-based access control and secure token-based workflows.
   *
   * @example
   * ```typescript
   * // Create an invitation
   * const invite = await tenantHandler.invites.create({
   *   email: 'newuser@company.com',
   *   role: 'admin',
   *   invite_url: 'https://yourapp.com/accept-invite'
   * });
   *
   * // Accept an invitation (from the invited user's session)
   * const result = await tenantHandler.invites.accept('invite_token_xyz');
   * ```
   */
  public readonly invites: TenantInviteManager;

  /**
   * Tenant subscription and billing management
   *
   * Provides access to subscription data and billing status for the
   * active tenant, including legacy price detection and payment method
   * verification. All operations are automatically scoped to the user's
   * currently active tenant.
   *
   * @example
   * ```typescript
   * // Get active subscriptions
   * const subs = await tenantHandler.subscriptions.getActive();
   *
   * // Check billing status
   * const status = await tenantHandler.subscriptions.getBillingStatus();
   * if (!status.data.has_billing_info) {
   *   console.log('No payment method configured');
   * }
   * ```
   *
   * @since 0.6.0
   * @group Tenant Management
   */
  public readonly subscriptions: TenantSubscriptionManager;
}
