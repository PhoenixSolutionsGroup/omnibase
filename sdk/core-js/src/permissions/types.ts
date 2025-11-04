/**
 * Types for the Permissions and Roles API
 *
 * This module defines TypeScript types for interacting with the Omnibase
 * permissions system, including both Ory Keto relationships and the
 * role-based access control (RBAC) system.
 *
 * @module Permissions Types
 * @since 0.7.0
 */

/**
 * Namespace definition from the database
 *
 * Represents a permission namespace (e.g., Tenant, Project) and its
 * available relations/permissions. Used for building role configuration UIs.
 *
 * @example
 * ```typescript
 * {
 *   id: 'uuid-123',
 *   namespace: 'Tenant',
 *   relations: ['invite_user', 'delete_tenant', 'manage_billing'],
 *   created_at: '2024-01-01T00:00:00Z',
 *   updated_at: '2024-01-01T00:00:00Z'
 * }
 * ```
 *
 * @since 0.7.0
 * @public
 */
export interface NamespaceDefinition {
  /**
   * Unique identifier for the namespace definition
   */
  id: string;

  /**
   * Name of the namespace (e.g., 'Tenant', 'Project')
   */
  namespace: string;

  /**
   * Available relations/permissions for this namespace
   * @example ['invite_user', 'delete_tenant', 'manage_billing']
   */
  relations: string[];

  /**
   * Timestamp when the namespace definition was created
   */
  created_at: string;

  /**
   * Timestamp when the namespace definition was last updated
   */
  updated_at: string;
}

/**
 * Role model representing a collection of permissions
 *
 * Roles can be system-wide (tenant_id = null) or tenant-specific.
 * System roles are defined in roles.config.json and apply to all tenants.
 * Custom roles are created via the API and are specific to a tenant.
 *
 * @example
 * System role:
 * ```typescript
 * {
 *   id: 'role_123',
 *   tenant_id: null,
 *   role_name: 'admin',
 *   permissions: ['tenant#delete_all_projects', 'tenant#manage_billing'],
 *   user_ids: ['user_456', 'user_789'],
 *   created_at: '2024-01-01T00:00:00Z',
 *   updated_at: '2024-01-01T00:00:00Z'
 * }
 * ```
 *
 * @example
 * Custom tenant role:
 * ```typescript
 * {
 *   id: 'role_456',
 *   tenant_id: 'tenant_123',
 *   role_name: 'billing_manager',
 *   permissions: ['tenant#manage_billing', 'tenant#view_invoices'],
 *   user_ids: ['user_999'],
 *   created_at: '2024-01-01T00:00:00Z',
 *   updated_at: '2024-01-01T00:00:00Z'
 * }
 * ```
 *
 * @since 0.7.0
 * @public
 */
export interface Role {
  /**
   * Unique identifier for the role
   */
  id: string;

  /**
   * Tenant ID this role belongs to, or null for system roles
   *
   * - `null`: System role (applies to all tenants)
   * - `string`: Tenant-specific custom role
   */
  tenant_id: string | null;

  /**
   * Human-readable name for the role
   * @example 'admin', 'billing_manager', 'developer'
   */
  role_name: string;

  /**
   * Array of permission strings in format: namespace#relation or namespace:id#relation
   *
   * @example
   * Tenant-wide permissions:
   * - 'tenant#invite_user'
   * - 'tenant#delete_all_projects'
   *
   * Resource-specific permissions:
   * - 'project:proj_abc123#deploy'
   * - 'project:proj_abc123#view_logs'
   */
  permissions: string[];

  /**
   * Array of user IDs assigned to this role
   *
   * When a user is assigned to a role, their ID is added here and
   * corresponding Keto relationship tuples are created for each permission.
   */
  user_ids: string[];

  /**
   * Timestamp when the role was created
   */
  created_at: string;

  /**
   * Timestamp when the role was last updated
   */
  updated_at: string;
}

/**
 * Request body for creating a new role
 *
 * @example
 * ```typescript
 * {
 *   role_name: 'billing_manager',
 *   permissions: [
 *     'tenant#manage_billing',
 *     'tenant#view_invoices',
 *     'tenant#update_payment_methods'
 *   ]
 * }
 * ```
 *
 * @since 0.7.0
 * @public
 */
export interface CreateRoleRequest {
  /**
   * Name for the new role
   * @example 'billing_manager', 'support_agent', 'developer'
   */
  role_name: string;

  /**
   * Array of permission strings to assign to the role
   * @example ['tenant#manage_billing', 'tenant#view_invoices']
   */
  permissions: string[];
}

/**
 * Request body for updating an existing role's permissions
 *
 * @example
 * ```typescript
 * {
 *   permissions: [
 *     'tenant#manage_billing',
 *     'tenant#view_invoices',
 *     'tenant#manage_users' // Added new permission
 *   ]
 * }
 * ```
 *
 * @since 0.7.0
 * @public
 */
export interface UpdateRoleRequest {
  /**
   * New array of permissions for the role
   *
   * This replaces all existing permissions. Old permissions are removed
   * from Keto and new ones are created for all assigned users.
   */
  permissions: string[];
}

/**
 * Request body for assigning a role to a user
 *
 * Supports assigning by either role ID or role name for flexibility.
 * When using role_name, the system will find the role by name within
 * the current tenant's scope (including system roles).
 *
 * @example
 * By role ID:
 * ```typescript
 * {
 *   role_id: 'role_456'
 * }
 * ```
 *
 * @example
 * By role name:
 * ```typescript
 * {
 *   role_name: 'owner'
 * }
 * ```
 *
 * @since 0.7.0
 * @public
 */
export interface AssignRoleRequest {
  /**
   * ID of the role to assign to the user
   * Use either role_id or role_name, not both
   */
  role_id?: string;

  /**
   * Name of the role to assign to the user
   * Use either role_id or role_name, not both
   * @example 'owner', 'admin', 'billing_manager'
   */
  role_name?: string;
}
