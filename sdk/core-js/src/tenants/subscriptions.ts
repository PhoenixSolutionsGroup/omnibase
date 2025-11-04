import type { OmnibaseClient } from "../client";
import type { ApiResponse } from "../types";

/**
 * Active subscription data returned from the API
 *
 * Represents a tenant's active Stripe subscription with config-based price IDs
 * instead of raw Stripe IDs. Includes legacy price detection for historical
 * billing configurations.
 *
 * **Note:** "Active" subscriptions include those with status `active`, `trialing`,
 * or `past_due`. This matches Stripe's definition of subscriptions that are
 * currently providing service to the customer.
 *
 * @example
 * ```typescript
 * const subscription: TenantSubscription = {
 *   subscription_id: 'sub_1234567890',
 *   config_price_id: 'price_pro_monthly',
 *   status: 'trialing', // Can be 'active', 'trialing', or 'past_due'
 *   is_legacy_price: false,
 *   current_period_end: 1735416000
 * };
 * ```
 *
 * @since 0.6.0
 * @public
 * @group Tenant Subscriptions
 */
export type TenantSubscription = {
  /** Stripe subscription ID */
  subscription_id: string;
  /** Config-based price ID from your billing configuration */
  config_price_id: string;
  /**
   * Subscription status - will be one of: `active`, `trialing`, or `past_due`
   *
   * These three statuses represent subscriptions that are currently active and
   * providing service to the customer:
   * - `active`: Subscription is active and paid
   * - `trialing`: Subscription is in trial period (no payment required yet)
   * - `past_due`: Payment failed but subscription is still active (grace period)
   */
  status: string;
  /** Whether this price is from a legacy billing configuration */
  is_legacy_price: boolean;
  /** Unix timestamp when the current billing period ends */
  current_period_end: number;
};

/**
 * Response structure for getting active subscriptions
 *
 * @since 0.6.0
 * @public
 * @group Tenant Subscriptions
 */
export type GetActiveSubscriptionsResponse = ApiResponse<TenantSubscription[]>;

/**
 * Billing status information for a tenant
 *
 * Indicates whether the tenant has valid billing information configured
 * in their Stripe customer account.
 *
 * @example
 * ```typescript
 * const status: BillingStatus = {
 *   has_billing_info: true,
 *   is_active: true
 * };
 * ```
 *
 * @since 0.6.0
 * @public
 * @group Tenant Subscriptions
 */
export type BillingStatus = {
  /** Whether the tenant has payment method(s) configured */
  has_billing_info: boolean;
  /** Whether the billing information is active and valid */
  is_active: boolean;
};

/**
 * Response structure for billing status check
 *
 * @since 0.6.0
 * @public
 * @group Tenant Subscriptions
 */
export type GetBillingStatusResponse = ApiResponse<BillingStatus>;

/**
 * Tenant subscription and billing management
 *
 * Provides access to the active tenant's Stripe subscriptions and billing
 * status. All operations are automatically scoped to the user's currently
 * active tenant via session authentication.
 *
 * **Note:** The `getActive()` method returns subscriptions with status `active`,
 * `trialing`, or `past_due` - all of which represent subscriptions currently
 * providing service to the customer.
 *
 * Key features:
 * - View all active subscriptions (including trials) with config-based price IDs
 * - Legacy price detection for historical billing configurations
 * - Billing status verification (payment method availability)
 * - Automatic tenant scoping via session context
 *
 * @example
 * ```typescript
 * const subscriptionManager = new TenantSubscriptionManager(omnibaseClient);
 *
 * // Get all active subscriptions (includes trialing and past_due)
 * const subscriptions = await subscriptionManager.getActive();
 * console.log(`Active subscriptions: ${subscriptions.data.length}`);
 *
 * // Check for trial subscriptions
 * const hasTrials = subscriptions.data.some(sub => sub.status === 'trialing');
 * if (hasTrials) {
 *   console.log('User has active trial subscriptions');
 * }
 *
 * // Check if tenant has billing configured
 * const status = await subscriptionManager.getBillingStatus();
 * if (!status.data.has_billing_info) {
 *   console.log('Please add a payment method');
 * }
 * ```
 *
 * @since 0.6.0
 * @public
 * @group Tenant Subscriptions
 */
export class TenantSubscriptionManager {
  /**
   * Creates a new TenantSubscriptionManager instance
   *
   * @param omnibaseClient - Configured Omnibase client instance
   *
   * @group Tenant Subscriptions
   */
  constructor(private omnibaseClient: OmnibaseClient) {}

  /**
   * Get all active subscriptions for the current tenant
   *
   * Retrieves all active Stripe subscriptions associated with the user's
   * currently active tenant. Returns subscriptions with config-based price IDs
   * instead of raw Stripe IDs, making it easier to match against your billing
   * configuration.
   *
   * **Important:** This method returns subscriptions with status `active`,
   * `trialing`, OR `past_due`. All three statuses represent subscriptions that
   * are currently providing service to the customer:
   * - `active`: Subscription is active and fully paid
   * - `trialing`: Subscription is in trial period (common with trial_period_days)
   * - `past_due`: Payment failed but still in grace period
   *
   * The endpoint automatically:
   * - Fetches subscriptions from Stripe API
   * - Maps Stripe price IDs to your config price IDs
   * - Checks both current and historical price mappings
   * - Flags legacy prices from old billing configurations
   * - Filters to only `active`, `trialing`, and `past_due` subscriptions
   *
   * Returns an empty array if:
   * - Tenant has no Stripe customer ID configured
   * - Tenant has no active subscriptions
   * - User is not authenticated
   *
   * @returns Promise resolving to array of active subscriptions (includes trialing and past_due)
   *
   * @throws {Error} When the user is not authenticated
   * @throws {Error} When the API request fails due to network issues
   * @throws {Error} When the server returns an error response (4xx, 5xx)
   *
   * @example
   * ```typescript
   * const response = await subscriptionManager.getActive();
   *
   * if (response.data.length === 0) {
   *   console.log('No active subscriptions');
   * } else {
   *   response.data.forEach(sub => {
   *     console.log(`Plan: ${sub.config_price_id}`);
   *     console.log(`Status: ${sub.status}`); // Can be 'active', 'trialing', or 'past_due'
   *
   *     if (sub.status === 'trialing') {
   *       console.log('🎉 Currently in trial period');
   *     }
   *
   *     if (sub.is_legacy_price) {
   *       console.log('⚠️ Using legacy pricing');
   *     }
   *   });
   * }
   * ```
   *
   * @since 0.6.0
   * @public
   * @group Tenant Subscriptions
   */
  async getActive(): Promise<GetActiveSubscriptionsResponse> {
    try {
      const response = await this.omnibaseClient.fetch(
        `/api/v1/tenants/subscriptions`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(
          `Failed to fetch subscriptions: ${response.status} - ${errorData}`
        );
      }

      const data = await response.json();
      return data as GetActiveSubscriptionsResponse;
    } catch (error) {
      console.error("Error fetching tenant subscriptions:", error);
      throw error;
    }
  }

  /**
   * Check if the current tenant has billing information configured
   *
   * Verifies whether the tenant has valid payment methods attached to their
   * Stripe customer account. This is useful for:
   * - Showing billing setup prompts
   * - Gating premium features behind payment method requirement
   * - Displaying billing status indicators in UI
   * - Determining if customer portal access should be shown
   *
   * The check verifies:
   * - Default payment source (card, bank account, etc.)
   * - Default payment method in invoice settings
   * - Whether the payment method is valid and active
   *
   * Returns `false` if:
   * - Tenant has no Stripe customer ID
   * - No payment methods are configured
   * - User is not authenticated
   *
   * @returns Promise resolving to billing status information
   *
   * @throws {Error} When the user is not authenticated
   * @throws {Error} When the API request fails due to network issues
   * @throws {Error} When the server returns an error response (4xx, 5xx)
   *
   * @example
   * ```typescript
   * const response = await subscriptionManager.getBillingStatus();
   *
   * if (!response.data.has_billing_info) {
   *   // Show billing setup prompt
   *   showBillingSetupModal();
   * } else if (!response.data.is_active) {
   *   // Payment method exists but may be expired/invalid
   *   showPaymentMethodUpdatePrompt();
   * } else {
   *   // All good - show customer portal link
   *   showManageBillingButton();
   * }
   * ```
   *
   * @since 0.6.0
   * @public
   * @group Tenant Subscriptions
   */
  async getBillingStatus(): Promise<GetBillingStatusResponse> {
    try {
      const response = await this.omnibaseClient.fetch(
        `/api/v1/tenants/billing-status`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(
          `Failed to fetch billing status: ${response.status} - ${errorData}`
        );
      }

      const data = await response.json();
      return data as GetBillingStatusResponse;
    } catch (error) {
      console.error("Error fetching billing status:", error);
      throw error;
    }
  }
}
