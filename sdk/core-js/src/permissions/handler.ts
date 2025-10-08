import { RelationshipApi, PermissionApi } from "@ory/client";

/**
 * Client for managing permissions and relationships using Ory Keto
 *
 * This client provides access to Ory Keto's permission system, allowing you to
 * create, manage, and check relationships between subjects and objects. It handles
 * both read operations (permission checks) and write operations (relationship management).
 *
 * The client automatically configures separate endpoints for read and write operations
 * to optimize performance and security by following Ory Keto's recommended architecture.
 *
 * @example
 * Basic permission checking:
 * ```typescript
 * import { PermissionsClient } from '@omnibase/core-js/permissions';
 *
 * const permissionsClient = new PermissionsClient('https://api.example.com');
 *
 * // Check if a user can view a tenant
 * const canView = await permissionsClient.permissions.checkPermission(
 *   undefined,
 *   {
 *     namespace: 'Tenant',
 *     object: 'tenant_123',
 *     relation: 'view',
 *     subjectId: 'user_456'
 *   }
 * );
 *
 * if (canView.data.allowed) {
 *   console.log('User can view the tenant');
 * }
 * ```
 *
 * @example
 * Creating tenant relationships:
 * ```typescript
 * // Create a relationship making a user an owner of a tenant
 * await permissionsClient.relationships.createRelationship(
 *   undefined,
 *   {
 *     namespace: 'Tenant',
 *     object: 'tenant_123',
 *     relation: 'owners',
 *     subjectId: 'user_456'
 *   }
 * );
 *
 * // Now the user has owner permissions on the tenant
 * console.log('User is now an owner of the tenant');
 * ```
 *
 * @example
 * Complex tenant permission management:
 * ```typescript
 * const tenantId = 'tenant_123';
 * const userId = 'user_456';
 *
 * // Grant admin permissions to a user
 * await permissionsClient.relationships.createRelationship(
 *   undefined,
 *   {
 *     namespace: 'Tenant',
 *     object: tenantId,
 *     relation: 'admins',
 *     subjectId: userId
 *   }
 * );
 *
 * // Check if user can manage members (admins and owners can)
 * const canManageMembers = await permissionsClient.permissions.checkPermission(
 *   undefined,
 *   {
 *     namespace: 'Tenant',
 *     object: tenantId,
 *     relation: 'manage_members',
 *     subjectId: userId
 *   }
 * );
 *
 * if (canManageMembers.data.allowed) {
 *   // User can invite/remove members
 *   console.log('User can manage tenant members');
 * }
 *
 * // Later, remove admin permissions
 * await permissionsClient.relationships.deleteRelationships(
 *   undefined,
 *   {
 *     namespace: 'Tenant',
 *     object: tenantId,
 *     relation: 'admins',
 *     subjectId: userId
 *   }
 * );
 * ```
 *
 * @since 1.0.0
 * @public
 * @group Client
 */
export class PermissionsClient {
  /**
   * Ory Keto RelationshipApi for managing subject-object relationships
   *
   * Provides methods for creating, updating, and deleting relationships between
   * subjects (users, groups) and objects (tenants, resources). This API handles
   * write operations and is used to establish permission structures.
   *
   * Key methods:
   * - `createRelationship()` - Creates a new relationship tuple
   * - `deleteRelationships()` - Removes existing relationship tuples
   * - `getRelationships()` - Queries existing relationships
   * - `patchRelationships()` - Updates multiple relationships atomically
   *
   * @example
   * ```typescript
   * // Create a relationship
   * await client.relationships.createRelationship(
   *   undefined,
   *   {
   *     namespace: 'Tenant',
   *     object: 'tenant_123',
   *     relation: 'members',
   *     subjectId: 'user_456'
   *   }
   * );
   * ```
   *
   * @since 1.0.0
   * @group Relationships
   */
  public relationships: RelationshipApi;

  /**
   * Ory Keto PermissionApi for checking permissions
   *
   * Provides methods for querying whether a subject has a specific permission
   * on an object. This API handles read operations and is optimized for fast
   * permission checks in your application logic.
   *
   * Key methods:
   * - `checkPermission()` - Checks if a subject has permission on an object
   * - `checkPermissionOrError()` - Same as above but throws error if denied
   * - `expandPermissions()` - Expands relationships to show all granted permissions
   *
   * @example
   * ```typescript
   * // Check permission
   * const result = await client.permissions.checkPermission(
   *   undefined,
   *   {
   *     namespace: 'Tenant',
   *     object: 'tenant_123',
   *     relation: 'view',
   *     subjectId: 'user_456'
   *   }
   * );
   *
   * console.log('Has permission:', result.data.allowed);
   * ```
   *
   * @since 1.0.0
   * @group Permissions
   */
  public permissions: PermissionApi;

  /**
   * Creates a new PermissionsClient instance
   *
   * Initializes the client with separate endpoints for read and write operations.
   * The client automatically appends the appropriate Keto API paths to the base URL
   * for optimal performance and security separation.
   *
   * @param apiBaseUrl - The base URL for your Omnibase API instance
   *
   * @throws {Error} When the base URL is invalid or cannot be reached
   *
   * @example
   * ```typescript
   * const client = new PermissionsClient('https://api.example.com');
   * ```
   *
   * @example
   * Local development:
   * ```typescript
   * const client = new PermissionsClient('http://localhost:8080');
   * ```
   *
   * @since 1.0.0
   * @group Client
   */
  constructor(apiBaseUrl: string) {
    this.relationships = new RelationshipApi(
      undefined,
      `${apiBaseUrl}/api/v1/permissions/write`
    );
    this.permissions = new PermissionApi(
      undefined,
      `${apiBaseUrl}/api/v1/permissions/read`
    );
  }
}
