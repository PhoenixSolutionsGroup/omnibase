"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Plus, FolderGit2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Project {
  id: string;
  name: string;
  group_id: string;
}

interface ProjectDropdownProps {
  projectGroupId: string;
  currentProject: string;
  projects?: Project[];
  onCreateProject?: () => void;
  currentBranch: string;
}

export function ProjectDropdown({
  projectGroupId,
  currentProject,
  projects = [],
  onCreateProject,
  currentBranch,
}: ProjectDropdownProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleProjectChange = (newProjectGroupId: string) => {
    if (newProjectGroupId === "__create_new__") {
      onCreateProject?.();
      return;
    }

    // Navigate to the same page but for the new project
    const pathSegments = pathname.split("/");
    const projectGroupIndex = pathSegments.findIndex(
      (segment) => segment === projectGroupId
    );

    if (projectGroupIndex !== -1) {
      pathSegments[projectGroupIndex] = newProjectGroupId;
      const newPath = pathSegments.join("/");
      router.push(newPath);
    } else {
      // Fallback: navigate to dashboard of new project
      router.push(`/projects/${newProjectGroupId}/${currentBranch}/dashboard`);
    }
  };

  return (
    <Select value={projectGroupId} onValueChange={handleProjectChange}>
      <SelectTrigger
        className={cn(
          "h-auto w-full border-0 bg-transparent px-3 py-2 text-sm font-medium shadow-none",
          "hover:bg-accent hover:text-accent-foreground focus:ring-0 focus:ring-offset-0"
        )}
      >
        <div className="flex items-center gap-2 w-full">
          <FolderGit2 className="h-4 w-4 text-muted-foreground shrink-0" />
          <SelectValue className="truncate">{currentProject}</SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        {projects.length > 0 ? (
          projects.map((project) => (
            <SelectItem key={project.group_id} value={project.group_id}>
              <div className="flex items-center gap-2">
                <FolderGit2 className="h-4 w-4" />
                <span>{project.name}</span>
              </div>
            </SelectItem>
          ))
        ) : (
          <SelectItem value={projectGroupId}>
            <div className="flex items-center gap-2">
              <FolderGit2 className="h-4 w-4" />
              <span>{currentProject}</span>
            </div>
          </SelectItem>
        )}
        <SelectItem value="__create_new__">
          <div className="flex items-center gap-2 text-primary">
            <Plus className="h-4 w-4" />
            <span>Create project</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
