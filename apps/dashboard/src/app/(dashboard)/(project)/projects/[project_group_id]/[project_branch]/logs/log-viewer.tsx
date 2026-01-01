"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Log {
  timestamp: string;
  message?: string;
  severity?: string;
  source?: string;
  service_type?: string;
  labels?: Record<string, string>;
  metadata?: Record<string, any>;
}

const MANAGED_HOSTING_API_URL = process.env.NEXT_PUBLIC_MANAGED_HOSTING_API_URL;
if (!MANAGED_HOSTING_API_URL)
  throw new Error("NEXT_PUBLIC_MANAGED_HOSTING_API_URL must be set");

// Service type labels and colors
const SERVICE_CONFIG: Record<string, { label: string; className: string }> = {
  all: { label: "All", className: "bg-gray-100 text-gray-700 border-gray-200" },
  api: { label: "API", className: "bg-blue-50 text-blue-700 border-blue-200" },
  "auth-pub": { label: "Auth Pub", className: "bg-green-50 text-green-700 border-green-200" },
  "auth-adm": { label: "Auth Adm", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  "perm-read": { label: "Perm Read", className: "bg-purple-50 text-purple-700 border-purple-200" },
  "perm-write": { label: "Perm Write", className: "bg-violet-50 text-violet-700 border-violet-200" },
  postgrest: { label: "PostgREST", className: "bg-orange-50 text-orange-700 border-orange-200" },
};

const getServiceTypeBadge = (serviceType?: string) => {
  if (!serviceType) return null;

  const config = SERVICE_CONFIG[serviceType] || {
    label: serviceType,
    className: "bg-gray-100 text-gray-700 border-gray-200",
  };

  return (
    <span
      className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-medium border whitespace-nowrap ${config.className}`}
    >
      {config.label}
    </span>
  );
};

// GCP Cloud Logging severity levels with subtle styling
const getSeverityBadge = (severity?: string) => {
  if (!severity) return null;

  const severityUpper = severity.toUpperCase();

  const severityConfig: Record<string, { label: string; className: string }> = {
    DEFAULT: {
      label: "DEFAULT",
      className: "bg-gray-100 text-gray-700 border-gray-200",
    },
    DEBUG: {
      label: "DEBUG",
      className: "bg-blue-50 text-blue-700 border-blue-200",
    },
    INFO: {
      label: "INFO",
      className: "bg-green-50 text-green-700 border-green-200",
    },
    NOTICE: {
      label: "NOTICE",
      className: "bg-cyan-50 text-cyan-700 border-cyan-200",
    },
    WARNING: {
      label: "WARNING",
      className: "bg-yellow-50 text-yellow-700 border-yellow-200",
    },
    ERROR: {
      label: "ERROR",
      className: "bg-red-50 text-red-700 border-red-200",
    },
    CRITICAL: {
      label: "CRITICAL",
      className: "bg-red-100 text-red-800 border-red-300",
    },
    ALERT: {
      label: "ALERT",
      className: "bg-purple-50 text-purple-700 border-purple-200",
    },
    EMERGENCY: {
      label: "EMERGENCY",
      className: "bg-purple-100 text-purple-800 border-purple-300",
    },
  };

  const config = severityConfig[severityUpper] || severityConfig.DEFAULT;

  return (
    <span
      className={`inline-flex items-center justify-center w-20 px-2 py-0.5 rounded text-xs font-medium border ${config.className}`}
    >
      {config.label}
    </span>
  );
};

interface LogViewerProps {
  initialLogs: Log[];
  projectId: string;
  serviceType: string;
  totalCount: number;
  limit: number;
}

export function LogViewer({
  initialLogs,
  projectId,
  serviceType,
  totalCount,
  limit,
}: LogViewerProps) {
  // Sort logs newest first on initial load
  const [logs, setLogs] = useState<Log[]>(
    [...initialLogs].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  );
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true); // Always show button initially

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

  const loadMoreLogs = async () => {
    if (loading || logs.length === 0) return;

    setLoading(true);
    try {
      const oldestLog = logs[logs.length - 1];
      const oldestTimestamp = new Date(oldestLog.timestamp);

      // Use the oldest log timestamp as end_time (backend will exclude it)
      const endTime = oldestTimestamp.toISOString();

      const url = new URL(
        `${MANAGED_HOSTING_API_URL}/api/v1/logs/${projectId}`,
        window.location.origin
      );
      url.searchParams.set("service_type", serviceType);
      url.searchParams.set("limit", limit.toString());
      url.searchParams.set("end_time", endTime);
      // Don't use tail=true for historical logs - we want older logs, not newest

      console.log("Loading older logs before:", endTime);

      const response = await fetch(url.toString(), {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Load more response:", data);
        if (data.logs && data.logs.length > 0) {
          // Sort and append older logs
          const sortedOlderLogs = [...data.logs].sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          setLogs((prev) => [...prev, ...sortedOlderLogs]);
          setHasMore(data.logs.length >= limit);
          console.log("Added", sortedOlderLogs.length, "older logs");
        } else {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error("Error loading more logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkNewLogs = async () => {
    if (logs.length === 0) return;

    try {
      const newestLog = logs[0];
      const newestTimestamp = new Date(newestLog.timestamp);

      // Add 1 millisecond to exclude the newest log we already have
      const startTime = new Date(newestTimestamp.getTime() + 1).toISOString();

      const url = new URL(
        `${MANAGED_HOSTING_API_URL}/api/v1/logs/${projectId}`,
        window.location.origin
      );
      url.searchParams.set("service_type", serviceType);
      url.searchParams.set("limit", "20");
      url.searchParams.set("start_time", startTime);
      url.searchParams.set("tail", "true");

      const response = await fetch(url.toString(), {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        if (data.logs && data.logs.length > 0) {
          const sortedNewLogs = [...data.logs].sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          setLogs((prev) => [...sortedNewLogs, ...prev]);
        }
      }
    } catch (error) {
      console.error("Error checking new logs:", error);
    }
  };

  // Real-time polling for new logs
  useEffect(() => {
    if (logs.length === 0) return;

    const interval = setInterval(() => {
      checkNewLogs();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [logs, projectId, serviceType]);

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString("en-AU", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted border-b">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium"></th>
              <th className="px-0 py-2 text-left text-sm font-medium">
                Severity
              </th>
              {serviceType === "all" && (
                <th className="px-2 py-2 text-left text-sm font-medium">
                  Service
                </th>
              )}
              <th className="px-3 py-2 text-left text-sm font-medium w-56">
                Timestamp
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Message
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {logs.map((log, index) => (
              <>
                <tr key={index} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-2 w-8">
                    <button
                      onClick={() => toggleRow(index)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {expandedRows.has(index) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                  <td className="px-0 py-2">
                    {getSeverityBadge(log.severity)}
                  </td>
                  {serviceType === "all" && (
                    <td className="px-2 py-2">
                      {getServiceTypeBadge(log.service_type)}
                    </td>
                  )}
                  <td className="px-3 py-2 w-56">
                    <span className="text-sm text-muted-foreground font-mono whitespace-nowrap">
                      {formatTimestamp(log.timestamp)}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span className="text-sm font-mono truncate block">
                      {log.message || "(no message)"}
                    </span>
                  </td>
                </tr>
                {expandedRows.has(index) && (
                  <tr key={`${index}-expanded`}>
                    <td colSpan={serviceType === "all" ? 5 : 4} className="px-4 pb-3 bg-muted/30">
                      {/* Raw Log Line */}
                      {log.metadata?.raw_line && (
                        <div className="mb-3">
                          <div className="text-xs font-semibold text-muted-foreground mb-1">
                            Raw Log:
                          </div>
                          <pre className="text-xs font-mono bg-muted text-foreground p-3 rounded overflow-x-auto border">
                            {typeof log.metadata.raw_line === "string"
                              ? (() => {
                                  try {
                                    return JSON.stringify(
                                      JSON.parse(log.metadata.raw_line),
                                      null,
                                      2
                                    );
                                  } catch {
                                    return log.metadata.raw_line;
                                  }
                                })()
                              : JSON.stringify(log.metadata.raw_line, null, 2)}
                          </pre>
                        </div>
                      )}

                      {/* Full Log Entry */}
                      <div>
                        <div className="text-xs font-semibold text-muted-foreground mb-1">
                          Full Log Entry:
                        </div>
                        <pre className="text-xs font-mono bg-muted text-foreground p-3 rounded overflow-x-auto border">
                          {JSON.stringify(log, null, 2)}
                        </pre>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Load More Button */}
      {logs.length > 0 && hasMore && (
        <div className="px-4 py-3 border-t flex justify-center">
          <Button
            onClick={loadMoreLogs}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            {loading ? "Loading..." : "Load More Historical"}
          </Button>
        </div>
      )}

      {/* Empty state */}
      {logs.length === 0 && (
        <div className="px-4 py-8 text-center text-muted-foreground">
          No logs found
        </div>
      )}
    </div>
  );
}
