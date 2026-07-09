import type { Metadata } from "next";
import { getOmnibaseConfiguration } from "@/lib/server";
import { redirect } from "next/navigation";
import {
  getAllProjectBranches,
  getProjectBranch,
  getProjectBranches,
} from "@/utils/get-project";
import { UnifiedLayoutClient } from "@/components/layout-client";
import { V1AuthApi } from "@omnibase/core-js";

export const metadata: Metadata = {
  title: "OmniBase Dashboard",
  description: "Manage your organization and projects",
};

interface ProjectLayoutProps {
  children: React.ReactNode;
  params: Promise<{ project_id: string; project_branch: string }>;
}

export default async function ProjectLayout({
  children,
  params,
}: ProjectLayoutProps) {
  const { project_id, project_branch } = await params;
  const project = await getProjectBranch(project_id, project_branch);

  if (!project) {
    redirect("/projects/new");
  }

  const branches = await getProjectBranches(project_id);
  const branchNames = branches?.map((b) => b.branch_name) || ["main"];

  const projects = await getAllProjectBranches();

  const config = await getOmnibaseConfiguration();
  const authApi = new V1AuthApi(config);
  const response = await authApi.listTenants();
  const tenantItems = response.tenants ?? [];

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
        branchId: project.id,
        projectId: project_id,
        projectBranch: project.branch_name,
        projectName: project.name,
        branches: branchNames,
      }}
      projects={projects || undefined}
    >
      {children}
    </UnifiedLayoutClient>
  );
}
