"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { SeverityBadge } from "@/components/SeverityBadge";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { formatTimestamp } from "@/lib/date";

interface Log {
	timestamp: string;
	message?: string;
	severity?: string;
	source?: string;
	service_name?: string;
	labels?: Record<string, string>;
	metadata?: Record<string, any>;
}

const MANAGED_HOSTING_API_URL = process.env.NEXT_PUBLIC_MANAGED_HOSTING_API_URL;
if (!MANAGED_HOSTING_API_URL)
	throw new Error("NEXT_PUBLIC_MANAGED_HOSTING_API_URL must be set");

// Service name labels and colors
const SERVICE_CONFIG: Record<string, { label: string; className: string }> = {
	all: {
		label: "ALL",
		className:
			"bg-muted-foreground/5 text-muted-foreground border-muted-foreground/50",
	},
	api: {
		label: "API",
		className: "bg-blue-700/5 text-blue-700 border-blue-700/50",
	},
	auth: {
		label: "AUTH",
		className: "bg-green-700/5 text-green-700 border-green-700/50",
	},
	perm: {
		label: "PERM",
		className: "bg-purple-700/5 text-purple-700 border-purple-700/50",
	},
	postgrest: {
		label: "POSTGREST",
		className: "bg-orange-700/5 text-orange-700 border-orange-700/50",
	},
};

const getServiceNameBadge = (serviceName?: string) => {
	if (!serviceName) return null;

	const config = SERVICE_CONFIG[serviceName] || {
		label: serviceName.toUpperCase(),
		className:
			"bg-muted-foreground/5 text-muted-foreground border-muted-foreground/50",
	};

	return (
		<span
			className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-medium border whitespace-nowrap ${config.className}`}
		>
			{config.label}
		</span>
	);
};

interface LogViewerProps {
	initialLogs: Log[];
	projectId: string;
	serviceType: string;
	totalCount: number;
	limit: number;
}

export function LogViewer({
	initialLogs,
	projectId,
	serviceType,
	totalCount,
	limit,
}: LogViewerProps) {
	// Sort logs newest first on initial load
	const [logs, setLogs] = useState<Log[]>(
		[...initialLogs].sort(
			(a, b) =>
				new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
		),
	);
	const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
	const [loading, setLoading] = useState(false);
	const [hasMore, setHasMore] = useState(true); // Always show button initially

	const colCount = serviceType === "all" ? 5 : 4;

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

	const loadMoreLogs = async () => {
		if (loading || logs.length === 0) return;

		setLoading(true);
		try {
			const oldestLog = logs[logs.length - 1];
			const oldestTimestamp = new Date(oldestLog.timestamp);

			// Use the oldest log timestamp as end_time (backend will exclude it)
			const endTime = oldestTimestamp.toISOString();

			const url = new URL(
				`${MANAGED_HOSTING_API_URL}/api/v1/logs/${projectId}`,
				window.location.origin,
			);
			url.searchParams.set("service_name", serviceType);
			url.searchParams.set("limit", limit.toString());
			url.searchParams.set("end_time", endTime);
			// Don't use tail=true for historical logs - we want older logs, not newest

			console.log("Loading older logs before:", endTime);

			const response = await fetch(url.toString(), {
				credentials: "include",
			});
			if (response.ok) {
				const { data } = await response.json();
				console.log("Load more response:", data);
				if (data.logs && data.logs.length > 0) {
					// Sort and append older logs
					const sortedOlderLogs = [...data.logs].sort(
						(a, b) =>
							new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
					);
					setLogs((prev) => [...prev, ...sortedOlderLogs]);
					setHasMore(data.logs.length >= limit);
					console.log("Added", sortedOlderLogs.length, "older logs");
				} else {
					setHasMore(false);
				}
			}
		} catch (error) {
			console.error("Error loading more logs:", error);
		} finally {
			setLoading(false);
		}
	};

	const checkNewLogs = useCallback(async () => {
		if (logs.length === 0) return;

		try {
			const newestLog = logs[0];
			const newestTimestamp = new Date(newestLog.timestamp);

			// Add 1 millisecond to exclude the newest log we already have
			const startTime = new Date(newestTimestamp.getTime() + 1).toISOString();

			const url = new URL(
				`${MANAGED_HOSTING_API_URL}/api/v1/logs/${projectId}`,
				window.location.origin,
			);
			url.searchParams.set("service_name", serviceType);
			url.searchParams.set("limit", "20");
			url.searchParams.set("start_time", startTime);
			url.searchParams.set("tail", "true");

			const response = await fetch(url.toString(), {
				credentials: "include",
			});
			if (response.ok) {
				const { data } = await response.json();
				if (data.logs && data.logs.length > 0) {
					const sortedNewLogs = [...data.logs].sort(
						(a, b) =>
							new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
					);
					setLogs((prev) => [...sortedNewLogs, ...prev]);
				}
			}
		} catch (error) {
			console.error("Error checking new logs:", error);
		}
	}, [logs, projectId, serviceType]);

	// Real-time polling for new logs
	useEffect(() => {
		if (logs.length === 0) return;

		const interval = setInterval(() => {
			checkNewLogs();
		}, 5000); // Poll every 5 seconds

		return () => clearInterval(interval);
	}, [logs, checkNewLogs]);

	return (
		<div className="flex h-full min-h-0 flex-col border rounded-lg overflow-hidden bg-background">
			<div className="min-h-0 flex-1 [&>div]:h-full [&>div]:overflow-auto">
				<Table>
					<TableHeader className="sticky top-0 z-10 bg-card shadow-[0_1px_0_var(--border)]">
						<TableRow>
							<TableHead className="w-12 px-4" />
							<TableHead className="w-42 px-3">Timestamp</TableHead>
							<TableHead className="w-24 px-0">Severity</TableHead>
							{serviceType === "all" && (
								<TableHead className="px-2 w-24">Service</TableHead>
							)}

							<TableHead className="px-4">Message</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{logs.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={colCount}
									className="px-4 py-8 text-center text-muted-foreground"
								>
									No logs found
								</TableCell>
							</TableRow>
						) : (
							logs.map((log, index) => (
								<React.Fragment key={`${log.timestamp}-${log.severity}`}>
									<TableRow>
										<TableCell className="px-4 py-2">
											<Button
												variant="ghost"
												size="icon"
												className="h-6 w-6"
												onClick={() => toggleRow(index)}
												aria-expanded={expandedRows.has(index)}
												aria-label={
													expandedRows.has(index)
														? "Collapse log"
														: "Expand log"
												}
											>
												{expandedRows.has(index) ? (
													<ChevronDown className="h-4 w-4" />
												) : (
													<ChevronRight className="h-4 w-4" />
												)}
											</Button>
										</TableCell>
										<TableCell className="px-3 py-2">
											<span className="text-muted-foreground">
												{formatTimestamp(log.timestamp)}
											</span>
										</TableCell>

										<TableCell className="px-0 py-2">
											<SeverityBadge severity={log.severity} variant="badge" />
										</TableCell>
										{serviceType === "all" && (
											<TableCell className="px-2 py-2 w-24">
												{getServiceNameBadge(log.service_name)}
											</TableCell>
										)}

										<TableCell className="px-4 py-2 max-w-0">
											<span>{log.message || "(no message)"}</span>
										</TableCell>
									</TableRow>
									{expandedRows.has(index) && (
										<TableRow className="hover:bg-transparent">
											<TableCell
												colSpan={colCount}
												className="px-4 pb-3 bg-muted/30 whitespace-normal"
											>
												{/* Raw Log Line */}
												{log.metadata?.raw_line && (
													<div className="mb-3">
														<div className="text-xs font-semibold text-muted-foreground mb-1">
															Raw Log:
														</div>
														<pre className="text-xs font-mono bg-muted text-foreground p-3 rounded overflow-x-auto border">
															{typeof log.metadata.raw_line === "string"
																? (() => {
																		try {
																			return JSON.stringify(
																				JSON.parse(log.metadata.raw_line),
																				null,
																				2,
																			);
																		} catch {
																			return log.metadata.raw_line;
																		}
																	})()
																: JSON.stringify(
																		log.metadata.raw_line,
																		null,
																		2,
																	)}
														</pre>
													</div>
												)}

												{/* Full Log Entry */}
												<div>
													<div className="text-xs font-semibold text-muted-foreground mb-1">
														Full Log Entry:
													</div>
													<pre className="text-xs font-mono bg-muted text-foreground p-3 rounded overflow-x-auto border">
														{JSON.stringify(log, null, 2)}
													</pre>
												</div>
											</TableCell>
										</TableRow>
									)}
								</React.Fragment>
							))
						)}
					</TableBody>
				</Table>
			</div>

			{/* Load More Button */}
			{logs.length > 0 && hasMore && (
				<div className="px-4 py-3 border-t flex justify-center shrink-0">
					<Button
						onClick={loadMoreLogs}
						disabled={loading}
						variant="outline"
						size="sm"
					>
						{loading ? "Loading..." : "Load More Historical"}
					</Button>
				</div>
			)}
		</div>
	);
}
