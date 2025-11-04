/**
 * Service configuration for local Docker Compose and managed hosting
 */

/**
 * Maps service names to their Docker Compose service names for local development
 */
export const LOCAL_SERVICE_MAPPING: Record<string, string> = {
  auth: "kratos",
  permissions: "keto",
  api: "api",
  postgrest: "postgrest",
  typegen: "typegen",
};

/**
 * Gets the Docker Compose service name for a given service
 * @param serviceName - The logical service name (e.g., "auth", "permissions")
 * @returns The Docker Compose service name, or undefined if not found
 */
export function getLocalServiceName(serviceName: string): string | undefined {
  return LOCAL_SERVICE_MAPPING[serviceName];
}

/**
 * Gets all available service names
 * @returns Array of service names
 */
export function getAvailableServices(): string[] {
  return Object.keys(LOCAL_SERVICE_MAPPING);
}
