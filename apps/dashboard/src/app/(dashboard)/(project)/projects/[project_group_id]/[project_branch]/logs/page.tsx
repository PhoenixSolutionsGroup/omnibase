import { createServerClient } from "@/lib/server";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { LogViewer } from "./log-viewer";
import { LimitSelector } from "./limit-selector";
import { getProject } from "@/utils/get-project";

interface LogsPageProps {
  params: Promise<{
    project_group_id: string;
    project_branch: string;
  }>;
  searchParams: Promise<{
    logs?: string;
    limit?: string;
  }>;
}

// Map of service suffixes to readable labels
const SERVICE_LABELS: Record<string, string> = {
  api: "API Service",
  "auth-adm": "Auth Admin",
  "auth-pub": "Auth Public",
  "perm-r": "Permissions Read",
  "perm-w": "Permissions Write",
  postgrest: "PostgREST",
  typegen: "Type Generator",
};

const SERVICE_ORDER = [
  "api",
  "auth-pub",
  "auth-adm",
  "perm-r",
  "perm-w",
  "postgrest",
  "typegen",
];

export default async function LogsPage({
  params,
  searchParams,
}: LogsPageProps) {
  const { project_group_id, project_branch } = await params;
  const project = await getProject(project_group_id, project_branch);

  if (!project) {
    notFound();
  }
  const { logs: activeService = "api", limit: limitParam = "20" } =
    await searchParams;
  const limit = parseInt(limitParam, 10) || 20;

  // Extract service names from full resource paths
  const serviceNames = (project.cloud_run_service_names || []).map(
    (fullPath: string) => {
      const parts = fullPath.split("/");
      return parts[parts.length - 1]; // Get last part after final /
    }
  );

  // Find the full service name for the active service
  const activeServiceName = serviceNames.find((name: string) =>
    name.endsWith(`-${activeService}`)
  );

  if (!activeServiceName && activeService !== "api") {
    // If invalid service specified, redirect to api
    redirect(`/projects/${project_group_id}/logs?logs=api`);
  }

  // Fetch logs from the managed-hosting API
  let logsData = null;
  let logsError = null;

  if (activeServiceName) {
    try {
      const cookieStore = await cookies();
      const cookieHeader = Array.from(cookieStore.getAll())
        .map((cookie) => `${cookie.name}=${cookie.value}`)
        .join("; ");

      const apiUrl = process.env.MANAGED_HOSTING_API_URL;

      if (!apiUrl) {
        throw new Error("MANAGED_HOSTING_API_URL not set");
      }
      const url = new URL(`${apiUrl}/api/v1/projects/${project.id}/logs`);
      url.searchParams.set("service", "cloud_run");
      url.searchParams.set("cloud_run_service", activeServiceName);
      url.searchParams.set("limit", limit.toString());

      const response = await fetch(url.toString(), {
        headers: {
          Cookie: cookieHeader,
        },
      });

      if (response.ok) {
        logsData = await response.json();
      } else {
        logsError = `Failed to fetch logs: ${response.status} ${response.statusText}`;
        console.error(logsError);
      }
    } catch (err) {
      logsError = err instanceof Error ? err.message : "Unknown error";
      console.error("Error fetching logs:", err);
    }
  }

  // Create service list with labels
  const services = SERVICE_ORDER.map((serviceKey) => {
    const fullName = serviceNames.find((name: string) =>
      name.endsWith(`-${serviceKey}`)
    );
    return fullName
      ? {
          key: serviceKey,
          label: SERVICE_LABELS[serviceKey] || serviceKey,
          fullName,
        }
      : null;
  }).filter(Boolean);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Logs - {project.name}</h1>
        <p className="text-muted-foreground">
          View logs for your Cloud Run services
        </p>
      </div>

      {/* Service Selector */}
      <div className="flex gap-2 flex-wrap items-center">
        {services.map((service) => (
          <a
            key={service!.key}
            href={`/projects/${project.id}/logs?logs=${
              service!.key
            }&limit=${limit}`}
            className={`px-4 py-2 rounded border ${
              activeService === service!.key
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background hover:bg-muted border-border"
            }`}
          >
            {service!.label}
          </a>
        ))}

        <LimitSelector
          projectId={project.id}
          activeService={activeService}
          currentLimit={limit}
        />
      </div>

      {/* Logs Display */}
      {logsError && (
        <div className="border rounded-lg p-4 bg-destructive/10 text-destructive">
          Error: {logsError}
        </div>
      )}

      {logsData && logsData.logs && (
        <LogViewer
          initialLogs={logsData.logs}
          projectId={project.id}
          serviceName={activeServiceName!}
          totalCount={logsData.count}
          limit={limit}
        />
      )}

      {!logsData && !logsError && (
        <div className="border rounded-lg p-8 text-center text-muted-foreground">
          Loading logs...
        </div>
      )}
    </div>
  );
}
