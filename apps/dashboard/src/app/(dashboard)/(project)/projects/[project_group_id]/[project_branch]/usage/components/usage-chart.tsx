"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

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

interface UsageChartProps {
  data: UsageResponse;
}

const chartConfig: ChartConfig = {
  workers_requests: {
    label: "Worker Requests",
    color: "#3b82f6",
  },
  storage_bytes: {
    label: "Storage (MB)",
    color: "#8b5cf6",
  },
  email_sends: {
    label: "Email Sends",
    color: "#10b981",
  },
  db_compute_hours: {
    label: "DB Compute Hours",
    color: "#f59e0b",
  },
};

export function UsageChart({ data }: UsageChartProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (data.period.granularity === "hourly") {
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        hour12: false,
      });
    }
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const chartData = data.data.map((point) => ({
    timestamp: formatDate(point.timestamp),
    workers_requests: point.workers_requests,
    storage_bytes: point.storage_bytes / (1024 * 1024), // Convert to MB
    email_sends: point.email_sends,
    db_compute_hours: point.db_compute_hours,
  }));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Usage Overview</CardTitle>
          <CardDescription>
            Usage metrics from{" "}
            {new Date(data.period.start).toLocaleDateString("en-US", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}{" "}
            to{" "}
            {new Date(data.period.end).toLocaleDateString("en-US", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}{" "}
            ({data.period.granularity})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar
                dataKey="workers_requests"
                fill="var(--color-workers_requests)"
              />
              <Bar dataKey="storage_bytes" fill="var(--color-storage_bytes)" />
              <Bar dataKey="email_sends" fill="var(--color-email_sends)" />
              <Bar
                dataKey="db_compute_hours"
                fill="var(--color-db_compute_hours)"
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Total Usage Summary</CardTitle>
          <CardDescription>Aggregated metrics for the period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Worker Requests</p>
              <p className="text-2xl font-bold">
                {data.totals.workers_requests.toLocaleString()}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Storage</p>
              <p className="text-2xl font-bold">
                {(data.totals.storage_bytes / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Email Sends</p>
              <p className="text-2xl font-bold">
                {data.totals.email_sends.toLocaleString()}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">DB Compute Hours</p>
              <p className="text-2xl font-bold">
                {data.totals.db_compute_hours.toFixed(2)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Storage Operations
              </p>
              <p className="text-2xl font-bold">
                {data.totals.storage_operations.toLocaleString()}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">DB Storage</p>
              <p className="text-2xl font-bold">
                {data.totals.db_storage_gb.toFixed(2)} GB
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Cloud Run Time</p>
              <p className="text-2xl font-bold">
                {(data.totals.cloudrun_billable_time_seconds / 3600).toFixed(2)}{" "}
                hrs
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Workers CPU</p>
              <p className="text-2xl font-bold">
                {(data.totals.workers_cpu_ms / 1000).toFixed(2)} sec
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
