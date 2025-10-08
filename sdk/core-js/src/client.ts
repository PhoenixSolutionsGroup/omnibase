import { PaymentHandler } from "./payments";
import { PermissionsClient } from "./permissions";
import { StorageClient } from "./storage";
import { TenantHandler } from "./tenants";

export type OmnibaseClientConfig = {
  api_url: string;
  fetch?: (endpoint: string, options: RequestInit) => Promise<Response>;
};

export class OmnibaseClient {
  constructor(private config: OmnibaseClientConfig) {
    this.permissions = new PermissionsClient(this.config.api_url);
  }

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
   * // Create a checkout session (mode auto-detected from price)
   * const checkout = await omnibase.payments.checkout.createSession({
   *   price_id: 'price_123',
   *   success_url: 'https://app.com/success',
   *   cancel_url: 'https://app.com/cancel'
   * });
   *
   * // Get available products
   * const products = await omnibase.payments.config.getAvailableProducts();
   * ```
   */
  public readonly payments = new PaymentHandler(this);

  public readonly tenants = new TenantHandler(this);

  public readonly permissions: PermissionsClient;

  /**
   * Storage client for file upload/download operations
   *
   * @example
   * ```typescript
   * // Upload with metadata
   * await omnibase.storage.bucket('documents').upload(
   *   'report.pdf',
   *   file,
   *   { metadata: { department: 'engineering' } }
   * );
   * ```
   */
  public storage = new StorageClient(this);

  async fetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
    if (this.config.fetch)
      return this.config.fetch(this.config.api_url + endpoint, options);
    return fetch(this.config.api_url + endpoint, {
      ...options,
      credentials: "include",
    });
  }
}
