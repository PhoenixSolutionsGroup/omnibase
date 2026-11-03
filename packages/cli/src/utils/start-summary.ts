export interface SummaryEntry {
  name: string;
  url: string;
}

const API_URL = "http://localhost:8080";

/**
 * Host ports published by the control-plane compose files
 * (see docker/docker-compose.base.yml). Indented entries are routes served
 * through the Omnibase API.
 */
export const CONTROL_PLANE_SERVICES: SummaryEntry[] = [
  { name: "Omnibase API", url: API_URL },
  { name: "  Auth", url: `${API_URL}/api/v1/auth` },
  { name: "  Permissions", url: `${API_URL}/api/v1/permissions` },
  { name: "  Database", url: `${API_URL}/api/v1/database` },
  { name: "Data API (PostgREST)", url: "http://localhost:8001" },
  { name: "PostgreSQL", url: "localhost:5432" },
  { name: "PgBouncer", url: "localhost:6432" },
  { name: "Adminer (DB UI)", url: "http://localhost:8081" },
  { name: "Mailpit (email UI)", url: "http://localhost:8025" },
  { name: "RustFS API (storage)", url: "http://localhost:9000" },
  { name: "RustFS console", url: "http://localhost:9001" },
];

/**
 * Poll the API readiness endpoint until it reports ready or the timeout
 * passes. Returns whether the API became ready.
 */
export async function waitForApiReady(
  timeoutMs = 120_000,
  intervalMs = 1_000,
): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${API_URL}/health/ready`, {
        signal: AbortSignal.timeout(2_000),
      });
      if (res.ok) return true;
    } catch {
      // not up yet
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  return false;
}

/**
 * Format the control-plane services and deployment dev servers as an aligned
 * list, one `name: url` line each.
 */
export function formatStartSummary(deployments: SummaryEntry[]): string[] {
  const entries = [...CONTROL_PLANE_SERVICES, ...deployments];
  const width = Math.max(...entries.map((e) => e.name.length)) + 1;
  return entries.map((e) => `  ${`${e.name}:`.padEnd(width + 1)} ${e.url}`);
}
