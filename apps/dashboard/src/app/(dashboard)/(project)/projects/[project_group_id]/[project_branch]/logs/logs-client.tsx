"use client";

import { useState, useEffect } from "react";
import { LogViewer } from "./log-viewer";
import { LimitSelector } from "./limit-selector";
import { Loader2 } from "lucide-react";

interface Log {
  timestamp: string;
  message?: string;
  severity?: string;
  source?: string;
  service_type?: string;
  labels?: Record<string, string>;
  metadata?: Record<string, any>;
}

interface LogsResponse {
  logs: Log[];
  count: number;
}

// Map of service types to readable labels
const SERVICE_LABELS: Record<string, string> = {
  "auth-pub": "Auth Public",
  "auth-adm": "Auth Admin",
  "perm-read": "Permissions Read",
  "perm-write": "Permissions Write",
  api: "API Service",
  postgrest: "PostgREST",
};

const SERVICE_ORDER = [
  "api",
  "auth-pub",
  "auth-adm",
  "perm-read",
  "perm-write",
  "postgrest",
];

interface LogsClientProps {
  projectId: string;
  projectName: string;
  projectGroupId: string;
  projectBranch: string;
  activeService: string;
  limit: number;
}

const MANAGED_HOSTING_API_URL = process.env.NEXT_PUBLIC_MANAGED_HOSTING_API_URL;
if (!MANAGED_HOSTING_API_URL)
  throw new Error("NEXT_PUBLIC_MANAGED_HOSTING_API_URL must be set");

export function LogsClient({
  projectId,
  projectName,
  projectGroupId,
  projectBranch,
  activeService,
  limit,
}: LogsClientProps) {
  const [logsData, setLogsData] = useState<LogsResponse | null>(null);
  const [logsError, setLogsError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState<number>(0);

  // Create service list with labels
  const services = SERVICE_ORDER.map((serviceKey) => ({
    key: serviceKey,
    label: SERVICE_LABELS[serviceKey] || serviceKey,
  }));

  // Fetch logs on mount and when dependencies change
  useEffect(() => {
    const fetchLogs = async () => {
      // Check if we should use cached data (within 1 minute)
      const now = Date.now();
      if (now - lastFetch < 60000 && logsData) {
        return;
      }

      setIsLoading(true);
      setLogsError(null);

      try {
        const url = new URL(
          `${MANAGED_HOSTING_API_URL}/api/v1/projects/${projectId}/logs`,
          window.location.origin
        );
        url.searchParams.set("service_type", activeService);
        url.searchParams.set("limit", limit.toString());
        url.searchParams.set("tail", "true");

        const response = await fetch(url.toString(), {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setLogsData(data);
          setLastFetch(Date.now());
        } else {
          setLogsError(
            `Failed to fetch logs: ${response.status} ${response.statusText}`
          );
          console.error("Failed to fetch logs:", response.status);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setLogsError(errorMessage);
        console.error("Error fetching logs:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [projectId, activeService, limit]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Logs - {projectName}</h1>
        <p className="text-muted-foreground">
          View logs for your project services
        </p>
      </div>

      {/* Service Selector */}
      <div className="flex gap-2 flex-wrap items-center">
        {services.map((service) => (
          <a
            key={service.key}
            href={`/projects/${projectGroupId}/${projectBranch}/logs?service_type=${service.key}&limit=${limit}`}
            className={`px-4 py-2 rounded border ${
              activeService === service.key
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background hover:bg-muted border-border"
            }`}
          >
            {service.label}
          </a>
        ))}

        <LimitSelector
          project_branch={projectBranch}
          project_group_id={projectGroupId}
          activeService={activeService}
          currentLimit={limit}
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="border rounded-lg p-8 flex flex-col items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Loading logs...</p>
        </div>
      )}

      {/* Error State */}
      {!isLoading && logsError && (
        <div className="border rounded-lg p-4 bg-destructive/10 text-destructive">
          Error: {logsError}
        </div>
      )}

      {/* Logs Display */}
      {!isLoading && logsData && logsData.logs && (
        <LogViewer
          initialLogs={logsData.logs}
          projectId={projectId}
          serviceType={activeService}
          totalCount={logsData.count}
          limit={limit}
        />
      )}

      {/* No Logs State */}
      {!isLoading &&
        logsData &&
        (!logsData.logs || logsData.logs.length === 0) && (
          <div className="border rounded-lg p-8 text-center text-muted-foreground">
            No logs found for this service
          </div>
        )}
    </div>
  );
}
