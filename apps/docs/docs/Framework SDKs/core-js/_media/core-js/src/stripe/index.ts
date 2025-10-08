/**
 * Stripe configuration and billing management module
 *
 * Provides configuration-aware billing operations that integrate with the
 * database-backed Stripe configuration system for safe pricing deployments.
 * Enables UI-ready pricing table data and comprehensive billing operations.
 *
 * @example
 * Basic usage:
 * ```typescript
 * import { getStripeConfig, getAvailableProducts } from '@omnibase/core-js/stripe';
 *
 * // Get current Stripe configuration
 * const config = await getStripeConfig();
 *
 * // Get UI-ready products for pricing tables
 * const products = await getAvailableProducts();
 * ```
 *
 * @module Stripe
 */

export * from "./config";
export * from "./types";
