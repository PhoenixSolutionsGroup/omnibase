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
   * @param formData - Form data containing the following fields:\n   *   - user_id (required): ID of the user to remove from the tenant\n   *   - redirect_to (optional): URL to redirect to after successful removal
   *
   * @returns Promise that resolves to success/error state object, or redirects on success
   *
   * @throws {Error} When user_id is missing from form data
   * @throws {Error} When the user removal fails or API returns an error
   *
   * @example
   * Programmatic usage:
   * ```typescript
   * import { omnibase } from '@/lib/omnibase-client';
   *
   * async function handleRemoveUser(userId: string) {
   *   const formData = new FormData();
   *   formData.append('user_id', userId);
   *   formData.append('redirect_to', '/tenants');
   *
   *   try {
   *     const result = await omnibase.tenants.user.remove(null, formData);
   *     // Will redirect on success, or return error state
   *   } catch (error) {
   *     console.error('Failed to remove user:', error);
   *   }
   * }
   * ```
   *
   * @since 1.0.0
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
}
