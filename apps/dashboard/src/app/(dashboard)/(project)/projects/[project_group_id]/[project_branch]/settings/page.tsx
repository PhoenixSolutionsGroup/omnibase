import { notFound } from "next/navigation";
import { SettingsClient } from "./client";
import { getProject } from "@/utils/get-project";
import { fetchProjectSecretKey, rotateProjectKeys } from "./actions";

interface ProjectSettingsPageProps {
  params: Promise<{
    project_group_id: string;
    project_branch: string;
  }>;
}

export default async function ProjectSettingsPage({
  params,
}: ProjectSettingsPageProps) {
  const { project_group_id, project_branch } = await params;
  const project = await getProject(project_group_id, project_branch);

  if (!project) {
    notFound();
  }

  return (
    <SettingsClient
      project={project}
      onFetchSecretKey={fetchProjectSecretKey}
      onRotateKeys={rotateProjectKeys}
    />
  );
}
