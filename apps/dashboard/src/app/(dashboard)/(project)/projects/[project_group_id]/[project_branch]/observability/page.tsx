import { notFound } from "next/navigation";
import { getProject } from "@/utils/get-project";
import { ObservabilityClient } from "./observability-client";

interface ObservabilityPageProps {
  params: Promise<{
    project_group_id: string;
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
  const { project_group_id, project_branch } = await params;
  const project = await getProject(project_group_id, project_branch);

  if (!project) {
    notFound();
  }

  const { dashboard = "project-dashboard" } = await searchParams;

  return (
    <ObservabilityClient
      projectId={project.id}
      projectName={project.name}
      projectGroupId={project_group_id}
      projectBranch={project_branch}
      dashboardUID={dashboard}
    />
  );
}
