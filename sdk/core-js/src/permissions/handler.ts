import { RelationshipApi, PermissionApi } from "@ory/client";
import type { OmnibaseClient } from "../client";
import { RolesHandler } from "./roles";

/**
 * Client for managing permissions and relationships using Ory Keto
 *
 * This client provides access to Ory Keto's permission system through Omnibase's API,
 * allowing you to create, manage, and check relationships between subjects and objects.
 * It handles both read operations (permission checks) and write operations (relationship management).
 *
 * The client automatically configures separate endpoints for read and write operations:
 * - Read operations (permission checks): `/api/v1/permissions/read`
 * - Write operations (relationship management): `/api/v1/permissions/write`
 *
 * This separation optimizes performance and security by following Ory Keto's recommended architecture.
 *
 * @example
 * Initialize the permissions client:
 * ```typescript
 * import { OmnibaseClient } from '@omnibase/core-js';
 *
 * const omnibase = new OmnibaseClient({
 *   apiUrl: 'https://api.example.com'
 * });
 *
 * // Access permissions client
 * const permissions = omnibase.permissions;
 * ```
 *
 * @example
 * Check if a user has permission:
 * ```typescript
 * // Check if a user can view a tenant
 * const result = await omnibase.permissions.permissions.checkPermission({
 *   namespace: 'Tenant',
 *   object: 'tenant_123',
 *   relation: 'view',
 *   subjectId: 'user_456'
 * });
 *
 * if (result.data.allowed) {
 *   console.log('User can view the tenant');
 * }
 * ```
 *
 * @example
 * Create relationships:
 * ```typescript
 * // Make a user an owner of a tenant
 * await omnibase.permissions.relationships.createRelationship({
 *   namespace: 'Tenant',
 *   object: 'tenant_123',
 *   relation: 'owners',
 *   subjectId: 'user_456'
 * });
 * ```
 *
 * @example
 * Query existing relationships:
 * ```typescript
 * // Get all members of a tenant
 * const relationships = await omnibase.permissions.relationships.getRelationships({
 *   namespace: 'Tenant',
 *   object: 'tenant_123',
 *   relation: 'members'
 * });
 *
 * console.log('Tenant members:', relationships.data.relation_tuples);
 * ```
 *
 * @example
 * Delete relationships:
 * ```typescript
 * // Remove a user from tenant admins
 * await omnibase.permissions.relationships.deleteRelationships({
 *   namespace: 'Tenant',
 *   object: 'tenant_123',
 *   relation: 'admins',
 *   subjectId: 'user_456'
 * });
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
   * All operations are proxied through Omnibase's API at `/api/v1/permissions/read`.
   *
   * Key methods:
   * - `checkPermission(params)` - Checks if a subject has permission on an object
   * - `checkPermissionOrError(params)` - Same as above but throws error if denied
   * - `expandPermissions(namespace, object, relation, maxDepth?)` - Expands relationships to show all granted permissions
   * - `postCheckPermission(maxDepth?, body)` - POST variant of permission check
   *
   * @example
   * Check a single permission:
   * ```typescript
   * const result = await omnibase.permissions.permissions.checkPermission({
   *   namespace: 'Tenant',
   *   object: 'tenant_123',
   *   relation: 'view',
   *   subjectId: 'user_456'
   * });
   *
   * if (result.data.allowed) {
   *   console.log('User has permission');
   * }
   * ```
   *
   * @example
   * Expand permission tree:
   * ```typescript
   * const tree = await omnibase.permissions.permissions.expandPermissions(
   *   'Tenant',
   *   'tenant_123',
   *   'view'
   * );
   *
   * console.log('Permission tree:', tree.data);
   * ```
   *
   * @example
   * Check permission or throw error:
   * ```typescript
   * try {
   *   await omnibase.permissions.permissions.checkPermissionOrError({
   *     namespace: 'Tenant',
   *     object: 'tenant_123',
   *     relation: 'edit',
   *     subjectId: 'user_456'
   *   });
   *   // Permission granted
   * } catch (error) {
   *   // Permission denied
   *   console.error('Access denied');
   * }
   * ```
   *
   * @since 1.0.0
   * @group Permissions
   */
  public permissions: PermissionApi;

  /**
   * Handler for managing roles and role-based permissions
   *
   * Provides methods for creating custom roles, assigning permissions,
   * and managing role assignments. Works alongside the Keto-based
   * permissions system to provide dynamic RBAC capabilities.
   *
   * Roles are stored in the database and automatically synchronized with
   * Ory Keto relationships, providing a higher-level abstraction over
   * raw relationship tuples.
   *
   * @example
   * Create a custom role:
   * ```typescript
   * const role = await omnibase.permissions.roles.create({
   *   role_name: 'billing_manager',
   *   permissions: ['tenant#manage_billing', 'tenant#view_invoices']
   * });
   * ```
   *
   * @example
   * Assign role to a user:
   * ```typescript
   * await omnibase.permissions.roles.assign('user_123', {
   *   role_id: role.id
   * });
   * ```
   *
   * @example
   * List all roles:
   * ```typescript
   * const roles = await omnibase.permissions.roles.list();
   * console.log('Available roles:', roles);
   * ```
   *
   * @since 0.7.0
   * @group Roles
   */
  public roles: RolesHandler;

  /**
   * Creates a new PermissionsClient instance
   *
   * Initializes the client with separate endpoints for read and write operations.
   * The client automatically configures the Ory Keto client libraries to use
   * Omnibase's permission proxy endpoints:
   * - Write endpoint: `${apiBaseUrl}/api/v1/permissions/write`
   * - Read endpoint: `${apiBaseUrl}/api/v1/permissions/read`
   *
   * This separation follows Ory Keto's recommended architecture for optimal
   * performance and security.
   *
   * @param apiBaseUrl - The base URL for your Omnibase API instance (e.g., 'https://api.example.com')
   * @param client - The main OmnibaseClient instance (required for roles handler)
   *
   * @throws {Error} When the base URL is invalid or cannot be reached
   *
   * @example
   * Direct instantiation (not recommended - use OmnibaseClient instead):
   * ```typescript
   * const client = new PermissionsClient('https://api.example.com', omnibaseClient);
   * ```
   *
   * @example
   * Recommended usage via OmnibaseClient:
   * ```typescript
   * import { OmnibaseClient } from '@omnibase/core-js';
   *
   * const omnibase = new OmnibaseClient({
   *   apiUrl: 'https://api.example.com'
   * });
   *
   * // Use the permissions client
   * await omnibase.permissions.permissions.checkPermission({
   *   namespace: 'Tenant',
   *   object: 'tenant_123',
   *   relation: 'view',
   *   subjectId: 'user_456'
   * });
   * ```
   *
   * @since 1.0.0
   * @group Client
   */
  constructor(apiBaseUrl: string, client: OmnibaseClient) {
    this.relationships = new RelationshipApi(
      undefined,
      `${apiBaseUrl}/api/v1/permissions/write`
    );
    this.permissions = new PermissionApi(
      undefined,
      `${apiBaseUrl}/api/v1/permissions/read`
    );
    this.roles = new RolesHandler(client);
  }
}
