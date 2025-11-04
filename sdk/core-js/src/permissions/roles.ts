import type { OmnibaseClient } from "../client";
import type { ApiResponse } from "../types";
import type {
  Role,
  CreateRoleRequest,
  UpdateRoleRequest,
  AssignRoleRequest,
  NamespaceDefinition,
} from "./types";

/**
 * Handler for managing roles and role-based permissions
 *
 * Provides methods for creating custom roles, assigning permissions,
 * and managing role assignments. Works alongside the Keto-based
 * permissions system to provide dynamic RBAC capabilities.
 *
 * @example
 * ```typescript
 * // Create a custom role
 * const role = await omnibase.permissions.roles.create({
 *   role_name: 'billing_manager',
 *   permissions: ['tenant#manage_billing', 'tenant#view_invoices']
 * });
 *
 * // Assign role to user
 * await omnibase.permissions.roles.assign('user_123', {
 *   role_id: role.id
 * });
 * ```
 *
 * @since 0.7.0
 * @public
 */
export class RolesHandler {
  constructor(private client: OmnibaseClient) {}

  /**
   * Get available namespace definitions for UI
   *
   * Returns all namespaces and their available relations/permissions.
   * Useful for building role configuration UIs.
   *
   * @returns List of namespace definitions
   *
   * @example
   * ```typescript
   * const definitions = await omnibase.permissions.roles.getDefinitions();
   *
   * // Output: [{ namespace: 'Tenant', relations: ['invite_user', 'delete_tenant', ...] }]
   * definitions.forEach(def => {
   *   console.log(`${def.namespace} supports: ${def.relations.join(', ')}`);
   * });
   * ```
   */
  async getDefinitions(): Promise<NamespaceDefinition[]> {
    const response = await this.client.fetch(
      "/api/v1/permissions/definitions",
      {
        method: "GET",
      }
    );

    const data = (await response.json()) as ApiResponse<{
      definitions: NamespaceDefinition[];
    }>;

    if (!response.ok || data.error) {
      throw new Error(data.error || "Failed to fetch definitions");
    }

    return data.data!.definitions;
  }

  /**
   * List all roles for the current tenant
   *
   * Returns both system roles (defined in roles.config.json) and
   * custom roles created via the API. System roles have `tenant_id = null`.
   *
   * @returns List of roles
   *
   * @example
   * ```typescript
   * const roles = await omnibase.permissions.roles.list();
   *
   * const systemRoles = roles.filter(r => r.tenant_id === null);
   * const customRoles = roles.filter(r => r.tenant_id !== null);
   *
   * console.log(`System roles: ${systemRoles.map(r => r.role_name).join(', ')}`);
   * console.log(`Custom roles: ${customRoles.map(r => r.role_name).join(', ')}`);
   * ```
   */
  async list(): Promise<Role[]> {
    const response = await this.client.fetch("/api/v1/permissions/roles", {
      method: "GET",
    });

    const data = (await response.json()) as ApiResponse<{ roles: Role[] }>;

    if (!response.ok || data.error) {
      throw new Error(data.error || "Failed to list roles");
    }

    return data.data!.roles;
  }

  /**
   * Create a new custom role
   *
   * Creates a tenant-specific role with the specified permissions.
   * Permissions use the format `namespace#relation` or `namespace:id#relation`.
   *
   * @param request - Role creation request
   * @returns Created role
   *
   * @example
   * ```typescript
   * const role = await omnibase.permissions.roles.create({
   *   role_name: 'billing_manager',
   *   permissions: [
   *     'tenant#manage_billing',
   *     'tenant#view_invoices',
   *     'tenant#update_payment_methods'
   *   ]
   * });
   *
   * console.log(`Created role: ${role.id}`);
   * ```
   *
   * @example
   * Resource-specific permissions:
   * ```typescript
   * const devRole = await omnibase.permissions.roles.create({
   *   role_name: 'project_developer',
   *   permissions: [
   *     'project:proj_abc123#deploy',
   *     'project:proj_abc123#view_logs',
   *     'tenant#invite_user'
   *   ]
   * });
   * ```
   */
  async create(request: CreateRoleRequest): Promise<Role> {
    const response = await this.client.fetch("/api/v1/permissions/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    const data = (await response.json()) as ApiResponse<Role>;

    if (!response.ok || data.error) {
      throw new Error(data.error || "Failed to create role");
    }

    return data.data!;
  }

  /**
   * Update an existing role's permissions
   *
   * Updates the permissions for a role and automatically updates all
   * Keto relationships for users assigned to this role. Old permissions
   * are removed and new ones are created.
   *
   * @param roleId - ID of role to update
   * @param request - Update request with new permissions
   * @returns Updated role
   *
   * @example
   * ```typescript
   * const updatedRole = await omnibase.permissions.roles.update('role_123', {
   *   permissions: [
   *     'tenant#manage_billing',
   *     'tenant#view_invoices',
   *     'tenant#manage_users' // Added new permission
   *   ]
   * });
   *
   * console.log(`Updated role with ${updatedRole.permissions.length} permissions`);
   * ```
   */
  async update(roleId: string, request: UpdateRoleRequest): Promise<Role> {
    const response = await this.client.fetch(
      `/api/v1/permissions/roles/${roleId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      }
    );

    const data = (await response.json()) as ApiResponse<Role>;

    if (!response.ok || data.error) {
      throw new Error(data.error || "Failed to update role");
    }

    return data.data!;
  }

  /**
   * Delete a role
   *
   * Deletes the role and automatically removes all Keto relationships
   * for users assigned to this role. Cannot delete system roles.
   *
   * @param roleId - ID of role to delete
   *
   * @example
   * ```typescript
   * await omnibase.permissions.roles.delete('role_123');
   * console.log('Role deleted successfully');
   * ```
   */
  async delete(roleId: string): Promise<void> {
    const response = await this.client.fetch(
      `/api/v1/permissions/roles/${roleId}`,
      {
        method: "DELETE",
      }
    );

    const data = (await response.json()) as ApiResponse<{ message: string }>;

    if (!response.ok || data.error) {
      throw new Error(data.error || "Failed to delete role");
    }
  }

  /**
   * Assign a role to a user
   *
   * Assigns a role to a user and automatically creates all necessary
   * Keto relationship tuples based on the role's permissions. The user
   * immediately gains all permissions defined in the role.
   *
   * Supports assignment by either role ID or role name for flexibility.
   *
   * @param userId - ID of user to assign role to
   * @param request - Assignment request with either role_id or role_name
   *
   * @example
   * Assign by role ID:
   * ```typescript
   * await omnibase.permissions.roles.assign('user_123', {
   *   role_id: 'role_456'
   * });
   * ```
   *
   * @example
   * Assign by role name (system or custom role):
   * ```typescript
   * // Assign system role
   * await omnibase.permissions.roles.assign('user_123', {
   *   role_name: 'owner'
   * });
   *
   * // Assign custom role
   * await omnibase.permissions.roles.assign('user_456', {
   *   role_name: 'billing_manager'
   * });
   * ```
   *
   * @example
   * Verify permissions after assignment:
   * ```typescript
   * await omnibase.permissions.roles.assign('user_123', {
   *   role_name: 'admin'
   * });
   *
   * // User now has all permissions from the admin role
   * const canManage = await omnibase.permissions.permissions.checkPermission(
   *   undefined,
   *   {
   *     namespace: 'Tenant',
   *     object: 'tenant_789',
   *     relation: 'manage_billing',
   *     subjectId: 'user_123'
   *   }
   * );
   * // canManage.data.allowed === true
   * ```
   */
  async assign(userId: string, request: AssignRoleRequest): Promise<void> {
    const response = await this.client.fetch(
      `/api/v1/permissions/users/${userId}/roles`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      }
    );

    const data = (await response.json()) as ApiResponse<{ message: string }>;

    if (!response.ok || data.error) {
      throw new Error(data.error || "Failed to assign role");
    }
  }
}
