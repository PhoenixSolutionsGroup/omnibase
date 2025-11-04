"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Log {
  timestamp: string;
  message?: string;
  severity?: string;
  [key: string]: any;
}

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
  serviceName: string;
  totalCount: number;
  limit: number;
}

export function LogViewer({
  initialLogs,
  projectId,
  serviceName,
  totalCount,
  limit,
}: LogViewerProps) {
  const [logs, setLogs] = useState<Log[]>(initialLogs);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialLogs.length < totalCount);

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
    if (loading) return;

    setLoading(true);
    try {
      const oldestLog = logs[logs.length - 1];
      const url = new URL(
        `/api/projects/${projectId}/logs`,
        window.location.origin
      );
      url.searchParams.set("service", "cloud_run");
      url.searchParams.set("cloud_run_service", serviceName);
      url.searchParams.set("limit", limit.toString());
      url.searchParams.set("before", oldestLog.timestamp);

      const response = await fetch(url.toString());
      if (response.ok) {
        const data = await response.json();
        if (data.logs && data.logs.length > 0) {
          setLogs((prev) => [...prev, ...data.logs]);
          setHasMore(data.logs.length >= limit);
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
    try {
      const newestLog = logs[0];
      const url = new URL(
        `/api/projects/${projectId}/logs`,
        window.location.origin
      );
      url.searchParams.set("service", "cloud_run");
      url.searchParams.set("cloud_run_service", serviceName);
      url.searchParams.set("limit", "20");
      url.searchParams.set("after", newestLog.timestamp);

      const response = await fetch(url.toString());
      if (response.ok) {
        const data = await response.json();
        if (data.logs && data.logs.length > 0) {
          setLogs((prev) => [...data.logs, ...prev]);
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
  }, [logs, projectId, serviceName]);

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
              <th className="px-3 py-2 text-left text-sm font-medium w-48">
                Timestamp
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Message
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {logs.map((log, index) => (
              <tr key={index}>
                <td colSpan={3} className="p-0">
                  <button
                    onClick={() => toggleRow(index)}
                    className="w-full text-left hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 px-4 py-2">
                      <div className="flex-shrink-0">
                        {expandedRows.has(index) ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-shrink-0 w-20">
                        {getSeverityBadge(log.severity)}
                      </div>
                      <div className="flex-shrink-0 w-48">
                        <span className="text-sm text-muted-foreground font-mono">
                          {formatTimestamp(log.timestamp)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-mono truncate block">
                          {log.message || "(no message)"}
                        </span>
                      </div>
                    </div>
                  </button>
                  {expandedRows.has(index) && (
                    <div className="px-4 pb-3 bg-muted/30">
                      <pre className="text-xs font-mono bg-muted text-foreground p-4 rounded overflow-x-auto border">
                        {JSON.stringify(log, null, 2)}
                      </pre>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Load More Button */}
      {logs.length > 0 && (
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
