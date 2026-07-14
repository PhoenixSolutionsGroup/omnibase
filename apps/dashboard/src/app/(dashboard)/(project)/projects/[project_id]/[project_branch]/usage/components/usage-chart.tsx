"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface R2Usage {
  bucket_name: string;
  payload_size_bytes: number;
  metadata_size_bytes: number;
  object_count: number;
  class_a_operations: number;
  class_b_operations: number;
}

export interface WorkerUsage {
  worker_name: string;
  requests: number;
  errors: number;
  subrequests: number;
  cpu_time_p50_us: number;
  cpu_time_p99_us: number;
}

export interface PostmarkUsage {
  sent: number;
  bounced: number;
  spam_complaints: number;
  opens: number;
}

export interface UsageResponse {
  branch_id: string;
  period: { start: string; end: string };
  r2?: R2Usage;
  workers?: WorkerUsage;
  postmark?: PostmarkUsage;
}

interface UsageChartProps {
  data: UsageResponse;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const exp = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  return `${(bytes / Math.pow(1024, exp)).toFixed(2)} ${units[exp]}`;
}

function formatNumber(n: number): string {
  return n.toLocaleString();
}

function formatMicros(us: number): string {
  if (us === 0) return "0";
  if (us < 1000) return `${us} µs`;
  if (us < 1_000_000) return `${(us / 1000).toFixed(2)} ms`;
  return `${(us / 1_000_000).toFixed(2)} s`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function UsageChart({ data }: UsageChartProps) {
  const sources: Array<{ label: string; present: boolean }> = [
    { label: "Storage (R2)", present: !!data.r2 },
    { label: "Workers", present: !!data.workers },
    { label: "Email (Postmark)", present: !!data.postmark },
  ];

  const presentCount = sources.filter((s) => s.present).length;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Usage Summary</CardTitle>
          <CardDescription>
            Period: {formatDate(data.period.start)} to{" "}
            {formatDate(data.period.end)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {presentCount === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No usage recorded for this period
            </p>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.r2 && (
                  <div className="flex flex-col space-y-1 p-4 border rounded-lg">
                    <span className="text-sm font-medium">Storage</span>
                    <p className="text-2xl font-bold">
                      {formatBytes(
                        data.r2.payload_size_bytes +
                          data.r2.metadata_size_bytes,
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatNumber(data.r2.object_count)} objects
                    </p>
                  </div>
                )}
                {data.workers && (
                  <div className="flex flex-col space-y-1 p-4 border rounded-lg">
                    <span className="text-sm font-medium">Workers</span>
                    <p className="text-2xl font-bold">
                      {formatNumber(data.workers.requests)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      requests ({formatNumber(data.workers.errors)} errors)
                    </p>
                  </div>
                )}
                {data.postmark && (
                  <div className="flex flex-col space-y-1 p-4 border rounded-lg">
                    <span className="text-sm font-medium">Email</span>
                    <p className="text-2xl font-bold">
                      {formatNumber(data.postmark.sent)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      sent ({formatNumber(data.postmark.bounced)} bounced)
                    </p>
                  </div>
                )}
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead>Metric</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.r2 && (
                    <>
                      <TableRow>
                        <TableCell rowSpan={5} className="font-medium align-top">
                          Storage
                        </TableCell>
                        <TableCell>Payload size</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatBytes(data.r2.payload_size_bytes)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Metadata size</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatBytes(data.r2.metadata_size_bytes)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Object count</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(data.r2.object_count)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Class A ops (writes/lists)</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(data.r2.class_a_operations)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Class B ops (reads)</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(data.r2.class_b_operations)}
                        </TableCell>
                      </TableRow>
                    </>
                  )}
                  {data.workers && (
                    <>
                      <TableRow>
                        <TableCell rowSpan={4} className="font-medium align-top">
                          Workers
                        </TableCell>
                        <TableCell>Requests</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(data.workers.requests)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Errors</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(data.workers.errors)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Subrequests</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(data.workers.subrequests)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>CPU p50 / p99</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatMicros(data.workers.cpu_time_p50_us)} /{" "}
                          {formatMicros(data.workers.cpu_time_p99_us)}
                        </TableCell>
                      </TableRow>
                    </>
                  )}
                  {data.postmark && (
                    <>
                      <TableRow>
                        <TableCell rowSpan={4} className="font-medium align-top">
                          Email
                        </TableCell>
                        <TableCell>Sent</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(data.postmark.sent)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Opens</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(data.postmark.opens)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Bounced</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(data.postmark.bounced)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Spam complaints</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(data.postmark.spam_complaints)}
                        </TableCell>
                      </TableRow>
                    </>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
