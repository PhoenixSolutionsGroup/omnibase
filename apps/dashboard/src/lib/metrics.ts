export const HOUR_MS = 60 * 60 * 1000;
export const EMPTY = "-";

/**
 * Types
 */
export interface MetricPoint {
  timestamp: string;
  value: number;
}

export type MetricSeries<M extends string = string> = Partial<
  Record<M, MetricPoint[]>
>;

export interface MetricsQuery<M extends string = string> {
  start: string;
  end: string;
  step: string;
  metrics: M[];
}

export interface KPI {
  header: string;
  title: string;
  subtitle?: string;
}

/**
 * Query helpers
 */
export function pickStep(startMs: number, endMs: number): string {
  const hours = (endMs - startMs) / HOUR_MS;
  if (hours <= 6) return "60s";
  if (hours <= 48) return "5m";
  return "1h";
}

export function buildMetricsParams(query: MetricsQuery): URLSearchParams {
  return new URLSearchParams({
    start: query.start,
    end: query.end,
    step: query.step,
    metrics: query.metrics.join(","),
  });
}

/**
 * Series Hhlpers
 */
export function sum(points: MetricPoint[]): number {
  return points.reduce((acc, p) => acc + p.value, 0);
}

export function avg(points: MetricPoint[]): number {
  return points.length === 0 ? 0 : sum(points) / points.length;
}

export function max(points: MetricPoint[]): number {
  return points.reduce((acc, p) => Math.max(acc, p.value), 0);
}

export function first(points: MetricPoint[]): number | undefined {
  return points.length === 0 ? undefined : points[0].value;
}

export function last(points: MetricPoint[]): number | undefined {
  return points.length === 0 ? undefined : points[points.length - 1].value;
}

export function peak(points: MetricPoint[]): MetricPoint | undefined {
  return points.reduce<MetricPoint | undefined>(
    (best, p) => (best === undefined || p.value > best.value ? p : best),
    undefined,
  );
}

/**
 * Formatters
 */
export function compact(n: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(n);
}

export function pct(n: number): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;
}

export function formatBytes(bytes: number): string {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = Math.abs(bytes);
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  return `${bytes < 0 ? "-" : ""}${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function formatRate(n: number): string {
  const text =
    n >= 10
      ? Math.round(n).toLocaleString("en-US")
      : n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  return `${text}/s`;
}

export function formatPeakTime(timestamp: string, showDate: boolean): string {
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
