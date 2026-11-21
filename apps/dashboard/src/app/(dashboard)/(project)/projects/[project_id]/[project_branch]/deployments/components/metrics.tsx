"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Separator } from "@/components/ui/separator";

export interface ApiResponse<T> {
  status: number;
  data: T;
}

export type MetricName =
  | "requests"
  | "errors"
  | "subrequests"
  | "cpu_total_seconds"
  | "cpu_p50_seconds"
  | "cpu_p99_seconds"
  | "duration_p50_seconds"
  | "duration_p99_seconds";

export interface MetricPoint {
  timestamp: string;
  value: number;
}

export interface MetricsData {
  period: { start: string; end: string }; // docs say {...}, shape is a guess
  step: string;
  series: Partial<Record<MetricName, MetricPoint[]>>;
}

export type MetricsResponse = ApiResponse<MetricsData>;

export interface MetricsQuery {
  start: string; // RFC3339
  end: string; // RFC3339
  step: string; // "60s", "5m", "1h", ...
  metrics: MetricName[];
}

export const ALL_METRICS: MetricName[] = [
  "requests",
  "errors",
  "subrequests",
  "cpu_total_seconds",
  "cpu_p50_seconds",
  "cpu_p99_seconds",
  "duration_p50_seconds",
  "duration_p99_seconds",
];

interface MetricsProps {
  projectId: string;
  workerName: string;
  startTime: string;
  endTime: string;
}

interface KPI {
  title: string;
  subtitle: string;
  header: string;
}

interface ChartPoint {
  date: string;
  requests: number;
  error: number;
}

async function fetchMetrics(
  projectId: string,
  workerName: string,
  query: MetricsQuery,
): Promise<MetricsResponse> {
  const params = new URLSearchParams({
    start: query.start,
    end: query.end,
    step: query.step,
    metrics: query.metrics.join(","),
  });
  const response = await fetch(
    `/api/project_branches/${projectId}/workers/${workerName}/metrics?${params}`,
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch metrics: ${response.status}`);
  }
  return (await response.json()) as MetricsResponse;
}

// ---------------------------------------------------------------------------
// Mapping helpers: API series -> UI
// ---------------------------------------------------------------------------
const HOUR_MS = 60 * 60 * 1000;

function pickStep(startMs: number, endMs: number): string {
  const hours = (endMs - startMs) / HOUR_MS;
  if (hours <= 6) return "60s";
  if (hours <= 48) return "5m";
  return "1h";
}

function sum(points: MetricPoint[]): number {
  return points.reduce((acc, p) => acc + p.value, 0);
}

function avg(points: MetricPoint[]): number {
  return points.length === 0 ? 0 : sum(points) / points.length;
}

function max(points: MetricPoint[]): number {
  return points.reduce((acc, p) => Math.max(acc, p.value), 0);
}

function compact(n: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(n);
}

function pct(n: number): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;
}

function buildKpis(
  current: MetricsData,
  previous: MetricsData,
  startMs: number,
): Array<KPI> {
  const cur = (m: MetricName): MetricPoint[] => current.series[m] ?? [];
  const prev = (m: MetricName): MetricPoint[] =>
    (previous.series[m] ?? []).filter((p) => Date.parse(p.timestamp) < startMs);

  const requests = sum(cur("requests"));
  const prevRequests = sum(prev("requests"));
  const errors = sum(cur("errors"));
  const subrequests = sum(cur("subrequests"));

  const requestsDelta =
    prevRequests === 0 ? 0 : ((requests - prevRequests) / prevRequests) * 100;
  const errorRate = requests === 0 ? 0 : (errors / requests) * 100;
  const subPerRequest = requests === 0 ? 0 : subrequests / requests;

  // seconds * 1000 = ms. Averaging p50 / taking max p99 across buckets is an
  // approximation, percentiles can't be exactly re-aggregated.
  const cpuP50Ms = avg(cur("cpu_p50_seconds")) * 1000;
  const cpuP99Ms = max(cur("cpu_p99_seconds")) * 1000;

  return [
    {
      header: "Requests",
      title: compact(requests),
      subtitle: `${pct(requestsDelta)} vs previous period`,
    },
    {
      header: "Errors",
      title: errors.toLocaleString("en-US"),
      subtitle: `${errorRate.toFixed(2)}% error rate`,
    },
    {
      header: "CPU time",
      title: `${cpuP50Ms.toFixed(1)} / ${cpuP99Ms.toFixed(0)} ms`,
      subtitle: "p50 / p99",
    },
    {
      header: "Subrequests",
      title: compact(subrequests),
      subtitle: `${subPerRequest.toFixed(1)} per request`,
    },
  ];
}

// Merge "requests" and "errors" series into one row per timestamp.
function buildChartData(data: MetricsData): Array<ChartPoint> {
  const requests = data.series.requests ?? [];
  const errors = new Map<string, number>(
    (data.series.errors ?? []).map((p) => [p.timestamp, p.value]),
  );
  return requests.map((p) => ({
    date: p.timestamp,
    requests: p.value,
    error: errors.get(p.timestamp) ?? 0,
  }));
}

const chartConfig = {
  requests: {
    label: "Requests",
    color: "var(--foreground)",
  },
  error: {
    label: "Error",
    color: "var(--destructive)",
  },
} satisfies ChartConfig;

function ChartAreaInteractive({
  projectId,
  workerName,
  startTime,
  endTime,
}: MetricsProps) {
  const [chartData, setChartData] = React.useState<Array<ChartPoint>>([]);

  React.useEffect(() => {
    let cancelled = false;
    const startMs = Date.parse(startTime);
    const endMs = Date.parse(endTime);

    fetchMetrics(projectId, workerName, {
      start: new Date(startMs).toISOString(),
      end: new Date(endMs).toISOString(),
      step: pickStep(startMs, endMs),
      metrics: ["requests", "errors"],
    })
      .then((res) => {
        if (!cancelled) setChartData(buildChartData(res.data));
      })
      .catch(() => {
        if (!cancelled) setChartData([]);
      });

    return () => {
      cancelled = true;
    };
  }, [projectId, workerName, startTime, endTime]);

  const showTime =
    (Date.parse(endTime) - Date.parse(startTime)) / HOUR_MS <= 48;

  const formatTick = (value: string): string => {
    const date = new Date(value);
    return showTime
      ? date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
      : date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 pt-5 sm:flex-row">
        <div className="grid flex-1">
          <CardTitle>Requests per hour</CardTitle>
          <CardDescription>
            Showing total visitors for the selected time period
          </CardDescription>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-62 w-full"
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillRequests" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-requests)"
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-requests)"
                  stopOpacity={0.02}
                />
              </linearGradient>
              <linearGradient id="fillError" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-error)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-error)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={formatTick}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    new Date(value).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  }
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="error"
              type="natural"
              fill="url(#fillError)"
              stroke="var(--color-error)"
              strokeOpacity={0.8}
              stackId="a"
            />
            <Area
              dataKey="requests"
              type="natural"
              fill="url(#fillRequests)"
              stroke="var(--color-requests)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export default function Metrics({
  projectId,
  workerName,
  startTime,
  endTime,
}: MetricsProps) {
  const [kpis, setKpis] = React.useState<Array<KPI>>([]);

  React.useEffect(() => {
    let cancelled = false;
    const startMs = Date.parse(startTime);
    const endMs = Date.parse(endTime);
    const spanMs = endMs - startMs;
    const step = pickStep(startMs, endMs);

    const query = (from: number, to: number): MetricsQuery => ({
      start: new Date(from).toISOString(),
      end: new Date(to).toISOString(),
      step,
      metrics: ALL_METRICS,
    });

    Promise.all([
      fetchMetrics(projectId, workerName, query(startMs, endMs)),
      fetchMetrics(projectId, workerName, query(startMs - spanMs, startMs)),
    ])
      .then(([current, previous]) => {
        if (!cancelled)
          setKpis(buildKpis(current.data, previous.data, startMs));
      })
      .catch(() => {
        if (!cancelled) setKpis([]);
      });

    return () => {
      cancelled = true;
    };
  }, [projectId, workerName, startTime, endTime]);

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
        {kpis.length <= 0
          ? [0, 1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="flex flex-col">
                  <span>-</span>
                  <span className="text-xl">-</span>
                  <span>-</span>
                </CardContent>
              </Card>
            ))
          : kpis.map((kpi) => (
              <Card key={kpi.header}>
                <CardContent className="flex flex-col">
                  <span>{kpi.header}</span>
                  <span className="text-xl">{kpi.title}</span>
                  <span>{kpi.subtitle}</span>
                </CardContent>
              </Card>
            ))}
      </div>
      {/* Chart */}
      <ChartAreaInteractive
        projectId={projectId}
        workerName={workerName}
        startTime={startTime}
        endTime={endTime}
      />
    </div>
  );
}
