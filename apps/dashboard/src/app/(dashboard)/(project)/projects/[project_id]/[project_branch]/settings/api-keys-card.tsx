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
import { useState } from "react";
import { Eye, EyeOff, Loader2, RotateCw } from "lucide-react";
import { toast } from "sonner";
import { fetchProjectSecretKey, fetchAPIServiceKey } from "../settings/actions";
import { Project } from "../dashboard/project-provisioning-dashboard";

interface ApiKeysCardProps {
  project: Project;
  onRotateKeys: (projectId: string) => Promise<{
    success: boolean;
    anonKey?: string;
    error?: string;
  }>;
}

interface KeyItem {
  label: string;
  value: string | null | undefined;
  sensitive?: boolean;
  encryptedField?: "db_service_key" | "api_service_key";
}

export function ApiKeysCard({ project, onRotateKeys }: ApiKeysCardProps) {
  const [revealedSecrets, setRevealedSecrets] = useState<Set<string>>(
    new Set()
  );
  const [decryptedValues, setDecryptedValues] = useState<Map<string, string>>(
    new Map()
  );
  const [loadingSecrets, setLoadingSecrets] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Map<string, string>>(new Map());
  const [isRotateModalOpen, setIsRotateModalOpen] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [rotateError, setRotateError] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const toggleReveal = async (key: string, encryptedField?: string) => {
    const isCurrentlyRevealed = revealedSecrets.has(key);

    // If hiding, just remove from revealed set
    if (isCurrentlyRevealed) {
      setRevealedSecrets((prev) => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
      return;
    }

    // If revealing and we already have the decrypted value, just show it
    if (decryptedValues.has(key)) {
      setRevealedSecrets((prev) => {
        const newSet = new Set(prev);
        newSet.add(key);
        return newSet;
      });
      return;
    }

    // Otherwise, fetch the decrypted value from the backend
    if (!encryptedField) {
      return;
    }

    setLoadingSecrets((prev) => new Set(prev).add(key));
    setErrors((prev) => {
      const newMap = new Map(prev);
      newMap.delete(key);
      return newMap;
    });

    try {
      let result:
        | {
            success: boolean;
            error?: string;
            serviceKey?: string;
            apiServiceKey?: string;
          }
        | undefined;
      switch (encryptedField) {
        case "db_service_key":
          result = await fetchProjectSecretKey(project.id);
          if (result?.success && result.serviceKey) {
            setDecryptedValues((prev) =>
              new Map(prev).set(key, result!.serviceKey!)
            );
          }
          break;
        case "api_service_key":
          result = await fetchAPIServiceKey(project.id);
          if (result?.success && result.apiServiceKey) {
            setDecryptedValues((prev) =>
              new Map(prev).set(key, result!.apiServiceKey!)
            );
          }
          break;
      }

      if (result && result.success) {
        setRevealedSecrets((prev) => {
          const newSet = new Set(prev);
          newSet.add(key);
          return newSet;
        });
      } else if (result && result.error) {
        setErrors((prev) => new Map(prev).set(key, result.error!));
        toast.error(result.error);
      }
    } catch (error) {
      const errorMessage = "Failed to decrypt secret";
      setErrors((prev) => new Map(prev).set(key, errorMessage));
      toast.error(errorMessage);
    } finally {
      setLoadingSecrets((prev) => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    }
  };

  const handleRotateKeys = async () => {
    setIsRotating(true);
    setRotateError(null);

    try {
      const result = await onRotateKeys(project.id);

      if (result.success && result.anonKey) {
        toast.success("Keys rotated successfully");
        setIsRotateModalOpen(false);
        // Clear decrypted values and revealed secrets to force refetch
        setDecryptedValues(new Map());
        setRevealedSecrets(new Set());
        // Refresh the page to show new keys
        window.location.reload();
      } else {
        setRotateError(result.error || "Failed to rotate keys");
      }
    } catch (err) {
      setRotateError("An unexpected error occurred");
    } finally {
      setIsRotating(false);
    }
  };

  const keys: KeyItem[] = [
    { label: "Anon Key", value: project.database_anon_key },
    {
      label: "Database Service Key",
      value: project.database_service_key_encrypted,
      sensitive: true,
      encryptedField: "db_service_key",
    },
    {
      label: "API Service Key",
      value: project.api_service_key_encrypted,
      sensitive: true,
      encryptedField: "api_service_key",
    },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Manage and rotate your project's API keys
              </CardDescription>
            </div>
            <button
              onClick={() => setIsRotateModalOpen(true)}
              className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-accent transition-colors"
            >
              <RotateCw className="h-4 w-4" />
              Rotate Keys
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {keys.map((item) => {
              const secretKey = item.label;
              const isRevealed = revealedSecrets.has(secretKey);
              const isLoading = loadingSecrets.has(secretKey);
              const error = errors.get(secretKey);
              const decryptedValue = decryptedValues.get(secretKey);

              // Determine what value to display
              let displayValue = item.value;
              if (item.sensitive && item.value) {
                if (isLoading) {
                  displayValue = "Decrypting...";
                } else if (error) {
                  displayValue = `Error: ${error}`;
                } else if (isRevealed && decryptedValue) {
                  displayValue = decryptedValue;
                } else if (!isRevealed) {
                  displayValue = "••••••••••••••••";
                }
              }

              return (
                <div
                  key={item.label}
                  className="flex items-start justify-between gap-4 rounded-lg border p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      {item.label}
                    </p>
                    <p
                      className={`mt-1 font-mono text-sm break-all ${
                        error ? "text-destructive" : ""
                      }`}
                    >
                      {displayValue || "Not yet provisioned"}
                    </p>
                  </div>
                  <div className="flex flex-shrink-0 gap-2">
                    {item.sensitive && item.value && (
                      <button
                        onClick={() =>
                          toggleReveal(secretKey, item.encryptedField)
                        }
                        disabled={isLoading}
                        className="rounded px-3 py-2 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={isRevealed ? "Hide" : "Reveal"}
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : isRevealed ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() =>
                        handleCopy(
                          item.sensitive && isRevealed && decryptedValue
                            ? decryptedValue
                            : item.value || "",
                          item.label
                        )
                      }
                      disabled={item.sensitive && !isRevealed}
                      className="rounded px-3 py-2 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Rotate Keys Confirmation Modal */}
      <Dialog open={isRotateModalOpen} onOpenChange={setIsRotateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rotate API Keys</DialogTitle>
            <DialogDescription>
              This will generate new API keys and invalidate the current ones.
              Any applications using the old keys will need to be updated. This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {rotateError && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {rotateError}
            </div>
          )}

          <DialogFooter>
            <button
              onClick={() => setIsRotateModalOpen(false)}
              disabled={isRotating}
              className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleRotateKeys}
              disabled={isRotating}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isRotating ? "Rotating..." : "Rotate Keys"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
