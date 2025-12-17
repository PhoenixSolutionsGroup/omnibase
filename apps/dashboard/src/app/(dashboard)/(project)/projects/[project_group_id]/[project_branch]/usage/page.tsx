import React from "react";
import { getProject } from "@/utils/get-project";
import { UsageClient } from "./client";

export default async function Page({
  params,
}: {
  params: Promise<{
    project_group_id: string;
    project_branch: string;
  }>;
}) {
  const { project_group_id, project_branch } = await params;

  const project = await getProject(project_group_id, project_branch);

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <UsageClient projectId={project.id} projectCreatedAt={project.created_at} />
  );
}
