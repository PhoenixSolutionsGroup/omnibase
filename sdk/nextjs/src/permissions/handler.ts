import type { OmnibaseClient } from "@omnibase/core-js";
import { RelationshipHandler } from "./relationship";

/**
 * Main handler for permission-related server actions in Next.js
 *
 * This class provides access to permission management functionality designed
 * to work seamlessly with Next.js server actions and React Server Components.
 * It acts as a container for specialized handlers that manage different aspects
 * of permissions, currently focused on relationship-based permissions via Ory Keto.
 *
 * The handler is designed to be used in server-side contexts only, as it requires
 * the OmnibaseClient which contains server-only authentication and API access.
 *
 * @example
 * Basic initialization and usage:
 * ```typescript
 * import { PermissionActionsHandler } from '@omnibase/nextjs/permissions';
 * import { createServerClient } from '@omnibase/nextjs';
 *
 * const client = createServerClient();
 * const permissions = new PermissionActionsHandler(client);
 *
 * // Access relationship management
 * export const createRelationship = permissions.relationship.create.bind(
 *   permissions.relationship
 * );
 * export const deleteRelationship = permissions.relationship.delete.bind(
 *   permissions.relationship
 * );
 * ```
 *
 * @example
 * Using in a Next.js server component:
 * ```typescript
 * // app/admin/permissions/page.tsx
 * import { PermissionActionsHandler } from '@omnibase/nextjs/permissions';
 * import { createServerClient } from '@omnibase/nextjs';
 *
 * export default function PermissionsPage() {
 *   const client = createServerClient();
 *   const permissions = new PermissionActionsHandler(client);
 *
 *   return (
 *     <form action={permissions.relationship.create.bind(permissions.relationship)}>
 *       <input name="namespace" placeholder="tenants" />
 *       <input name="object" placeholder="tenant:123" />
 *       <input name="relation" placeholder="member" />
 *       <input name="subject_id" placeholder="user:456" />
 *       <button type="submit">Grant Permission</button>
 *     </form>
 *   );
 * }
 * ```
 *
 * @since 1.0.0
 * @public
 * @group Permissions
 */
export class PermissionActionsHandler {
  /**
   * Handler for relationship-based permission operations
   *
   * Provides methods to create and delete permission relationships between
   * subjects (users) and objects (resources). Uses Ory Keto's relationship
   * tuple model for fine-grained access control.
   *
   * @example
   * ```typescript
   * const permissions = new PermissionActionsHandler(client);
   *
   * // Use the relationship handler
   * const createAction = permissions.relationship.create.bind(
   *   permissions.relationship
   * );
   * ```
   */
  public relationship: RelationshipHandler;

  /**
   * Creates a new PermissionActionsHandler instance
   *
   * Initializes the permission handler with the provided Omnibase client,
   * setting up access to relationship management and other permission-related
   * operations. This should be instantiated server-side only.
   *
   * @param omnibaseClient - The Omnibase client instance with server-side authentication
   *
   * @example
   * ```typescript
   * import { createServerClient } from '@omnibase/nextjs';
   * import { PermissionActionsHandler } from '@omnibase/nextjs/permissions';
   *
   * const client = createServerClient();
   * const permissions = new PermissionActionsHandler(client);
   * ```
   *
   * @since 1.0.0
   * @group Permissions
   */
  constructor(omnibaseClient: OmnibaseClient) {
    this.relationship = new RelationshipHandler(omnibaseClient);
  }
}
