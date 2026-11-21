"use client";

import { Building2, FolderKanban, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Database } from "@/types/omnibase";
import { Button } from "@/components/ui/button";

type Project = Database["public"]["Tables"]["projects"]["Row"];
interface ProjectsClientProps {
  projects: Pick<Project, "id" | "name" | "created_at">[];
}

export function ProjectsClient({ projects }: ProjectsClientProps) {
  const router = useRouter();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="max-w-5xl my-8 mx-auto">
      <div className="mx-16 space-y-4">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground">
              Manage and monitor your projects
            </p>
          </div>
          <Button onClick={() => router.push("/projects/new")}>
            <Plus className="h-4 w-4" />
            Create Project
          </Button>
        </div>

        {/* Projects Table or Empty State */}
        {projects.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-md border border-dashed py-16 text-center">
            <FolderKanban className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No projects yet. Use "Create Project" to get started.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow
                    key={project.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() =>
                      router.push(`/projects/${project.id}/main/dashboard`)
                    }
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                          <Building2 className="h-4 w-4 text-primary" />
                        </div>
                        {project.name}
                      </div>
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {formatDate(project.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/projects/${project.id}/main/dashboard`);
                        }}
                      >
                        View →
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
