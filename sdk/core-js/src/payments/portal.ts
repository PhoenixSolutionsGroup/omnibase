import type { OmnibaseClient } from "../client";
import type { ApiResponse } from "../types";

/**
 * Configuration options for creating a Stripe customer portal session
 *
 * Defines the parameters needed to create a customer portal session
 * that allows customers to manage their subscription, payment methods,
 * billing history, and other account settings.
 *
 * @example
 * ```typescript
 * const options: PortalOptions = {
 *   return_url: 'https://app.com/billing'
 * };
 * ```
 *
 * @since 1.0.0
 * @public
 * @group Portal
 */
export type PortalOptions = {
  /** URL to redirect the customer to when they exit the portal */
  return_url: string;
};

/**
 * Response from creating a customer portal session
 *
 * Contains the portal session URL for redirecting customers to
 * Stripe's hosted customer portal where they can manage their
 * billing and subscription settings.
 *
 * @since 1.0.0
 * @public
 * @group Portal
 */
export type CreateCustomerPortalResponse = ApiResponse<{
  /** URL to redirect the customer to for accessing their portal */
  url: string;
}>;

/**
 * Manager for Stripe customer portal operations
 *
 * Handles creation of customer portal sessions that allow customers
 * to manage their own billing information, subscriptions, payment methods,
 * and download invoices through Stripe's hosted portal interface.
 *
 * The customer portal provides a secure, self-service interface that
 * reduces support burden by allowing customers to handle common
 * billing tasks independently.
 *
 * @example
 * Creating a customer portal session:
 * ```typescript
 * const portalManager = new PortalManager(paymentHandler);
 *
 * const portal = await portalManager.create({
 *   return_url: 'https://app.com/billing'
 * });
 *
 * // Redirect customer to portal
 * window.location.href = portal.data.url;
 * ```
 *
 * @since 1.0.0
 * @public
 * @group Portal
 */
export class PortalManager {
  /**
   * Initialize the portal manager
   *
   * @param paymentHandler - Payment handler instance for API communication
   *
   * @group Portal
   */
  constructor(private omnibaseClient: OmnibaseClient) {}

  /**
   * Create a new customer portal session
   *
   * Creates a portal session that allows the specified customer to
   * manage their billing information, subscriptions, and payment methods.
   * Returns a URL that the customer should be redirected to.
   *
   * The portal session is temporary and expires after a short period
   * for security. Each access requires creating a new session.
   *
   * @param options - Configuration options for the portal session
   * @param options.return_url - URL to redirect to when exiting the portal
   *
   * @returns Promise resolving to portal session response with access URL
   *
   * @throws {Error} When the API request fails due to network issues
   * @throws {Error} When the server returns an error response
   * @throws {ValidationError} When required parameters are missing or invalid
   *
   * @example
   * Basic portal creation:
   * ```typescript
   * const portal = await portalManager.create({
   *   return_url: 'https://myapp.com/account/billing'
   * });
   *
   * // Redirect user to portal
   * window.location.href = portal.data.url;
   * ```
   *
   * @example
   * With error handling:
   * ```typescript
   * try {
   *   const portal = await portalManager.create({
   *     return_url: window.location.origin + '/billing'
   *   });
   *
   *   window.location.href = portal.data.url;
   * } catch (error) {
   *   console.error('Failed to create portal session:', error);
   *   showErrorMessage('Unable to access billing portal. Please try again.');
   * }
   * ```
   *
   * @since 1.0.0
   * @group Portal
   */
  async create(options: PortalOptions): Promise<CreateCustomerPortalResponse> {
    const response = await this.omnibaseClient.fetch(
      "/api/v1/payments/portal",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(options),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(
        `Failed to create customer portal: ${response.status} - ${errorData}`
      );
    }

    const result = await response.json();
    return result as CreateCustomerPortalResponse;
  }
}
