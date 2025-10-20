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
 * ```typescript
 * // app/server/permissions/page.tsx
 * import { PermissionActionsHandler } from '@omnibase/nextjs/permissions';
 * import { OmnibaseClient } from '@omnibase/core-js';
 *
 * const omnibase = new OmnibaseClient({ api_url: process.env.OMNIBASE_API_URL! });
 * const permissions = new PermissionActionsHandler(omnibase);
 *
 * export default function PermissionsPage() {
 *   return (
 *     <form action={async (prevState, formData) => {
 *       'use server';
 *       return permissions.relationship.create(prevState, formData);
 *     }}>
 *       <input name="namespace" defaultValue="Tenant" />
 *       <input name="object" placeholder="tenant_123" />
 *       <input name="relation" placeholder="members" />
 *       <input name="subject_id" placeholder="user_456" />
 *       <button type="submit">Grant Permission</button>
 *     </form>
 *   );
 * }
 * ```
 *
 * @since 0.5.1
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
   * import { OmnibaseClient } from '@omnibase/core-js';
   * import { PermissionActionsHandler } from '@omnibase/nextjs/permissions';
   *
   * const omnibase = new OmnibaseClient({ api_url: process.env.OMNIBASE_API_URL! });
   * const permissions = new PermissionActionsHandler(omnibase);
   * ```
   *
   * @since 0.5.1
   * @group Permissions
   */
  constructor(omnibaseClient: OmnibaseClient) {
    this.relationship = new RelationshipHandler(omnibaseClient);
  }
}
