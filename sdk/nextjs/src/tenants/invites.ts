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
    redirect(redirectUrl);
  }

  async create(prevState: any, formData: FormData) {
    try {
      const data = extractCreateTenantInviteData(formData);
      const response = await this.omnibaseClient.tenants.invites.create(
        data.tenant_id,
        {
          email: data.email,
          role: data.role,
        }
      );

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

/**
 * Extracts the redirect URL from form data or environment variables
 *
 * This helper function determines where to redirect the user after successfully
 * accepting a tenant invitation. It first checks the form data for a 'redirect_to'
 * field, then falls back to the OMNIBASE_ACCEPT_TENANT_INVITE_REDIRECT_URL
 * environment variable.
 *
 * @param formData - Form data that may contain a redirect_to field
 *
 * @returns The redirect URL to use
 *
 * @throws {Error} When no redirect URL is found in form data or environment variables
 *
 * @internal
 */
const getRedirectToUrl = (formData: FormData): string => {
  const url =
    (formData.get("redirect_to") as string | null) ||
    process.env.OMNIBASE_ACCEPT_TENANT_INVITE_REDIRECT_URL;
  if (!url)
    throw new Error(
      "Either set `redirect_to` in the form or set OMNIBASE_ACCEPT_TENANT_INVITE_REDIRECT_URL in env variables"
    );

  return url;
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

const extractCreateTenantInviteData = (formData: FormData) => {
  const tenant_id = formData.get("tenant_id") as string;
  const email = formData.get("email") as string;
  const role = formData.get("role") as string;

  if (!tenant_id || !email || !role) {
    throw new Error("Missing required fields: tenant_id, email, role");
  }

  return {
    tenant_id,
    email,
    role,
  };
};
