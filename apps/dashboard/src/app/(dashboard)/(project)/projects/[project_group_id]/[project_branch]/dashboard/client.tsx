"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock,
  Loader2,
  ScrollText,
  Wrench,
  XCircle,
} from "lucide-react";
import { Project } from "./project-provisioning-dashboard";
import { useEffect, useState } from "react";
import Link from "next/link";

interface ProjectDashboardClientProps {
  project: Project & {
    vps_hosts?: {
      region: string;
    } | null;
  };
}

const OMNIBASE_WORKER_URL = process.env.NEXT_PUBLIC_OMNIBASE_WORKER_URL;
if (!OMNIBASE_WORKER_URL)
  throw new Error("NEXT_PUBLIC_OMNIBASE_WORKER_URL must be set");

const MANAGED_HOSTING_API_URL = process.env.NEXT_PUBLIC_MANAGED_HOSTING_API_URL;
if (!MANAGED_HOSTING_API_URL)
  throw new Error("NEXT_PUBLIC_MANAGED_HOSTING_API_URL must be set");

interface ServiceStatus {
  name: string;
  url: string;
  status: "checking" | "healthy" | "unhealthy" | "error";
  responseTime?: number;
  error?: string;
  serviceType: string; // For mapping to logs
}

interface LogEntry {
  timestamp: string;
  severity: string;
  message: string;
  source: string;
  service_type: string;
  labels?: Record<string, string>;
  metadata?: Record<string, any>;
}

interface ServiceLogs {
  [serviceType: string]: LogEntry[];
}

export function ProjectDashboardClient({
  project,
}: ProjectDashboardClientProps) {
  const [serviceStatuses, setServiceStatuses] = useState<ServiceStatus[]>([]);
  const [serviceLogs, setServiceLogs] = useState<ServiceLogs>({});
  const [logsLoading, setLogsLoading] = useState(true);

  // Define services to check (with service type mapping)
  const services = [
    {
      name: "Auth (Public)",
      url: project.auth_public_url,
      health_url: project.auth_public_url + "/health/alive",
      serviceType: "auth-pub",
    },
    {
      name: "Auth (Admin)",
      url: project.auth_admin_url,
      health_url: project.auth_admin_url + "/health/alive",
      serviceType: "auth-adm",
    },
    {
      name: "API",
      url: project.api_url,
      health_url: project.api_url + "/health",
      serviceType: "api",
    },
    {
      name: "PostgREST",
      url: project.postgrest_url,
      health_url: project.postgrest_url + "/ready",
      serviceType: "postgrest",
    },
    {
      name: "Permissions (Read)",
      url: project.permissions_read_url,
      health_url: project.permissions_read_url + "/health/ready",
      serviceType: "perm-read",
    },
    {
      name: "Permissions (Write)",
      url: project.permissions_write_url,
      health_url: project.permissions_write_url + "/health/ready",
      serviceType: "perm-write",
    },
    {
      name: "Worker",
      url: project.worker_url,
      health_url: project.worker_url,
      serviceType: "worker",
    },
  ].filter(
    (
      service
    ): service is {
      name: string;
      url: string;
      health_url: string;
      serviceType: string;
    } => service.url !== null
  );

  // Health check function using edge worker to avoid CORS issues
  const checkServiceHealth = async (
    services: {
      name: string;
      url: string;
      health_url: string;
      serviceType: string;
    }[]
  ): Promise<ServiceStatus[]> => {
    try {
      // Call the edge function health check endpoint
      const response = await fetch(OMNIBASE_WORKER_URL + "/api/health-check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          urls: services.map((s) => s.health_url),
        }),
      });

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.statusText}`);
      }

      const data = await response.json();

      // Map results back to service statuses
      return services.map((service, index) => {
        const result = data.results[index];
        return {
          name: service.name,
          url: service.url,
          status: result.status,
          responseTime: result.responseTime,
          error: result.error,
          serviceType: service.serviceType,
        };
      });
    } catch (error) {
      // If edge function fails, return error status for all services
      return services.map((service) => ({
        name: service.name,
        url: service.url,
        status: "error" as const,
        error: error instanceof Error ? error.message : "Unknown error",
        serviceType: service.serviceType,
      }));
    }
  };

  // Fetch logs from all services
  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      // Service types to fetch logs from
      const serviceTypes = [
        "api",
        "auth-pub",
        "auth-adm",
        "perm-read",
        "perm-write",
        "postgrest",
      ];

      // Calculate start time (24 hours ago)
      const startTime = new Date();
      startTime.setHours(startTime.getHours() - 24);

      // Fetch logs for each service type with severity filter for WARNING (includes ERROR)
      const logPromises = serviceTypes.map(async (serviceType) => {
        try {
          const url = new URL(
            `${MANAGED_HOSTING_API_URL}/api/v1/projects/${project.id}/logs`
          );
          url.searchParams.set("service_type", serviceType);
          url.searchParams.set("severity", "WARNING");
          url.searchParams.set("limit", "100");
          url.searchParams.set("start_time", startTime.toISOString());
          url.searchParams.set("tail", "true");

          const response = await fetch(url.toString(), {
            credentials: "include",
            cache: "no-store",
          });

          if (!response.ok) {
            console.error(
              `Failed to fetch logs for ${serviceType}: ${response.status}`
            );
            return { serviceType, logs: [] };
          }

          const data = await response.json();
          console.log(data);
          return { serviceType, logs: data.logs || [] };
        } catch (error) {
          console.error(`Error fetching logs for ${serviceType}:`, error);
          return { serviceType, logs: [] };
        }
      });

      const results = await Promise.allSettled(logPromises);
      const logsGrouped: ServiceLogs = {};

      results.forEach((result) => {
        if (result.status === "fulfilled") {
          const { serviceType, logs } = result.value;
          // Sort by timestamp (newest first) and prioritize errors over warnings
          const sortedLogs = logs.sort((a: LogEntry, b: LogEntry) => {
            // First prioritize by severity (ERROR/CRITICAL > WARNING)
            const aSevere =
              a.severity === "ERROR" || a.severity === "CRITICAL" ? 1 : 0;
            const bSevere =
              b.severity === "ERROR" || b.severity === "CRITICAL" ? 1 : 0;
            if (aSevere !== bSevere) return bSevere - aSevere;

            // Then by timestamp
            return (
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
          });
          logsGrouped[serviceType] = sortedLogs;
        }
      });

      setServiceLogs(logsGrouped);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setLogsLoading(false);
    }
  };

  const runHealthChecks = async () => {
    setServiceStatuses(
      services.map((s) => ({
        name: s.name,
        url: s.url,
        status: "checking",
        serviceType: s.serviceType,
      }))
    );

    const statuses = await checkServiceHealth(services);
    setServiceStatuses(statuses);
  };
  useEffect(() => {
    runHealthChecks();
  }, []);

  // Fetch logs on mount
  useEffect(() => {
    fetchLogs();
  }, []);

  const region = project.vps_hosts?.region || "Unknown";

  // Helper to get severity badge
  const getSeverityBadge = (severity: string) => {
    const config: Record<string, { label: string; className: string }> = {
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
    };

    const severityConfig = config[severity] || config.WARNING;

    return (
      <span
        className={`inline-flex items-center justify-center w-20 px-2 py-0.5 rounded text-xs font-medium border ${severityConfig.className}`}
      >
        {severityConfig.label}
      </span>
    );
  };

  // Helper to format timestamp
  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString("en-AU", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Welcome Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {project.name}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {region} • Created{" "}
              {new Date(project.created_at).toLocaleDateString()}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-3">
            <Link
              href={`/projects/${project.project_group_id}/${project.branch_name}/configuration`}
            >
              <Card className="h-full transition-colors hover:bg-muted/50 cursor-pointer">
                <CardContent className="flex items-center gap-4 p-6 pt-6">
                  <Wrench className="h-8 w-8 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">Configuration</h3>
                    <p className="text-sm text-muted-foreground">
                      View all service URLs
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link
              href={`/projects/${project.project_group_id}/${project.branch_name}/logs`}
            >
              <Card className="h-full transition-colors hover:bg-muted/50 cursor-pointer">
                <CardContent className="flex items-center gap-4 p-6 pt-6">
                  <ScrollText className="h-8 w-8 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">Logs</h3>
                    <p className="text-sm text-muted-foreground">
                      View application logs
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link
              href={`/projects/${project.project_group_id}/${project.branch_name}/usage`}
            >
              <Card className="h-full transition-colors hover:bg-muted/50 cursor-pointer">
                <CardContent className="flex items-center gap-4 p-6 pt-6">
                  <BarChart3 className="h-8 w-8 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">Usage</h3>
                    <p className="text-sm text-muted-foreground">
                      View resource usage
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Project Information */}
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
              <CardDescription>
                Infrastructure and deployment details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Database Provider
                  </p>
                  <p className="mt-1 font-medium">
                    {project.database_provider || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Compute Provider
                  </p>
                  <p className="mt-1 font-medium">
                    {project.compute_provider || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Storage Provider
                  </p>
                  <p className="mt-1 font-medium">
                    {project.storage_provider || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Email Provider
                  </p>
                  <p className="mt-1 font-medium">
                    {project.email_provider || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Provisioning Type
                  </p>
                  <p className="mt-1 font-medium">
                    {project.provisioning_type || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Status
                  </p>
                  <p className="mt-1 font-medium capitalize">
                    {project.status}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Region
                  </p>
                  <p className="mt-1 font-medium">{region}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Branch
                  </p>
                  <p className="mt-1 font-medium">{project.branch_name}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Health & Errors */}
          <Card>
            <CardHeader>
              <CardTitle>Service Health</CardTitle>
              <CardDescription>
                Real-time status and errors & warnings from the past 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {serviceStatuses.map((service) => {
                  const logs = serviceLogs[service.serviceType] || [];
                  const errorCount = logs.length;
                  const firstLog = logs[0];
                  const startTime = new Date();
                  startTime.setHours(startTime.getHours() - 24);

                  return (
                    <div
                      key={service.name}
                      className="rounded-lg border p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {service.status === "checking" && (
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                          )}
                          {service.status === "healthy" && (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          )}
                          {service.status === "unhealthy" && (
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                          )}
                          {service.status === "error" && (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{service.name}</p>
                              {logsLoading && (
                                <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {service.url}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {!logsLoading && errorCount > 0 && (
                            <Link
                              href={`/projects/${project.project_group_id}/${
                                project.branch_name
                              }/logs?service_type=${
                                service.serviceType
                              }&severity=WARNING&start_time=${startTime.toISOString()}`}
                              className="text-sm text-primary hover:underline"
                            >
                              View logs →
                            </Link>
                          )}
                          {service.responseTime !== undefined && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              {service.responseTime}ms
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Show first error/warning */}
                      {!logsLoading && firstLog && (
                        <div className="pl-8 flex items-start gap-2 text-sm">
                          {getSeverityBadge(firstLog.severity)}
                          <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                            {formatTimestamp(firstLog.timestamp)}
                          </span>
                          <span className="text-sm font-mono text-muted-foreground truncate flex-1">
                            {firstLog.message}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
