"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { OrganizationDropdown } from "./organization-dropdown";
import { BranchDropdown } from "./branch-dropdown";

interface ProjectBreadcrumbProps {
  organizationName: string;
  projectName: string;
  className?: string;
  projectBranch: string;
  projectGroupId: string;
  branches: string[];
  onCreateBranch?: () => void;
}

export function ProjectBreadcrumb({
  organizationName,
  projectName,
  className,
  projectBranch,
  projectGroupId,
  branches,
  onCreateBranch,
}: ProjectBreadcrumbProps) {
  return (
    <nav
      className={cn("flex items-center gap-2 text-base", className)}
      aria-label="Breadcrumb"
    >
      {/* Logo/Favicon */}
      <Link href="/" className="flex items-center justify-center">
        <svg
          className="h-7 w-7 text-primary"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
        </svg>
      </Link>

      {/* Organization Dropdown */}
      <span className="text-muted-foreground">/</span>
      <OrganizationDropdown currentOrganization={organizationName} />

      {/* Project Name */}
      <span className="text-muted-foreground">/</span>
      <span className="text-foreground font-medium">{projectName}</span>

      {/* Branch Dropdown */}
      <span className="text-muted-foreground">/</span>
      <BranchDropdown
        projectGroupId={projectGroupId}
        currentBranch={projectBranch}
        branches={branches}
        onCreateBranch={onCreateBranch}
      />
    </nav>
  );
}
