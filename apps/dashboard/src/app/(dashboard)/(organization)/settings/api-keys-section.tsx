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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { createAPIKey, listAPIKeys, revokeAPIKey } from "./actions";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Plus, Copy, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface APIKey {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at?: string;
  expires_at?: string;
  is_active: boolean;
}

interface APIKeysSectionProps {
  initialKeys: APIKey[];
  hasPermission: boolean;
}

export function APIKeysSection({
  initialKeys,
  hasPermission,
}: APIKeysSectionProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [apiKeys, setApiKeys] = useState<APIKey[]>(initialKeys);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [canViewKeys, setCanViewKeys] = useState(hasPermission);

  const handleCreateAPIKey = async () => {
    if (!keyName.trim()) {
      toast.error("Please enter a name for the API key");
      return;
    }

    setIsCreating(true);
    try {
      const result = await createAPIKey(keyName);
      setNewlyCreatedKey(result.key);

      // Refresh the list
      const response = await listAPIKeys();
      setApiKeys(response.api_keys);
      setCanViewKeys(response.hasPermission);

      toast.success("API key created successfully");
      setKeyName("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create API key"
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevokeAPIKey = async (keyId: string, keyName: string) => {
    if (!confirm(`Are you sure you want to revoke the API key "${keyName}"?`)) {
      return;
    }

    try {
      await revokeAPIKey(keyId);

      // Refresh the list
      const response = await listAPIKeys();
      setApiKeys(response.api_keys);
      setCanViewKeys(response.hasPermission);

      toast.success("API key revoked successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to revoke API key"
      );
    }
  };

  const handleCopyKey = (key: string, keyId: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKeyId(keyId);
    toast.success("API key copied to clipboard");

    setTimeout(() => {
      setCopiedKeyId(null);
    }, 2000);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setNewlyCreatedKey(null);
    setKeyName("");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <Card className={!canViewKeys ? "opacity-60" : ""}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                {canViewKeys
                  ? "Manage API keys for programmatic access to your organization"
                  : "You don't have permission to view or manage API keys"}
              </CardDescription>
            </div>
            {canViewKeys && apiKeys.length > 0 && (
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                size="sm"
                variant="outline"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create New Key
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!canViewKeys ? (
            <div className="text-center py-8 text-muted-foreground">
              Contact an administrator to grant you permission to view API keys.
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <h3 className="mt-2 text-lg font-semibold">No API keys</h3>
              <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-sm">
                Create an API key to authenticate your requests to the platform
                programmatically.
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create API Key
              </Button>
            </div>
          ) : (
            <Table wrapperClassName="overflow-visible">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Key Prefix</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">{key.name}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                        {key.key_prefix}...
                      </code>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(key.created_at)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {key.last_used_at
                        ? formatDate(key.last_used_at)
                        : "Never"}
                    </TableCell>
                    <TableCell>
                      {key.is_active ? (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900"
                        >
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Revoked</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {key.is_active && (
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                navigator.clipboard.writeText(key.id);
                                toast.success("Key ID copied to clipboard");
                              }}
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              Copy ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() =>
                                handleRevokeAPIKey(key.id, key.name)
                              }
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Revoke Key
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateModalOpen} onOpenChange={handleCloseCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {newlyCreatedKey ? "API Key Created" : "Create API Key"}
            </DialogTitle>
            <DialogDescription>
              {newlyCreatedKey
                ? "Save this API key now. You won't be able to see it again."
                : "Create a new API key for programmatic access to your organization."}
            </DialogDescription>
          </DialogHeader>

          {newlyCreatedKey ? (
            <div className="space-y-4">
              <div className="rounded-md bg-muted p-4">
                <div className="flex items-center justify-between gap-2">
                  <code className="text-sm break-all">{newlyCreatedKey}</code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopyKey(newlyCreatedKey, "new")}
                  >
                    {copiedKeyId === "new" ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>
              <div className="rounded-md bg-yellow-50 dark:bg-yellow-950 p-3 text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ Make sure to copy your API key now. You won't be able to see
                it again!
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="key-name">Name</Label>
                <Input
                  id="key-name"
                  placeholder="e.g., CI/CD Pipeline"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  disabled={isCreating}
                />
                <p className="text-xs text-muted-foreground">
                  A descriptive name to help you identify this key
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            {newlyCreatedKey ? (
              <Button onClick={handleCloseCreateModal}>Done</Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleCloseCreateModal}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateAPIKey} disabled={isCreating}>
                  {isCreating ? "Creating..." : "Create API Key"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
