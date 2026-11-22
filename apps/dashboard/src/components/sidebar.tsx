"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Database,
  Settings,
  ScrollText,
  CreditCard,
  FolderKanban,
  Users,
  Wrench,
  Globe,
  PanelLeft,
  House,
  Rocket,
  FileDatabase,
} from "lucide-react";
import { ProjectOption } from "./project-dropdown";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSidebar } from "./sidebar-context";
import { Button } from "./ui/button";

interface ProjectContext {
  branchId: string;
  projectId: string;
  projectBranch: string;
  projectName: string;
  branches: string[];
  projects?: ProjectOption[];
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

function NavItem({
  href,
  icon: Icon,
  title,
  isActive,
  isCollapsed,
}: NavItemProps) {
  const linkContent = (
    <Link href={href} className={cn("flex items-center px-2")}>
      <div
        className={cn(
          "flex items-center rounded-md text-xs font-medium transition-colors gap-3 w-full",
          isCollapsed ? "justify-center p-2" : "gap-3 px-3 py-2",

          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {!isCollapsed && title}
      </div>
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

export const getProjectNavigationItems = (
  projectId: string,
  projectBranch: string,
) => [
  {
    title: "Project Overview",
    href: `/projects/${projectId}/${projectBranch}/dashboard`,
    icon: House,
  },
  {
    title: "Table Editor",
    href: `/projects/${projectId}/${projectBranch}/studio`,
    icon: Database,
  },
  {
    title: "PostgreSQL",
    href: `/projects/${projectId}/${projectBranch}/postgresql`,
    icon: FileDatabase,
  },
  {
    title: "Stripe",
    href: `/projects/${projectId}/${projectBranch}/stripe-settings`,
    icon: CreditCard,
  },
  {
    title: "Logs",
    href: `/projects/${projectId}/${projectBranch}/logs`,
    icon: ScrollText,
  },
  {
    title: "Usage",
    href: `/projects/${projectId}/${projectBranch}/usage`,
    icon: BarChart3,
  },
  {
    title: "Deployments",
    href: `/projects/${projectId}/${projectBranch}/deployments`,
    icon: Rocket,
  },
  {
    title: "Configuration",
    href: `/projects/${projectId}/${projectBranch}/configuration`,
    icon: Wrench,
  },
  {
    title: "Project Settings",
    href: `/projects/${projectId}/${projectBranch}/settings`,
    icon: Settings,
  },
];

export const organizationNavigationItems = [
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
    title: "Domains",
    href: "/domains",
    icon: Globe,
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
    allowOrgCollapse && projectContext ? true : false,
  );

  const projectNavigationItems = projectContext
    ? getProjectNavigationItems(
        projectContext.projectId,
        projectContext.projectBranch,
      )
    : [];

  const toggleLabel = isCollapsed ? "Expand sidebar" : "Collapse sidebar";

  const toggleButton = (
    <Button
      variant="ghost"
      onClick={toggle}
      aria-label={toggleLabel}
      className={cn(
        "flex w-full items-center rounded-md text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        isCollapsed ? "justify-center p-2" : "justify-start gap-3 px-3 py-2",
      )}
    >
      <PanelLeft className="h-4 w-4 shrink-0" />
    </Button>
  );

  return (
    <div
      className={cn(
        "group/sidebar relative hidden md:flex h-full flex-col bg-sidebar transition-all duration-200 border-r",
        isCollapsed ? "w-14" : "w-64",
      )}
    >
      {/* Sidebar Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* PROJECT CONTEXT SECTION - Only visible when in a project */}
        {projectContext && (
          <>
            {/* Branch Navigation Items */}
            <nav className={cn("space-y-1 mt-2")}>
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

            <Separator className="my-4" />
          </>
        )}

        {/* ORGANIZATION NAVIGATION - Always visible */}
        <nav className={cn("space-y-1 pb-4 mt-2", isCollapsed ? "px-2" : "")}>
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
        </nav>
      </div>

      {/* SIDEBAR TOGGLE - pinned to bottom */}
      <div className={cn("py-2", isCollapsed ? "px-2" : "px-3")}>
        {isCollapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>{toggleButton}</TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              {toggleLabel}
            </TooltipContent>
          </Tooltip>
        ) : (
          toggleButton
        )}
      </div>
    </div>
  );
}
