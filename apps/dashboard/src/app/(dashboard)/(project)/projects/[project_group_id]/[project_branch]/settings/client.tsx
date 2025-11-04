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

interface Project {
  id: string;
  name: string;
  tenant_id: string;
  stage: string;
  anon_key?: string | null;
  [key: string]: any;
}

interface SettingsClientProps {
  project: Project;
  onFetchSecretKey: (projectId: string) => Promise<{
    success: boolean;
    serviceKey?: string;
    error?: string;
  }>;
  onRotateKeys: (projectId: string) => Promise<{
    success: boolean;
    anonKey?: string;
    serviceKey?: string;
    error?: string;
  }>;
}

export function SettingsClient({
  project,
  onFetchSecretKey,
  onRotateKeys,
}: SettingsClientProps) {
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteProject = async () => {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete project");
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
          <ApiKeysCard
            anonKey={project.anon_key || null}
            projectId={project.id}
            onFetchSecretKey={onFetchSecretKey}
            onRotateKeys={onRotateKeys}
          />

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
                  <h3 className="font-medium">Delete Project</h3>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete this project and all of its data. This
                    action cannot be undone.
                  </p>
                </div>
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors"
                >
                  Delete Project
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
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{project.name}</strong>?
              This action cannot be undone and will permanently delete all
              project data.
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
              {isDeleting ? "Deleting..." : "Delete Project"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
