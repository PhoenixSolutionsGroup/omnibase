"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { ChevronDown, Plus, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BranchDropdownProps {
  projectGroupId: string;
  currentBranch: string;
  branches: string[];
  onCreateBranch?: () => void;
}

export function BranchDropdown({
  projectGroupId,
  currentBranch,
  branches,
  onCreateBranch,
}: BranchDropdownProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleBranchChange = (newBranch: string) => {
    if (newBranch === "__create_new__") {
      onCreateBranch?.();
      return;
    }

    // Replace the current branch in the URL with the new one
    const pathSegments = pathname.split("/");
    const branchIndex = pathSegments.findIndex(
      (segment) => segment === currentBranch
    );

    if (branchIndex !== -1) {
      pathSegments[branchIndex] = newBranch;
      const newPath = pathSegments.join("/");
      router.push(newPath);
    }
  };

  return (
    <Select value={currentBranch} onValueChange={handleBranchChange}>
      <SelectTrigger
        className={cn(
          "h-auto w-auto border-0 bg-transparent px-2 py-1 text-sm font-medium shadow-none",
          "hover:bg-accent hover:text-accent-foreground focus:ring-0 focus:ring-offset-0"
        )}
      >
        <div className="flex items-center gap-1.5">
          <GitBranch className="h-3.5 w-3.5 text-muted-foreground" />
          <SelectValue>{currentBranch}</SelectValue>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {branches.map((branch) => (
          <SelectItem key={branch} value={branch}>
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              <span>{branch}</span>
            </div>
          </SelectItem>
        ))}
        <SelectItem value="__create_new__">
          <div className="flex items-center gap-2 text-primary">
            <Plus className="h-4 w-4" />
            <span>Create branch</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
