"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  LayoutDashboard,
  Settings,
  ScrollText,
  CreditCard,
  FolderKanban,
  Users,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { ProjectDropdown } from "./project-dropdown";
import { BranchDropdown } from "./branch-dropdown";
import { Separator } from "@/components/ui/separator";

interface Project {
  id: string;
  name: string;
  group_id: string;
}

interface ProjectContext {
  projectGroupId: string;
  projectBranch: string;
  projectName: string;
  branches: string[];
  projects?: Project[];
  onCreateBranch?: () => void;
  onCreateProject?: () => void;
}

interface UnifiedSidebarProps {
  projectContext?: ProjectContext;
  allowOrgCollapse?: boolean;
}

const getProjectNavigationItems = (
  projectGroupId: string,
  projectBranch: string
) => [
  {
    title: "Dashboard",
    href: `/projects/${projectGroupId}/${projectBranch}/dashboard`,
    icon: LayoutDashboard,
  },
  {
    title: "Logs",
    href: `/projects/${projectGroupId}/${projectBranch}/logs`,
    icon: ScrollText,
  },
  {
    title: "Usage",
    href: `/projects/${projectGroupId}/${projectBranch}/usage`,
    icon: BarChart3,
  },
  {
    title: "Stripe Settings",
    href: `/projects/${projectGroupId}/${projectBranch}/stripe-settings`,
    icon: CreditCard,
  },
  {
    title: "Settings",
    href: `/projects/${projectGroupId}/${projectBranch}/settings`,
    icon: Settings,
  },
];

const organizationNavigationItems = [
  {
    title: "Projects",
    href: "/projects",
    icon: FolderKanban,
  },
  {
    title: "People",
    href: "/people",
    icon: Users,
  },
  {
    title: "Subscriptions",
    href: "/subscriptions",
    icon: CreditCard,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function UnifiedSidebar({
  projectContext,
  allowOrgCollapse = false,
}: UnifiedSidebarProps) {
  const pathname = usePathname();
  const [isOrgCollapsed, setIsOrgCollapsed] = React.useState(
    allowOrgCollapse && projectContext ? true : false
  );

  const projectNavigationItems = projectContext
    ? getProjectNavigationItems(
        projectContext.projectGroupId,
        projectContext.projectBranch
      )
    : [];

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-sidebar">
      {/* PROJECT CONTEXT SECTION - Only visible when in a project */}
      {projectContext && (
        <>
          <div className="flex flex-col">
            {/* PROJECT SECTION */}
            <div className="border-b border-border px-3 py-3">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Project
              </label>
              <ProjectDropdown
                projectGroupId={projectContext.projectGroupId}
                currentProject={projectContext.projectName}
                currentBranch={projectContext.projectBranch}
                projects={projectContext.projects}
                onCreateProject={projectContext.onCreateProject}
              />
            </div>

            {/* BRANCH SECTION WITH NAVIGATION */}
            <div className="px-3 py-3">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Branch
              </label>
              <BranchDropdown
                currentBranch={projectContext.projectBranch}
                branches={projectContext.branches}
                onCreateBranch={projectContext.onCreateBranch}
              />

              {/* Branch Navigation Items */}
              <nav className="mt-4 space-y-1">
                {projectNavigationItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.title}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          <Separator className="my-2" />
        </>
      )}

      {/* ORGANIZATION NAVIGATION - Always visible */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {allowOrgCollapse ? (
          <button
            onClick={() => setIsOrgCollapsed(!isOrgCollapsed)}
            className="mb-2 flex w-full items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
          >
            {isOrgCollapsed ? (
              <ChevronRight className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
            Organization
          </button>
        ) : (
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Organization
          </label>
        )}
        {(!allowOrgCollapse || !isOrgCollapsed) && (
          <>
            {organizationNavigationItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Link>
              );
            })}
          </>
        )}
      </nav>
    </div>
  );
}
