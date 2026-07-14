"use client";

import * as React from "react";
import Link from "next/link";
import { BookOpen, User, Settings, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OrganizationDropdown } from "./organization-dropdown";
import { switchTenant } from "@/app/(dashboard)/(organization)/actions";
import type { GetTenantByIDRow as Tenant } from "@omnibase/core-js";

interface TopNavbarProps {
  tenants: Tenant[];
  currentTenantId: string;
}

export function TopNavbar({ tenants, currentTenantId }: TopNavbarProps) {
  const router = useRouter();
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
    <div className="flex h-18 w-full items-center border-b border-border bg-background px-6">
      {/* Tenant Switcher */}
      <OrganizationDropdown
        tenants={tenants}
        currentTenantId={currentTenantId}
        formAction={async (formData) => {
          await switchTenant(formData);
        }}
        createTenantLabel="Create Tenant"
        onCreateTenant={() => router.push("/onboarding/create-tenant")}
      />

      <div className="flex-1" />

      {/* Right Section - Docs and Profile */}
      <div className="flex h-full items-center gap-2">
        <Link
          href="/docs"
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          title="Documentation"
        >
          <BookOpen className="h-4 w-4" />
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
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
              <Settings className="mr-2 h-4 w-4" />
              Account Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
