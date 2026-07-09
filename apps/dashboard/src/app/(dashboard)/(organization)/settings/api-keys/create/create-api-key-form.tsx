"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { PermissionsSelectorTree } from "@omnibase/shadcn";
import type { NamespaceDefinitionResponse } from "@omnibase/core-js";
import { createAPIKey, type Permission } from "../../actions";
import Link from "next/link";

interface NamespaceMapEntry {
  id: string;
  label: string;
}

interface CreateAPIKeyFormProps {
  definitions: NamespaceDefinitionResponse[];
  namespaceMap: Record<string, NamespaceMapEntry[]>;
}

function parsePermissionString(perm: string): {
  namespace: string;
  relation: string;
  objectId: string;
} {
  const hashIndex = perm.indexOf("#");
  if (hashIndex === -1) return { namespace: "", relation: "", objectId: "" };

  const beforeHash = perm.substring(0, hashIndex);
  const relation = perm.substring(hashIndex + 1);
  const colonIndex = beforeHash.indexOf(":");

  if (colonIndex === -1) return { namespace: beforeHash, relation, objectId: "" };
  return {
    namespace: beforeHash.substring(0, colonIndex),
    relation,
    objectId: beforeHash.substring(colonIndex + 1),
  };
}

export function CreateAPIKeyForm({
  definitions,
  namespaceMap,
}: CreateAPIKeyFormProps) {
  const [keyName, setKeyName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  // The tree looks up objects by lower-cased namespace key.
  const lowerNamespaceMap = useMemo(() => {
    const out: Record<string, NamespaceMapEntry[]> = {};
    for (const [key, value] of Object.entries(namespaceMap)) {
      out[key.toLowerCase()] = value;
    }
    return out;
  }, [namespaceMap]);

  // Restore original namespace casing (tree emits lower-cased) so the API's
  // case-sensitive namespace matching works.
  const originalNamespace = useMemo(() => {
    const map = new Map<string, string>();
    for (const d of definitions) map.set(d.namespace.toLowerCase(), d.namespace);
    return map;
  }, [definitions]);

  const buildPermissions = (): Permission[] => {
    return selectedPermissions
      .map((perm) => parsePermissionString(perm))
      .filter((p) => p.namespace && p.relation)
      .map((p) => {
        const namespace = originalNamespace.get(p.namespace) ?? p.namespace;
        const permission: Permission = { namespace, relation: p.relation };
        if (namespace.toLowerCase() !== "tenant" && p.objectId) {
          permission.object = p.objectId;
        }
        return permission;
      });
  };

  const handleSubmit = async () => {
    if (!keyName.trim()) {
      toast.error("Please enter a name for the API key");
      return;
    }

    const permissions = buildPermissions();
    if (permissions.length === 0) {
      toast.error("Please add at least one permission");
      return;
    }

    setIsCreating(true);
    try {
      const result = await createAPIKey(keyName, permissions);
      setCreatedKey(result.key);
      toast.success("API key created successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create API key"
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyKey = () => {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey);
      toast.success("API key copied to clipboard");
    }
  };

  if (createdKey) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>API Key Created</CardTitle>
          <CardDescription>
            Save this API key now. You won't be able to see it again.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-muted p-4">
            <div className="flex items-center justify-between gap-2">
              <code className="text-sm break-all">{createdKey}</code>
              <Button size="sm" variant="outline" onClick={handleCopyKey}>
                Copy
              </Button>
            </div>
          </div>
          <div className="rounded-md bg-yellow-50 dark:bg-yellow-950 p-3 text-sm text-yellow-800 dark:text-yellow-200">
            Make sure to copy your API key now. You won't be able to see it
            again!
          </div>
          <div className="flex justify-end">
            <Link
              href="/settings"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
            >
              Done
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Link
            href="/settings"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <CardTitle>Create API Key</CardTitle>
            <CardDescription>
              Create a new API key with specific permissions
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="key-name">Name</Label>
          <Input
            id="key-name"
            placeholder="e.g., CI/CD Pipeline, Analytics Service"
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
            disabled={isCreating}
          />
          <p className="text-xs text-muted-foreground">
            A descriptive name to help you identify this key
          </p>
        </div>

        <div className="space-y-4">
          <Label>Permissions</Label>
          <PermissionsSelectorTree
            definitions={definitions}
            namespaceMap={lowerNamespaceMap}
            value={selectedPermissions}
            onChange={setSelectedPermissions}
            disabled={isCreating}
            showPreview
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Link
            href="/settings"
            className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 ${
              isCreating ? "pointer-events-none opacity-50" : ""
            }`}
          >
            Cancel
          </Link>
          <Button onClick={handleSubmit} disabled={isCreating}>
            {isCreating ? "Creating..." : "Create API Key"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
