import type { Metadata } from "next";
import { createServerClient, getOmnibaseConfiguration } from "@/lib/server";
import { redirect } from "next/navigation";
import { getProject } from "@/utils/get-project";
import { UnifiedLayoutClient } from "@/components/layout-client";
import { V1AuthApi } from "@omnibase/core-js";

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
    redirect("/projects/new");
  }

  const db = await createServerClient();

  // Fetch all branches for this project group
  const { data: branches } = await db
    .from("projects")
    .select("branch_name")
    .eq("project_group_id", project_group_id)
    .order("branch_name");

  const branchNames = branches?.map((b) => b.branch_name || "main") || ["main"];

  const { data: projects } = await db
    .from("projects")
    .select("*")
    .in("status", ["active", "provisioning"]);

  // Fetch tenants using the SDK
  const config = await getOmnibaseConfiguration();
  const authApi = new V1AuthApi(config);
  const response = await authApi.listTenants();
  const tenantItems = response.data?.tenants ?? [];

  if (tenantItems.length === 0) {
    redirect("/auth/onboarding");
  }

  const activeTenantItem = tenantItems.find((t) => t.isActive);
  if (!activeTenantItem) {
    redirect("/auth/onboarding");
  }

  const tenants = tenantItems.map((t) => t.tenant);
  const currentTenantId = activeTenantItem.tenant.id;

  return (
    <UnifiedLayoutClient
      tenants={tenants}
      currentTenantId={currentTenantId}
      projectData={{
        projectId: project.id,
        projectGroupId: project_group_id,
        projectBranch: project.branch_name || "main",
        projectName: project.name,
        branches: branchNames,
      }}
      projects={projects || undefined}
    >
      {children}
    </UnifiedLayoutClient>
  );
}
