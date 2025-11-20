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
 * ```typescript
 * // app/server/permissions/page.tsx
 * import { PermissionActionsHandler } from '@omnibase/nextjs/permissions';
 * import { OmnibaseClient } from '@omnibase/core-js';
 *
 * const omnibase = new OmnibaseClient({ api_url: process.env.OMNIBASE_API_URL! });
 * const permissions = new PermissionActionsHandler(omnibase);
 *
 * export default function PermissionsPage() {
 *   return (
 *     <form action={async (prevState, formData) => {
 *       'use server';
 *       return permissions.relationship.create(prevState, formData);
 *     }}>
 *       <input name="namespace" defaultValue="Tenant" />
 *       <input name="object" placeholder="tenant_123" />
 *       <input name="relation" placeholder="members" />
 *       <input name="subject_id" placeholder="user_456" />
 *       <button type="submit">Grant Permission</button>
 *     </form>
 *   );
 * }
 * ```
 *
 * @module Permissions
 */

export * from "./handler";
