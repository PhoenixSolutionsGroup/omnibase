import type { OmnibaseClient } from "@omnibase/core-js";
import type { CreateTenantRequest } from "@omnibase/core-js/tenants";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Manager for tenant lifecycle server actions
 *
 * This class provides Next.js server actions for managing tenant operations including
 * creation, deletion, and switching between tenants. All methods are designed to work
 * seamlessly with Next.js forms and the React useActionState hook, handling form
 * validation, API communication, JWT token management in HTTP-only cookies, and
 * automatic redirects.
 *
 * Each action follows a consistent pattern:
 * 1. Extract and validate form data
 * 2. Call the OmniBase API
 * 3. Handle errors with user-friendly messages
 * 4. Update JWT token in cookies (if applicable)
 * 5. Redirect to success page or return error state
 *
 * @example
 * Using tenant management in a server component:
 * ```typescript
 * import { omnibase } from '@/lib/omnibase-client';
 *
 * export default async function TenantPage() {
 *   return (
 *     <div>
 *       <CreateTenantForm action={omnibase.tenants.manage.create} />
 *       <DeleteTenantButton action={omnibase.tenants.manage.delete} />
 *       <TenantSwitcher action={omnibase.tenants.manage.switch} />
 *     </div>
 *   );
 * }
 * ```
 *
 * @since 0.5.1
 * @public
 * @group Tenant Management
 */
export class TenantManagementManager {
  /**
   * Creates a new tenant management manager
   *
   * @param omnibaseClient - Configured OmnibaseClient instance for API communication
   *
   * @group Tenant Management
   */
  constructor(private omnibaseClient: OmnibaseClient) {}

  /**
   * Next.js server action for deleting a tenant
   *
   * This server action handles the complete tenant deletion workflow, including
   * form validation, API calls, cookie management, and redirection. It permanently
   * removes a tenant and all associated data, clears the authentication token,
   * and redirects the user to a specified URL.
   *
   * The action expects a FormData object with a 'tenant_id' field and optionally
   * a 'redirect_to' field. If no redirect URL is provided in the form, it will
   * use the OMNIBASE_DELETE_TENANT_REDIRECT_URL environment variable.
   *
   * @param prevState - Previous state from useFormState hook (can be any type)
   * @param formData - Form data containing tenant_id and optional redirect_to fields
   *
   * @returns Promise that resolves to success/error state object, or redirects on success
   *
   * @throws {Error} When tenant_id is missing from form data
   * @throws {Error} When no redirect URL is available (form field or env var)
   * @throws {Error} When tenant deletion fails or returns no data
   * @throws {Error} When any other error occurs during the process
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
   *     <DeleteTenantForm
   *       action={async (prevState: any, formData: FormData) => {
   *         'use server';
   *         return actions.manage.delete(prevState, formData);
   *       }}
   *     />
   *   );
   * }
   * ```
   *
   * @since 0.5.1
   * @public
   * @group Server Actions
   */
  async delete(prevState: any, formData: FormData) {
    try {
      const tenant_id = extractTenantIdFormData(formData);
      const redirectUrl = getRedirectToUrl(formData);
      const response = await this.omnibaseClient.tenants.manage.deleteTenant(
        tenant_id
      );

      if (response.error) {
        return { success: false, error: response.error };
      }
      if (!response.data) {
        throw new Error(
          "Response was not an error, but no data was retrieved from deleteTenant"
        );
      }

      const c = await cookies();
      c.set("omnibase_postgrest_jwt", "");

      redirect(redirectUrl);
    } catch (error: any) {
      throw new Error(error.message ?? "Unknown Error");
    }
  }

  /**
   * Next.js server action for creating a new tenant
   *
   * This server action handles the complete tenant creation workflow, including form
   * validation, API calls, Stripe billing setup, JWT token management, and redirection.
   * When a tenant is created, the user becomes the owner and receives a new JWT token
   * with the tenant context, which is automatically stored in HTTP-only cookies.
   *
   * The action expects a FormData object with 'name', 'billing_email', and 'user_id'
   * fields, plus optionally a 'redirect_to' field. If no redirect URL is provided,
   * it will use the OMNIBASE_DELETE_TENANT_REDIRECT_URL environment variable.
   *
   * @param prevState - Previous state from useActionState hook (can be any type)
   * @param formData - Form data containing the following fields:
   *   - name (required): Display name for the tenant
   *   - billing_email (required): Email address for billing notifications
   *   - user_id (required): ID of the user creating the tenant (becomes owner)
   *   - redirect_to (optional): URL to redirect to after successful creation
   *
   * @returns Promise that resolves to success/error state object, or redirects on success
   *
   * @throws {Error} When required fields (name, billing_email, user_id) are missing
   * @throws {Error} When no redirect URL is available (form field or env var)
   * @throws {Error} When tenant creation fails or returns no data
   * @throws {Error} When any other error occurs during the process
   *
   * @example
   * Using in a server component:
   * ```typescript
   * // In your page.tsx (server component)
   * import { omnibase } from '@/lib/server';
   * import { TenantActionsHandler } from '@omnibase/nextjs/tenants';
   * import { getServerSession } from '@omnibase/nextjs/auth';
   *
   * const actions = new TenantActionsHandler(omnibase);
   *
   * export default async function TenantsPage() {
   *   const session = await getServerSession();
   *
   *   return (
   *     <CreateTenantForm
   *       action={async (prevState: any, formData: FormData) => {
   *         'use server';
   *         formData.set('user_id', session.identity?.id!);
   *         return actions.manage.create(prevState, formData);
   *       }}
   *     />
   *   );
   * }
   * ```
   *
   * @since 0.5.1
   * @public
   * @group Server Actions
   */
  async create(prevState: any, formData: FormData) {
    const tenantData = extractTenantFormData(formData);
    const redirectUrl = getRedirectToUrl(formData);
    try {
      const response = await this.omnibaseClient.tenants.manage.createTenant(
        tenantData
      );

      if (response.error) {
        return { success: false, error: response.error };
      }
      if (!response.data) {
        throw new Error(
          "Response was not an error, but no data was retrieved from `createTenant`"
        );
      }

      const c = await cookies();
      c.set("omnibase_postgrest_jwt", response.data.token);
    } catch (error: any) {
      throw new Error(error.message ?? "Unknown Error");
    }
    redirect(redirectUrl);
  }

  /**
   * Next.js server action for switching the active tenant
   *
   * This server action allows users to switch between tenants they belong to. It handles
   * the complete switching workflow including validation, API calls, and JWT token updates.
   * The new JWT token with the selected tenant context is automatically stored in cookies.
   *
   * Unlike create and delete actions, this action does NOT redirect but returns a success
   * state, allowing you to handle the UI update (like closing a dropdown) before optionally
   * navigating to a different page.
   *
   * @param prevState - Previous state from useActionState hook (can be any type)
   * @param formData - Form data containing the following field:
   *   - tenant_id (required): ID of the tenant to switch to
   *
   * @returns Promise resolving to { success: true, message: string } on success,
   *          or { success: false, error: string } on failure
   *
   * @throws {Error} When tenant_id is missing from form data
   * @throws {Error} When tenant switching fails or returns no data
   * @throws {Error} When any other error occurs during the process
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
   *     <SwitchTenantForm
   *       action={async (prevState: any, formData: FormData) => {
   *         'use server';
   *         return actions.manage.switch(prevState, formData);
   *       }}
   *     />
   *   );
   * }
   * ```
   *
   * @since 0.5.1
   * @public
   * @group Server Actions
   */
  async switch(prevState: any, formData: FormData) {
    try {
      const tenant_id = extractTenantIdFormData(formData);
      const response =
        await this.omnibaseClient.tenants.manage.switchActiveTenant(tenant_id);

      if (response.error) {
        return { success: false, error: response.error };
      }
      if (!response.data) {
        throw new Error(
          "Response was not an error, but no data was retrieved from switchActiveTenant"
        );
      }

      const c = await cookies();
      c.set("omnibase_postgrest_jwt", response.data.token);

      return { success: true, message: "Successfully switched" };
    } catch (error: any) {
      throw new Error(error.message ?? "Unknown Error");
    }
  }
}

/**
 * Extracts and validates the tenant_id from form data
 *
 * This helper function validates that the required 'tenant_id' field is present
 * in the form data and returns it.
 *
 * @param formData - Form data containing the tenant_id
 *
 * @returns The validated tenant ID string
 *
 * @throws {Error} When tenant_id is missing from form data
 *
 * @internal
 */
function extractTenantIdFormData(formData: FormData) {
  const tenant_id = formData.get("tenant_id") as string;
  if (!tenant_id) throw new Error("Missing required field: tenant_id");
  return tenant_id;
}

/**
 * Extracts the redirect URL from form data or environment variables
 *
 * This helper function determines where to redirect the user after a successful
 * tenant operation. It first checks the form data for a 'redirect_to' field,
 * then falls back to the OMNIBASE_DELETE_TENANT_REDIRECT_URL environment variable.
 *
 * @param formData - Form data that may contain a redirect_to field
 *
 * @returns The redirect URL to use
 *
 * @throws {Error} When no redirect URL is found in form data or environment variables
 *
 * @internal
 */
const getRedirectToUrl = (formData: FormData) => {
  const url =
    (formData.get("redirect_to") as string | null) ||
    process.env.OMNIBASE_DELETE_TENANT_REDIRECT_URL;
  if (!url)
    throw new Error(
      "Either set `redirect_to` in the form or set OMNIBASE_DELETE_TENANT_REDIRECT_URL in env variables"
    );

  return url;
};

/**
 * Extracts and validates tenant creation data from form data
 *
 * This helper function validates that all required fields for tenant creation
 * (name, billing_email, user_id) are present in the form data and returns them
 * in a structured format.
 *
 * @param formData - Form data containing tenant creation fields
 *
 * @returns Validated CreateTenantRequest object
 *
 * @throws {Error} When any required field is missing from form data
 *
 * @internal
 */
const extractTenantFormData = (formData: FormData): CreateTenantRequest => {
  const name = formData.get("name") as string;
  const billing_email = formData.get("billing_email") as string;
  const user_id = formData.get("user_id") as string;

  if (!name || !billing_email || !user_id) {
    throw new Error("Missing required fields: name, billing_email, user_id");
  }

  return {
    name,
    billing_email,
    user_id,
  };
};
