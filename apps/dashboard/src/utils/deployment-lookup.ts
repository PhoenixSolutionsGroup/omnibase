const MANAGED_HOSTING_API_URL = process.env.NEXT_PUBLIC_MANAGED_HOSTING_API_URL;

export type ComputeDeployment = {
  id: string;
  provider: string;
  machine_type: string;
  name: string;
  vcpus: number;
  memory_gb: number;
  storage_gb: number;
  max_tenants: number;
};

export type DatabaseDeployment = {
  id: string;
  provider: string;
  region: string;
  name: string;
  country: string;
  continent: string;
  location_name: string;
};

export type StorageDeployment = {
  id: string;
  provider: string;
  name: string;
};

export async function fetchComputeDeployment(
  id: string
): Promise<ComputeDeployment | null> {
  if (!id || !MANAGED_HOSTING_API_URL) return null;
  try {
    const response = await fetch(
      `${MANAGED_HOSTING_API_URL}/api/v1/projects/options/compute/${encodeURIComponent(id)}`
    );
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export async function fetchDatabaseDeployment(
  id: string
): Promise<DatabaseDeployment | null> {
  if (!id || !MANAGED_HOSTING_API_URL) return null;
  try {
    const response = await fetch(
      `${MANAGED_HOSTING_API_URL}/api/v1/projects/options/database/${encodeURIComponent(id)}`
    );
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export async function fetchStorageDeployment(
  id: string
): Promise<StorageDeployment | null> {
  if (!id || !MANAGED_HOSTING_API_URL) return null;
  try {
    const response = await fetch(
      `${MANAGED_HOSTING_API_URL}/api/v1/projects/options/storage/${encodeURIComponent(id)}`
    );
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}
