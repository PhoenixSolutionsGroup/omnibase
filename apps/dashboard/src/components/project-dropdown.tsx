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
import { projectHasActiveBranch } from "@/app/(dashboard)/(project)/projects/[project_id]/[project_branch]/new-branch/actions";

interface ProjectOption {
  id: string;
  name: string;
}

interface ProjectDropdownProps {
  projectId: string;
  currentProject: string;
  projects?: ProjectOption[];
  onCreateProject?: () => void;
  currentBranch: string;
}

export function ProjectDropdown({
  projectId,
  currentProject,
  projects = [],
  onCreateProject,
  currentBranch,
}: ProjectDropdownProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleProjectChange = async (newProjectId: string): Promise<void> => {
    if (newProjectId === "__create_new__") {
      onCreateProject?.();
      return;
    }

    if (newProjectId === projectId) return;

    // Keep the current branch only if the target project has an active branch with the same name; otherwise fall back to main.
    const keepBranch: boolean =
      currentBranch === "main" ||
      (await projectHasActiveBranch(newProjectId, currentBranch));
    const targetBranch: string = keepBranch ? currentBranch : "main";

    const pathSegments: string[] = pathname.split("/");
    const projectIndex: number = pathSegments.indexOf(projectId);

    if (projectIndex !== -1) {
      pathSegments[projectIndex] = newProjectId;
      if (pathSegments[projectIndex + 1] !== undefined) {
        pathSegments[projectIndex + 1] = targetBranch;
      } else {
        pathSegments.push(targetBranch, "dashboard");
      }
      router.push(pathSegments.join("/"));
    } else {
      // Fallback: navigate to dashboard of new project
      router.push(`/projects/${newProjectId}/${targetBranch}/dashboard`);
    }
  };

  return (
    <Select value={projectId} onValueChange={handleProjectChange}>
      <SelectTrigger
        className={cn(
          "h-auto w-full border-0 bg-transparent px-3 py-2 text-sm font-medium shadow-none",
          "hover:bg-accent hover:text-accent-foreground focus:ring-0 focus:ring-offset-0",
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
            <SelectItem key={project.id} value={project.id}>
              <div className="flex items-center gap-2">
                <FolderGit2 className="h-4 w-4" />
                <span>{project.name}</span>
              </div>
            </SelectItem>
          ))
        ) : (
          <SelectItem value={projectId}>
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
