"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Configuration, V1StripeApi } from "@omnibase/core-js";

interface UsageLineItem {
  PriceID: string;
  Quantity: number;
  Description: string;
  ProjectID: string;
  Metadata: Record<string, string>;
}

interface UsagePreviewResponse {
  project_id: string;
  billing_start: string;
  billing_end: string;
  line_items: UsageLineItem[];
  item_count: number;
}

interface UsageChartProps {
  data: UsagePreviewResponse;
}

type UsageCategory = "Compute" | "Storage" | "Database" | "Email" | "Workers" | "Other";

// Map of PriceID -> amount in cents
type PriceMap = Map<string, number>;

// Price IDs that are priced per million units (divide quantity by 1,000,000)
const PER_MILLION_PRICE_IDS = [
  "cloudflare_workers_cpu_ms",
  "cloudflare_workers_requests",
];

const categoryColors: Record<UsageCategory, string> = {
  Compute: "bg-blue-500",
  Storage: "bg-purple-500",
  Database: "bg-amber-500",
  Email: "bg-green-500",
  Workers: "bg-cyan-500",
  Other: "bg-gray-500",
};

function getCategoryFromDescription(description: string): UsageCategory {
  if (description.startsWith("Compute")) return "Compute";
  if (description.startsWith("Storage")) return "Storage";
  if (description.startsWith("Database")) return "Database";
  if (description.startsWith("Email")) return "Email";
  if (description.startsWith("Workers")) return "Workers";
  return "Other";
}

function formatQuantity(quantity: number, description: string): string {
  const lowerDesc = description.toLowerCase();

  if (lowerDesc.includes("hours") || lowerDesc.includes("compute hours")) {
    return `${quantity.toLocaleString()} hrs`;
  }
  if (lowerDesc.includes("gb-seconds") || lowerDesc.includes("gb seconds")) {
    return `${quantity.toLocaleString()} GB-sec`;
  }
  if (lowerDesc.includes("vcpu-seconds") || lowerDesc.includes("vcpu seconds")) {
    return `${quantity.toLocaleString()} vCPU-sec`;
  }
  if (lowerDesc.includes("requests")) {
    return `${quantity.toLocaleString()} reqs`;
  }
  if (lowerDesc.includes("emails")) {
    return `${quantity.toLocaleString()} emails`;
  }
  if (lowerDesc.includes("cpu ms") || lowerDesc.includes("cpu milliseconds")) {
    // Show milliseconds if under 1 second, otherwise show seconds
    if (quantity < 1000) {
      return `${quantity.toLocaleString()} ms`;
    }
    return `${(quantity / 1000).toFixed(2)} sec`;
  }
  if (lowerDesc.includes("gb") || lowerDesc.includes("storage")) {
    return `${quantity.toLocaleString()} GB`;
  }
  if (lowerDesc.includes("class a ops") || lowerDesc.includes("class b ops")) {
    return `${quantity.toLocaleString()} ops`;
  }

  return quantity.toLocaleString();
}

function formatCost(amountCents: number): string {
  const dollars = amountCents / 100;
  if (dollars < 0.01) {
    return `$${dollars.toFixed(4)}`;
  }
  return `$${dollars.toFixed(2)}`;
}

function calculateCost(priceId: string, pricePerUnit: number, quantity: number): number {
  // Some prices are per million units
  if (PER_MILLION_PRICE_IDS.includes(priceId)) {
    return pricePerUnit * (quantity / 1_000_000);
  }
  return pricePerUnit * quantity;
}

export function UsageChart({ data }: UsageChartProps) {
  const [priceMap, setPriceMap] = useState<PriceMap>(new Map());
  const [pricesLoaded, setPricesLoaded] = useState(false);

  // Fetch prices for all unique PriceIDs using the SDK
  useEffect(() => {
    async function fetchPrices() {
      const uniquePriceIds = [...new Set(data.line_items.map((item) => item.PriceID))];
      if (uniquePriceIds.length === 0) {
        setPricesLoaded(true);
        return;
      }

      const config = new Configuration({
        basePath: process.env.NEXT_PUBLIC_OMNIBASE_API_URL,
      });
      const stripeApi = new V1StripeApi(config);
      const newPriceMap: PriceMap = new Map();

      await Promise.all(
        uniquePriceIds.map(async (priceId) => {
          try {
            const response = await stripeApi.getPriceByID({ priceId });
            if (response.price?.amount !== undefined) {
              newPriceMap.set(priceId, response.price.amount);
            }
          } catch {
            // Price lookup failed - will show as N/A
          }
        })
      );

      setPriceMap(newPriceMap);
      setPricesLoaded(true);
    }

    fetchPrices();
  }, [data.line_items]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Group line items by category
  const groupedItems = data.line_items.reduce(
    (acc, item) => {
      const category = getCategoryFromDescription(item.Description);
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    },
    {} as Record<UsageCategory, UsageLineItem[]>
  );

  const categories = Object.keys(groupedItems) as UsageCategory[];

  // Calculate total cost
  const totalCost = data.line_items.reduce((sum, item) => {
    const pricePerUnit = priceMap.get(item.PriceID);
    if (pricePerUnit !== undefined) {
      return sum + calculateCost(item.PriceID, pricePerUnit, item.Quantity);
    }
    return sum;
  }, 0);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Usage Summary</CardTitle>
              <CardDescription>
                Billing period: {formatDate(data.billing_start)} to{" "}
                {formatDate(data.billing_end)}
              </CardDescription>
            </div>
            {pricesLoaded && totalCost > 0 && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Estimated Total</p>
                <p className="text-2xl font-bold">{formatCost(totalCost)}</p>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {data.line_items.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No usage recorded for this billing period
            </p>
          ) : (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {categories.map((category) => (
                  <div
                    key={category}
                    className="flex flex-col space-y-1 p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${categoryColors[category]}`}
                      />
                      <span className="text-sm font-medium">{category}</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {groupedItems[category].length}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      line item{groupedItems[category].length !== 1 ? "s" : ""}
                    </p>
                  </div>
                ))}
              </div>

              {/* Detailed Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.line_items.map((item, index) => {
                    const category = getCategoryFromDescription(item.Description);
                    const pricePerUnit = priceMap.get(item.PriceID);
                    const cost = pricePerUnit !== undefined ? calculateCost(item.PriceID, pricePerUnit, item.Quantity) : null;

                    return (
                      <TableRow key={`${item.PriceID}-${index}`}>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={`${categoryColors[category]} text-white`}
                          >
                            {category}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.Description}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatQuantity(item.Quantity, item.Description)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {cost !== null ? formatCost(cost) : "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
