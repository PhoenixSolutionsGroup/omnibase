"use client";

import * as React from "react";
import { TopNavbar } from "@/components/top-navbar";
import { UnifiedSidebar } from "@/components/sidebar";
import { SidebarProvider } from "@/components/sidebar-context";
import { useRouter } from "next/navigation";
import { Project } from "@/app/(dashboard)/(project)/projects/[project_group_id]/[project_branch]/dashboard/project-provisioning-dashboard";
import type { Tenant } from "@omnibase/core-js";

interface ProjectData {
  projectId: string;
  projectGroupId: string;
  projectBranch: string;
  projectName: string;
  branches: string[];
}

interface UnifiedLayoutClientProps {
  children: React.ReactNode;
  tenants: Tenant[];
  currentTenantId: string;
  projectData?: ProjectData;
  projects?: Project[];
}

export function UnifiedLayoutClient({
  children,
  tenants,
  currentTenantId,
  projectData,
  projects,
}: UnifiedLayoutClientProps) {
  const router = useRouter();
  return (
    <SidebarProvider>
      <div className="flex h-screen flex-col overflow-hidden bg-background">
        <TopNavbar tenants={tenants} currentTenantId={currentTenantId} />
        <div className="flex flex-1 overflow-hidden">
          <UnifiedSidebar
            projectContext={
              projectData
                ? {
                    projectGroupId: projectData.projectGroupId,
                    projectBranch: projectData.projectBranch,
                    projectName: projectData.projectName,
                    branches: projectData.branches,
                    onCreateProject: () => router.push("/projects/new"),
                    projects: projects,
                  }
                : undefined
            }
            allowOrgCollapse={!!projectData}
          />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
