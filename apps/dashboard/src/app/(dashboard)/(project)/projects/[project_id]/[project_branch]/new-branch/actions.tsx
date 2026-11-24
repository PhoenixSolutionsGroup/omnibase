"use server";

import { getProjectBranches } from "@/utils/get-project";

export async function projectHasActiveBranch(
	projectId: string,
	branchName: string,
): Promise<boolean> {
	const branches = await getProjectBranches(projectId, branchName);

	return (
		branches?.some(
			(b) => b.branch_name === branchName && b.status === "active",
		) ?? false
	);
}
