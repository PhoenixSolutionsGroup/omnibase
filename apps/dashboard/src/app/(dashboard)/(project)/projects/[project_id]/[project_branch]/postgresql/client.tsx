"use client";

import { useMemo, useState } from "react";
import { Metrics } from "./components/metrics";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Logs from "./components/logs";
import TopQueries from "./components/top-queries";

interface PostgreSQLClientProps {
  branchId: string;
}

type TimeRange = "24h" | "7d" | "30d";

const HOUR_MS = 60 * 60 * 1000;

const TIME_RANGES: { value: TimeRange; label: string; hours: number }[] = [
  { value: "24h", label: "Last 24 hours", hours: 24 },
  { value: "7d", label: "Last 7 days", hours: 24 * 7 },
  { value: "30d", label: "Last 30 days", hours: 24 * 30 },
];

export function PostgreSQLClient({ branchId }: PostgreSQLClientProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");

  const { startTime, endTime } = useMemo(() => {
    const hours =
      TIME_RANGES.find((r) => r.value === timeRange)?.hours ?? 24 * 7;
    const end = new Date();
    return {
      startTime: new Date(end.getTime() - hours * HOUR_MS).toISOString(),
      endTime: end.toISOString(),
    };
  }, [timeRange]);

  return (
    <div className="max-w-7xl my-8 mx-auto">
      <div className="mx-16 space-y-4">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight">PostgreSQL</h1>
            <p className="text-muted-foreground">
              Health and activity for your branch database
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select
              value={timeRange}
              onValueChange={(v) => setTimeRange(v as TimeRange)}
            >
              <SelectTrigger className="w-50">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                {TIME_RANGES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <Metrics
            projectBranchId={branchId}
            startTime={startTime}
            endTime={endTime}
          />

          <Logs
            projectBranchId={branchId}
            startTime={startTime}
            endTime={endTime}
          />

          <TopQueries
            projectBranchId={branchId}
            startTime={startTime}
            endTime={endTime}
          />
        </div>
      </div>
    </div>
  );
}
