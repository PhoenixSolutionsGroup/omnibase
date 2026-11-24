import { getProjectBranch } from "@/utils/get-project";
import { PostgreSQLClient } from "./client";

interface PageProps {
  params: Promise<{
    project_id: string;
    project_branch: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { project_id, project_branch } = await params;

  const project = await getProjectBranch(project_id, project_branch);

  if (!project) {
    return <div>Project not found</div>;
  }

  return <PostgreSQLClient branchId={project.id} />;
}
