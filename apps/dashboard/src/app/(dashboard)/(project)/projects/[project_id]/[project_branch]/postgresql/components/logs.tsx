"use client";

import * as React from "react";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { SeverityBadge } from "@/components/SeverityBadge";
import { Loader2 } from "lucide-react";

interface LogsProps {
  projectBranchId: string;
  startTime: string;
  endTime: string;
}

interface LogEntry {
  timestamp: string;
  severity: string;
  message: string;
}

export interface PostgresLogsResponse {
  data: {
    logs: LogEntry[];
  };
}

async function fetchLogs(
  projectBranchId: string,
  range: { startTime: string; endTime: string },
  severity?: string,
): Promise<PostgresLogsResponse> {
  const params = new URLSearchParams({
    start_time: range.startTime,
    end_time: range.endTime,
    tail: "true",
  });
  if (severity) params.set("severity", severity);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_MANAGED_HOSTING_API_URL}/api/v1/project_branches/${projectBranchId}/postgresql/logs?${params}`,
    { credentials: "include" },
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch logs: ${response.status}`);
  }

  return (await response.json()) as PostgresLogsResponse;
}

export default function Logs({
  projectBranchId,
  startTime,
  endTime,
}: LogsProps) {
  const [logs, setLogs] = React.useState<LogEntry[]>([]);
  const [typeFilter, setTypeFilter] = React.useState<string>("all");
  const [loading, setLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    let cancelled = false;
    const severity = typeFilter === "errors" ? "error" : undefined;

    setLoading(true);
    fetchLogs(projectBranchId, { startTime, endTime }, severity)
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
  }, [projectBranchId, startTime, endTime, typeFilter]);

  return (
    <Card className="py-0 gap-0">
      <CardHeader className="flex items-center pt-5 pb-4 sm:flex-row">
        <div className="grid flex-1">
          <CardTitle>Logs</CardTitle>
          <CardDescription>Recent logs, warnings and errors</CardDescription>
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
      <CardContent className="p-0 [&>div]:max-h-88 [&>div]:overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-card shadow-[0_1px_0_var(--border)]">
            <TableRow>
              <TableHead className="w-42 px-4">Timestamp</TableHead>
              <TableHead className="w-24 px-4">Severity</TableHead>
              <TableHead className="px-4">Message</TableHead>
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
              logs.map((log, i) => (
                <TableRow
                  key={`${log.timestamp}-${i}`}
                  className={
                    log.severity.toUpperCase() === "CRITICAL"
                      ? "bg-destructive/20 text-destructive"
                      : ""
                  }
                >
                  <TableCell className="text-muted-foreground px-4">
                    {new Date(log.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </TableCell>
                  <TableCell className="font-medium text-start px-4">
                    <SeverityBadge severity={log.severity} variant="badge" />
                  </TableCell>
                  <TableCell className="px-4">{log.message}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
