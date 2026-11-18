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
  workerName: string;
  startTime: string;
  endTime: string;
}

interface LogEntry {
  timestamp: string;
  severity: string;
  message: string;
  source: string;
  labels: {
    source: string;
    worker_name: string;
    script_name: string;
    [key: string]: string;
  };
  metadata: {
    raw_line: string;
  };
}

interface WorkerLogsData {
  worker: string;
  script_name: string;
  count: number;
  logs: LogEntry[];
}

interface ApiResponse<T> {
  status: number;
  data: T;
}

export type WorkerLogsResponse = ApiResponse<WorkerLogsData>;

type Severity = keyof typeof SEVERITIES;

interface SeverityType {
  color: string;
  label: string;
}

const SEVERITIES = {
  INFO: { color: "text-info", label: "INFO" },
  ERROR: {
    color: "text-destructive",
    label: "ERROR",
  },
  DEBUG: {
    color: "text-muted-foreground ",
    label: "DEBUG",
  },
  WARNING: {
    color: " text-warning",
    label: "WARNING",
  },
  CRITICAL: {
    color: "text-foreground",
    label: "CRITICAL",
  },
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
  workerName: string,
  range: { startTime: string; endTime: string },
): Promise<WorkerLogsResponse> {
  const params = new URLSearchParams({
    start_time: range.startTime,
    end_time: range.endTime,
  });

  const response = await fetch(
    `/api/project_branches/${projectId}/workers/${workerName}/logs?${params}`,
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch logs: ${response.status}`);
  }

  const res = (await response.json()) as WorkerLogsResponse;
  const logs = res.data.logs.filter((l) => l.labels.source === "cloudflare");
  return { ...res, data: { ...res.data, logs, count: logs.length } };
}

export default function Logs({
  projectId,
  workerName,
  startTime,
  endTime,
}: LogsProps) {
  const [logs, setLogs] = React.useState<LogEntry[]>([]);
  const [typeFilter, setTypeFilter] = React.useState<string>("all");

  React.useEffect(() => {
    let cancelled = false;

    fetchLogs(projectId, workerName, { startTime, endTime })
      .then((res) => {
        if (!cancelled) setLogs(res.data.logs);
      })
      .catch(() => {
        if (!cancelled) setLogs([]);
      });

    return () => {
      cancelled = true;
    };
  }, [projectId, workerName, startTime, endTime]);

  return (
    <Card className="pt-0 gap-0">
      <CardHeader className="flex items-center pt-5 pb-4 sm:flex-row">
        <div className="grid flex-1 gap-1">
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
                  className={`${log.severity === "CRITICAL" ? "bg-destructive/20 text-destructive" : ""}`}
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
