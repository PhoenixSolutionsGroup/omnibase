import type { OmnibaseClient } from "../client";
import type { ApiResponse } from "../types";

/**
 * Configuration options for creating a Stripe checkout session
 *
 * Defines all parameters needed to create a checkout session for either
 * one-time payments or subscription billing. The checkout mode (payment vs
 * subscription) is automatically determined by examining the price configuration
 * - no need to specify it manually.
 *
 * @example
 * ```typescript
 * const options: CheckoutOptions = {
 *   price_id: 'price_monthly_pro',
 *   success_url: 'https://app.com/success?session_id={CHECKOUT_SESSION_ID}',
 *   cancel_url: 'https://app.com/pricing',
 * };
 * ```
 *
 * @since 0.6.0
 * @public
 * @group Checkout
 */
export type CheckoutOptions = {
  /** Stripe price ID for the product/service being purchased */
  price_id: string;
  /**
   * URL to redirect to after successful payment
   * Can include {CHECKOUT_SESSION_ID} placeholder for session tracking
   */

  success_url: string;

  /** URL to redirect to if the user cancels the checkout */
  cancel_url: string;

  /**
   * Number of days for the trial period (subscriptions only)
   * Only applies when the price has a recurring interval
   */
  trial_period_days?: number;

  /**
   * Stripe promotion code ID to apply automatically
   * Mutually exclusive with allow_promotion_codes
   */
  promotion_code?: string;

  /**
   * Whether to show promotion code input field in checkout
   * Allows customers to enter their own promo codes
   */
  allow_promotion_codes?: boolean;
};

/**
 * Response from creating a checkout session
 *
 * Contains the checkout session URL and ID for redirecting users
 * to Stripe's hosted checkout page and tracking the session.
 *
 * @since 0.6.0
 * @public
 * @group Checkout
 */
export type CreateCheckoutResponse = ApiResponse<{
  /** URL to redirect the user to for completing payment */
  url: string;

  /** Unique identifier for the checkout session */
  sessionId: string;
}>;

/**
 * Manager for Stripe checkout session operations
 *
 * Handles creation and management of Stripe checkout sessions for both
 * one-time payments and subscription billing. The checkout mode is automatically
 * determined by examining whether the price has a recurring interval - recurring
 * prices create subscription checkouts, while non-recurring prices create one-time
 * payment checkouts.
 *
 * Checkout sessions provide a secure, PCI-compliant payment flow without requiring
 * sensitive payment data to touch your servers. The API automatically fetches the
 * price details from Stripe to determine the appropriate checkout mode.
 *
 * @example
 * ```typescript
 * const checkoutManager = new CheckoutManager(omnibaseClient);
 *
 * const session = await checkoutManager.createSession({
 *   price_id: 'price_monthly_pro',
 *   success_url: 'https://app.com/welcome?session_id={CHECKOUT_SESSION_ID}',
 *   cancel_url: 'https://app.com/pricing',
 * });
 *
 * // Redirect user to checkout
 * window.location.href = session.data.url;
 * ```
 *
 * @since 0.6.0
 * @public
 * @group Checkout
 */
export class CheckoutManager {
  /**
   * Initialize the checkout manager
   *
   * @param paymentHandler - Payment handler instance for API communication
   *
   * @group Checkout
   */
  constructor(private omnibaseClient: OmnibaseClient) {}

  /**
   * Create a new Stripe checkout session
   *
   * Creates a checkout session with the specified options and returns
   * the session URL for redirecting the user to complete payment.
   * The checkout mode (one-time payment or subscription) is automatically
   * determined from the price's configuration - no need to specify it manually.
   *
   * @param options - Configuration options for the checkout session
   * @param options.price_id - Stripe price ID for the product/service
   * @param options.success_url - URL to redirect after successful payment
   * @param options.cancel_url - URL to redirect if user cancels
   *
   * @returns Promise resolving to checkout session response with URL and session ID
   *
   * @throws {Error} When the API request fails due to network issues
   * @throws {Error} When the server returns an error response (invalid price_id, etc.)
   * @throws {ValidationError} When required parameters are missing or invalid
   *
   * @example
   * ```typescript
   * const session = await checkoutManager.createSession({
   *   price_id: 'price_monthly_pro',
   *   success_url: 'https://app.com/success',
   *   cancel_url: 'https://app.com/cancel'
   * });
   *
   * // Redirect to Stripe checkout
   * if (session.data?.url) {
   *   window.location.href = session.data.url;
   * }
   * ```
   *
   * @since 0.6.0
   * @group Checkout
   */
  async createSession(
    options: CheckoutOptions
  ): Promise<CreateCheckoutResponse> {
    const response = await this.omnibaseClient.fetch(
      "/api/v1/payments/checkout",
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
        `Failed to create checkout session: ${response.status} - ${errorData}`
      );
    }

    const result = await response.json();
    return result as CreateCheckoutResponse;
  }
}
