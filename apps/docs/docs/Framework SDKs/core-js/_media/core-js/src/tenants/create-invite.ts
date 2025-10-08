import type { ApiResponse } from "./types";

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
export interface TenantInvite {
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
}

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
 * @throws {Error} When OMNIBASE_API_URL environment variable is not configured
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
export async function createTenantUserInvite(
  tenantId: string,
  inviteData: CreateTenantUserInviteRequest
): Promise<CreateTenantUserInviteResponse> {
  const baseUrl = process.env.OMNIBASE_API_URL;

  if (!baseUrl) {
    throw new Error("OMNIBASE_API_URL is not configured");
  }

  if (!tenantId) {
    throw new Error("Tenant ID is required");
  }

  if (!inviteData.email || !inviteData.role) {
    throw new Error("Email and role are required");
  }

  try {
    const response = await fetch(
      `${baseUrl}/api/v1/tenants/${tenantId}/invites`,
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
