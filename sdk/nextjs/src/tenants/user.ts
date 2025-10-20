import type { OmnibaseClient } from "@omnibase/core-js";
import { redirect } from "next/navigation";

/**
 * Manager for tenant user server actions
 *
 * This class provides Next.js server actions for managing users within tenants,
 * including removing users from the active tenant. All actions are designed to
 * work seamlessly with Next.js forms and the React useActionState hook, providing
 * automatic form validation and optional redirect handling.
 *
 * User management operations require appropriate permissions and will fail if the
 * requesting user doesn't have sufficient privileges (typically admin or owner role).
 *
 * @example
 * Using in a server component:
 * ```typescript
 * import { omnibase } from '@/lib/omnibase-client';
 *
 * export default async function TenantUsersPage() {
 *   const removeUserAction = omnibase.tenants.user.remove;
 *
 *   return (
 *     <div>
 *       <RemoveUserForm action={removeUserAction} />
 *     </div>
 *   );
 * }
 * ```
 *
 * @since 0.5.1
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
   * Next.js server action for removing a user from a tenant
   *
   * This server action handles the complete user removal workflow, including form
   * validation, API calls, and optional redirection. When a user is successfully
   * removed, they lose access to the tenant and all its resources.
   *
   * The action expects a FormData object with a 'user_id' field (required) and
   * optionally a 'redirect_to' field. If no redirect URL is provided, the action
   * returns a success state object instead.
   *
   * @param prevState - Previous state from useActionState hook (can be any type)
   * @param formData - Form data containing the following fields:
   *   - user_id (required): ID of the user to remove from the tenant
   *   - redirect_to (optional): URL to redirect to after successful removal
   *
   * @returns Promise that resolves to success/error state object, or redirects on success
   *
   * @throws {Error} When user_id is missing from form data
   * @throws {Error} When the user removal fails or API returns an error
   *
   * @example
   * Using in a server component:
   * ```typescript
   * // In your page.tsx (server component)
   * import { omnibase } from '@/lib/server';
   * import { TenantActionsHandler } from '@omnibase/nextjs/tenants';
   *
   * const actions = new TenantActionsHandler(omnibase);
   *
   * export default async function TenantsPage() {
   *   return (
   *     <RemoveTenantUserForm
   *       action={async (prevState: any, formData: FormData) => {
   *         'use server';
   *         return actions.user.remove(prevState, formData);
   *       }}
   *     />
   *   );
   * }
   * ```
   *
   * @since 0.5.1
   * @public
   * @group Tenant User Management
   */
  async remove(prevState: any, formData: FormData) {
    const redirectUrl = formData.get("redirect_to") as string | null;
    const user_id = formData.get("user_id") as string;

    if (!user_id) throw new Error("user_id must be submitted in form");

    const response = await this.omnibaseClient.tenants.user.remove({
      user_id,
    });

    if (response.error) {
      return { success: false, error: response.error };
    }

    if (redirectUrl) redirect(redirectUrl);
    else
      return {
        success: true,
      };
  }

  /**
   * Next.js server action for updating a user's role within a tenant
   *
   * This server action handles the complete role update workflow, including form
   * validation, API calls, and optional redirection. When a user's role is successfully
   * updated, their permissions and access rights within the tenant are immediately modified.
   *
   * The action expects a FormData object with 'user_id' and 'role' fields (both required)
   * and optionally a 'redirect_to' field. If no redirect URL is provided, the action
   * returns a success state object instead.
   *
   * @param prevState - Previous state from useActionState hook (can be any type)
   * @param formData - Form data containing the following fields:
   *   - user_id (required): ID of the user whose role is being updated
   *   - role (required): New role to assign (e.g., 'admin', 'member', 'viewer')
   *   - redirect_to (optional): URL to redirect to after successful role update
   *
   * @returns Promise that resolves to success/error state object, or redirects on success
   *
   * @throws {Error} When user_id or role is missing from form data
   * @throws {Error} When the role update fails or API returns an error
   *
   * @example
   * Using in a server component:
   * ```typescript
   * // In your page.tsx (server component)
   * import { omnibase } from '@/lib/server';
   * import { TenantActionsHandler } from '@omnibase/nextjs/tenants';
   *
   * const actions = new TenantActionsHandler(omnibase);
   *
   * export default async function TenantsPage() {
   *   return (
   *     <UpdateRoleForm
   *       action={async (prevState: any, formData: FormData) => {
   *         'use server';
   *         return actions.user.updateRole(prevState, formData);
   *       }}
   *     />
   *   );
   * }
   * ```
   *
   * @since 0.5.1
   * @public
   * @group Tenant User Management
   */
  async updateRole(prevState: any, formData: FormData) {
    const redirectUrl = formData.get("redirect_to") as string | undefined;
    const user_id = formData.get("user_id") as string | undefined;
    const role = formData.get("role") as string | undefined;

    if (!user_id || !role)
      throw new Error("user_id and role must be sent inside formdata");

    const response = await this.omnibaseClient.tenants.user.updateRole({
      role,
      user_id,
    });

    if (response.error) {
      return { success: false, error: response.error };
    }

    if (redirectUrl) redirect(redirectUrl);
    else
      return {
        success: true,
      };
  }
}
