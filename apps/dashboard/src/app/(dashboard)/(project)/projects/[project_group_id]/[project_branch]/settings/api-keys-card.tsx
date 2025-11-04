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
import { Eye, EyeOff, Copy, Check, RotateCw } from "lucide-react";

interface ApiKeysCardProps {
  anonKey: string | null;
  projectId: string;
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

export function ApiKeysCard({
  anonKey,
  projectId,
  onFetchSecretKey,
  onRotateKeys,
}: ApiKeysCardProps) {
  const [currentAnonKey, setCurrentAnonKey] = useState<string | null>(anonKey);
  const [serviceKey, setServiceKey] = useState<string | null>(null);
  const [isLoadingKey, setIsLoadingKey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showServiceKey, setShowServiceKey] = useState(false);
  const [copiedAnon, setCopiedAnon] = useState(false);
  const [copiedService, setCopiedService] = useState(false);
  const [isRotateModalOpen, setIsRotateModalOpen] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [rotateError, setRotateError] = useState<string | null>(null);

  const handleViewSecretKey = async () => {
    if (serviceKey) {
      setShowServiceKey(!showServiceKey);
      return;
    }

    setIsLoadingKey(true);
    setError(null);

    try {
      const result = await onFetchSecretKey(projectId);

      if (result.success && result.serviceKey) {
        setServiceKey(result.serviceKey);
        setShowServiceKey(true);
      } else {
        setError(result.error || "Failed to fetch secret key");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoadingKey(false);
    }
  };

  const copyToClipboard = async (text: string, isService: boolean) => {
    try {
      await navigator.clipboard.writeText(text);
      if (isService) {
        setCopiedService(true);
        setTimeout(() => setCopiedService(false), 2000);
      } else {
        setCopiedAnon(true);
        setTimeout(() => setCopiedAnon(false), 2000);
      }
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const maskKey = (key: string) => {
    if (key.length <= 20) return "•".repeat(key.length);
    return (
      key.substring(0, 10) +
      "•".repeat(key.length - 20) +
      key.substring(key.length - 10)
    );
  };

  const handleRotateKeys = async () => {
    setIsRotating(true);
    setRotateError(null);

    try {
      const result = await onRotateKeys(projectId);

      if (result.success && result.anonKey && result.serviceKey) {
        setCurrentAnonKey(result.anonKey);
        setServiceKey(result.serviceKey);
        setShowServiceKey(true);
        setIsRotateModalOpen(false);
      } else {
        setRotateError(result.error || "Failed to rotate keys");
      }
    } catch (err) {
      setRotateError("An unexpected error occurred");
    } finally {
      setIsRotating(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Manage your project's API keys for accessing the database
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
        <CardContent className="space-y-6">
          {/* Anon Key */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Anon Key (Public)</label>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-md border bg-muted/50 px-3 py-2 font-mono text-sm break-all">
                {currentAnonKey || "Not yet provisioned"}
              </div>
              {currentAnonKey && (
                <button
                  onClick={() => copyToClipboard(currentAnonKey, false)}
                  className="rounded-md border px-3 py-2 hover:bg-accent transition-colors"
                  title="Copy to clipboard"
                >
                  {copiedAnon ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              This key is safe to use in a browser if you have enabled Row Level
              Security for your tables and configured policies.
            </p>
          </div>

          {/* Service Key */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Service Key (Secret)
              </label>
              <button
                onClick={handleViewSecretKey}
                disabled={isLoadingKey}
                className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-accent transition-colors disabled:opacity-50"
              >
                {isLoadingKey ? (
                  "Loading..."
                ) : showServiceKey ? (
                  <>
                    <EyeOff className="h-4 w-4" />
                    Hide
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    View
                  </>
                )}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-md border bg-muted/50 px-3 py-2 font-mono text-sm break-all">
                {error ? (
                  <span className="text-destructive">{error}</span>
                ) : serviceKey ? (
                  showServiceKey ? (
                    serviceKey
                  ) : (
                    maskKey(serviceKey)
                  )
                ) : (
                  "Click 'View' to reveal the secret key"
                )}
              </div>
              {serviceKey && showServiceKey && (
                <button
                  onClick={() => copyToClipboard(serviceKey, true)}
                  className="rounded-md border px-3 py-2 hover:bg-accent transition-colors"
                  title="Copy to clipboard"
                >
                  {copiedService ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>
            <p className="text-xs text-destructive">
              This key has the ability to bypass Row Level Security. Never share
              it publicly.
            </p>
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
