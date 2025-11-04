import type { OmnibaseClient } from "../client";
import type {
  StripeConfigResponse,
  Product,
  ProductWithPricingUI,
  Price,
} from "./types";

export class ConfigManager {
  constructor(private omnibaseClient: OmnibaseClient) {}

  /**
   * Get the current Stripe configuration from the database
   *
   * Retrieves the latest Stripe configuration including products, prices,
   * and UI customization data. This configuration represents the current
   * active pricing structure with all UI elements for pricing table rendering.
   *
   * @returns Promise resolving to the current Stripe configuration
   *
   * @throws {Error} When the API request fails due to network issues
   * @throws {Error} When the server returns an error response (4xx, 5xx status codes)
   *
   * @example
   * Basic usage:
   * ```typescript
   * const config = await getStripeConfig();
   * console.log(`Found ${config.data.config.products.length} products`);
   *
   * // Access product UI configuration
   * config.data.config.products.forEach(product => {
   *   console.log(`${product.name}: ${product.ui?.tagline || 'No tagline'}`);
   * });
   * ```
   */
  async getStripeConfig(): Promise<StripeConfigResponse> {
    try {
      const response = await this.omnibaseClient.fetch(
        `/api/v1/stripe/config`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(
          `Failed to get Stripe config: ${response.status} - ${errorData}`
        );
      }

      const data = await response.json();
      return data as StripeConfigResponse;
    } catch (error) {
      console.error("Error getting Stripe config:", error);
      throw error;
    }
  }

  /**
   * Get available products with UI-ready pricing data
   *
   * Transforms the raw Stripe configuration into UI-ready format for pricing
   * table rendering. Includes formatted pricing, features, limits, and all
   * display customizations needed for marketing pages.
   *
   * @returns Promise resolving to products ready for UI consumption
   *
   * @throws {Error} When the API request fails or configuration is invalid
   *
   * @example
   * Pricing table rendering:
   * ```typescript
   * const products = await getAvailableProducts();
   *
   * products.forEach(product => {
   *   const display = product.pricing_display;
   *   console.log(`${display.name} - ${display.tagline}`);
   *
   *   display.prices.forEach(price => {
   *     console.log(`  ${price.display_name}: ${price.formatted_price}`);
   *   });
   * });
   * ```
   */
  async getAvailableProducts(): Promise<ProductWithPricingUI[]> {
    const configResponse = await this.getStripeConfig();

    if (!configResponse.data?.config) {
      throw new Error("No Stripe configuration found");
    }

    const products = configResponse.data.config.products;

    return products
      .map(transformProductToUIReady)
      .sort(
        (a, b) => a.pricing_display.sort_order - b.pricing_display.sort_order
      );
  }

  /**
   * Get a specific product by ID
   *
   * Retrieves a single product configuration by its ID from the current
   * Stripe configuration. Useful for product-specific operations.
   *
   * @param productId - The configuration product ID to retrieve
   * @returns Promise resolving to the product or null if not found
   *
   * @example
   * ```typescript
   * const product = await getProduct('starter_plan');
   * if (product) {
   *   console.log(`Found product: ${product.name}`);
   * }
   * ```
   */
  async getProduct(productId: string): Promise<Product | null> {
    const configResponse = await this.getStripeConfig();

    if (!configResponse.data?.config) {
      return null;
    }

    const product = configResponse.data.config.products.find(
      (p) => p.id === productId
    );
    return product || null;
  }
}

/**
 * Transform a product configuration into UI-ready format
 *
 * Internal helper that converts raw product data into structured format
 * optimized for pricing table rendering with proper fallbacks and formatting.
 */
function transformProductToUIReady(product: Product): ProductWithPricingUI {
  const ui = product.ui || {};

  return {
    ...product,
    pricing_display: {
      name: ui.display_name || product.name,
      tagline: ui.tagline,
      features: ui.features || [],
      badge: ui.badge,
      cta_text: ui.cta_text || "Choose Plan",
      highlighted: ui.highlighted || false,
      sort_order: ui.sort_order || 0,
      prices: product.prices.map((price) => {
        const priceUI = price.ui || {};

        return {
          id: price.id,
          display_name: priceUI.display_name || formatDefaultPriceName(price),
          formatted_price: formatPrice(price, priceUI),
          billing_period:
            priceUI.billing_period || formatDefaultBillingPeriod(price),
          features: priceUI.features || [],
          limits: priceUI.limits || [],
        };
      }),
    },
  };
}

/**
 * Format price display with custom formatting options
 */
function formatPrice(price: Price, priceUI: any): string {
  // Handle custom text (e.g., "Contact us", "Free")
  if (priceUI.price_display?.custom_text) {
    return priceUI.price_display.custom_text;
  }

  // Handle zero/free pricing
  if (!price.amount || price.amount === 0) {
    return "Free";
  }

  // Format standard pricing
  const amount = price.amount / 100; // Convert from cents
  const currency = price.currency.toUpperCase();

  let formattedPrice = "";

  // Add currency symbol if not explicitly hidden
  if (priceUI.price_display?.show_currency !== false) {
    const currencySymbol = getCurrencySymbol(currency);
    formattedPrice = `${currencySymbol}${amount.toFixed(2)}`;
  } else {
    formattedPrice = amount.toFixed(2);
  }

  // Add suffix if provided
  if (priceUI.price_display?.suffix) {
    formattedPrice += ` ${priceUI.price_display.suffix}`;
  }

  return formattedPrice;
}

/**
 * Get currency symbol for common currencies
 */
function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    CAD: "C$",
    AUD: "A$",
  };

  return symbols[currency] || currency;
}

/**
 * Generate default price name if not specified
 */
function formatDefaultPriceName(price: Price): string {
  if (price.interval) {
    return price.interval.charAt(0).toUpperCase() + price.interval.slice(1);
  }
  return "One-time";
}

/**
 * Generate default billing period text if not specified
 */
function formatDefaultBillingPeriod(price: Price): string {
  if (price.interval) {
    const count = price.interval_count || 1;
    const period = count === 1 ? price.interval : `${count} ${price.interval}s`;
    return `per ${period}`;
  }
  return "one-time";
}
