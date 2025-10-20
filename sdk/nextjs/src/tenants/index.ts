/**
 * Tenant management module for Next.js
 *
 * This module provides comprehensive tenant management functionality for multi-tenant
 * Next.js applications built on the OmniBase platform. It includes server actions for
 * tenant operations, invitation handling, and tenant context switching with seamless
 * cookie and JWT token management.
 *
 * Key features:
 * - **Tenant Creation**: Server actions for creating new tenants with billing setup
 * - **Tenant Deletion**: Safe tenant removal with automatic token cleanup
 * - **Tenant Switching**: Context switching between multiple tenants
 * - **Invitation System**: Send and accept tenant invitations with secure tokens
 * - **Server Actions**: Ready-to-use form actions compatible with Next.js forms
 * - **Cookie Management**: Automatic JWT token handling in HTTP-only cookies
 *
 * All server actions are designed to work with React's useActionState hook and Next.js
 * form handling, providing a seamless experience for multi-tenant applications. The
 * actions handle form validation, API communication, cookie management, and appropriate
 * redirects or error responses.
 *
 * @example
 * Setting up tenant actions in a Next.js server component:
 * ```typescript
 * // In your page.tsx (server component)
 * import { omnibase } from '@/lib/server';
 * import { TenantActionsHandler } from '@omnibase/nextjs/tenants';
 * import { getServerSession } from '@omnibase/nextjs/auth';
 *
 * const actions = new TenantActionsHandler(omnibase);
 *
 * export default async function TenantsPage() {
 *   const session = await getServerSession();
 *
 *   return (
 *     <div>
 *       <CreateTenantForm
 *         action={async (prevState: any, formData: FormData) => {
 *           'use server';
 *           formData.set('user_id', session.identity?.id!);
 *           return actions.manage.create(prevState, formData);
 *         }}
 *       />
 *       <SwitchTenantForm action={actions.manage.switch} />
 *       <CreateInviteForm action={actions.invites.create} />
 *     </div>
 *   );
 * }
 * ```
 *
 * @module Tenants
 */

export * from "./handler";
export * from "./management";
export * from "./invites";
