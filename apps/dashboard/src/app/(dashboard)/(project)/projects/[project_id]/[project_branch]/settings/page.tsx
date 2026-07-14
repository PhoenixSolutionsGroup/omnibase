import { notFound } from "next/navigation";
import { SettingsClient } from "./client";
import { getProjectBranch } from "@/utils/get-project";
import { rotateProjectKeys } from "./actions";

interface ProjectSettingsPageProps {
  params: Promise<{
    project_id: string;
    project_branch: string;
  }>;
}

export default async function ProjectSettingsPage({
  params,
}: ProjectSettingsPageProps) {
  const { project_id, project_branch } = await params;
  const project = await getProjectBranch(project_id, project_branch);

  if (!project) {
    notFound();
  }

  return <SettingsClient project={project} onRotateKeys={rotateProjectKeys} />;
}
