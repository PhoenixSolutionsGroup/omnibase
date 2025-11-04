"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { OrganizationDropdown } from "./organization-dropdown";

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  isOrganization?: boolean;
}

interface OrganizationBreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function OrganizationBreadcrumb({
  items,
  className,
}: OrganizationBreadcrumbProps) {
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

      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={index}>
            <span className="text-muted-foreground">/</span>
            {item.isOrganization ? (
              <OrganizationDropdown currentOrganization={item.label} />
            ) : item.href && !isLast ? (
              <Link
                href={item.href}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.icon && (
                  <span className="flex items-center">{item.icon}</span>
                )}
                <span>{item.label}</span>
              </Link>
            ) : (
              <span
                className={cn(
                  "flex items-center gap-1.5",
                  isLast
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                )}
              >
                {item.icon && (
                  <span className="flex items-center">{item.icon}</span>
                )}
                <span>{item.label}</span>
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
