import { notFound } from "next/navigation";
import { getProjectBranch } from "@/utils/get-project";
import { LogsClient } from "./logs-client";

interface LogsPageProps {
  params: Promise<{
    project_id: string;
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
  const { project_id, project_branch } = await params;
  const project = await getProjectBranch(project_id, project_branch);

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
      projectName={project.name}
      projectId={project_id}
      projectBranch={project_branch}
      activeService={activeService}
      limit={limit}
      timeRange={timeRange}
    />
  );
}
