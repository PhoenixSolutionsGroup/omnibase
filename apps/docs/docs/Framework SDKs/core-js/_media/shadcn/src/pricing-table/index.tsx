import * as React from "react";
import type { Product } from "@omnibase/core-js/payments";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check, Star, ChevronLeft, ChevronRight } from "lucide-react";

export interface PricingTableProps {
  products: Product[];
  selectedPriceId?: string;
  onPriceSelect?: (priceId: string, productId: string) => void;
  className?: string;
  showPricingToggle?: boolean;
  defaultInterval?: "month" | "year";
}

const getCurrencySymbol = (currency: string): string => {
  const symbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    CAD: "C$",
    AUD: "A$",
  };
  return symbols[currency] || currency;
};

const formatPrice = (price: any): string => {
  const priceUI = price.ui || {};
  if (priceUI.price_display?.custom_text)
    return priceUI.price_display.custom_text;
  if (!price.amount || price.amount === 0) return "Free";
  const amount = price.amount / 100;
  const currency = price.currency.toUpperCase();
  let formattedPrice =
    priceUI.price_display?.show_currency !== false
      ? `${getCurrencySymbol(currency)}${amount.toFixed(2)}`
      : amount.toFixed(2);
  if (priceUI.price_display?.suffix)
    formattedPrice += ` ${priceUI.price_display.suffix}`;
  return formattedPrice;
};

const formatBillingPeriod = (price: any): string => {
  const priceUI = price.ui || {};
  if (priceUI.billing_period) return priceUI.billing_period;
  if (price.interval) {
    const count = price.interval_count || 1;
    return `per ${
      count === 1 ? price.interval : `${count} ${price.interval}s`
    }`;
  }
  return "one-time";
};

function PricingCard({
  product,
  isSelected,
  onPriceSelect,
  displayedPrice,
}: {
  product: Product;
  isSelected: boolean;
  onPriceSelect?: (priceId: string, productId: string) => void;
  displayedPrice: any;
}) {
  const ui = product.ui || {};
  const isHighlighted = ui.highlighted;

  return (
    <div
      className={cn(
        "flex flex-col h-full pb-6",
        isHighlighted ? "relative" : ""
      )}
    >
      <div className="h-4 flex-shrink-0 relative">
        {ui.badge && (
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 whitespace-nowrap shadow-md">
              {ui.badge === "Most Popular" && <Star className="w-3 h-3" />}
              {ui.badge}
            </div>
          </div>
        )}
      </div>
      <Card
        className={cn(
          "flex flex-col flex-1 w-full transition-all duration-200 hover:shadow-lg",
          isHighlighted && "border-primary shadow-lg",
          isSelected && "ring-2 ring-primary"
        )}
      >
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold">
            {ui.display_name || product.name}
          </CardTitle>
          {ui.tagline && (
            <CardDescription className="text-base">
              {ui.tagline}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="flex-1 space-y-6">
          <div className="text-center">
            <div className="text-3xl font-bold">
              {formatPrice(displayedPrice)}
            </div>
            <div className="text-sm text-muted-foreground">
              {formatBillingPeriod(displayedPrice)}
            </div>
          </div>
          {((ui.features && ui.features.length > 0) ||
            displayedPrice.ui?.features?.length > 0 ||
            displayedPrice.ui?.limits?.length > 0) && (
            <div className="space-y-4">
              {ui.features && ui.features.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    Features
                  </h4>
                  <ul className="space-y-2">
                    {ui.features.map((feature: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {displayedPrice.ui?.features &&
                displayedPrice.ui.features.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                      This Plan
                    </h4>
                    <ul className="space-y-2">
                      {displayedPrice.ui.features.map(
                        (feature: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              {displayedPrice.ui?.limits &&
                displayedPrice.ui.limits.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                      Usage Limits
                    </h4>
                    <ul className="space-y-1">
                      {displayedPrice.ui.limits.map(
                        (limit: { text: string }, index: number) => (
                          <li
                            key={index}
                            className="text-sm text-muted-foreground"
                          >
                            {limit.text}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            variant={isHighlighted ? "default" : "outline"}
            size="lg"
            onClick={() => onPriceSelect?.(displayedPrice.id, product.id)}
          >
            {ui.cta_text || "Choose Plan"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

const CARD_WIDTH = 320;
const GAP = 24;

export function PricingTable({
  products,
  selectedPriceId,
  onPriceSelect,
  className,
  showPricingToggle = false,
  defaultInterval = "month",
}: PricingTableProps) {
  const [selectedInterval, setSelectedInterval] = React.useState<
    "month" | "year"
  >(defaultInterval);
  const [carouselIndex, setCarouselIndex] = React.useState(0);

  const sortedProducts = React.useMemo(
    () =>
      [...products].sort(
        (a, b) => (a.ui?.sort_order ?? 999) - (b.ui?.sort_order ?? 999)
      ),
    [products]
  );

  const hasMultipleIntervals = React.useMemo(
    () =>
      products.some(
        (p) => new Set(p.prices.map((price) => price.interval)).size > 1
      ),
    [products]
  );

  const getDisplayedPrice = (product: Product) =>
    product.prices.find((price) => price.interval === selectedInterval) ||
    product.prices[0];

  const renderCard = (product: Product) => {
    const displayedPrice = getDisplayedPrice(product);
    return (
      <PricingCard
        product={product}
        displayedPrice={displayedPrice}
        isSelected={selectedPriceId === displayedPrice.id}
        onPriceSelect={onPriceSelect}
      />
    );
  };

  const desktopCarousel = (
    <div className="relative max-w-7xl mx-auto">
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 z-10 bg-white shadow-lg border hover:bg-gray-50 disabled:opacity-50"
        onClick={() => setCarouselIndex(Math.max(0, carouselIndex - 1))}
        disabled={carouselIndex === 0}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      <div
        className="overflow-hidden mx-auto"
        style={{ width: `${3 * CARD_WIDTH + 2 * GAP}px` }}
      >
        <div
          className="flex items-stretch transition-transform duration-300 ease-in-out"
          style={{
            transform: `translateX(-${carouselIndex * (CARD_WIDTH + GAP)}px)`,
            gap: `${GAP}px`,
          }}
        >
          {sortedProducts.map((p) => (
            <div
              key={p.id}
              style={{ width: `${CARD_WIDTH}px` }}
              className="flex-shrink-0"
            >
              {renderCard(p)}
            </div>
          ))}
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 z-10 bg-white shadow-lg border hover:bg-gray-50 disabled:opacity-50"
        onClick={() =>
          setCarouselIndex(
            Math.min(sortedProducts.length - 3, carouselIndex + 1)
          )
        }
        disabled={carouselIndex >= sortedProducts.length - 3}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
      <div className="flex justify-center mt-6 space-x-2">
        {Array.from(
          { length: Math.max(1, sortedProducts.length - 2) },
          (_, i) => (
            <button
              key={i}
              onClick={() => setCarouselIndex(i)}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                i === carouselIndex ? "bg-primary" : "bg-gray-300"
              )}
              aria-label={`Go to slide ${i + 1}`}
            />
          )
        )}
      </div>
    </div>
  );

  const staticLayout = (
    <div
      className="flex flex-row items-stretch justify-center"
      style={{ gap: `${GAP}px` }}
    >
      {sortedProducts.map((p) => (
        <div
          key={p.id}
          style={{ width: `${CARD_WIDTH}px` }}
          className="flex-shrink-0"
        >
          {renderCard(p)}
        </div>
      ))}
    </div>
  );

  return (
    <div className={cn("w-full", className)}>
      {showPricingToggle && hasMultipleIntervals && (
        <div className="flex justify-center mb-4">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <Button
              variant={selectedInterval === "month" ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedInterval("month")}
              className="rounded-md"
            >
              Monthly
            </Button>
            <Button
              variant={selectedInterval === "year" ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedInterval("year")}
              className="rounded-md"
            >
              Yearly
            </Button>
          </div>
        </div>
      )}

      {/* Mobile/Tablet: Carousel, 1 card at a time, centered */}
      <div className="lg:hidden relative">
        <div
          className="overflow-hidden mx-auto"
          style={{ width: `${CARD_WIDTH}px` }}
        >
          <div
            className="flex transition-transform duration-300 ease-in-out items-stretch"
            style={{
              transform: `translateX(-${carouselIndex * CARD_WIDTH}px)`,
            }}
          >
            {sortedProducts.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0"
                style={{ width: `${CARD_WIDTH}px` }}
              >
                {renderCard(product)}
              </div>
            ))}
          </div>
        </div>
        {sortedProducts.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 bg-white shadow-lg border hover:bg-gray-50 disabled:opacity-50"
              onClick={() => setCarouselIndex((prev) => Math.max(0, prev - 1))}
              disabled={carouselIndex === 0}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 bg-white shadow-lg border hover:bg-gray-50 disabled:opacity-50"
              onClick={() =>
                setCarouselIndex((prev) =>
                  Math.min(sortedProducts.length - 1, prev + 1)
                )
              }
              disabled={carouselIndex >= sortedProducts.length - 1}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
            <div className="flex justify-center mt-6 space-x-2">
              {Array.from({ length: sortedProducts.length }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCarouselIndex(i)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    i === carouselIndex ? "bg-primary" : "bg-gray-300"
                  )}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Desktop: Static grid or Carousel */}
      <div className="hidden lg:block">
        {sortedProducts.length <= 3 ? staticLayout : desktopCarousel}
      </div>
    </div>
  );
}

export default PricingTable;
