"use client";

import React, { useEffect, useState } from "react";
import { UsageChart, UsageResponse } from "./components/usage-chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface UsageClientProps {
  branchId: string;
  branchCreatedAt: string;
}

function generateMonthOptions(createdAt: string) {
  const created = new Date(createdAt);
  const now = new Date();
  const options: { value: string; label: string }[] = [];

  const startYear = created.getFullYear();
  const startMonth = created.getMonth();
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

  return options.reverse();
}

export function UsageClient({ branchId, branchCreatedAt }: UsageClientProps) {
  const monthOptions = generateMonthOptions(branchCreatedAt);
  const [selectedMonth, setSelectedMonth] = useState(
    monthOptions[0]?.value || "",
  );
  const [usageData, setUsageData] = useState<UsageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedMonth) return;

    async function fetchUsageData() {
      try {
        setLoading(true);
        setError(null);

        const [year, month] = selectedMonth.split("-").map(Number);

        const monthStart = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
        const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59));
        const now = new Date();
        const monthEnd = endOfMonth < now ? endOfMonth : now;

        const response = await fetch(
          `/api/project_branches/${branchId}/usage?start=${monthStart.toISOString()}&end=${monthEnd.toISOString()}`,
          {
            method: "GET",
            credentials: "include",
          },
        );

        if (!response.ok) {
          throw new Error("Failed to load usage data");
        }

        const data = await response.json();
        setUsageData(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load usage data",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchUsageData();
  }, [branchId, selectedMonth]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usage</h1>
          <p className="text-muted-foreground">
            Monitor your branch&apos;s usage metrics
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
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col space-y-2 p-4 border rounded-lg"
                >
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
