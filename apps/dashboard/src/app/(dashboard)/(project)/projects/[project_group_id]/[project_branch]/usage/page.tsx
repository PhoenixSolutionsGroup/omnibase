import React from "react";
import { cookies } from "next/headers";
import { getProject } from "@/utils/get-project";

export default async function Page({
  params,
}: {
  params: Promise<{
    project_group_id: string;
    project_branch: string;
  }>;
}) {
  const { project_group_id, project_branch } = await params;
  const cookieStore = await cookies();
  const cookieHeader = Array.from(cookieStore.getAll())
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  // Calculate date range: 3 days ago to 3 days from now (as a tester)
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 1);
  const endDate = new Date();
  endDate.setDate(endDate.getDate());

  const project = await getProject(project_group_id, project_branch);

  if (!project) {
    return <div>Project not found</div>;
  }

  const response = await fetch(
    `${process.env.MANAGED_HOSTING_API_URL}/api/v1/usage/cost?project_id=${
      project.id
    }&start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}`,
    {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
      },
    }
  );

  const data = await response.json();
  console.log(data);

  return <div>page</div>;
}
