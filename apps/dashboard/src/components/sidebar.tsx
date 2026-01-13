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
  Wrench,
} from "lucide-react";
import { ProjectDropdown } from "./project-dropdown";
import { BranchDropdown } from "./branch-dropdown";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSidebar } from "./sidebar-context";
import { Project } from "@/app/(dashboard)/(project)/projects/[project_group_id]/[project_branch]/dashboard/project-provisioning-dashboard";

interface ProjectContext {
  projectGroupId: string;
  projectBranch: string;
  projectName: string;
  branches: string[];
  projects?: Project[];
  onCreateProject?: () => void;
}

interface UnifiedSidebarProps {
  projectContext?: ProjectContext;
  allowOrgCollapse?: boolean;
}

interface NavItemProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  isActive: boolean;
  isCollapsed: boolean;
}

function NavItem({ href, icon: Icon, title, isActive, isCollapsed }: NavItemProps) {
  const linkContent = (
    <Link
      href={href}
      className={cn(
        "flex items-center rounded-md text-sm font-medium transition-colors",
        isCollapsed ? "justify-center p-2" : "gap-3 px-3 py-2",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!isCollapsed && title}
    </Link>
  );

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {title}
        </TooltipContent>
      </Tooltip>
    );
  }

  return linkContent;
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
    title: "Configuration",
    href: `/projects/${projectGroupId}/${projectBranch}/configuration`,
    icon: Wrench,
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
    title: "Stripe",
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
  const { isCollapsed, toggle } = useSidebar();
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
    <div
      className={cn(
        "group/sidebar relative flex h-full flex-col bg-sidebar transition-all duration-200",
        isCollapsed ? "w-14" : "w-64"
      )}
    >
      {/* Sidebar Content */}
      <div className="flex-1 overflow-hidden">
        {/* PROJECT CONTEXT SECTION - Only visible when in a project */}
        {projectContext && (
          <>
            <div className="flex flex-col">
              {/* PROJECT SECTION */}
              {!isCollapsed && (
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
              )}

              {/* BRANCH SECTION WITH NAVIGATION */}
              <div className={cn("py-3", isCollapsed ? "px-2" : "px-3")}>
                {!isCollapsed && (
                  <>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Branch
                    </label>
                    <BranchDropdown
                      currentBranch={projectContext.projectBranch}
                      branches={projectContext.branches}
                      projectGroupId={projectContext.projectGroupId}
                    />
                  </>
                )}

                {/* Branch Navigation Items */}
                <nav className={cn("space-y-1", !isCollapsed && "mt-4")}>
                  {projectNavigationItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <NavItem
                        key={item.href}
                        href={item.href}
                        icon={item.icon}
                        title={item.title}
                        isActive={isActive}
                        isCollapsed={isCollapsed}
                      />
                    );
                  })}
                </nav>
              </div>
            </div>

            <Separator className="my-2" />
          </>
        )}

        {/* ORGANIZATION NAVIGATION - Always visible */}
        <nav className={cn("flex-1 space-y-1 py-4", isCollapsed ? "px-2" : "px-3")}>
          {!isCollapsed && (
            allowOrgCollapse ? (
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
            )
          )}
          {(isCollapsed || !allowOrgCollapse || !isOrgCollapsed) && (
            <>
              {organizationNavigationItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <NavItem
                    key={item.href}
                    href={item.href}
                    icon={item.icon}
                    title={item.title}
                    isActive={isActive}
                    isCollapsed={isCollapsed}
                  />
                );
              })}
            </>
          )}
        </nav>
      </div>

      {/* Clickable Right Border */}
      <button
        onClick={toggle}
        className={cn(
          "absolute -right-2 top-0 h-full w-4 bg-transparent transition-colors before:absolute before:right-2 before:top-0 before:h-full before:w-px before:bg-border before:transition-colors hover:before:bg-primary",
          isCollapsed ? "cursor-e-resize" : "cursor-w-resize"
        )}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      />
    </div>
  );
}
