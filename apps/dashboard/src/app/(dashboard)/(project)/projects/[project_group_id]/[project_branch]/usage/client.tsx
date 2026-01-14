"use client";

import React, { useEffect, useState } from "react";
import { UsageChart } from "./components/usage-chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

interface UsageClientProps {
  projectId: string;
  projectCreatedAt: string;
}

function generateMonthOptions(createdAt: string) {
  const created = new Date(createdAt);
  const now = new Date();
  const options: { value: string; label: string }[] = [];

  // Start from the month the project was created
  const startYear = created.getFullYear();
  const startMonth = created.getMonth();

  // Go up to the current month
  const endYear = now.getFullYear();
  const endMonth = now.getMonth();

  for (let year = startYear; year <= endYear; year++) {
    const monthStart = year === startYear ? startMonth : 0;
    const monthEnd = year === endYear ? endMonth : 11;

    for (let month = monthStart; month <= monthEnd; month++) {
      const date = new Date(year, month, 1);
      const value = `${year}-${String(month + 1).padStart(2, "0")}`;
      const label = date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
      options.push({ value, label });
    }
  }

  // Reverse to show most recent first
  return options.reverse();
}

export function UsageClient({ projectId, projectCreatedAt }: UsageClientProps) {
  const monthOptions = generateMonthOptions(projectCreatedAt);
  const [selectedMonth, setSelectedMonth] = useState(
    monthOptions[0]?.value || ""
  );
  const [usageData, setUsageData] = useState<UsagePreviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedMonth) return;

    async function fetchUsageData() {
      try {
        setLoading(true);
        setError(null);

        const [year, month] = selectedMonth.split("-").map(Number);

        // Selected month: start to end of selected calendar month (RFC3339 format)
        const monthStart = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
        const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59));
        const now = new Date();
        // Use the earlier of end-of-month or current time
        const monthEnd = endOfMonth < now ? endOfMonth : now;

        const response = await fetch(
          `/api/projects/${projectId}/usage?start=${monthStart.toISOString()}&end=${monthEnd.toISOString()}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load usage data");
        }

        const data = await response.json();
        setUsageData(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load usage data"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchUsageData();
  }, [projectId, selectedMonth]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usage</h1>
          <p className="text-muted-foreground">
            Monitor your project's usage metrics
          </p>
        </div>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-64 mt-2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Summary Cards Skeleton */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="flex flex-col space-y-2 p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Skeleton className="w-3 h-3 rounded-full" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  ))}
                </div>

                {/* Table Skeleton */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...Array(4)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-5 w-16 rounded-full" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-48" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-4 w-16 ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center p-8">
          <p className="text-muted-foreground">{error}</p>
        </div>
      )}

      {!loading && !error && usageData && <UsageChart data={usageData} />}

      {!loading && !error && !usageData && (
        <div className="flex items-center justify-center p-8">
          <p className="text-muted-foreground">No usage data available</p>
        </div>
      )}
    </div>
  );
}
