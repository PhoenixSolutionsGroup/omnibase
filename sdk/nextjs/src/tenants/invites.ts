import type { OmnibaseClient } from "@omnibase/core-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Manager for tenant invitation server actions
 *
 * This class provides Next.js server actions for handling tenant invitations,
 * including secure token validation, JWT token management, and automatic redirects.
 * It integrates seamlessly with Next.js forms and the React useActionState hook.
 *
 * The invitation system allows users to be invited to existing tenants via a secure
 * token. When a user accepts an invitation, they are added to the tenant and receive
 * a new JWT token with the appropriate tenant context, which is automatically stored
 * in HTTP-only cookies.
 *
 * @since 1.0.0
 * @public
 * @group Tenant Invitations
 */
export class TenantInviteManager {
  /**
   * Creates a new tenant invite manager
   *
   * @param omnibaseClient - Configured OmnibaseClient instance for API communication
   *
   * @group Tenant Invitations
   */
  constructor(private omnibaseClient: OmnibaseClient) {}

  /**
   * Next.js server action for accepting a tenant invitation
   *
   * This server action handles the complete invitation acceptance workflow, including
   * token validation, API calls, JWT token storage in cookies, and redirection. When
   * a user accepts an invitation, they are added to the tenant and receive a new
   * authentication token with the tenant context.
   *
   * The action expects a FormData object with a 'token' field (the secure invitation
   * token) and optionally a 'redirect_to' field. If no redirect URL is provided in
   * the form, it will use the OMNIBASE_ACCEPT_TENANT_INVITE_REDIRECT_URL environment
   * variable.
   *
   * @param prevState - Previous state from useActionState hook (can be any type)
   * @param formData - Form data containing the following fields:
   *   - token (required): The secure invitation token received via email or link
   *   - redirect_to (optional): URL to redirect to after successful acceptance
   *
   * @returns Promise that resolves to success/error state object, or redirects on success
   *
   * @throws {Error} When token is missing from form data
   * @throws {Error} When no redirect URL is available (form field or env var)
   * @throws {Error} When invitation acceptance fails or returns no data
   * @throws {Error} When any other error occurs during the process
   *
   * @example
   * Programmatic usage:
   * ```typescript
   * import { omnibase } from '@/lib/omnibase-client';
   *
   * async function handleAcceptInvite(token: string) {
   *   const formData = new FormData();
   *   formData.append('token', token);
   *   formData.append('redirect_to', '/dashboard');
   *
   *   try {
   *     await omnibase.tenants.invites.accept(null, formData);
   *     // Will redirect on success
   *   } catch (error) {
   *     console.error('Failed to accept invitation:', error);
   *   }
   * }
   * ```
   *
   * @since 1.0.0
   * @public
   * @group Tenant Invitations
   */
  async accept(prevState: any, formData: FormData) {
    const redirectUrl = getRedirectToUrl(formData);
    try {
      const acceptTenantInviteData = extractAcceptTenantInviteData(formData);
      const response = await this.omnibaseClient.tenants.invites.accept(
        acceptTenantInviteData.token
      );

      if (response.error) {
        return { success: false, error: response.error };
      }
      if (!response.data) {
        throw new Error(
          "Response was not an error, but no data was retrieved from `accept`"
        );
      }

      const c = await cookies();
      c.set("omnibase_postgrest_jwt", response.data.token);
    } catch (error: any) {
      throw new Error(error.message ?? "Unknown Error");
    }
    if (redirectUrl) redirect(redirectUrl);
  }

  /**
   * Next.js server action for creating a tenant invitation
   *
   * This server action creates a new invitation for a user to join the active tenant.
   * An email notification is automatically sent to the invited user with a secure
   * invitation link. The action validates all required fields and returns success/error
   * state suitable for use with React's useActionState hook.
   *
   * @param prevState - Previous state from useActionState hook (can be any type)
   * @param formData - Form data containing the following fields:
   *   - email (required): Email address of the user being invited
   *   - role (required): Role to assign to the invited user (e.g., 'admin', 'member')
   *   - invite_url (required): Base URL for the invitation acceptance page
   *
   * @returns Promise resolving to success/error state object
   *
   * @throws {Error} When required fields (email, role, invite_url) are missing
   * @throws {Error} When the invitation creation fails or API returns an error
   *
   * @example
   * Using with a form component:
   * ```typescript
   * 'use client';
   *
   * import { useActionState } from 'react';
   *
   * export function InviteUserForm({ action }: { action: any }) {
   *   const [state, formAction] = useActionState(action, null);
   *
   *   return (
   *     <form action={formAction}>
   *       <input
   *         type="email"
   *         name="email"
   *         placeholder="user@example.com"
   *         required
   *       />
   *       <select name="role" required>
   *         <option value="member">Member</option>
   *         <option value="admin">Admin</option>
   *       </select>
   *       <input
   *         type="hidden"
   *         name="invite_url"
   *         value="https://app.example.com/invites"
   *       />
   *       <button type="submit">Send Invitation</button>
   *       {state?.error && <p className="error">{state.error}</p>}
   *       {state?.success && <p className="success">Invitation sent!</p>}
   *     </form>
   *   );
   * }
   * ```
   *
   * @since 1.0.0
   * @public
   * @group Tenant Invitations
   */
  async create(prevState: any, formData: FormData) {
    try {
      const data = extractCreateTenantInviteData(formData);
      const response = await this.omnibaseClient.tenants.invites.create({
        email: data.email,
        role: data.role,
        invite_url: data.invite_url,
      });

      if (response.error) {
        return { success: false, error: response.error };
      }
      if (!response.data) {
        throw new Error(
          "Response was not an error, but no data was retrieved from `create`"
        );
      }

      return { success: true };
    } catch (error: any) {
      throw new Error(error.message ?? "Unknown Error");
    }
  }
}

const getRedirectToUrl = (formData: FormData): string | null => {
  return formData.get("redirect_to") as string | null;
};

/**
 * Extracts and validates the invitation token from form data
 *
 * This helper function validates that the required 'token' field is present
 * in the form data and returns it in a structured format.
 *
 * @param formData - Form data containing the invitation token
 *
 * @returns Object containing the validated token
 *
 * @throws {Error} When the token field is missing from form data
 *
 * @internal
 */
const extractAcceptTenantInviteData = (
  formData: FormData
): { token: string } => {
  const token = formData.get("token") as string;
  if (!token) {
    throw new Error("Missing required fields: token");
  }

  return {
    token,
  };
};

/**
 * Extracts and validates tenant invitation data from form data
 *
 * This helper function validates that all required fields for creating a tenant
 * invitation are present in the form data and returns them in a structured format.
 *
 * @param formData - Form data containing the invitation details
 *
 * @returns Object containing the validated invitation data
 *
 * @throws {Error} When any required field (email, role, invite_url) is missing
 *
 * @internal
 */
const extractCreateTenantInviteData = (formData: FormData) => {
  const invite_url = formData.get("invite_url") as string;
  const email = formData.get("email") as string;
  const role = formData.get("role") as string;

  if (!email || !role || !invite_url) {
    throw new Error("Missing required fields: invite_url, email, role");
  }

  return {
    invite_url,
    email,
    role,
  };
};
