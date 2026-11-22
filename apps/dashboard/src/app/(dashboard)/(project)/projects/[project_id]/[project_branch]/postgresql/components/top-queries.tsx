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
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronRight,
  TriangleExclamationPoint,
} from "lucide-react";
import { formatTimestamp } from "@/lib/date";

interface QueriesProps {
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

async function fetchQueries(
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

export default function TopQueries({
  projectBranchId,
  startTime,
  endTime,
}: QueriesProps) {
  const [queries, setQueries] = React.useState<LogEntry[]>([]);
  const [typeFilter, setTypeFilter] = React.useState<string>("all");

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
    const severity = typeFilter === "errors" ? "error" : undefined;

    fetchQueries(projectBranchId, { startTime, endTime }, severity)
      .then((res) => {
        if (!cancelled) setQueries(res.data.queries);
      })
      .catch(() => {
        if (!cancelled) setQueries([]);
      });

    return () => {
      cancelled = true;
    };
  }, [projectBranchId, startTime, endTime, typeFilter]);

  const queryMetaData = [
    { key: "queryId" },
    { key: "queryId" },
    { key: "queryId" },
    { key: "queryId" },
    { key: "queryId" },
  ];

  const buildHints = (hint: any) => {
    const config = {
      warning: "text-warning",
      error: "text-destructive",
    };
    return config[hint];
  };

  return (
    <Card className="py-0 gap-0">
      <CardHeader className="flex items-center pt-5 pb-4 sm:flex-row">
        <div className="grid flex-1 ">
          <CardTitle>Top queries</CardTitle>
          <CardDescription>
            Statistics from pg_stat_statements since the last reset 6 days ago
          </CardDescription>
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
              <TableHead>Query</TableHead>
              <TableHead>Calls</TableHead>
              <TableHead>Total time</TableHead>
              <TableHead>Mean time</TableHead>
              <TableHead>Rows</TableHead>
              <TableHead>Cache hit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {queries.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="px-4 py-6 text-center text-muted-foreground"
                >
                  No queries found
                </TableCell>
              </TableRow>
            ) : (
              queries.map((query, index) => (
                <React.Fragment key={index}>
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
                        {formatTimestamp(query.query)}
                      </span>
                    </TableCell>
                    <TableCell className="px-0 py-2">
                      <span className="text-muted-foreground">
                        {query.calls}
                      </span>
                    </TableCell>
                    <TableCell className="px-0 py-2">
                      <span className="text-muted-foreground">
                        {query.total_time}
                      </span>
                    </TableCell>
                    <TableCell className="px-0 py-2">
                      <span className="text-muted-foreground">
                        {query.mean_time}
                      </span>
                    </TableCell>
                    <TableCell className="px-0 py-2">
                      <span className="text-muted-foreground">
                        {query.rows}
                      </span>
                    </TableCell>
                    <TableCell className="px-0 py-2">
                      <span className="text-muted-foreground">
                        {query.cache_hit}
                      </span>
                    </TableCell>
                  </TableRow>
                  {expandedRows.has(index) && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell
                        colSpan={6}
                        className="px-4 pb-3 bg-muted/30 whitespace-normal"
                      >
                        <Card>
                          <CardContent>
                            <span>{query.query}</span>
                          </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-4">
                          {queryMetaData.map((queryMeta) => (
                            <Card>
                              <CardContent>
                                {queryMeta.key}
                                {queryMeta.value}
                              </CardContent>
                            </Card>
                          ))}
                        </div>

                        <p className={`${buildHints(queryMeta.hint.severity)}`}>
                          <TriangleExclamationPoint className="w-3 h-3" />
                          {queryMeta.hint.text}
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
