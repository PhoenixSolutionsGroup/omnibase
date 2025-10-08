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
 * @since 1.0.0
 * @public
 * @group User Management
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
 * @since 1.0.0
 * @public
 * @group User Management
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
 * Specifies the email address of the user to invite and their intended
 * role within the tenant. The role determines what permissions the user
 * will have once they accept the invitation.
 *
 * @example
 * ```typescript
 * const inviteData: CreateTenantUserInviteRequest = {
 *   email: 'developer@company.com',
 *   role: 'admin'
 * };
 * ```
 *
 * @since 1.0.0
 * @public
 * @group User Management
 */
export type CreateTenantUserInviteRequest = {
  /** Email address of the user to invite */
  email: string;
  /** Role the invited user will have in the tenant */
  role: string;
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
 * const invite = await inviteManager.create('tenant_123', {
 *   email: 'colleague@company.com',
 *   role: 'member'
 * });
 *
 * // Accept an invitation (from the invited user's session)
 * const result = await inviteManager.accept('invite_token_xyz');
 * console.log(`Joined tenant: ${result.data.tenant_id}`);
 * ```
 *
 * @since 1.0.0
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
   * Creates a new user invitation for a specific tenant
   *
   * Generates a secure invitation that allows a user to join the specified
   * tenant with the defined role. The invitation is sent to the provided
   * email address and includes a time-limited token for security.
   *
   * The function creates the invitation record in the database and can
   * trigger email notifications (depending on server configuration).
   * The invitation expires after a predefined time period and can only
   * be used once.
   *
   * Only existing tenant members with appropriate permissions can create
   * invitations. The inviter's authentication is validated via HTTP-only
   * cookies sent with the request.
   *
   * @param tenantId - Unique identifier of the tenant to invite the user to
   * @param inviteData - Configuration object for the invitation
   * @param inviteData.email - Email address of the user to invite
   * @param inviteData.role - Role the user will have after joining (e.g., 'member', 'admin')
   *
   * @returns Promise resolving to the created invitation with secure token
   *
   * @throws {Error} When tenantId parameter is missing or empty
   * @throws {Error} When required fields (email, role) are missing or empty
   * @throws {Error} When the API request fails due to network issues
   * @throws {Error} When the server returns an error response (4xx, 5xx status codes)
   *
   * @example
   * Basic invitation creation:
   * ```typescript
   * const invite = await createTenantUserInvite('tenant_123', {
   *   email: 'colleague@company.com',
   *   role: 'member'
   * });
   *
   * console.log(`Invite sent to: ${invite.data.invite.email}`);
   * // The invite token can be used to generate invitation links
   * const inviteLink = `https://app.com/accept-invite?token=${invite.data.invite.token}`;
   * ```
   *
   * @example
   * Creating admin invitation:
   * ```typescript
   * const adminInvite = await createTenantUserInvite('tenant_456', {
   *   email: 'admin@company.com',
   *   role: 'admin'
   * });
   *
   * // Admin users get elevated permissions
   * console.log(`Admin invite created with ID: ${adminInvite.data.invite.id}`);
   * ```
   *
   *
   * @since 1.0.0
   * @public
   * @group User Management
   */
  async create(
    tenantId: string,
    inviteData: CreateTenantUserInviteRequest
  ): Promise<CreateTenantUserInviteResponse> {
    if (!tenantId) {
      throw new Error("Tenant ID is required");
    }

    if (!inviteData.email || !inviteData.role) {
      throw new Error("Email and role are required");
    }

    try {
      console.log("PreFetch");
      const response = await this.omnibaseClient.fetch(
        `/api/v1/tenants/invites/${tenantId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(inviteData),
          credentials: "include",
        }
      );

      console.log("PostFetch");

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
