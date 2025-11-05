"use client";

import * as React from "react";
import { TopNavbar } from "@/components/top-navbar";
import { UnifiedSidebar } from "@/components/sidebar";
import { Breadcrumb } from "@/components/breadcrumb";
import { CreateProjectModal } from "@/components/create-project-modal";

interface ProjectData {
  projectId: string;
  projectGroupId: string;
  projectBranch: string;
  projectName: string;
  branches: string[];
}

interface UnifiedLayoutClientProps {
  children: React.ReactNode;
  organizationName: string;
  projectData?: ProjectData;
}

export function UnifiedLayoutClient({
  children,
  organizationName,
  projectData,
}: UnifiedLayoutClientProps) {
  const [isCreateBranchModalOpen, setIsCreateBranchModalOpen] =
    React.useState(false);

  const handleCreateBranch = () => {
    setIsCreateBranchModalOpen(true);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <TopNavbar>
        <Breadcrumb organizationName={organizationName} />
      </TopNavbar>
      <div className="flex flex-1 overflow-hidden">
        <UnifiedSidebar
          projectContext={
            projectData
              ? {
                  projectGroupId: projectData.projectGroupId,
                  projectBranch: projectData.projectBranch,
                  projectName: projectData.projectName,
                  branches: projectData.branches,
                  onCreateBranch: handleCreateBranch,
                }
              : undefined
          }
          allowOrgCollapse={!!projectData}
        />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      {/* Create Branch Modal - only for project context */}
      {projectData && (
        <CreateProjectModal
          open={isCreateBranchModalOpen}
          onOpenChange={setIsCreateBranchModalOpen}
          projectGroupId={projectData.projectGroupId}
          projectName={projectData.projectName}
        />
      )}
    </div>
  );
}
