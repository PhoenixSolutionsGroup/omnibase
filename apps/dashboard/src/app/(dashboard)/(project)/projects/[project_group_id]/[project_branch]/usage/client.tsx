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

interface UsageMetric {
  timestamp: string;
  storage_bytes: number;
  storage_operations: number;
  db_storage_gb: number;
  db_compute_hours: number;
  email_sends: number;
  cloudrun_billable_time_seconds: number;
  workers_requests: number;
  workers_cpu_ms: number;
}

interface UsageResponse {
  project_id: string;
  project_group_id: string;
  organization_id: string;
  period: {
    start: string;
    end: string;
    granularity: string;
  };
  data: UsageMetric[];
  totals: UsageMetric;
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

        // Selected month: start to end of selected calendar month
        const monthStart = new Date(year, month - 1, 1);
        const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);

        const response = await fetch(
          `/api/projects/${projectId}/usage?start_date=${monthStart.toISOString()}&end_date=${monthEnd.toISOString()}&real_time=true`,
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
        <div className="flex items-center justify-center p-8">
          <p className="text-muted-foreground">Loading usage data...</p>
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
