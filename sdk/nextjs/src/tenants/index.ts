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
 * Creating a tenant with form action:
 * ```typescript
 * import { createTenantAction } from '@omnibase/nextjs/tenants';
 * import { useActionState } from 'react';
 *
 * export function CreateTenantForm({ userId }: { userId: string }) {
 *   const [state, action, isPending] = useActionState(createTenantAction, null);
 *
 *   return (
 *     <form action={action}>
 *       <input name="name" placeholder="Tenant Name" required />
 *       <input name="billing_email" type="email" placeholder="Billing Email" required />
 *       <input name="user_id" type="hidden" value={userId} />
 *       <input name="redirect_to" type="hidden" value="/dashboard" />
 *
 *       {state?.error && <p className="error">{state.error}</p>}
 *       <button type="submit" disabled={isPending}>
 *         {isPending ? 'Creating...' : 'Create Tenant'}
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 *
 * @example
 * Tenant switching:
 * ```typescript
 * import { switchActiveTenantAction } from '@omnibase/nextjs/tenants';
 * import { useActionState } from 'react';
 *
 * export function TenantSwitcher({ tenants }: { tenants: Tenant[] }) {
 *   const [state, action] = useActionState(switchActiveTenantAction, null);
 *
 *   return (
 *     <form action={action}>
 *       <select name="tenant_id" required>
 *         {tenants.map(tenant => (
 *           <option key={tenant.id} value={tenant.id}>
 *             {tenant.name}
 *           </option>
 *         ))}
 *       </select>
 *       <button type="submit">Switch Tenant</button>
 *       {state?.error && <p className="error">{state.error}</p>}
 *       {state?.success && <p className="success">{state.message}</p>}
 *     </form>
 *   );
 * }
 * ```
 *
 * @example
 * Accepting tenant invitations:
 * ```typescript
 * import { acceptTenantInviteAction } from '@omnibase/nextjs/tenants';
 * import { useActionState } from 'react';
 *
 * export function AcceptInviteForm({ token }: { token: string }) {
 *   const [state, action, isPending] = useActionState(acceptTenantInviteAction, null);
 *
 *   return (
 *     <form action={action}>
 *       <input name="token" type="hidden" value={token} />
 *       <input name="redirect_to" type="hidden" value="/dashboard" />
 *
 *       {state?.error && <p className="error">{state.error}</p>}
 *       <button type="submit" disabled={isPending}>
 *         {isPending ? 'Accepting...' : 'Accept Invitation'}
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 *
 * @module Tenants
 */

export * from "./handler";
export * from "./management";
export * from "./invites";
