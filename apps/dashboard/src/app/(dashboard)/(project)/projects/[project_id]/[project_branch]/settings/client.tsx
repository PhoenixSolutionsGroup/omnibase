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
            (isMain ? "Failed to delete project" : "Failed to delete branch")
        );
      }

      // Redirect to projects page after successful deletion
      router.push("/projects");
      router.refresh();
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "An error occurred"
      );
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Project Settings
            </h1>
            <p className="mt-2 text-muted-foreground">
              Manage your project configuration and preferences
            </p>
          </div>

          {/* API Keys */}
          <ApiKeysCard project={project} onRotateKeys={onRotateKeys} />

          {/* Danger Zone */}
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-destructive/50 bg-destructive/5 p-4">
                <div className="space-y-1">
                  <h3 className="font-medium">
                    {isMain ? "Delete Project" : `Delete ${branchName} branch`}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isMain
                      ? "Permanently delete this project and all of its branches and data. This action cannot be undone."
                      : `Permanently delete the ${branchName} branch and all of its data. This action cannot be undone.`}
                  </p>
                </div>
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors"
                >
                  {isMain ? "Delete Project" : `Delete ${branchName} branch`}
                </button>
              </div>
            </CardContent>
          </Card>
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
                  <strong>{project.name}</strong>? This permanently deletes the
                  project and <strong>all of its branches</strong>. This action
                  cannot be undone.
                </>
              ) : (
                <>
                  Are you sure you want to delete the{" "}
                  <strong>{branchName}</strong> branch of{" "}
                  <strong>{project.name}</strong>? This action cannot be undone.
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
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
              className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteProject}
              disabled={isDeleting}
              className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50"
            >
              {isDeleting
                ? "Deleting..."
                : isMain
                  ? "Delete Project"
                  : `Delete ${branchName} branch`}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
