/**
 * Permissions module
 *
 * This module provides server-side permission management functionality for Next.js
 * applications, built on top of Ory Keto. It enables fine-grained access control
 * through relationship-based permissions, allowing you to define and manage
 * permissions between subjects (users) and objects (resources).
 *
 * Key features:
 * - Create and delete permission relationships
 * - Server action compatibility for Next.js App Router
 * - Form data handling for seamless integration with React Server Components
 * - Built on Ory Keto's relationship tuples model
 *
 * @example
 * Basic usage with server actions:
 * ```typescript
 * import { PermissionActionsHandler } from '@omnibase/nextjs/permissions';
 * import { createServerClient } from '@omnibase/nextjs';
 *
 * const client = createServerClient();
 * const permissions = new PermissionActionsHandler(client);
 *
 * // Create a permission relationship
 * const createAction = permissions.relationship.create.bind(permissions.relationship);
 *
 * // Use in a server component
 * <form action={createAction}>
 *   <input name="namespace" value="tenants" />
 *   <input name="object" value="tenant:123" />
 *   <input name="relation" value="member" />
 *   <input name="subject_id" value="user:456" />
 *   <button type="submit">Grant Permission</button>
 * </form>
 * ```
 *
 * @module Permissions
 */

export * from "./handler";
