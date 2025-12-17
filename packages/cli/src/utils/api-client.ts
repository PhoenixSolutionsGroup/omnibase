import axios, { AxiosInstance } from "axios";
import { resolveEnvironment } from "./environment";
import { getActiveProfile } from "./credentials";

export function createApiClient(envFlag?: string): AxiosInstance {
  // 1. Resolve Environment (Cloud vs Local)
  const envConfig = resolveEnvironment(envFlag);

  // 2. Get Active Profile (if available)
  const profile = getActiveProfile();

  // 3. Construct Headers
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Add API Key (Service Key)
  if (envConfig.apiKey) {
    headers["X-Service-Key"] = envConfig.apiKey;
  }

  // Add Project ID (from env config)
  if (envConfig.projectId) {
    headers["X-Project-ID"] = envConfig.projectId;
  }

  // Add Tenant ID (from active profile, if not local)
  if (envConfig.name !== "local" && profile?.tenant_id) {
    headers["X-Tenant-ID"] = profile.tenant_id;
  }

  // Add API Key for Auth (X-Api-Key Header)
  // Used for authenticated cloud calls (anything not local)
  if (envConfig.name !== "local" && profile?.api_key) {
    headers["X-Api-Key"] = profile.api_key;
  }

  // 4. Create Axios Instance
  return axios.create({
    baseURL: envConfig.managedHostingUrl || envConfig.apiUrl,
    headers,
  });
}
