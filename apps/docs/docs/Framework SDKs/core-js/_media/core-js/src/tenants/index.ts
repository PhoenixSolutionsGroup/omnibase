/**
 * Tenant management module
 *
 * This module provides comprehensive tenant management functionality for multi-tenant
 * applications. It handles tenant creation, user invitations, tenant switching, and
 * administrative operations like tenant deletion.
 *
 * Key features:
 * - Tenant lifecycle management (create, delete)
 * - User invitation system with role-based access
 * - Active tenant switching for authenticated users
 * - Secure invite token handling with expiration
 * - Integration with Stripe for billing management
 * - Row-level security (RLS) policy support via JWT tokens
 *
 * All functions in this module require proper environment configuration with
 * `OMNIBASE_API_URL` and handle authentication via HTTP-only cookies for security.
 *
 * @example
 * Basic tenant operations:
 * ```typescript
 * import { createTenant, createTenantUserInvite, switchActiveTenant } from '@omnibase/sdk-core/tenants';
 *
 * // Create a new tenant
 * const newTenant = await createTenant({
 *   name: 'My Company',
 *   billing_email: 'billing@company.com',
 *   user_id: 'user_123'
 * });
 *
 * // Invite a user to the tenant
 * const invite = await createTenantUserInvite(newTenant.data.tenant.id, {
 *   email: 'colleague@company.com',
 *   role: 'member'
 * });
 *
 * // Switch to this tenant
 * await switchActiveTenant(newTenant.data.tenant.id);
 * ```
 *
 * @module Tenants
 */

export * from "./switch-tenant";
export * from "./create-invite";
export * from "./create-tenant";

/**
 * @showGroups
 */
export * from "./accept-invite";
export * from "./delete-tenant";
export * from "./types";
