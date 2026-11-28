"use client";

import { ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { EMPTY } from "@/lib/metrics";

interface QueriesProps {
	projectBranchId: string;
	startTime: string;
	endTime: string;
}

interface QueryStat {
	query_id: string;
	query: string;
	calls: number;
	total_exec_time_ms: number;
	mean_exec_time_ms: number;
	rows: number;
	shared_blks_hit: number;
	shared_blks_read: number;
	temp_blks_read: number;
	temp_blks_written: number;
	blk_read_time_ms: number;
	blk_write_time_ms: number;
}

export interface PostgresQueriesResponse {
	status: number;
	data: {
		project_branch_id: string;
		order_by: string;
		limit: number;
		queries: QueryStat[];
	};
}

type SortKey = "total_time" | "mean_time" | "calls";

async function fetchQueries(
	projectBranchId: string,
): Promise<PostgresQueriesResponse> {
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_MANAGED_HOSTING_API_URL}/api/v1/project_branches/${projectBranchId}/postgresql`,
		{ credentials: "include" },
	);
	if (!response.ok) {
		throw new Error(`Failed to fetch queries: ${response.status}`);
	}
	return (await response.json()) as PostgresQueriesResponse;
}

function redact(sql: string): string {
	return sql.replace(/(PASSWORD\s+)'[^']*'/gi, "$1'***'");
}

function formatMs(ms: number): string {
	if (ms >= 1000) return `${(ms / 1000).toFixed(2)} s`;
	if (ms >= 1) return `${ms.toFixed(2)} ms`;
	return `${ms.toFixed(3)} ms`;
}

function cacheHitPct(q: QueryStat): number | undefined {
	const total = q.shared_blks_hit + q.shared_blks_read;
	return total === 0 ? undefined : (q.shared_blks_hit / total) * 100;
}

function sortQueries(queries: QueryStat[], key: SortKey): QueryStat[] {
	const value = (q: QueryStat): number =>
		key === "total_time"
			? q.total_exec_time_ms
			: key === "mean_time"
				? q.mean_exec_time_ms
				: q.calls;
	return [...queries].sort((a, b) => value(b) - value(a));
}

export default function TopQueries({ projectBranchId }: QueriesProps) {
	const [queries, setQueries] = React.useState<QueryStat[]>([]);
	const [loading, setLoading] = React.useState<boolean>(true);
	const [sortKey, setSortKey] = React.useState<SortKey>("total_time");
	const [expandedRows, setExpandedRows] = React.useState<Set<number>>(
		new Set(),
	);

	const toggleRow = (index: number) => {
		setExpandedRows((prev) => {
			const next = new Set(prev);
			if (next.has(index)) {
				next.delete(index);
			} else {
				next.add(index);
			}
			return next;
		});
	};

	React.useEffect(() => {
		let cancelled = false;
		setLoading(true);

		fetchQueries(projectBranchId)
			.then((res) => {
				if (!cancelled) {
					setQueries(res.data.queries ?? []);
					setExpandedRows(new Set());
				}
			})
			.catch(() => {
				if (!cancelled) {
					setQueries([]);
					toast.error("Failed to fetch queries");
				}
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, [projectBranchId]);

	const sorted = React.useMemo(
		() => sortQueries(queries, sortKey),
		[queries, sortKey],
	);

	return (
		<Card className="py-0 gap-0">
			<CardHeader className="flex items-center pt-5 pb-4 sm:flex-row">
				<div className="grid flex-1">
					<CardTitle>Top queries</CardTitle>
					<CardDescription>
						Statistics from pg_stat_statements since the last reset
					</CardDescription>
				</div>
				<Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
					<SelectTrigger
						className="hidden w-44 rounded-lg sm:ml-auto sm:flex"
						aria-label="Sort queries by"
					>
						<SelectValue placeholder="Sort by" />
					</SelectTrigger>
					<SelectContent className="rounded-xl">
						<SelectItem value="total_time" className="rounded-lg">
							Total time
						</SelectItem>
						<SelectItem value="mean_time" className="rounded-lg">
							Mean time
						</SelectItem>
						<SelectItem value="calls" className="rounded-lg">
							Calls
						</SelectItem>
					</SelectContent>
				</Select>
			</CardHeader>
			<Separator />
			<CardContent className="p-0 [&>div]:max-h-92 [&>div]:overflow-auto">
				<Table>
					<TableHeader className="sticky top-0 z-10 bg-card shadow-[0_1px_0_var(--border)]">
						<TableRow>
							<TableHead className="w-10" />
							<TableHead>Query</TableHead>
							<TableHead>Calls</TableHead>
							<TableHead>Total time</TableHead>
							<TableHead>Mean time</TableHead>
							<TableHead>Rows</TableHead>
							<TableHead>Cache hit</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{loading ? (
							<TableRow>
								<TableCell
									colSpan={7}
									className="px-4 py-6 text-center text-muted-foreground"
								>
									<div className="flex items-center justify-center gap-2">
										<Loader2 className="h-5 w-5 animate-spin" />
										<p>Loading queries...</p>
									</div>
								</TableCell>
							</TableRow>
						) : sorted.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={7}
									className="px-4 py-6 text-center text-muted-foreground"
								>
									No queries found
								</TableCell>
							</TableRow>
						) : (
							sorted.map((query, index) => {
								const expanded = expandedRows.has(index);
								const pct = cacheHitPct(query);
								const meta: { label: string; value: string }[] = [
									{ label: "Query ID", value: query.query_id },
									{
										label: "Shared blocks hit",
										value: String(query.shared_blks_hit),
									},
									{
										label: "Shared blocks read",
										value: String(query.shared_blks_read),
									},
									{
										label: "Temp blocks read",
										value: String(query.temp_blks_read),
									},
									{
										label: "Temp blocks written",
										value: String(query.temp_blks_written),
									},
									{
										label: "Block read time",
										value: formatMs(query.blk_read_time_ms),
									},
									{
										label: "Block write time",
										value: formatMs(query.blk_write_time_ms),
									},
									{
										label: "Rows / call",
										value: String(query.rows / query.calls),
									},
								];

								return (
									<React.Fragment key={query.query_id}>
										<TableRow
											onClick={() => toggleRow(index)}
											className="cursor-pointer"
										>
											<TableCell className="px-4 py-2">
												<Button
													variant="ghost"
													size="icon"
													className="h-6 w-6"
													aria-expanded={expanded}
													aria-label={
														expanded ? "Collapse query" : "Expand query"
													}
												>
													{expanded ? (
														<ChevronDown className="h-4 w-4" />
													) : (
														<ChevronRight className="h-4 w-4" />
													)}
												</Button>
											</TableCell>
											<TableCell className="max-w-md px-3 py-2">
												<span className="block truncate font-mono text-xs">
													{redact(query.query)}
												</span>
											</TableCell>
											<TableCell className="px-3 py-2">
												<span className="text-muted-foreground">
													{query.calls}
												</span>
											</TableCell>
											<TableCell className="px-3 py-2">
												<span className="text-muted-foreground">
													{formatMs(query.total_exec_time_ms)}
												</span>
											</TableCell>
											<TableCell className="px-3 py-2">
												<span className="text-muted-foreground">
													{formatMs(query.mean_exec_time_ms)}
												</span>
											</TableCell>
											<TableCell className="px-3 py-2">
												<span className="text-muted-foreground">
													{query.rows}
												</span>
											</TableCell>
											<TableCell className="px-3 py-2">
												<span className="text-muted-foreground">
													{pct === undefined ? EMPTY : `${pct.toFixed(1)}%`}
												</span>
											</TableCell>
										</TableRow>
										{expanded && (
											<TableRow className="hover:bg-transparent">
												<TableCell
													colSpan={7}
													className="space-y-3 bg-muted/30 px-4 pb-3 whitespace-normal"
												>
													<Card>
														<CardContent>
															<pre className="whitespace-pre-wrap break-all font-mono text-xs">
																{redact(query.query)}
															</pre>
														</CardContent>
													</Card>

													<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
														{meta.map((m) => (
															<Card key={m.label}>
																<CardContent className="flex flex-col">
																	<span className="text-muted-foreground">
																		{m.label}
																	</span>
																	<span className="break-all">{m.value}</span>
																</CardContent>
															</Card>
														))}
													</div>
												</TableCell>
											</TableRow>
										)}
									</React.Fragment>
								);
							})
						)}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
