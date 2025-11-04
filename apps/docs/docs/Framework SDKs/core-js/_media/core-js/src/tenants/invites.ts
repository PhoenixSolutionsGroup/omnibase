import type { OmnibaseClient } from "../client";
import type { ApiResponse } from "../types";

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
 * @since 0.6.0
 * @public
 * @group Tenant Invitations
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
 * @since 0.6.0
 * @public
 * @group Tenant Invitations
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
 * Response structure for tenant user invite creation
 *
 * Contains the newly created invite information including the secure token
 * that will be sent to the invitee. The invite has an expiration time and
 * can only be used once to join the specified tenant.
 *
 * @example
 * ```typescript
 * const response: CreateTenantUserInviteResponse = {
 *   data: {
 *     invite: {
 *       id: 'invite_123',
 *       tenant_id: 'tenant_abc',
 *       email: 'colleague@company.com',
 *       role: 'member',
 *       token: 'inv_secure_token_xyz',
 *       expires_at: '2024-02-15T10:30:00Z'
 *     },
 *     message: 'Invite created successfully'
 *   },
 *   status: 201
 * };
 * ```
 *
 * @since 0.6.0
 * @public
 * @group Tenant Invitations
 */
export type CreateTenantUserInviteResponse = ApiResponse<{
  /** The newly created tenant invite */
  invite: TenantInvite;
  /** Success message confirming invite creation */
  message: string;
}>;

/**
 * Tenant invitation entity structure
 *
 * Represents a pending invitation for a user to join a specific tenant
 * with a defined role. The invite contains a secure token that expires
 * after a certain time period and can only be used once.
 *
 * @example
 * ```typescript
 * const invite: TenantInvite = {
 *   id: 'invite_abc123',
 *   tenant_id: 'tenant_xyz789',
 *   email: 'newuser@company.com',
 *   role: 'member',
 *   token: 'inv_secure_abc123xyz',
 *   inviter_id: 'user_owner123',
 *   expires_at: '2024-02-01T12:00:00Z',
 *   created_at: '2024-01-25T12:00:00Z',
 *   used_at: undefined // null until invite is accepted
 * };
 * ```
 *
 * @since 0.6.0
 * @public
 * @group Tenant Invitations
 */
export type TenantInvite = {
  /** Unique identifier for the invitation */
  id: string;
  /** ID of the tenant the user is being invited to */
  tenant_id: string;
  /** Email address of the invited user */
  email: string;
  /** Role the user will have in the tenant (e.g., 'owner', 'admin', 'member') */
  role: string;
  /** Secure token used to accept the invitation */
  token: string;
  /** ID of the user who created this invitation */
  inviter_id: string;
  /** ISO 8601 timestamp when the invitation expires */
  expires_at: string;
  /** ISO 8601 timestamp when the invitation was created */
  created_at: string;
  /** ISO 8601 timestamp when the invitation was accepted (null if unused) */
  used_at?: string;
};

/**
 * Required data for creating a tenant user invitation
 *
 * Specifies the email address of the user to invite, their intended
 * role within the tenant, and the invitation URL that will be sent in the email.
 * The role determines what permissions the user will have once they accept the invitation.
 * The invite_url will be automatically appended with ?token=XYZ when sent to the user.
 *
 * @example
 * ```typescript
 * const inviteData: CreateTenantUserInviteRequest = {
 *   email: 'developer@company.com',
 *   role: 'admin',
 *   invite_url: 'https://yourapp.com/accept-invite'
 * };
 * ```
 *
 * @since 0.6.0
 * @public
 * @group Tenant Invitations
 */
export type CreateTenantUserInviteRequest = {
  /** Email address of the user to invite */
  email: string;
  /** Role the invited user will have in the tenant */
  role: string;
  /** Invite URL - the link that will be sent to the user's email, automatically suffixed with ?token=XYZ */
  invite_url: string;
};

/**
 * Tenant invitation management handler
 *
 * This class handles all tenant invitation operations including creating
 * invitations for new users and processing invitation acceptances. It provides
 * a secure, email-based invitation workflow with role-based access control
 * and token-based security.
 *
 * The manager handles:
 * - Creating secure invitations with time-limited tokens
 * - Processing invitation acceptances with validation
 * - Email workflow integration (server-side)
 * - Role assignment and permission setup
 * - Security validation and anti-abuse measures
 *
 * All invitation operations respect tenant permissions and ensure that only
 * authorized users can invite others to their tenants.
 *
 * @example
 * ```typescript
 * const inviteManager = new TenantInviteManager(omnibaseClient);
 *
 * // Create an invitation
 * const invite = await inviteManager.create({
 *   email: 'colleague@company.com',
 *   role: 'member',
 *   invite_url: 'https://yourapp.com/accept-invite'
 * });
 *
 * // Accept an invitation (from the invited user's session)
 * const result = await inviteManager.accept('invite_token_xyz');
 * console.log(`Joined tenant: ${result.data.tenant_id}`);
 * ```
 *
 * @since 0.6.0
 * @public
 * @group Tenant Invitations
 */
export class TenantInviteManager {
  /**
   * Creates a new TenantInviteManager instance
   *
   * Initializes the manager with the provided Omnibase client for making
   * authenticated API requests to tenant invitation endpoints.
   *
   * @param omnibaseClient - Configured Omnibase client instance
   *
   * @group Tenant Invitations
   */
  constructor(private omnibaseClient: OmnibaseClient) {}

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
   * @throws {Error} When the token parameter is missing or empty
   * @throws {Error} When the invitation token is invalid or expired
   * @throws {Error} When the invitation has already been accepted
   * @throws {Error} When the user is not authenticated
   * @throws {Error} When the API request fails due to network issues
   * @throws {Error} When the server returns an error response (4xx, 5xx status codes)
   *
   * @example
   * ```typescript
   * // Typically called from an invitation link like:
   * // https://app.com/accept-invite?token=inv_secure_token_abc123
   *
   * const urlParams = new URLSearchParams(window.location.search);
   * const inviteToken = urlParams.get('token');
   *
   * if (inviteToken) {
   *   try {
   *     const result = await inviteManager.accept(inviteToken);
   *
   *     // Success - redirect to tenant dashboard
   *     console.log(`Successfully joined tenant: ${result.data.tenant_id}`);
   *     window.location.href = `/dashboard?tenant=${result.data.tenant_id}`;
   *   } catch (error) {
   *     console.error('Failed to accept invitation:', error.message);
   *   }
   * }
   * ```
   *
   * @since 0.6.0
   * @public
   * @group Tenant Invitations
   */
  async accept(token: string): Promise<AcceptTenantInviteResponse> {
    if (!token) {
      throw new Error("Invite token is required");
    }

    const requestBody = {
      token,
    };

    try {
      const response = await this.omnibaseClient.fetch(
        `/api/v1/tenants/invites/accept`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
          credentials: "include",
        }
      );

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

  /**
   * Creates a new user invitation for the active tenant
   *
   * Generates a secure invitation that allows a user to join the currently active
   * tenant with the defined role. The invitation is sent to the provided email address
   * and includes a time-limited token for security. The invite URL will be automatically
   * appended with ?token=XYZ when sent to the user.
   *
   * The function creates the invitation record in the database and triggers an email
   * notification to the invited user. The invitation expires after 7 days and can only
   * be used once.
   *
   * Only existing tenant members with appropriate permissions (invite_user permission)
   * can create invitations. The inviter's authentication and tenant context are validated
   * via HTTP-only cookies sent with the request.
   *
   * @param inviteData - Configuration object for the invitation
   * @param inviteData.email - Email address of the user to invite
   * @param inviteData.role - Role the user will have after joining (e.g., 'member', 'admin')
   * @param inviteData.invite_url - Base URL for the invitation link (will be appended with ?token=XYZ)
   *
   * @returns Promise resolving to the created invitation with secure token
   *
   * @throws {Error} When required fields (email, role, invite_url) are missing or empty
   * @throws {Error} When the user doesn't have permission to invite users to the tenant
   * @throws {Error} When the API request fails due to network issues
   * @throws {Error} When the server returns an error response (4xx, 5xx status codes)
   *
   * @example
   * ```typescript
   * const invite = await inviteManager.create({
   *   email: 'colleague@company.com',
   *   role: 'member',
   *   invite_url: 'https://yourapp.com/accept-invite'
   * });
   *
   * console.log(`Invite sent to: ${invite.data.invite.email}`);
   * console.log(`Invite token: ${invite.data.invite.token}`);
   * ```
   *
   * @since 0.6.0
   * @public
   * @group Tenant Invitations
   */
  async create(
    inviteData: CreateTenantUserInviteRequest
  ): Promise<CreateTenantUserInviteResponse> {
    if (!inviteData.email || !inviteData.role || !inviteData.invite_url) {
      throw new Error(
        "Missing data in `create` - email, role, and invite_url are required"
      );
    }

    try {
      const response = await this.omnibaseClient.fetch(
        `/api/v1/tenants/invites`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(inviteData),
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(
          `Failed to create invite: ${response.status} - ${errorData}`
        );
      }

      const data = await response.json();
      return data as CreateTenantUserInviteResponse;
    } catch (error) {
      console.error("Error creating tenant user invite:", error);
      throw error;
    }
  }
}
