import { Configuration } from "@omnibase/core-js";
import { PostgrestClient } from "@supabase/postgrest-js";
import { cookies } from "next/headers";
import type { Project } from "@/app/(dashboard)/(project)/projects/[project_id]/[project_branch]/dashboard/project-provisioning-dashboard";
import type { Database } from "@/types/omnibase";

const OMNIBASE_API_URL = process.env.OMNIBASE_API_URL!.replace(/\/+$/, "");
const MANAGED_HOSTING_API_URL = process.env.MANAGED_HOSTING_API_URL!;

const OMNIBASE_POSTGREST_URL = `${OMNIBASE_API_URL}/api/v1/rest`;

export const createServerClient = async () => {
	const cookieStore = await cookies();
	const sessionToken = cookieStore.get("omnibase_session_token")?.value;
	const cookieHeader = cookieStore
		.getAll()
		.map((cookie) => `${cookie.name}=${cookie.value}`)
		.join("; ");

	return new PostgrestClient<Database>(OMNIBASE_POSTGREST_URL, {
		headers: sessionToken
			? { "X-Session-Token": sessionToken }
			: { Cookie: cookieHeader },
	});
};

export const getOmnibaseConfiguration = async () => {
	const cookieStore = await cookies();
	const sessionToken = cookieStore.get("omnibase_session_token")?.value;
	const cookieHeader = cookieStore
		.getAll()
		.map((cookie) => `${cookie.name}=${cookie.value}`)
		.join("; ");
	return new Configuration({
		basePath: OMNIBASE_API_URL,
		headers: sessionToken
			? { "X-Session-Token": sessionToken }
			: { Cookie: cookieHeader },
	});
};

// Requires current user to have permission to decrypt api service key
export const getOmnibaseProjectConfiguration = async (
	project: Pick<Project, "id" | "api_url">,
) => {
	const cookieStore = await cookies();
	const cookieHeader = cookieStore
		.getAll()
		.map((cookie) => `${cookie.name}=${cookie.value}`)
		.join("; ");

	const response = await fetch(
		`${MANAGED_HOSTING_API_URL}/api/v1/project_branches/${project.id}/api-service-key`,
		{
			headers: {
				Cookie: cookieHeader,
			},
		},
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
