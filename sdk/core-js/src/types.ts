/**
 * Base API Response structure for all operations
 *
 * This generic type defines the standard response format returned by all
 * API endpoints. It provides a consistent structure for
 * handling both successful responses and error conditions across the SDK.
 *
 * @template T - The type of the response data payload
 *
 * @example
 * Successful response:
 * ```typescript
 * const response: ApiResponse<{ tenant: Tenant }> = {
 *   data: { tenant: { id: '123', name: 'My Company' } },
 *   status: 200
 * };
 * ```
 *
 * @example
 * Error response:
 * ```typescript
 * const response: ApiResponse<never> = {
 *   status: 400,
 *   error: 'Invalid tenant name provided'
 * };
 * ```
 *
 * @since 1.0.0
 * @public
 */
export type ApiResponse<T> = {
  /**
   * Response data payload (present only on successful operations)
   * Contains the actual data returned by the API endpoint
   */
  data?: T;

  /**
   * HTTP status code indicating the result of the operation
   * @example 200 for success, 400 for client errors, 500 for server errors
   */
  status: number;

  /**
   * Error message (present only when operation fails)
   * Provides human-readable description of what went wrong
   */
  error?: string;
};
