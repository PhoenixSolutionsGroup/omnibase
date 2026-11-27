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
	type ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
	avg,
	buildMetricsParams,
	compact,
	EMPTY,
	HOUR_MS,
	type KPI,
	type MetricPoint,
	type MetricsQuery,
	max,
	pct,
	pickStep,
	sum,
} from "@/lib/metrics";

// Re-exported so existing imports from this file keep working.
export type { MetricPoint, MetricsQuery };

export interface ApiResponse<T> {
	status: number;
	data: T;
}

export type MetricName =
	| "requests"
	| "errors"
	| "cpu_total_seconds"
	| "cpu_p50_seconds"
	| "cpu_p95_seconds"
	| "cpu_p99_seconds";

export interface MetricsData {
	period: { start: string; end: string }; // docs say {...}, shape is a guess
	step: string;
	series: Partial<Record<MetricName, MetricPoint[]>>;
}

export type MetricsResponse = ApiResponse<MetricsData>;

export const ALL_METRICS: MetricName[] = [
	"requests",
	"errors",
	"cpu_total_seconds",
	"cpu_p50_seconds",
	"cpu_p95_seconds",
	"cpu_p99_seconds",
];

interface MetricsProps {
	projectId: string;
	workerName: string;
	startTime: string;
	endTime: string;
}

interface ChartPoint {
	date: string;
	requests: number;
	error: number;
}

const KPI_HEADERS = [
	"Requests",
	"Total CPU Time",
	"CPU Metrics",
	"Errors",
] as const;

async function fetchMetrics(
	projectId: string,
	workerName: string,
	query: MetricsQuery<MetricName>,
): Promise<MetricsResponse> {
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_MANAGED_HOSTING_API_URL}/api/v1/project_branches/${projectId}/workers/${workerName}/metrics?${buildMetricsParams(query)}`,
		{ credentials: "include" },
	);
	if (!response.ok) {
		throw new Error(`Failed to fetch metrics: ${response.status}`);
	}
	return response.json();
}

function formatCpu(ms: number): string {
	if (ms >= 1000) return `${(ms / 1000).toFixed(2)} s`;
	return `${ms.toFixed(1)} ms`;
}

function formatPercentile(ms: number): string {
	if (ms < 1) return "<1";
	if (ms < 10) return ms.toFixed(1);
	return Math.round(ms).toString();
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
	const cpuTotalMs = sum(cur("cpu_total_seconds")) * 1000;
	const prevCpuTotalMs = sum(prev("cpu_total_seconds")) * 1000;

	const requestsDelta =
		prevRequests === 0 ? 0 : ((requests - prevRequests) / prevRequests) * 100;
	const cpuDelta =
		prevCpuTotalMs === 0
			? 0
			: ((cpuTotalMs - prevCpuTotalMs) / prevCpuTotalMs) * 100;
	const errorRate = requests === 0 ? 0 : (errors / requests) * 100;

	const cpuP50Ms = avg(cur("cpu_p50_seconds")) * 1000;
	const cpuP95Ms = avg(cur("cpu_p95_seconds")) * 1000;
	const cpuP99Ms = max(cur("cpu_p99_seconds")) * 1000;

	return [
		{
			header: "Requests",
			title: compact(requests),
			subtitle: `${pct(requestsDelta)} vs previous period`,
		},
		{
			header: "Total CPU Time",
			title: formatCpu(cpuTotalMs),
			subtitle: `${pct(cpuDelta)} vs previous period`,
		},
		{
			header: "CPU Metrics",
			title: `${formatPercentile(cpuP50Ms)} / ${formatPercentile(cpuP95Ms)} / ${formatPercentile(cpuP99Ms)} ms`,
			subtitle: "p50 / p95 / p99",
		},
		{
			header: "Errors",
			title: errors.toLocaleString("en-US"),
			subtitle: `${errorRate.toFixed(2)}% error rate`,
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
	const [loading, setLoading] = React.useState<boolean>(true);
	const [error, setError] = React.useState<boolean>(false);

	React.useEffect(() => {
		let cancelled = false;
		const startMs = Date.parse(startTime);
		const endMs = Date.parse(endTime);
		const spanMs = endMs - startMs;
		const kpiStep = `${Math.max(1, Math.floor(spanMs / 1000))}s`;

		const query = (from: number, to: number): MetricsQuery<MetricName> => ({
			start: new Date(from).toISOString(),
			end: new Date(to).toISOString(),
			step: kpiStep,
			metrics: ALL_METRICS,
		});

		setLoading(true);
		setError(false);

		Promise.all([
			fetchMetrics(projectId, workerName, query(startMs, endMs)),
			fetchMetrics(projectId, workerName, query(startMs - spanMs, startMs)),
		])
			.then(([current, previous]) => {
				if (!cancelled)
					setKpis(buildKpis(current.data, previous.data, startMs));
			})
			.catch(() => {
				if (!cancelled) {
					setKpis([]);
					setError(true);
				}
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, [projectId, workerName, startTime, endTime]);

	return (
		<div className="space-y-4">
			{/* KPI Cards */}
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
										<span>{kpi?.subtitle ?? EMPTY}</span>
									</>
								)}
							</CardContent>
						</Card>
					);
				})}
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
