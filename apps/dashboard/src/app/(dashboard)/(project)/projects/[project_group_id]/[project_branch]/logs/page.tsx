import { notFound } from "next/navigation";
import { getProject } from "@/utils/get-project";
import { LogsClient } from "./logs-client";

interface LogsPageProps {
  params: Promise<{
    project_group_id: string;
    project_branch: string;
  }>;
  searchParams: Promise<{
    service_name?: string;
    limit?: string;
    time_range?: string;
  }>;
}

export default async function LogsPage({
  params,
  searchParams,
}: LogsPageProps) {
  const { project_group_id, project_branch } = await params;
  const project = await getProject(project_group_id, project_branch);

  if (!project) {
    notFound();
  }

  const {
    service_name: activeService = "all",
    limit: limitParam = "100",
    time_range: timeRange = "7d",
  } = await searchParams;
  const limit = parseInt(limitParam, 10) || 100;

  return (
    <LogsClient
      projectId={project.id}
      projectName={project.name}
      projectGroupId={project_group_id}
      projectBranch={project_branch}
      activeService={activeService}
      limit={limit}
      timeRange={timeRange}
    />
  );
}
