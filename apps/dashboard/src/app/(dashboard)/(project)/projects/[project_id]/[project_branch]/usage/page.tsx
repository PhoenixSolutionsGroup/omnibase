import React from "react";
import { getProjectBranch } from "@/utils/get-project";
import { UsageClient } from "./client";

export default async function Page({
  params,
}: {
  params: Promise<{
    project_id: string;
    project_branch: string;
  }>;
}) {
  const { project_id, project_branch } = await params;

  const project = await getProjectBranch(project_id, project_branch);

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <UsageClient branchId={project.id} branchCreatedAt={project.created_at} />
  );
}
