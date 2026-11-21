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
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

interface LogsProps {
  projectId: string;
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

type Severity = keyof typeof SEVERITIES;

interface SeverityType {
  color: string;
  label: string;
}

const SEVERITIES = {
  TRACE: { color: "text-muted-foreground", label: "TRACE" },
  DEBUG: { color: "text-muted-foreground", label: "DEBUG" },
  INFO: { color: "text-info", label: "INFO" },
  WARN: { color: "text-warning", label: "WARN" },
  WARNING: { color: "text-warning", label: "WARNING" },
  ERROR: { color: "text-destructive", label: "ERROR" },
  CRITICAL: { color: "text-foreground", label: "CRITICAL" },
} as const satisfies Record<string, SeverityType>;

function isSeverity(value: string): value is Severity {
  return Object.hasOwn(SEVERITIES, value);
}

function getSeverity(status: string): SeverityType {
  const key = status.toUpperCase();
  return isSeverity(key) ? SEVERITIES[key] : SEVERITIES.INFO;
}

async function fetchLogs(
  projectId: string,
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
    `/api/v1/project_branches/${projectId}/postgresql/logs?${params}`,
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch logs: ${response.status}`);
  }

  return (await response.json()) as PostgresLogsResponse;
}

export default function Logs({ projectId, startTime, endTime }: LogsProps) {
  const [logs, setLogs] = React.useState<LogEntry[]>([]);
  const [typeFilter, setTypeFilter] = React.useState<string>("all");

  React.useEffect(() => {
    let cancelled = false;
    const severity = typeFilter === "errors" ? "error" : undefined;

    fetchLogs(projectId, { startTime, endTime }, severity)
      .then((res) => {
        if (!cancelled) setLogs(res.data.logs);
      })
      .catch(() => {
        if (!cancelled) setLogs([]);
      });

    return () => {
      cancelled = true;
    };
  }, [projectId, startTime, endTime, typeFilter]);

  return (
    <Card className="pt-0 gap-0">
      <CardHeader className="flex items-center pt-5 pb-4 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Logs</CardTitle>
          <CardDescription>PostgreSQL logs</CardDescription>
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
      <CardContent className="p-0">
        <Table>
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
                  <TableCell className="pl-4 text-muted-foreground">
                    {new Date(log.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </TableCell>
                  <TableCell className="font-medium text-start">
                    <div className={getSeverity(log.severity).color}>
                      {getSeverity(log.severity).label}
                    </div>
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
