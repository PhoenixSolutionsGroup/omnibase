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
} from "lucide-react";

interface ProjectSidebarProps {
  projectGroupId: string;
  projectBranch: string;
}

const getNavigationItems = (projectGroupId: string, projectBranch: string) => [
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

export function ProjectSidebar({
  projectGroupId,
  projectBranch,
}: ProjectSidebarProps) {
  const pathname = usePathname();
  const navigationItems = getNavigationItems(projectGroupId, projectBranch);

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-sidebar">
      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigationItems.map((item) => {
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
  );
}
