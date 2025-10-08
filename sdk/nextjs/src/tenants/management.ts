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
 * @since 1.0.0
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
   * Basic usage in a Next.js form:
   * ```typescript
   * import { deleteTenantAction } from '@omnibase/nextjs/tenants';
   * import { useFormState } from 'react-dom';
   *
   * export default function DeleteTenantForm({ tenantId }: { tenantId: string }) {
   *   const [state, formAction] = useFormState(deleteTenantAction, null);
   *
   *   // Form should include:
   *   // - hidden input with name="tenant_id" value={tenantId}
   *   // - hidden input with name="redirect_to" value="/dashboard"
   *   // - submit button
   *   // - error display: {state?.error && <p>Error: {state.error}</p>}
   * }
   * ```
   *
   * @example
   * Using environment variable for redirect:
   * ```typescript
   * // Set OMNIBASE_DELETE_TENANT_REDIRECT_URL=/tenants in your environment
   *
   * export default function DeleteTenantForm({ tenantId }: { tenantId: string }) {
   *   const [state, formAction] = useFormState(deleteTenantAction, null);
   *
   *   // Form only needs tenant_id field - redirect URL comes from env var
   * }
   * ```
   *
   * @example
   * Programmatic usage:
   * ```typescript
   * import { deleteTenantAction } from '@omnibase/nextjs/tenants';
   *
   * async function handleDeleteTenant(tenantId: string) {
   *   const formData = new FormData();
   *   formData.append('tenant_id', tenantId);
   *   formData.append('redirect_to', '/dashboard');
   *
   *   try {
   *     await deleteTenantAction(null, formData);
   *     // Will redirect on success
   *   } catch (error) {
   *     console.error('Failed to delete tenant:', error);
   *   }
   * }
   * ```
   *
   * @since 1.0.0
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
   * Server Action to create a new tenant with authentication and redirect handling
   *
   * @param prevState - Previous action state (required for useActionState compatibility)
   * @param formData - FormData containing the following required fields:
   * - `name` (string) - The tenant name
   * - `billing_email` (string) - Billing email for the tenant
   * - `user_id` (string) - ID of the user creating the tenant
   * - `callback_url` (string, optional) - Redirect URL after successful creation.
   *   If not provided, uses OMNIBASE_ONBOARDING_REDIRECT_URL environment variable
   *
   * @returns On business/user errors, returns `{ success: false, error: string }`.
   * On success, redirects user to callback URL. Server/config errors throw exceptions.
   *
   * @example Client-side usage with useActionState:
   * ```tsx
   * "use client"
   * import { useActionState } from "react"
   * import { createTenantAction } from "@omnibase/nextjs/tenants"
   *
   * export function CreateTenantForm({ userId }: { userId: string }) {
   *   const [state, formAction, isPending] = useActionState(createTenantAction, null)
   *
   *   return (
   *     <form action={formAction}>
   *       <div>
   *         <label htmlFor="name">Tenant Name</label>
   *         <input
   *           id="name"
   *           name="name"
   *           type="text"
   *           required
   *           disabled={isPending}
   *         />
   *       </div>
   *
   *       <div>
   *         <label htmlFor="billing_email">Billing Email</label>
   *         <input
   *           id="billing_email"
   *           name="billing_email"
   *           type="email"
   *           required
   *           disabled={isPending}
   *         />
   *       </div>
   *
   *       <input name="user_id" type="hidden" value={userId} />
   *       <input name="redirect_to" type="hidden" value="/dashboard" />
   *
   *       {state?.error && (
   *         <div className="error" role="alert">
   *           {state.error}
   *         </div>
   *       )}
   *
   *       <button type="submit" disabled={isPending}>
   *         {isPending ? "Creating Tenant..." : "Create Tenant"}
   *       </button>
   *     </form>
   *   )
   * }
   * ```
   */
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
   * Programmatic usage:
   * ```typescript
   * import { omnibase } from '@/lib/omnibase-client';
   *
   * async function createNewTenant(userId: string, name: string, email: string) {
   *   const formData = new FormData();
   *   formData.append('user_id', userId);
   *   formData.append('name', name);
   *   formData.append('billing_email', email);
   *   formData.append('redirect_to', '/dashboard');
   *
   *   try {
   *     await omnibase.tenants.manage.create(null, formData);
   *     // Will redirect on success
   *   } catch (error) {
   *     console.error('Failed to create tenant:', error);
   *   }
   * }
   * ```
   *
   * @since 1.0.0
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
   * Programmatic usage:
   * ```typescript
   * import { omnibase } from '@/lib/omnibase-client';
   *
   * async function handleSwitchTenant(tenantId: string) {
   *   const formData = new FormData();
   *   formData.append('tenant_id', tenantId);
   *
   *   try {
   *     const result = await omnibase.tenants.manage.switch(null, formData);
   *     if (result.success) {
   *       console.log('Successfully switched tenant');
   *       // Optionally navigate to a different page
   *       window.location.href = '/dashboard';
   *     } else {
   *       console.error('Switch failed:', result.error);
   *     }
   *   } catch (error) {
   *     console.error('Failed to switch tenant:', error);
   *   }
   * }
   * ```
   *
   * @since 1.0.0
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
