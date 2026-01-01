import axios, { AxiosInstance } from "axios";
import { EnvironmentConfig } from "./environment";
import { getActiveProfile } from "./credentials";

/**
 * Create API client for core OmniBase operations.
 * Used for: database, permissions, stripe, email operations.
 * Uses: OMNIBASE_API_URL
 */
export function createOmnibaseClient(env: EnvironmentConfig): AxiosInstance {
  const profile = getActiveProfile();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (env.omnibaseServiceKey) {
    headers["X-Service-Key"] = env.omnibaseServiceKey;
  }

  if (env.projectId) {
    headers["X-Project-ID"] = env.projectId;
  }

  if (env.name !== "local" && profile?.tenant_id) {
    headers["X-Tenant-ID"] = profile.tenant_id;
  }

  if (env.name !== "local" && profile?.api_key) {
    headers["X-Api-Key"] = profile.api_key;
  }

  return axios.create({
    baseURL: env.omnibaseApiUrl,
    headers,
  });
}

/**
 * Create API client for managed hosting operations.
 * Used for: workers deployment, cloud auth verification.
 * Uses: MANAGED_HOSTING_API_URL
 * Throws if MANAGED_HOSTING_API_URL is not configured.
 */
export function createManagedHostingClient(
  env: EnvironmentConfig
): AxiosInstance {
  const profile = getActiveProfile();

  if (!env.managedHostingApiUrl) {
    throw new Error(
      `MANAGED_HOSTING_API_URL is required for '${env.name}' environment. ` +
        `This is needed for cloud operations like worker deployment.`
    );
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (env.projectId) {
    headers["X-Project-ID"] = env.projectId;
  }

  if (profile?.tenant_id) {
    headers["X-Tenant-ID"] = profile.tenant_id;
  }

  if (profile?.api_key) {
    headers["X-Api-Key"] = profile.api_key;
  }

  return axios.create({
    baseURL: env.managedHostingApiUrl,
    headers,
  });
}
