/**
 * Permissions module
 *
 * This module provides comprehensive permission management functionality using Ory Keto
 * as the underlying authorization engine. It enables fine-grained access control through
 * relationships between subjects (users, groups) and objects (tenants, resources).
 *
 * Key features:
 * - Relationship-based access control (ReBAC)
 * - Real-time permission checking
 * - Hierarchical permission inheritance
 * - Support for complex permission models
 * - Tenant-based multi-tenancy
 * - Integration with Ory Keto authorization engine
 *
 * The module is built around the concept of relationships that define how subjects
 * relate to objects (e.g., "user_123 is an owner of tenant_456"). These relationships
 * then determine what permissions a subject has on various objects through a flexible
 * permission model.
 *
 * @example
 * Basic permission checking:
 * ```typescript
 * import { PermissionsClient } from '@omnibase/core-js/permissions';
 *
 * const permissions = new PermissionsClient('https://api.example.com');
 *
 * // Check if user can view a tenant
 * const canView = await permissions.permissions.checkPermission(
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
 *   // User has view permission
 *   console.log('Access granted');
 * }
 * ```
 *
 * @example
 * Managing tenant relationships:
 * ```typescript
 * import { PermissionsClient } from '@omnibase/core-js/permissions';
 *
 * const permissions = new PermissionsClient('https://api.example.com');
 *
 * // Make user an admin of a tenant
 * await permissions.relationships.createRelationship(
 *   undefined,
 *   {
 *     namespace: 'Tenant',
 *     object: 'tenant_123',
 *     relation: 'admins',
 *     subjectId: 'user_456'
 *   }
 * );
 *
 * // Check admin permissions (admins can manage members)
 * const canManage = await permissions.permissions.checkPermission(
 *   undefined,
 *   {
 *     namespace: 'Tenant',
 *     object: 'tenant_123',
 *     relation: 'manage_members',
 *     subjectId: 'user_456'
 *   }
 * );
 * ```
 *
 * @example
 * Complex permission workflow:
 * ```typescript
 * import { PermissionsClient } from '@omnibase/core-js/permissions';
 *
 * const permissions = new PermissionsClient('https://api.example.com');
 * const tenantId = 'tenant_123';
 * const userId = 'user_456';
 *
 * // 1. Add user as a member
 * await permissions.relationships.createRelationship(
 *   undefined,
 *   {
 *     namespace: 'Tenant',
 *     object: tenantId,
 *     relation: 'members',
 *     subjectId: userId
 *   }
 * );
 *
 * // 2. Grant billing management permission
 * await permissions.relationships.createRelationship(
 *   undefined,
 *   {
 *     namespace: 'Tenant',
 *     object: tenantId,
 *     relation: 'can_manage_billing',
 *     subjectId: userId
 *   }
 * );
 *
 * // 3. Verify user can manage billing
 * const canManageBilling = await permissions.permissions.checkPermission(
 *   undefined,
 *   {
 *     namespace: 'Tenant',
 *     object: tenantId,
 *     relation: 'manage_billing',
 *     subjectId: userId
 *   }
 * );
 *
 * // 4. Later, remove billing permission
 * if (canManageBilling.data.allowed) {
 *   await permissions.relationships.deleteRelationships(
 *     undefined,
 *     {
 *       namespace: 'Tenant',
 *       object: tenantId,
 *       relation: 'can_manage_billing',
 *       subjectId: userId
 *     }
 *   );
 * }
 * ```
 *
 * @module Permissions
 */

/**
 * Main permissions client for interacting with Ory Keto
 *
 * Provides a unified interface for both permission checking and relationship
 * management. The client handles the underlying Ory Keto API communication
 * and provides a developer-friendly interface for authorization operations.
 *
 * The client exposes two main APIs:
 * - `permissions` - For checking if subjects have specific permissions
 * - `relationships` - For managing the relationships that define permissions
 *
 * @example
 * Basic usage:
 * ```typescript
 * const client = new PermissionsClient('https://api.example.com');
 *
 * // Check permissions
 * const hasAccess = await client.permissions.checkPermission(
 *   undefined,
 *   {
 *     namespace: 'Tenant',
 *     object: 'tenant_123',
 *     relation: 'view',
 *     subjectId: 'user_456'
 *   }
 * );
 *
 * // Manage relationships
 * await client.relationships.createRelationship(
 *   undefined,
 *   {
 *     namespace: 'Tenant',
 *     object: 'tenant_123',
 *     relation: 'owners',
 *     subjectId: 'user_456'
 *   }
 * );
 * ```
 *
 * @example
 * Tenant permission management:
 * ```typescript
 * const client = new PermissionsClient('https://api.example.com');
 * const tenantId = 'tenant_123';
 * const adminUserId = 'user_456';
 * const memberUserId = 'user_789';
 *
 * // Set up tenant permissions
 * await client.relationships.createRelationship(
 *   undefined,
 *   {
 *     namespace: 'Tenant',
 *     object: tenantId,
 *     relation: 'admins',
 *     subjectId: adminUserId
 *   }
 * );
 *
 * await client.relationships.createRelationship(
 *   undefined,
 *   {
 *     namespace: 'Tenant',
 *     object: tenantId,
 *     relation: 'members',
 *     subjectId: memberUserId
 *   }
 * );
 *
 * // Check permissions
 * const adminCanDelete = await client.permissions.checkPermission(
 *   undefined,
 *   {
 *     namespace: 'Tenant',
 *     object: tenantId,
 *     relation: 'delete',
 *     subjectId: adminUserId
 *   }
 * );
 *
 * const memberCanView = await client.permissions.checkPermission(
 *   undefined,
 *   {
 *     namespace: 'Tenant',
 *     object: tenantId,
 *     relation: 'view',
 *     subjectId: memberUserId
 *   }
 * );
 * ```
 *
 * @example
 * Removing permissions:
 * ```typescript
 * const client = new PermissionsClient('https://api.example.com');
 *
 * // Remove a user's admin privileges
 * await client.relationships.deleteRelationships(
 *   undefined,
 *   {
 *     namespace: 'Tenant',
 *     object: 'tenant_123',
 *     relation: 'admins',
 *     subjectId: 'user_456'
 *   }
 * );
 *
 * // The user is no longer an admin, but might still be a member
 * const stillMember = await client.permissions.checkPermission(
 *   undefined,
 *   {
 *     namespace: 'Tenant',
 *     object: 'tenant_123',
 *     relation: 'view',
 *     subjectId: 'user_456'
 *   }
 * );
 * ```
 *
 * @since 1.0.0
 * @public
 * @group Client
 */
export { PermissionsClient } from "./handler";
export { RolesHandler } from "./roles";
export type * from "./types";
