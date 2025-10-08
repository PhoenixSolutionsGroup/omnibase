import type { OmnibaseClient } from "@omnibase/core-js";
import { TenantManagementManager } from "./management";
import { TenantInviteManager } from "./invites";

/**
 * Main handler for tenant-related server actions
 *
 * This class serves as the entry point for all tenant operations in Next.js server
 * components and server actions. It provides access to tenant management operations
 * (create, delete, switch) and invitation handling through organized sub-managers.
 *
 * The handler is designed to work seamlessly with Next.js server actions and the
 * React useActionState hook, providing automatic form validation, cookie management,
 * and redirection handling.
 *
 * @example
 * Using the tenant handler in a server component:
 * ```typescript
 * import { omnibase } from '@/lib/omnibase-client';
 *
 * export default async function TenantManagementPage() {
 *   // Access tenant management actions
 *   const createAction = omnibase.tenants.manage.create;
 *   const switchAction = omnibase.tenants.manage.switch;
 *
 *   // Access invitation actions
 *   const acceptInviteAction = omnibase.tenants.invites.accept;
 *
 *   return (
 *     <div>
 *       <CreateTenantForm action={createAction} />
 *       <TenantSwitcher action={switchAction} />
 *     </div>
 *   );
 * }
 * ```
 *
 * @since 1.0.0
 * @public
 * @group Tenant Handler
 */
export class TenantActionsHandler {
  /**
   * Creates a new tenant actions handler
   *
   * This constructor initializes the handler with an OmnibaseClient instance,
   * which is used to communicate with the OmniBase API for all tenant operations.
   * The handler creates sub-managers for different tenant operation categories.
   *
   * @param omnibaseClient - Configured OmnibaseClient instance with API credentials
   *
   * @example
   * ```typescript
   * import { OmnibaseClient } from '@omnibase/core-js';
   * import { TenantActionsHandler } from '@omnibase/nextjs/tenants';
   *
   * const client = new OmnibaseClient({
   *   apiKey: process.env.OMNIBASE_API_KEY!,
   *   baseUrl: process.env.OMNIBASE_API_URL
   * });
   *
   * const tenantHandler = new TenantActionsHandler(client);
   * ```
   *
   * @group Tenant Handler
   */
  constructor(omnibaseClient: OmnibaseClient) {
    this.manage = new TenantManagementManager(omnibaseClient);
    this.invites = new TenantInviteManager(omnibaseClient);
  }

  /**
   * Tenant management operations manager
   *
   * Provides access to server actions for creating, deleting, and switching
   * between tenants. All methods are designed to work with Next.js forms and
   * the useActionState hook.
   *
   * @example
   * ```typescript
   * // Create a new tenant
   * const createAction = tenantHandler.manage.create;
   *
   * // Delete a tenant
   * const deleteAction = tenantHandler.manage.delete;
   *
   * // Switch active tenant
   * const switchAction = tenantHandler.manage.switch;
   * ```
   *
   * @group Tenant Handler
   */
  manage: TenantManagementManager;

  /**
   * Tenant invitation operations manager
   *
   * Provides access to server actions for handling tenant invitations,
   * including accepting invites with secure token validation.
   *
   * @example
   * ```typescript
   * // Accept a tenant invitation
   * const acceptAction = tenantHandler.invites.accept;
   * ```
   *
   * @group Tenant Handler
   */
  invites: TenantInviteManager;
}
