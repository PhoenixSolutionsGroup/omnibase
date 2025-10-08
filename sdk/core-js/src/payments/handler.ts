import type { OmnibaseClient } from "../client";
import { CheckoutManager } from "./checkout";
import { ConfigManager } from "./config";
import { PortalManager } from "./portal";
import { UsageManager } from "./usage";

/**
 * Main payment handler for all payment-related operations
 *
 * This class serves as the central coordinator for all payment functionality,
 * providing access to checkout sessions, billing configuration, customer portals,
 * and usage tracking. It handles the low-level HTTP communication with the
 * payment API and delegates specific operations to specialized managers.
 *
 * The handler automatically manages authentication, request formatting, and
 * provides a consistent interface across all payment operations.
 *
 * @example
 * ```typescript
 * const paymentHandler = new PaymentHandler('https://api.example.com');
 *
 * // Create a checkout session (mode auto-detected from price)
 * const checkout = await paymentHandler.checkout.createSession({
 *   price_id: 'price_123',
 *   success_url: 'https://app.com/success',
 *   cancel_url: 'https://app.com/cancel'
 * });
 *
 * // Get available products
 * const products = await paymentHandler.config.getAvailableProducts();
 * ```
 *
 * @since 1.0.0
 * @public
 * @group Client
 */
export class PaymentHandler {
  /**
   * Initialize the payment handler with API configuration
   *
   * Creates a new payment handler instance that will communicate with
   * the specified API endpoint. The handler automatically handles
   * request formatting and authentication headers.
   *
   * @param apiUrl - Base URL for the payment API endpoint
   *
   * @example
   * ```typescript
   * const paymentHandler = new PaymentHandler('https://api.myapp.com');
   * ```
   *
   * @since 1.0.0
   * @group Client
   */
  constructor(private omnibaseClient: OmnibaseClient) {
    this.checkout = new CheckoutManager(this.omnibaseClient);
    this.config = new ConfigManager(this.omnibaseClient);
    this.portal = new PortalManager(this.omnibaseClient);
    this.usage = new UsageManager(this.omnibaseClient);
  }

  /**
   * Checkout session management
   *
   * Provides functionality for creating and managing Stripe checkout sessions
   * for both one-time payments and subscription billing.
   *
   * @example
   * ```typescript
   * const session = await paymentHandler.checkout.createSession({
   *   price_id: 'price_monthly',
   *   success_url: window.location.origin + '/success',
   *   cancel_url: window.location.origin + '/pricing'
   * });
   * ```
   */
  public readonly checkout: CheckoutManager;

  /**
   * Stripe configuration management
   *
   * Handles retrieval and processing of database-backed Stripe configurations,
   * providing UI-ready product and pricing data for rendering pricing tables.
   *
   * @example
   * ```typescript
   * const products = await paymentHandler.config.getAvailableProducts();
   * const config = await paymentHandler.config.getStripeConfig();
   * ```
   */
  public readonly config: ConfigManager;

  /**
   * Customer portal management
   *
   * Creates customer portal sessions for subscription management,
   * billing history, and payment method updates.
   *
   * @example
   * ```typescript
   * const portal = await paymentHandler.portal.create({
   *   return_url: 'https://app.com/billing'
   * });
   * ```
   */
  public readonly portal: PortalManager;

  /**
   * Usage tracking and metered billing
   *
   * Records usage events for metered billing products and manages
   * usage-based pricing calculations.
   *
   * @example
   * ```typescript
   * await paymentHandler.usage.recordUsage({
   *   meter_event_name: 'api_calls',
   *   value: '1'
   * });
   * ```
   */
  public readonly usage: UsageManager;
}
