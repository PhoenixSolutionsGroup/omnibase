"use client";

import { Building2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateProjectModal } from "@/components/create-project-modal";
import { useState } from "react";

interface Project {
  id: string;
  name: string;
  region: string;
  created_at: string;
}

interface ProjectsClientProps {
  projects: Project[];
}

export function ProjectsClient({ projects }: ProjectsClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    <div className="flex h-full flex-col">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
              <p className="mt-2 text-muted-foreground">
                Manage and monitor all your projects
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Create Project
            </button>
          </div>

          {/* Projects Table */}
          <div className="rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Region</TableHead>
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
                      {project.region}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(project.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        className="text-sm text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/projects/${project.id}/dashboard`);
                        }}
                      >
                        View →
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <CreateProjectModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}
