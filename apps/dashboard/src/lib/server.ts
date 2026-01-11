import { Project } from "@/app/(dashboard)/(project)/projects/[project_group_id]/[project_branch]/dashboard/project-provisioning-dashboard";
import { Database } from "@/types/omnibase";
import { Configuration, V1PaymentsApi, V1StripeApi } from "@omnibase/core-js";
import { PostgrestClient } from "@supabase/postgrest-js";
import { cookies } from "next/headers";

const OMNIBASE_API_URL = process.env.OMNIBASE_API_URL!;
const MANAGED_HOSTING_API_URL = process.env.MANAGED_HOSTING_API_URL!;

const OMNIBASE_POSTGREST_URL = process.env.OMNIBASE_POSTGREST_URL!;
const OMNIBASE_ANON_KEY = process.env.OMNIBASE_ANON_KEY!;

export const createServerClient = async () => {
  const cookieStore = await cookies();
  const key =
    cookieStore.get("omnibase_postgrest_jwt")?.value || OMNIBASE_ANON_KEY;

  return new PostgrestClient<Database>(OMNIBASE_POSTGREST_URL, {
    headers: {
      Authorization: `Bearer ${key}`,
    },
  });
};

export const getOmnibaseConfiguration = async () => {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
  return new Configuration({
    basePath: OMNIBASE_API_URL,
    headers: {
      Cookie: cookieHeader,
    },
  });
};

// Requires current user to have permission to decrypt api service key
export const getOmnibaseProjectConfiguration = async (
  project: Pick<Project, "id" | "api_url">
) => {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  const response = await fetch(
    `${MANAGED_HOSTING_API_URL}/api/v1/projects/${project.id}/api-service-key`,
    {
      headers: {
        Cookie: cookieHeader,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get API service key: ${response.statusText}`);
  }

  const { api_service_key } = await response.json();

  return new Configuration({
    basePath: project.api_url!,
    headers: {
      "X-Service-Key": api_service_key,
    },
  });
};
