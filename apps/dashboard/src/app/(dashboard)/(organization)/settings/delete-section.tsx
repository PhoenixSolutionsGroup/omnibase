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

interface DeleteSectionProps {
  onDeleteTenant: () => Promise<void>;
}

export function DeleteSection({ onDeleteTenant }: DeleteSectionProps) {
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteTenant = async () => {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await onDeleteTenant();
      router.push("/");
      router.refresh();
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "An error occurred"
      );
      setIsDeleting(false);
    }
  };

  return (
    <>
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
              <h3 className="font-medium">Delete Organization</h3>
              <p className="text-sm text-muted-foreground">
                Permanently delete this organization and all of its data. This
                action cannot be undone.
              </p>
            </div>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors"
            >
              Delete Organization
            </button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Organization</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this organization? This action
              cannot be undone and will permanently delete all organization
              data, including all users, projects, and settings.
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
              onClick={handleDeleteTenant}
              disabled={isDeleting}
              className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete Organization"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
