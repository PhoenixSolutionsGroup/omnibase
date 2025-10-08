import type { ApiResponse } from "../types";

/**
 * Response from Stripe configuration API endpoints
 *
 * Contains the current Stripe configuration including products, prices,
 * and UI customization settings. This represents the complete billing
 * configuration loaded from the database.
 *
 * @since 1.0.0
 * @public
 * @group Configuration
 */
export type StripeConfigResponse = ApiResponse<{
  /** The complete Stripe configuration object */
  config: StripeConfiguration;

  /** Optional message from the API response */
  message?: string;
}>;

/**
 * Complete Stripe billing configuration
 *
 * Represents a versioned Stripe configuration containing all products,
 * prices, and UI customizations. This configuration is stored in the
 * database and enables safe deployment and rollback of pricing changes.
 *
 * @example
 * ```typescript
 * const config: StripeConfiguration = {
 *   version: "v1.2.0",
 *   products: [
 *     {
 *       id: "starter_plan",
 *       name: "Starter Plan",
 *       description: "Perfect for individuals and small teams",
 *       type: "service",
 *       prices: [...]
 *     }
 *   ]
 * };
 * ```
 *
 * @since 1.0.0
 * @public
 * @group Configuration
 */
export interface StripeConfiguration {
  /** Version identifier for this configuration */
  version: string;

  /** Array of all products in this configuration */
  products: Product[];
}

/**
 * Product definition in Stripe configuration
 *
 * Represents a billable product or service with associated pricing options
 * and UI customizations. Products can be services, physical goods, or
 * metered usage products.
 *
 * @example
 * ```typescript
 * const product: Product = {
 *   id: "pro_plan",
 *   name: "Professional Plan",
 *   description: "Advanced features for growing businesses",
 *   type: "service",
 *   prices: [
 *     { id: "monthly", amount: 2900, currency: "usd", interval: "month" },
 *     { id: "yearly", amount: 29000, currency: "usd", interval: "year" }
 *   ],
 *   ui: {
 *     display_name: "Pro",
 *     tagline: "Most Popular",
 *     features: ["Unlimited projects", "24/7 support"],
 *     highlighted: true
 *   }
 * };
 * ```
 *
 * @since 1.0.0
 * @public
 * @group Configuration
 */
export interface Product {
  /** Unique identifier for this product */
  id: string;

  /** Display name for the product */
  name: string;

  /** Optional detailed description */
  description?: string;

  /**
   * Product type affecting billing behavior
   * - 'service': Subscription services
   * - 'good': Physical or digital goods
   * - 'metered': Usage-based billing
   */
  type?: "service" | "good" | "metered";

  /** Array of pricing options for this product */
  prices: Price[];

  /** Optional UI customization settings */
  ui?: ProductUI;
}

/**
 * Price definition for a product
 *
 * Defines a specific pricing option including amount, currency, billing
 * frequency, and advanced pricing features like tiered billing. Supports
 * both fixed and usage-based pricing models.
 *
 * @example
 * Simple monthly pricing:
 * ```typescript
 * const monthlyPrice: Price = {
 *   id: "monthly_standard",
 *   amount: 1999, // $19.99 in cents
 *   currency: "usd",
 *   interval: "month",
 *   usage_type: "licensed"
 * };
 * ```
 *
 * @example
 * Tiered usage pricing:
 * ```typescript
 * const tieredPrice: Price = {
 *   id: "api_calls_tiered",
 *   currency: "usd",
 *   usage_type: "metered",
 *   billing_scheme: "tiered",
 *   tiers_mode: "graduated",
 *   tiers: [
 *     { up_to: 1000, unit_amount: 10 }, // First 1000 calls at $0.10 each
 *     { up_to: "inf", unit_amount: 5 }  // Additional calls at $0.05 each
 *   ]
 * };
 * ```
 *
 * @since 1.0.0
 * @public
 * @group Configuration
 */
export interface Price {
  /** Unique identifier for this price */
  id: string;

  /**
   * Price amount in smallest currency unit (e.g., cents for USD)
   * Omitted for usage-based pricing with tiers
   */
  amount?: number;

  /** Currency code (ISO 4217) */
  currency: string;

  /**
   * Billing interval for recurring prices
   * - 'month': Monthly billing
   * - 'year': Annual billing
   * - 'week': Weekly billing
   * - 'day': Daily billing
   */
  interval?: "month" | "year" | "week" | "day";

  /**
   * Number of intervals between billings
   * @defaultValue 1
   */
  interval_count?: number;

  /**
   * Usage type determining billing model
   * - 'licensed': Fixed recurring pricing
   * - 'metered': Usage-based pricing
   */
  usage_type?: "licensed" | "metered";

  /**
   * Billing scheme for complex pricing
   * - 'per_unit': Simple per-unit pricing
   * - 'tiered': Graduated or volume-based tiers
   */
  billing_scheme?: "per_unit" | "tiered";

  /**
   * Tier calculation mode (when billing_scheme is 'tiered')
   * - 'graduated': Each tier applies to usage within that tier
   * - 'volume': Entire usage charged at the tier rate
   */
  tiers_mode?: "graduated" | "volume";

  /** Pricing tiers for tiered billing */
  tiers?: Tier[];

  /** Optional UI customization settings */
  ui?: PriceUI;
}

/**
 * Pricing tier definition for tiered billing
 *
 * Defines a usage range and associated pricing for tiered billing models.
 * Enables graduated pricing where different usage levels have different rates.
 *
 * @example
 * ```typescript
 * const tiers: Tier[] = [
 *   { up_to: 100, flat_amount: 0, unit_amount: 10 },    // First 100 free, then $0.10 each
 *   { up_to: 1000, unit_amount: 5 },                    // Next 900 at $0.05 each
 *   { up_to: "inf", unit_amount: 2 }                    // Beyond 1000 at $0.02 each
 * ];
 * ```
 *
 * @since 1.0.0
 * @public
 * @group Configuration
 */
export interface Tier {
  /**
   * Upper bound for this tier
   * Use "inf" for the highest tier with no upper limit
   */
  up_to: number | "inf";

  /**
   * Fixed amount charged for this tier (in cents)
   * Used for flat fees at tier boundaries
   */
  flat_amount?: number;

  /**
   * Per-unit amount for usage within this tier (in cents)
   * Applied to each unit of usage in this tier range
   */
  unit_amount?: number;
}

/**
 * UI customization settings for products
 *
 * Controls how products are displayed in pricing tables and marketing pages.
 * Provides extensive customization options for branding and presentation.
 *
 * @example
 * ```typescript
 * const productUI: ProductUI = {
 *   display_name: "Enterprise",
 *   tagline: "For large organizations",
 *   features: ["SSO integration", "Advanced analytics", "Priority support"],
 *   badge: "Most Popular",
 *   cta_text: "Contact Sales",
 *   highlighted: true,
 *   sort_order: 3
 * };
 * ```
 *
 * @since 1.0.0
 * @public
 * @group UI Configuration
 */
export interface ProductUI {
  /** Custom display name (overrides product.name) */
  display_name?: string;

  /** Marketing tagline or subtitle */
  tagline?: string;

  /** List of key features to highlight */
  features?: string[];

  /** Optional badge text (e.g., "Popular", "Best Value") */
  badge?: string;

  /** Custom call-to-action button text */
  cta_text?: string;

  /** Whether to visually highlight this product */
  highlighted?: boolean;

  /** Sort order for display (lower numbers first) */
  sort_order?: number;
}

/**
 * UI customization settings for prices
 *
 * Controls how individual price options are displayed within products.
 * Enables custom formatting, feature lists, and usage limits display.
 *
 * @example
 * ```typescript
 * const priceUI: PriceUI = {
 *   display_name: "Annual Billing",
 *   price_display: {
 *     custom_text: "$99/year",
 *     suffix: "billed annually"
 *   },
 *   billing_period: "per year",
 *   features: ["2 months free", "Priority support"],
 *   limits: [
 *     { text: "Up to 10 users", value: 10, unit: "users" },
 *     { text: "100GB storage", value: 100, unit: "GB" }
 *   ]
 * };
 * ```
 *
 * @since 1.0.0
 * @public
 * @group UI Configuration
 */
export interface PriceUI {
  /** Custom display name for this price option */
  display_name?: string;

  /** Custom price display formatting */
  price_display?: PriceDisplay;

  /** Custom billing period description */
  billing_period?: string;

  /** Price-specific features to highlight */
  features?: string[];

  /** Usage limits and quotas for this price */
  limits?: PriceLimit[];
}

/**
 * Custom price display formatting options
 *
 * Provides fine-grained control over how prices are formatted and displayed,
 * including custom text, currency symbols, and suffixes.
 *
 * @example
 * ```typescript
 * const priceDisplay: PriceDisplay = {
 *   custom_text: "Contact us for pricing",
 *   show_currency: false,
 *   suffix: "per month"
 * };
 * ```
 *
 * @since 1.0.0
 * @public
 * @group UI Configuration
 */
export interface PriceDisplay {
  /**
   * Custom text to display instead of calculated price
   * Useful for "Contact us" or "Free" pricing
   */
  custom_text?: string;

  /**
   * Whether to show currency symbol
   * @defaultValue true
   */
  show_currency?: boolean;

  /** Additional text to append after the price */
  suffix?: string;
}

/**
 * Usage limit or quota definition
 *
 * Represents a specific limit or quota associated with a price tier,
 * such as user limits, storage quotas, or API call allowances.
 *
 * @example
 * ```typescript
 * const limits: PriceLimit[] = [
 *   { text: "Up to 5 team members", value: 5, unit: "users" },
 *   { text: "50GB storage included", value: 50, unit: "GB" },
 *   { text: "Unlimited API calls" } // No value/unit for unlimited
 * ];
 * ```
 *
 * @since 1.0.0
 * @public
 * @group UI Configuration
 */
export interface PriceLimit {
  /** Human-readable description of the limit */
  text: string;

  /** Numeric value of the limit (omit for unlimited) */
  value?: number;

  /** Unit of measurement for the limit */
  unit?: string;
}

/**
 * UI-ready product data structure for pricing tables
 *
 * Extended product interface that includes pre-processed display data
 * optimized for rendering pricing tables and marketing pages. Contains
 * formatted prices, organized features, and display-ready content.
 *
 * This interface is returned by [`getAvailableProducts()`](config.ts) and provides
 * everything needed to render a complete pricing table without additional
 * data processing.
 *
 * @example
 * ```typescript
 * const products: ProductWithPricingUI[] = await configManager.getAvailableProducts();
 *
 * products.forEach(product => {
 *   const display = product.pricing_display;
 *   console.log(`${display.name}: ${display.tagline}`);
 *
 *   display.prices.forEach(price => {
 *     console.log(`  ${price.display_name}: ${price.formatted_price}`);
 *   });
 * });
 * ```
 *
 * @since 1.0.0
 * @public
 * @group UI Configuration
 */
export interface ProductWithPricingUI extends Product {
  /** Pre-processed display data for UI rendering */
  pricing_display: {
    /** Display name for the product */
    name: string;

    /** Marketing tagline or subtitle */
    tagline?: string;

    /** Key features to highlight */
    features: string[];

    /** Optional badge text */
    badge?: string;

    /** Call-to-action button text */
    cta_text: string;

    /** Whether this product should be visually highlighted */
    highlighted: boolean;

    /** Sort order for display */
    sort_order: number;

    /** UI-ready price information */
    prices: Array<{
      /** Price identifier */
      id: string;

      /** Display name for this price option */
      display_name: string;

      /** Formatted price string ready for display */
      formatted_price: string;

      /** Billing period description */
      billing_period: string;

      /** Price-specific features */
      features: string[];

      /** Usage limits and quotas */
      limits: Array<{
        /** Limit description */
        text: string;

        /** Numeric value (if applicable) */
        value?: number;

        /** Unit of measurement */
        unit?: string;
      }>;
    }>;
  };
}
