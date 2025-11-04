"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { TopNavbar } from "@/components/top-navbar";
import { OrganizationSidebar } from "@/components/organization-sidebar";
import { OrganizationBreadcrumb } from "@/components/organization-breadcrumb";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  tenantName: string;
}

export function DashboardLayoutClient({
  children,
  tenantName,
}: DashboardLayoutClientProps) {
  const pathname = usePathname();

  // Determine breadcrumb items based on pathname
  const getBreadcrumbItems = () => {
    const items: Array<{ label: string; isOrganization?: boolean }> = [
      {
        label: tenantName,
        isOrganization: true,
      },
    ];

    if (pathname === "/projects") {
      items.push({ label: "Projects" });
    } else if (pathname === "/people") {
      items.push({ label: "People" });
    } else if (pathname === "/billing") {
      items.push({ label: "Billing" });
    } else if (pathname === "/settings") {
      items.push({ label: "Settings" });
    }

    return items;
  };

  const breadcrumbItems = getBreadcrumbItems();

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <TopNavbar>
        <OrganizationBreadcrumb items={breadcrumbItems} />
      </TopNavbar>
      <div className="flex flex-1 overflow-hidden">
        <OrganizationSidebar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
