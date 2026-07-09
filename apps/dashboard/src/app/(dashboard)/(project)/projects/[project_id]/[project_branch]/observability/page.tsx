import { notFound } from "next/navigation";
import { getProjectBranch } from "@/utils/get-project";
import { ObservabilityClient } from "./observability-client";

interface ObservabilityPageProps {
  params: Promise<{
    project_id: string;
    project_branch: string;
  }>;
  searchParams: Promise<{
    dashboard?: string;
  }>;
}

export default async function ObservabilityPage({
  params,
  searchParams,
}: ObservabilityPageProps) {
  const { project_id, project_branch } = await params;
  const project = await getProjectBranch(project_id, project_branch);

  if (!project) {
    notFound();
  }

  const { dashboard = "project-dashboard" } = await searchParams;

  return (
    <ObservabilityClient
      projectId={project.id}
      projectName={project.name}
      projectId={project_id}
      projectBranch={project_branch}
      dashboardUID={dashboard}
    />
  );
}
