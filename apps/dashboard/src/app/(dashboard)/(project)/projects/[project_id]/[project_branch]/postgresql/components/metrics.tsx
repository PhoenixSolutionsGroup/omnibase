"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  EMPTY,
  HOUR_MS,
  avg,
  buildMetricsParams,
  first,
  formatBytes,
  formatPeakTime,
  formatRate,
  last,
  peak,
  pickStep,
  type KPI,
  type MetricPoint,
  type MetricsQuery,
} from "@/lib/metrics";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type MetricName =
  | "up"
  | "connections"
  | "connections_active"
  | "cache_hit_ratio" // 0-1
  | "database_size_bytes"
  | "transactions_per_second";

interface MetricsResponse {
  status: number;
  data: {
    series: Partial<Record<MetricName, MetricPoint[]>>;
  };
}

interface MetricsProps {
  projectBranchId: string;
  startTime: string;
  endTime: string;
}

const KPI_METRICS: MetricName[] = [
  "up",
  "connections",
  "connections_active",
  "cache_hit_ratio",
  "database_size_bytes",
  "transactions_per_second",
];

const KPI_HEADERS = [
  "Connections",
  "Cache hit ratio",
  "Database size",
  "Transactions",
] as const;

async function fetchMetrics(
  projectBranchId: string,
  query: MetricsQuery<MetricName>,
): Promise<MetricsResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/project_branches/${projectBranchId}/postgresql/metrics?${buildMetricsParams(query)}`,
    { credentials: "include" },
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch metrics: ${response.status}`);
  }
  return (await response.json()) as MetricsResponse;
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
    setError(null);

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
        if (!cancelled) {
          setKpis([]);
          setError(String(err));
          toast.error("Failed to fetch metrics");
        }
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
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
        {KPI_HEADERS.map((header) => {
          const kpi = kpis.find((k) => k.header === header);
          return (
            <Card key={header}>
              <CardContent className="flex flex-col">
                <span>{header}</span>
                {loading ? (
                  <>
                    <Skeleton className="my-1 h-7 w-20" />
                    <Skeleton className="h-4 w-28" />
                  </>
                ) : error ? (
                  <>
                    <span className="text-xl">{EMPTY}</span>
                    <span>{EMPTY}</span>
                  </>
                ) : (
                  <>
                    <span className="text-xl">{kpi?.title ?? EMPTY}</span>
                    {kpi?.subtitle && <span>{kpi.subtitle}</span>}
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
