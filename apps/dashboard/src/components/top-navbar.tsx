"use client";

import * as React from "react";
import Link from "next/link";
import {
  BookOpen,
  User,
  LogOut,
  CircleDot,
  Menu,
  GitBranch,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OrganizationDropdown } from "./organization-dropdown";
import { switchTenant } from "@/app/(dashboard)/(organization)/actions";
import type { AuthTenant as Tenant } from "@omnibase/core-js";
import { ProjectDropdown, ProjectOption } from "./project-dropdown";
import { BranchDropdown } from "./branch-dropdown";
import { MobileMenuOverlay, MobileProjectOverlay } from "./mobile-nav";

interface ProjectContext {
  branchId: string;
  projectId: string;
  projectBranch: string;
  projectName: string;
  branches: string[];
  projects?: ProjectOption[];
  onCreateProject?: () => void;
}

interface TopNavbarProps {
  tenants: Tenant[];
  currentTenantId: string;
  projectContext?: ProjectContext;
}

const THEME_OPTIONS = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
] as const;

const ICON_BUTTON_CLASS =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground";

export function TopNavbar({
  tenants,
  currentTenantId,
  projectContext,
}: TopNavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const activeTheme = mounted ? theme : undefined;

  const [menuOpen, setMenuOpen] = React.useState(false);
  const [projectOverlayOpen, setProjectOverlayOpen] = React.useState(false);

  // Close both overlays whenever the route changes.
  React.useEffect(() => {
    setMenuOpen(false);
    setProjectOverlayOpen(false);
  }, [pathname]);

  const closeMenu = React.useCallback(() => setMenuOpen(false), []);
  const closeProjectOverlay = React.useCallback(
    () => setProjectOverlayOpen(false),
    [],
  );

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="flex h-18 w-full items-center border-b border-border bg-background px-4 md:px-6">
      <Image
        src="/omnibase-logo.svg"
        alt="Omnibase"
        width={24}
        height={24}
        className="shrink-0 rounded-lg dark:hidden block"
        unoptimized
      />
      <Image
        src="/omnibase-logo-dark.svg"
        alt="Omnibase"
        width={24}
        height={24}
        className="shrink-0 rounded-lg hidden dark:block"
        unoptimized
      />
      {/* Tenant Switcher */}
      <div className="min-w-0 shrink">
        <OrganizationDropdown
          tenants={tenants}
          currentTenantId={currentTenantId}
          formAction={async (formData) => {
            await switchTenant(formData);
          }}
          createTenantLabel="Create Tenant"
          onCreateTenant={() => router.push("/onboarding/create-tenant")}
        />
      </div>

      {projectContext && (
        <>
          {/* Mobile: git-branch icon opens the project/branch overlay */}
          <button
            type="button"
            onClick={() => setProjectOverlayOpen(true)}
            aria-label="Switch project and branch"
            className={`${ICON_BUTTON_CLASS} md:hidden`}
          >
            <GitBranch className="h-4 w-4" />
          </button>

          {/* Desktop: inline project and branch dropdowns */}
          <div className="hidden items-center md:flex">
            <span className="text-muted-foreground">/</span>
            <div className="py-3 px-3">
              <ProjectDropdown
                projectId={projectContext.projectId}
                currentProject={projectContext.projectName}
                currentBranch={projectContext.projectBranch}
                projects={projectContext.projects}
                onCreateProject={projectContext.onCreateProject}
              />
            </div>
            <span className="text-muted-foreground">/</span>
            <div className="py-3 px-3">
              <BranchDropdown
                currentBranch={projectContext.projectBranch}
                branches={projectContext.branches}
                projectId={projectContext.projectId}
              />
            </div>
          </div>
        </>
      )}
      <div className="flex-1" />

      {/* Right Section - Docs, Profile, Mobile menu */}
      <div className="flex h-full items-center gap-2">
        <Link href="/docs" className={ICON_BUTTON_CLASS} title="Documentation">
          <BookOpen className="h-4 w-4" />
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-shadow hover:ring-2 hover:ring-ring/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none data-[state=open]:ring-2 data-[state=open]:ring-ring/50">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() =>
                router.push(`/auth/settings?return_to=${window.location.href}`)
              }
              className="cursor-pointer"
            >
              <User className="mr-2 h-4 w-4" />
              Account Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>Theme</DropdownMenuLabel>
              {THEME_OPTIONS.map(({ value, label }) => (
                <DropdownMenuItem
                  key={value}
                  onSelect={() => setTheme(value)}
                  className="cursor-pointer"
                >
                  <span className="mr-2 flex h-4 w-4 items-center justify-center">
                    {activeTheme === value ? <CircleDot /> : null}
                  </span>
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Mobile: three-line menu button next to the user button */}
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          className={`${ICON_BUTTON_CLASS} md:hidden`}
        >
          <Menu className="h-4 w-4" />
        </button>
      </div>

      <MobileMenuOverlay
        open={menuOpen}
        onClose={closeMenu}
        projectContext={projectContext}
      />
      {projectContext && (
        <MobileProjectOverlay
          open={projectOverlayOpen}
          onClose={closeProjectOverlay}
          projectContext={projectContext}
        />
      )}
    </div>
  );
}
