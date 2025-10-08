import type { ApiResponse } from "./types";

/**
 * Request data for accepting a tenant invitation
 *
 * Contains the secure token that was provided in the invitation.
 * This token is validated server-side to ensure the invitation
 * is legitimate, not expired, and hasn't been used before.
 *
 * @example
 * ```typescript
 * const acceptData: AcceptTenantInviteRequest = {
 *   token: 'inv_secure_token_abc123xyz'
 * };
 * ```
 *
 * @since 1.0.0
 * @public
 * @group User Management
 */
export type AcceptTenantInviteRequest = {
  /** Secure invitation token from the email invitation */
  token: string;
};

/**
 * Response structure for accepting a tenant invitation
 *
 * Contains the ID of the tenant that the user has successfully joined
 * along with a confirmation message. After accepting an invitation,
 * the user becomes a member of the tenant with the role specified
 * in the original invitation.
 *
 * @example
 * ```typescript
 * const response: AcceptTenantInviteResponse = {
 *   data: {
 *     tenant_id: 'tenant_abc123',
 *     message: 'Successfully joined tenant'
 *   },
 *   status: 200
 * };
 * ```
 *
 * @since 1.0.0
 * @public
 * @group User Management
 */
export type AcceptTenantInviteResponse = ApiResponse<{
  /** ID of the tenant the user has joined */
  tenant_id: string;
  /** Success message confirming the invitation acceptance */
  message: string;
  /** JWT token for postgrest RLS */
  token: string;
}>;

/**
 * Accepts a tenant invitation using a secure token
 *
 * Processes a tenant invitation by validating the provided token and
 * adding the authenticated user to the specified tenant. The invitation
 * token is consumed during this process and cannot be used again.
 *
 * The function performs several validations:
 * - Verifies the token exists and is valid
 * - Checks that the invitation hasn't expired
 * - Ensures the invitation hasn't already been used
 * - Confirms the user is authenticated via session cookies
 *
 * Upon successful acceptance, the user is granted access to the tenant
 * with the role specified in the original invitation. The invitation
 * record is marked as used and cannot be accepted again.
 *
 * @param token - The secure invitation token from the email invitation
 *
 * @returns Promise resolving to the tenant ID and success confirmation
 *
 * @throws {Error} When OMNIBASE_API_URL environment variable is not configured
 * @throws {Error} When the token parameter is missing or empty
 * @throws {Error} When the invitation token is invalid or expired
 * @throws {Error} When the invitation has already been accepted
 * @throws {Error} When the user is not authenticated
 * @throws {Error} When the API request fails due to network issues
 * @throws {Error} When the server returns an error response (4xx, 5xx status codes)
 *
 * @example
 * Basic invitation acceptance:
 * ```typescript
 * const result = await acceptTenantInvite('inv_secure_token_abc123');
 *
 * console.log(`Successfully joined tenant: ${result.data.tenant_id}`);
 * // User can now access tenant resources
 * await switchActiveTenant(result.data.tenant_id);
 * ```
 *
 * @example
 * Handling the invitation flow:
 * ```typescript
 * // Typically called from an invitation link like:
 * // https://app.com/accept-invite?token=inv_secure_token_abc123
 *
 * const urlParams = new URLSearchParams(window.location.search);
 * const inviteToken = urlParams.get('token');
 *
 * if (inviteToken) {
 *   try {
 *     const result = await acceptTenantInvite(inviteToken);
 *
 *     // Success - redirect to tenant dashboard
 *     window.location.href = `/dashboard?tenant=${result.data.tenant_id}`;
 *   } catch (error) {
 *     console.error('Failed to accept invitation:', error.message);
 *     // Show error to user
 *   }
 * }
 * ```
 *
 *
 * @since 1.0.0
 * @public
 * @group User Management
 */
export async function acceptTenantInvite(
  token: string
): Promise<AcceptTenantInviteResponse> {
  const baseUrl = process.env.OMNIBASE_API_URL;

  if (!baseUrl) {
    throw new Error("OMNIBASE_API_URL is not configured");
  }

  if (!token) {
    throw new Error("Invite token is required");
  }

  const requestBody = {
    token,
  };

  try {
    const response = await fetch(`${baseUrl}/api/v1/tenants/invites/accept`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(
        `Failed to accept invite: ${response.status} - ${errorData}`
      );
    }

    const data = await response.json();
    return data as AcceptTenantInviteResponse;
  } catch (error) {
    console.error("Error accepting tenant invite:", error);
    throw error;
  }
}
