"use client";

import { useMemo, useRef, useEffect } from "react";
import { AlertCircle } from "lucide-react";

interface ObservabilityClientProps {
  projectId: string;
  projectName: string;
  projectBranch: string;
  dashboardUID: string;
}

const MANAGED_HOSTING_API_URL = process.env.NEXT_PUBLIC_MANAGED_HOSTING_API_URL;
if (!MANAGED_HOSTING_API_URL)
  throw new Error("NEXT_PUBLIC_MANAGED_HOSTING_API_URL must be set");

// Dashboard configurations
const DASHBOARDS = [
  {
    uid: "project-dashboard",
    label: "Logs",
    panelId: "panel-1",
    slug: "project-group-logs",
    services: ["auth-adm", "auth-pub", "perm-read", "perm-write", "postgrest"],
  },
  {
    uid: "metrics-dashboard",
    label: "Metrics",
    panelId: "panel-1",
    slug: "project-metrics",
    services: [],
  },
  {
    uid: "overview-dashboard",
    label: "Overview",
    panelId: "panel-1",
    slug: "project-overview",
    services: [],
  },
];

function buildEmbedURL(
  dashboardUID: string,
  projectId: string,
  services: string[] = []
): string | null {
  const dashboard = DASHBOARDS.find((d) => d.uid === dashboardUID);
  if (!dashboard) return null;

  const params = new URLSearchParams({
    orgId: "1",
    timezone: "browser",
    "var-project_id": projectId,
    kiosk: "true",
  });

  // Add service filters
  services.forEach((service) => {
    params.append("var-service", service);
  });

  // return `${MANAGED_HOSTING_API_URL}/api/v1/grafana/proxy/d-solo/${dashboard.uid}/${dashboard.slug}?${params}`;
  return `${MANAGED_HOSTING_API_URL}/api/v1/grafana/proxy/d/${dashboard.uid}/${dashboard.slug}?${params}`;
}

export function ObservabilityClient({
  projectId,
  projectName,
  projectBranch,
  dashboardUID,
}: ObservabilityClientProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Build embed URL directly on the frontend
  const embedURL = useMemo(() => {
    const dashboard = DASHBOARDS.find((d) => d.uid === dashboardUID);
    if (!dashboard) return null;

    return buildEmbedURL(dashboardUID, projectId, dashboard.services);
  }, [dashboardUID, projectId]);

  // Disable ESC key in Grafana iframe to prevent exiting kiosk mode
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleIframeLoad = () => {
      try {
        // Add keydown event listener to iframe's contentWindow
        // This intercepts ESC key (keyCode 27) and F key (keyCode 70) presses
        iframe.contentWindow?.addEventListener(
          "keydown",
          (event: KeyboardEvent) => {
            // Block ESC key to prevent exiting kiosk mode
            if (event.keyCode === 27 || event.key === "Escape") {
              event.preventDefault();
              event.stopPropagation();
              return false;
            }
          },
          true // Use capture phase to intercept before Grafana handlers
        );
        console.log("Successfully disabled ESC key in Grafana iframe");
      } catch (e) {
        // This will fail if cross-origin, but since we're using a reverse proxy
        // at /api/v1/grafana/proxy, it should be same-origin
        console.warn("Unable to disable ESC key in Grafana iframe:", e);
      }
    };

    iframe.addEventListener("load", handleIframeLoad);
    return () => iframe.removeEventListener("load", handleIframeLoad);
  }, [embedURL]);

  return (
    <div className="flex flex-col h-full p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Observability - {projectName}</h1>
        <p className="text-muted-foreground">
          View dashboards, metrics, and logs for your project
        </p>
      </div>

      {/* Dashboard Selector */}
      <div className="flex gap-2 flex-wrap items-center">
        {DASHBOARDS.map((dashboard) => (
          <a
            key={dashboard.uid}
            href={`/projects/${projectId}/${projectBranch}/observability?dashboard=${dashboard.uid}`}
            className={`px-4 py-2 rounded border ${
              dashboardUID === dashboard.uid
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background hover:bg-muted border-border"
            }`}
          >
            {dashboard.label}
          </a>
        ))}
      </div>

      {/* Grafana Embed */}
      {embedURL ? (
        <div className="flex-1 border rounded-lg overflow-hidden">
          <iframe
            ref={iframeRef}
            src={embedURL}
            className="w-full h-full border-0"
            allow="fullscreen"
            title={`Grafana Dashboard - ${dashboardUID}`}
          />
        </div>
      ) : (
        <div className="flex-1 border rounded-lg flex flex-col items-center justify-center gap-3 p-8">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <div className="text-center">
            <p className="font-semibold text-destructive">
              Dashboard not found
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              The requested dashboard "{dashboardUID}" is not available.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
