"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiKeysCard } from "./api-keys-card";
import { Project } from "../dashboard/project-provisioning-dashboard";
import { Button } from "@/components/ui/button";

interface SettingsClientProps {
  project: Project;
  onRotateKeys: (projectId: string) => Promise<{
    success: boolean;
    anonKey?: string;
    error?: string;
  }>;
}

export function SettingsClient({ project, onRotateKeys }: SettingsClientProps) {
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const branchName = project.branch_name;
  const isMain = branchName === "main";
  const deleteUrl = isMain
    ? `/api/projects/${project.project_id}`
    : `/api/project_branches/${project.id}`;

  const handleDeleteProject = async () => {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch(deleteUrl, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.message ||
            (isMain ? "Failed to delete project" : "Failed to delete branch"),
        );
      }

      // Redirect to projects page after successful deletion
      router.push("/projects");
      router.refresh();
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "An error occurred",
      );
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-5xl  my-8 mx-auto">
      <div className="mx-16 space-y-4">
        <div className="flex flex-col md:flex-row items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Project Settings
            </h1>
            <p className="text-muted-foreground">
              Manage your project configuration and preferences
            </p>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isMain ? "Delete Project" : `Delete ${branchName} branch`}
              </DialogTitle>
              <DialogDescription>
                {isMain ? (
                  <>
                    Are you sure you want to delete{" "}
                    <strong>{project.name}</strong>? This permanently deletes
                    the project and <strong>all of its branches</strong>. This
                    action cannot be undone.
                  </>
                ) : (
                  <>
                    Are you sure you want to delete the{" "}
                    <strong>{branchName}</strong> branch of{" "}
                    <strong>{project.name}</strong>? This action cannot be
                    undone.
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            {deleteError && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {deleteError}
              </div>
            )}

            <DialogFooter>
              <Button
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteProject}
                disabled={isDeleting}
                variant="destructive"
              >
                {isDeleting
                  ? "Deleting..."
                  : isMain
                    ? "Delete Project"
                    : `Delete ${branchName} branch`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
