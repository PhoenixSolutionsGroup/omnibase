"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TriangleExclamationPoint } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";

type MetricName =
  | "up"
  | "connections"
  | "connections_active"
  | "cache_hit_ratio" // 0-1
  | "database_size_bytes"
  | "transactions_per_second";

interface MetricPoint {
  timestamp: string;
  value: number;
}

interface MetricsResponse {
  status: number;
  data: {
    series: Partial<Record<MetricName, MetricPoint[]>>;
  };
}

interface MetricsQuery {
  start: string;
  end: string;
  step: string;
  metrics: MetricName[];
}

interface MetricsProps {
  projectBranchId: string;
  startTime: string;
  endTime: string;
}

interface KPI {
  header: string;
  title: string;
  subtitle?: string;
}

const KPI_METRICS: MetricName[] = [
  "up",
  "connections",
  "connections_active",
  "cache_hit_ratio",
  "database_size_bytes",
  "transactions_per_second",
];

const HOUR_MS = 60 * 60 * 1000;
const EMPTY = "-";

async function fetchMetrics(
  projectBranchId: string,
  query: MetricsQuery,
): Promise<MetricsResponse> {
  const params = new URLSearchParams({
    start: query.start,
    end: query.end,
    step: query.step,
    metrics: query.metrics.join(","),
  });
  const response = await fetch(
    `/api/project_branches/${projectBranchId}/postgresql/metrics?${params}`,
    { credentials: "include" },
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch metrics: ${response.status}`);
  }
  return (await response.json()) as MetricsResponse;
}

function pickStep(startMs: number, endMs: number): string {
  const hours = (endMs - startMs) / HOUR_MS;
  if (hours <= 6) return "60s";
  if (hours <= 48) return "5m";
  return "1h";
}

function avg(points: MetricPoint[]): number {
  return points.length === 0
    ? 0
    : points.reduce((acc, p) => acc + p.value, 0) / points.length;
}

function last(points: MetricPoint[]): number | undefined {
  return points.length === 0 ? undefined : points[points.length - 1].value;
}

function first(points: MetricPoint[]): number | undefined {
  return points.length === 0 ? undefined : points[0].value;
}

function peak(points: MetricPoint[]): MetricPoint | undefined {
  return points.reduce<MetricPoint | undefined>(
    (best, p) => (best === undefined || p.value > best.value ? p : best),
    undefined,
  );
}

function formatBytes(bytes: number): string {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = Math.abs(bytes);
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  return `${bytes < 0 ? "-" : ""}${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function formatRate(n: number): string {
  const text =
    n >= 10
      ? Math.round(n).toLocaleString("en-US")
      : n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  return `${text}/s`;
}

function formatPeakTime(timestamp: string, showDate: boolean): string {
  const date = new Date(timestamp);
  return showDate
    ? date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
}

function buildKpis(data: MetricsResponse["data"], showDate: boolean): KPI[] {
  const s = (m: MetricName): MetricPoint[] => data.series[m] ?? [];

  const asleep = (last(s("up")) ?? 0) === 0;
  const sub = (text?: string): string | undefined =>
    asleep ? "Database asleep" : text;

  const connections = last(s("connections"));
  const active = last(s("connections_active"));

  const cache = s("cache_hit_ratio");

  const size = s("database_size_bytes");
  const sizeNow = last(size);
  const sizeStart = first(size);

  const tps = s("transactions_per_second");
  const tpsPeak = peak(tps);

  return [
    {
      header: "Connections",
      title:
        active !== undefined && connections !== undefined
          ? `${Math.round(active)} / ${Math.round(connections)}`
          : EMPTY,
      subtitle: sub("active / total"),
    },
    {
      header: "Cache hit ratio",
      title: cache.length === 0 ? EMPTY : `${(avg(cache) * 100).toFixed(1)}%`,
      subtitle: sub("target above 99%"),
    },
    {
      header: "Database size",
      title: sizeNow === undefined ? EMPTY : formatBytes(sizeNow),
      subtitle: sub(
        sizeNow === undefined || sizeStart === undefined
          ? undefined
          : `${sizeNow - sizeStart >= 0 ? "+" : ""}${formatBytes(sizeNow - sizeStart)} over period`,
      ),
    },
    {
      header: "Transactions",
      title: tps.length === 0 ? EMPTY : formatRate(avg(tps)),
      subtitle: sub(
        tpsPeak === undefined
          ? undefined
          : `peak ${formatRate(tpsPeak.value)} at ${formatPeakTime(tpsPeak.timestamp, showDate)}`,
      ),
    },
  ];
}

export function Metrics({ projectBranchId, startTime, endTime }: MetricsProps) {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const startMs = Date.parse(startTime);
    const endMs = Date.parse(endTime);

    setLoading(true);

    fetchMetrics(projectBranchId, {
      start: new Date(startMs).toISOString(),
      end: new Date(endMs).toISOString(),
      step: pickStep(startMs, endMs),
      metrics: KPI_METRICS,
    })
      .then((res) => {
        if (!cancelled)
          setKpis(buildKpis(res.data, (endMs - startMs) / HOUR_MS > 48));
      })
      .catch((err) => {
        if (!cancelled) setKpis([]);
        setError(String(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [projectBranchId, startTime, endTime]);

  return (
    <div className="space-y-4">
      {loading && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="flex flex-col p-4 rounded-lg">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-3 w-32" />
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-64 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-2 p-4 border rounded-lg">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-64 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-2 p-4 border rounded-lg">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {error && (
        <Card>
          <CardContent>
            <div className="flex flex-col items-center justify-center p-8 gap-2">
              <Image
                src="/omnibase-logo-error.svg"
                alt="Omnibase"
                width={42}
                height={42}
                className="shrink-0 rounded-lg"
                unoptimized
              />
              <p className="text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && !error && kpis.length <= 0 && (
        <Card>
          <CardContent className="flex gap-2 items-center">
            <TriangleExclamationPoint className="w-3 h-3" />
            Failed to load postgreSQL metrics. Please try again
          </CardContent>
        </Card>
      )}

      {!loading && !error && kpis.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
          {kpis.map((kpi) => (
            <Card key={kpi.header}>
              <CardContent className="flex flex-col">
                <span>{kpi.header}</span>
                <span className="text-xl">{kpi.title}</span>
                {kpi.subtitle && <span>{kpi.subtitle}</span>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
