"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { StatusBadge } from "@/components/status-badge";
import Metrics from "./components/metrics";
import Logs from "./components/logs";
import Domains from "./components/domains";

interface DeploymentClientProps {
  projectStatus: string;
  branchName: string;
  branchId: string;
}

interface Worker {
  id: string;
  name: string;
  worker_url: string;
}

interface ProjectState {
  pulse?: boolean;
  color: string;
  label: string;
}

type TimeRange = "24h" | "7d" | "30d";

const PROJECT_STATES = {
  active: { color: "text-success", label: "active", pulse: true },
  pending: { color: "text-warning", label: "pending" },
} as const satisfies Record<string, ProjectState>;

function getProjectState(status: string): ProjectState {
  if (status === "active" || status === "pending") {
    return PROJECT_STATES[status];
  }
  return PROJECT_STATES["pending"];
}

const HOUR_MS = 60 * 60 * 1000;

const TIME_RANGES: { value: TimeRange; label: string; hours: number }[] = [
  { value: "24h", label: "Last 24 hours", hours: 24 },
  { value: "7d", label: "Last 7 days", hours: 24 * 7 },
  { value: "30d", label: "Last 30 days", hours: 24 * 30 },
];

async function fetchWorkers(branchId: string): Promise<Worker[]> {
  const response = await fetch(`/api/project_branches/${branchId}/workers`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to load workers");
  }

  return (await response.json()) as Worker[];
}

export function DeploymentClient({
  projectStatus,
  branchName,
  branchId,
}: DeploymentClientProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const state = getProjectState(projectStatus);
  const currentWorker = workers.find((w) => w.id === selectedWorkerId) ?? null;

  const { startTime, endTime } = useMemo(() => {
    const hours =
      TIME_RANGES.find((r) => r.value === timeRange)?.hours ?? 24 * 7;
    const end = new Date();
    return {
      startTime: new Date(end.getTime() - hours * HOUR_MS).toISOString(),
      endTime: end.toISOString(),
    };
  }, [timeRange]);

  useEffect(() => {
    let cancelled = false;

    async function loadWorkers() {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchWorkers(branchId);
        if (cancelled) return;

        setWorkers(data);
        setSelectedWorkerId(data[0]?.id ?? "");
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load workers");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadWorkers();

    return () => {
      cancelled = true;
    };
  }, [branchId]);

  return (
    <div className="max-w-7xl my-8 mx-auto">
      <div className="mx-16 space-y-4">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Deployment</h1>
            <p className="text-muted-foreground">
              Workers on {branchName}. Traffic and logs come from Cloudflare.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select
              value={selectedWorkerId}
              onValueChange={setSelectedWorkerId}
              disabled={loading || workers.length === 0}
            >
              <SelectTrigger className="w-50">
                <SelectValue placeholder="Select worker" />
              </SelectTrigger>
              <SelectContent>
                {workers.map((worker) => (
                  <SelectItem key={worker.id} value={worker.id}>
                    {worker.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

        {loading && (
          <div className="space-y-4">
            <Alert className="flex gap-4">
              <Skeleton className="h-6 w-42" />
              <Skeleton className="h-6 w-42" />
              <Skeleton className="h-6 w-42" />
              <Skeleton className="h-6 w-42" />
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="flex flex-col p-4 rounded-lg">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-3 w-32" />
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-64 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-2 p-4 border rounded-lg">
                  <Skeleton className="h-52 w-full" />
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-3 gap-3">
              <Card className="col-span-2">
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-64 mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-2 p-4 border rounded-lg">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-64 mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-2 p-4 border rounded-lg">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center p-8">
            <p className="text-muted-foreground">{error}</p>
          </div>
        )}

        {!loading && !error && currentWorker && (
          <div className="space-y-4">
            <Alert>
              <div className="flex gap-4 items-center">
                <StatusBadge {...state} variant="dot" />
                <span>{currentWorker.name}</span>
                <span className="text-muted-foreground">
                  Worker URL:{" "}
                  <span className="text-foreground">
                    {currentWorker.worker_url}
                  </span>
                </span>
                <span className="text-muted-foreground">
                  Version: <span className="text-foreground">a1f9c2e</span>
                </span>
                <span className="text-muted-foreground">
                  Deployed: <span className="text-foreground">2h ago</span>
                </span>
                <span className="text-muted-foreground">
                  Path: <span className="text-foreground">./workers/api</span>
                </span>
              </div>
            </Alert>

            <Metrics
              projectId={branchId}
              workerName={currentWorker.name}
              startTime={startTime}
              endTime={endTime}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="col-span-2">
                <Logs
                  projectId={branchId}
                  workerName={currentWorker.name}
                  startTime={startTime}
                  endTime={endTime}
                />
              </div>

              <Domains projectId={branchId} workerName={currentWorker.name} />
            </div>
          </div>
        )}

        {!loading && !error && workers.length === 0 && (
          <div className="flex items-center justify-center p-8">
            <p className="text-muted-foreground">No workers found</p>
          </div>
        )}
      </div>
    </div>
  );
}
