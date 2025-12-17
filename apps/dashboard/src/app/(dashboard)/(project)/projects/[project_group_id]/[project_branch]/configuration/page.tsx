import { createServerClient } from "@/lib/server";
import { notFound } from "next/navigation";
import { getProject } from "@/utils/get-project";
import { ConfigurationClient } from "./client";

interface ConfigurationPageProps {
  params: Promise<{
    project_group_id: string;
    project_branch: string;
  }>;
}

export default async function ConfigurationPage({
  params,
}: ConfigurationPageProps) {
  const { project_group_id, project_branch } = await params;
  const project = await getProject(project_group_id, project_branch);

  if (!project) {
    notFound();
  }

  return <ConfigurationClient project={project} />;
}
