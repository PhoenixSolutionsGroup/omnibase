"use client";

import * as React from "react";
import { TopNavbar } from "@/components/top-navbar";
import { ProjectSidebar } from "@/components/project-sidebar";
import { ProjectBreadcrumb } from "@/components/project-breadcrumb";
import { CreateProjectModal } from "@/components/create-project-modal";

interface ProjectLayoutClientProps {
  children: React.ReactNode;
  projectId: string;
  projectName: string;
  projectBranch: string;
  projectGroupId: string;
  organizationName: string;
  branches: string[];
}

export function ProjectLayoutClient({
  children,
  projectId,
  projectName,
  projectBranch,
  projectGroupId,
  organizationName,
  branches,
}: ProjectLayoutClientProps) {
  const [isCreateBranchModalOpen, setIsCreateBranchModalOpen] =
    React.useState(false);

  const handleCreateBranch = () => {
    setIsCreateBranchModalOpen(true);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <TopNavbar>
        <ProjectBreadcrumb
          organizationName={organizationName}
          projectName={projectName}
          projectBranch={projectBranch}
          projectGroupId={projectGroupId}
          branches={branches}
          onCreateBranch={handleCreateBranch}
        />
      </TopNavbar>
      <div className="flex flex-1 overflow-hidden">
        <ProjectSidebar
          projectGroupId={projectGroupId}
          projectBranch={projectBranch}
        />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      <CreateProjectModal
        open={isCreateBranchModalOpen}
        onOpenChange={setIsCreateBranchModalOpen}
        projectGroupId={projectGroupId}
        projectName={projectName}
      />
    </div>
  );
}
