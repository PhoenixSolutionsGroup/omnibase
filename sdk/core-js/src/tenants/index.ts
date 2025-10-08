/**
 * Tenants module
 *
 * This module provides comprehensive tenant management functionality using
 * an object-oriented approach with dedicated handler classes. The module
 * supports multi-tenant applications with user management, invitations,
 * and tenant switching capabilities.
 *
 * Key features:
 * - Tenant lifecycle management (create, delete, switch)
 * - User invitation system with email workflows
 * - Multi-tenant user management and permissions
 * - Active tenant switching for user sessions
 * - Comprehensive error handling and validation
 * - Integration with Stripe for billing management
 *
 * @example
 * Basic usage with the main TenantHandler:
 * ```typescript
 * import { TenantHandler } from '@omnibase/core-js/tenants';
 *
 * // Initialize the handler with your client
 * const tenantHandler = new TenantHandler(omnibaseClient);
 *
 * // Create a new tenant
 * const tenant = await tenantHandler.tenants.createTenant({
 *   name: 'My Company',
 *   billing_email: 'billing@company.com',
 *   user_id: 'user_123'
 * });
 *
 * // Invite a user to the tenant
 * const invite = await tenantHandler.invites.create(tenant.data.tenant.id, {
 *   email: 'user@example.com',
 *   role: 'member'
 * });
 *
 * // Switch active tenant
 * await tenantHandler.tenants.switchActiveTenant(tenant.data.tenant.id);
 * ```
 *
 * @module Tenants
 */

export * from "./handler";

export type * from "./invites";
export type * from "./management";
