import type { OmnibaseClient } from "../client";
import type { ApiResponse } from "../types";

/**
 * Configuration options for recording usage events
 *
 * Defines the parameters needed to record a usage event for metered billing.
 * Usage events are used to track consumption of metered products and calculate
 * charges based on actual usage rather than fixed pricing.
 *
 * @example
 * ```typescript
 * const options: UsageOptions = {
 *   meter_event_name: 'api_calls',
 *   value: '1'
 * };
 * ```
 *
 * @since 1.0.0
 * @public
 * @group Usage
 */
export type UsageOptions = {
  /**
   * Name of the meter event to record usage for
   * Must match a meter configured in your Stripe billing configuration
   */
  meter_event_name: string;

  /**
   * Usage value to record as a string
   * Typically represents quantity consumed (e.g., "1" for single API call, "250" for MB of storage)
   */
  value: string;
};

/**
 * Manager for usage tracking and metered billing operations
 *
 * Handles recording of usage events for metered billing products. Usage events
 * are used by Stripe to calculate charges for products with usage-based pricing,
 * such as API calls, data transfer, or storage consumption.
 *
 * Usage tracking is essential for accurate metered billing and provides
 * transparency to customers about their consumption patterns.
 *
 * @example
 * Recording API usage:
 * ```typescript
 * const usageManager = new UsageManager(paymentHandler);
 *
 * // Record a single API call
 * await usageManager.recordUsage({
 *   meter_event_name: 'api_calls',
 *   value: '1'
 * });
 *
 * // Record bulk data transfer
 * await usageManager.recordUsage({
 *   meter_event_name: 'data_transfer_gb',
 *   value: '2.5'
 * });
 * ```
 *
 * @since 1.0.0
 * @public
 * @group Usage
 */
export class UsageManager {
  /**
   * Initialize the usage manager
   *
   * @param paymentHandler - Payment handler instance for API communication
   *
   * @group Usage
   */
  constructor(private omnibaseClient: OmnibaseClient) {}

  /**
   * Record a usage event for metered billing
   *
   * Records a usage event against a specific meter for billing calculation.
   * The event will be aggregated with other usage events for the billing period
   * to determine the customer's charges for metered products.
   *
   * Usage events should be recorded in real-time or as close to real-time as
   * possible to ensure accurate billing and provide up-to-date usage visibility
   * to customers.
   *
   * @param options - Usage recording options
   * @param options.meter_event_name - Name of the meter to record against
   * @param options.value - Usage quantity as string
   *
   * @returns Promise resolving to API response confirmation
   *
   * @throws {Error} When the API request fails due to network issues
   * @throws {Error} When the server returns an error response (invalid meter name, customer, etc.)
   * @throws {ValidationError} When required parameters are missing or invalid
   *
   * @example
   * API call tracking:
   * ```typescript
   * // Record each API call
   * await usageManager.recordUsage({
   *   meter_event_name: 'api_requests',
   *   value: '1'
   * });
   * ```
   *
   * @example
   * Batch usage recording:
   * ```typescript
   * // Record multiple operations at once
   * const usageEvents = [
   *   { meter_event_name: 'compute_hours', value: '0.5' },
   *   { meter_event_name: 'storage_gb', value: '10' },
   *   { meter_event_name: 'api_calls', value: '50' }
   * ];
   *
   * for (const event of usageEvents) {
   *   await usageManager.recordUsage(event);
   * }
   * ```
   *
   * @example
   * With error handling:
   * ```typescript
   * try {
   *   await usageManager.recordUsage({
   *     meter_event_name: 'file_uploads',
   *     value: String(uploadedFiles.length)
   *   });
   * } catch (error) {
   *   console.error('Failed to record usage:', error);
   *   // Usage recording failure shouldn't block user operations
   *   // but should be logged for billing accuracy
   * }
   * ```
   *
   * @since 1.0.0
   * @group Usage
   */
  async recordUsage(options: UsageOptions): Promise<ApiResponse<"">> {
    const response = await this.omnibaseClient.fetch("/api/v1/payments/usage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(
        `Failed to record usage: ${response.status} - ${errorData}`
      );
    }

    const result = await response.json();
    return result as ApiResponse<"">;
  }
}
