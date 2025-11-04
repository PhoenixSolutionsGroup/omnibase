import type { Metadata } from "next";
import { ProjectLayoutClient } from "@/components/project-layout-client";
import { createServerClient } from "@/lib/server";
import { notFound } from "next/navigation";
import { getProject } from "@/utils/get-project";
import { Project } from "./dashboard/project-provisioning-dashboard";

export const metadata: Metadata = {
  title: "OmniBase Dashboard",
  description: "Manage your organization and projects",
};

interface ProjectLayoutProps {
  children: React.ReactNode;
  params: Promise<{ project_group_id: string; project_branch: string }>;
}

export default async function ProjectLayout({
  children,
  params,
}: ProjectLayoutProps) {
  const { project_group_id, project_branch } = await params;
  const project = await getProject(project_group_id, project_branch);

  if (!project) {
    notFound();
  }

  const db = (await createServerClient()) as any;
  const { data: organization } = await db
    .schema("auth")
    .from("tenant_users")
    .select("tenants(*)")
    .eq("is_active", true)
    .single();

  const tenantName = organization.tenants.name;

  // Fetch all branches for this project group
  const { data: branches } = await db
    .from("projects")
    .select("branch_name")
    .eq("project_group_id", project_group_id)
    .order("branch_name");

  const branchNames = branches?.map(
    (b: Project) => b.branch_name || "main"
  ) || ["main"];

  // For now, using a placeholder for organization name
  // You can fetch this from the tenants table if needed
  const organizationName = "My Organization";

  return (
    <ProjectLayoutClient
      projectId={project.id}
      projectName={project.name}
      projectBranch={project.branch_name || "main"}
      projectGroupId={project_group_id}
      organizationName={organizationName}
      branches={branchNames}
    >
      {children}
    </ProjectLayoutClient>
  );
}
