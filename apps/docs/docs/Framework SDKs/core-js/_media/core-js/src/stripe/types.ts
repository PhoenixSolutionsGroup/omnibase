import type { ApiResponse } from "../tenants/types";

/**
 * Stripe configuration types mirroring the Go structs and JSON schema
 */

export type StripeConfigResponse = ApiResponse<{
  config: StripeConfiguration;
  message?: string;
}>;

export interface StripeConfiguration {
  version: string;
  products: Product[];
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  type?: "service" | "good" | "metered";
  prices: Price[];
  ui?: ProductUI;
}

export interface Price {
  id: string;
  amount?: number;
  currency: string;
  interval?: "month" | "year" | "week" | "day";
  interval_count?: number;
  usage_type?: "licensed" | "metered";
  billing_scheme?: "per_unit" | "tiered";
  tiers_mode?: "graduated" | "volume";
  tiers?: Tier[];
  ui?: PriceUI;
}

export interface Tier {
  up_to: number | "inf";
  flat_amount?: number;
  unit_amount?: number;
}

// UI Configuration Types

export interface ProductUI {
  display_name?: string;
  tagline?: string;
  features?: string[];
  badge?: string;
  cta_text?: string;
  highlighted?: boolean;
  sort_order?: number;
}

export interface PriceUI {
  display_name?: string;
  price_display?: PriceDisplay;
  billing_period?: string;
  features?: string[];
  limits?: PriceLimit[];
}

export interface PriceDisplay {
  custom_text?: string;
  show_currency?: boolean;
  suffix?: string;
}

export interface PriceLimit {
  text: string;
  value?: number;
  unit?: string;
}

// UI-ready data structures for pricing tables

export interface ProductWithPricingUI extends Product {
  pricing_display: {
    name: string;
    tagline?: string;
    features: string[];
    badge?: string;
    cta_text: string;
    highlighted: boolean;
    sort_order: number;
    prices: Array<{
      id: string;
      display_name: string;
      formatted_price: string;
      billing_period: string;
      features: string[];
      limits: Array<{ text: string; value?: number; unit?: string }>;
    }>;
  };
}
