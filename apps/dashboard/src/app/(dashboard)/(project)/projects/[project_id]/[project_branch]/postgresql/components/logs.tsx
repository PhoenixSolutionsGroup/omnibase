"use client";

import * as React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    `/api/project_branches/${projectBranchId}/postgresql/logs?${params}`,
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

  React.useEffect(() => {
    let cancelled = false;
    const severity = typeFilter === "errors" ? "error" : undefined;

    fetchLogs(projectBranchId, { startTime, endTime }, severity)
      .then((res) => {
        if (!cancelled) setLogs(res.data.logs);
      })
      .catch(() => {
        if (!cancelled) setLogs([]);
      });

    return () => {
      cancelled = true;
    };
  }, [projectBranchId, startTime, endTime, typeFilter]);

  return (
    <Card className="py-0 gap-0">
      <CardHeader className="flex items-center pt-5 pb-4 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Logs</CardTitle>
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
      <CardContent className="p-0 ">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-42 pl-4">Timestamp</TableHead>
              <TableHead className="w-24">Severity</TableHead>
              <TableHead>Message</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
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
                  <TableCell className="pl-3 text-muted-foreground">
                    {new Date(log.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </TableCell>
                  <TableCell className="font-medium text-start">
                    <SeverityBadge severity={log.severity} variant="badge" />
                  </TableCell>
                  <TableCell className="pr-3">{log.message}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
