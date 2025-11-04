"use client";

import * as React from "react";
import { ChevronDown, Plus, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Organization {
  id: string;
  name: string;
}

interface OrganizationDropdownProps {
  organizations?: Organization[];
  currentOrganization?: string;
  onOrganizationChange?: (organizationId: string) => void;
  onCreateOrganization?: () => void;
}

export function OrganizationDropdown({
  organizations = [{ id: "1", name: "My Organization" }],
  currentOrganization = "My Organization",
  onOrganizationChange,
  onCreateOrganization,
}: OrganizationDropdownProps) {
  return (
    <div className="relative inline-block">
      <button
        className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
        onClick={(e) => {
          e.preventDefault();
          // This will be enhanced with proper dropdown functionality
        }}
      >
        <span>{currentOrganization}</span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </button>
    </div>
  );
}
