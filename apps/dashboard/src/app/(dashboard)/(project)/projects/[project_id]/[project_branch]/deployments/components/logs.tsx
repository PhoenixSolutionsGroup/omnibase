"use client";

import { Loader2 } from "lucide-react";
import * as React from "react";
import { SeverityBadge } from "@/components/SeverityBadge";
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
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { formatTimestamp } from "@/lib/date";

interface LogsProps {
	projectId: string;
	workerName: string;
	startTime: string;
	endTime: string;
}

interface LogEntry {
	timestamp: string;
	severity: string;
	message: string;
	labels: {
		source: string;
	};
}

export interface WorkerLogsResponse {
	data: {
		logs: LogEntry[];
	};
}

async function fetchLogs(
	projectId: string,
	workerName: string,
	range: { startTime: string; endTime: string },
): Promise<WorkerLogsResponse> {
	const params = new URLSearchParams({
		start_time: range.startTime,
		end_time: range.endTime,
	});

	const response = await fetch(
		`${process.env.NEXT_PUBLIC_MANAGED_HOSTING_API_URL}/api/v1/project_branches/${projectId}/workers/${workerName}/logs?${params}`,
		{ credentials: "include" },
	);
	if (!response.ok) {
		throw new Error(`Failed to fetch logs: ${response.status}`);
	}

	const res = (await response.json()) as WorkerLogsResponse;
	const logs = res.data.logs.filter((l) => l.labels.source === "cloudflare");
	return { data: { logs } };
}

export default function Logs({
	projectId,
	workerName,
	startTime,
	endTime,
}: LogsProps) {
	const [logs, setLogs] = React.useState<LogEntry[]>([]);
	const [typeFilter, setTypeFilter] = React.useState<string>("all");
	const [loading, setLoading] = React.useState<boolean>(false);

	React.useEffect(() => {
		let cancelled = false;
		setLoading(true);
		fetchLogs(projectId, workerName, { startTime, endTime })
			.then((res) => {
				if (!cancelled) setLogs(res.data.logs);
			})
			.catch(() => {
				if (!cancelled) setLogs([]);
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, [projectId, workerName, startTime, endTime]);

	return (
		<Card className="py-0 gap-0">
			<CardHeader className="flex items-center pt-5 pb-4 sm:flex-row">
				<div className="grid flex-1">
					<CardTitle>Logs</CardTitle>
					<CardDescription>Live tail of api-worker invocations</CardDescription>
				</div>
				<Select value={typeFilter} onValueChange={setTypeFilter}>
					<SelectTrigger
						className="hidden w-40 rounded-lg sm:ml-auto sm:flex"
						aria-label="Select a value"
					>
						<SelectValue placeholder="all" />
					</SelectTrigger>
					<SelectContent className="rounded-xl">
						<SelectItem value="all" className="rounded-lg">
							All
						</SelectItem>
						<SelectItem value="errors" className="rounded-lg">
							Errors
						</SelectItem>
					</SelectContent>
				</Select>
			</CardHeader>
			<Separator />
			<CardContent className="p-0 max-h-97 overflow-scroll">
				<Table>
					<TableBody>
						{loading ? (
							<TableRow>
								<TableCell
									colSpan={3}
									className="px-4 py-6 text-center text-muted-foreground"
								>
									<div className="flex items-center justify-center gap-2">
										<Loader2 className="h-5 w-5 animate-spin" />
										<p>Loading logs...</p>
									</div>
								</TableCell>
							</TableRow>
						) : logs.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={3}
									className="px-4 py-6 text-center text-muted-foreground"
								>
									No logs in this period
								</TableCell>
							</TableRow>
						) : (
							logs.map((log) => (
								<TableRow
									key={`${log.timestamp}-${log.severity}`}
									className={`${log.severity === "CRITICAL" ? "bg-destructive/20 text-destructive" : ""}`}
								>
									<TableCell className="pl-4 text-muted-foreground">
										{formatTimestamp(log.timestamp)}
									</TableCell>
									<TableCell className="font-medium text-start">
										<SeverityBadge severity={log.severity} variant="badge" />
									</TableCell>

									<TableCell className="pr-4">{log.message}</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
