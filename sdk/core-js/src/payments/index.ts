/**
 * Payments and billing management module
 *
 * Comprehensive payment processing module that provides database-backed Stripe
 * configuration management, checkout sessions, customer portals, and usage tracking.
 * This module enables safe deployment and rollback of pricing changes through
 * versioned configurations stored in PostgreSQL.
 *
 * Key features:
 * - **Configuration Management**: Database-backed Stripe configurations with versioning
 * - **Checkout Sessions**: Secure payment flows for one-time and subscription billing
 * - **Customer Portals**: Self-service billing management for customers
 * - **Usage Tracking**: Metered billing and usage-based pricing support
 * - **UI-Ready Data**: Pre-formatted pricing data for marketing and pricing tables
 *
 * The module provides enterprise-grade billing features including A/B testing of
 * pricing strategies, staged rollouts, audit trails, and safe migration between
 * configuration versions while maintaining full operational safety.
 *
 * @example
 * Setting up payment processing:
 * ```typescript
 * import { PaymentHandler } from '@omnibase/core-js/payments';
 *
 * const paymentHandler = new PaymentHandler('https://api.myapp.com');
 *
 * // Get current billing configuration
 * const config = await paymentHandler.config.getStripeConfig();
 *
 * // Get UI-ready products for pricing tables
 * const products = await paymentHandler.config.getAvailableProducts();
 *
 * // Create a checkout session (mode auto-detected from price)
 * const checkout = await paymentHandler.checkout.createSession({
 *   price_id: 'price_monthly_pro',
 *   success_url: 'https://app.com/success',
 *   cancel_url: 'https://app.com/pricing'
 * });
 * ```
 *
 * @example
 * Customer portal and usage tracking:
 * ```typescript
 * // Create customer portal session
 * const portal = await paymentHandler.portal.create({
 *   return_url: 'https://app.com/billing'
 * });
 *
 * // Record usage for metered billing
 * await paymentHandler.usage.recordUsage({
 *   meter_event_name: 'api_calls',
 *   value: '1'
 * });
 * ```
 *
 * @module Payments
 */

export * from "./handler";
export * from "./config";
export * from "./types";
export * from "./checkout";
export * from "./portal";
export * from "./usage";
