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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Trash2, Check, ChevronsUpDown, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { NamespaceDefinition } from "@omnibase/core-js";
import { createAPIKey, type Permission } from "../../actions";
import Link from "next/link";

interface NamespaceMapEntry {
  id: string;
  label: string;
}

interface CreateAPIKeyFormProps {
  definitions: NamespaceDefinition[];
  namespaceMap: Record<string, NamespaceMapEntry[]>;
}

interface PermissionRow {
  id: string;
  namespace: string;
  relation: string;
  objectId: string;
}

interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
}

function Combobox({
  options,
  value,
  onChange,
  placeholder,
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  disabled = false,
  className = "",
}: ComboboxProps) {
  const [open, setOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);
  const isEmpty = options.length === 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || isEmpty}
          className={cn(
            "justify-between font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          {isEmpty ? (
            <span className="text-muted-foreground">None</span>
          ) : selectedOption ? (
            <span className="truncate">{selectedOption.label}</span>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function formatRelation(relation: string): string {
  const stripped = relation.replace(/^can_/, "");
  return stripped
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function CreateAPIKeyForm({
  definitions,
  namespaceMap,
}: CreateAPIKeyFormProps) {
  const [keyName, setKeyName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [permissionRows, setPermissionRows] = useState<PermissionRow[]>([
    { id: generateId(), namespace: "", relation: "", objectId: "" },
  ]);
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  const namespaceOptions = useMemo(
    () => definitions.map((d) => ({ value: d.namespace, label: d.namespace })),
    [definitions]
  );

  const getRelationsForNamespace = (namespace: string): ComboboxOption[] => {
    const def = definitions.find((d) => d.namespace === namespace);
    if (!def) return [];
    return def.relations
      .filter((rel) => rel.startsWith("can_") || rel.startsWith("is_"))
      .map((rel) => ({ value: rel, label: formatRelation(rel) }));
  };

  const getObjectsForNamespace = (
    namespace: string
  ): ComboboxOption[] | null => {
    if (namespace.toLowerCase() === "tenant") {
      return null;
    }
    const objects = namespaceMap[namespace.toLowerCase()] || [];
    return objects.map((obj) => ({ value: obj.id, label: obj.label }));
  };

  const hasAnyValue = (row: PermissionRow): boolean => {
    return !!(row.namespace || row.relation || row.objectId);
  };

  const removePermissionRow = (id: string) => {
    if (permissionRows.length > 1) {
      setPermissionRows(permissionRows.filter((row) => row.id !== id));
    }
  };

  const updatePermissionRow = (
    id: string,
    field: keyof PermissionRow,
    value: string
  ) => {
    setPermissionRows((currentRows) => {
      const updatedRows = currentRows.map((row) => {
        if (row.id !== id) return row;

        const updated = { ...row, [field]: value };

        if (field === "namespace") {
          updated.relation = "";
          updated.objectId = "";
        }

        return updated;
      });

      const lastRow = updatedRows[updatedRows.length - 1];

      if (hasAnyValue(lastRow)) {
        return [
          ...updatedRows,
          { id: generateId(), namespace: "", relation: "", objectId: "" },
        ];
      }

      return updatedRows;
    });
  };

  const buildPermissions = (): Permission[] => {
    return permissionRows
      .filter((row) => row.namespace && row.relation)
      .map((row) => {
        const permission: Permission = {
          namespace: row.namespace,
          relation: row.relation,
        };

        if (row.namespace.toLowerCase() !== "tenant" && row.objectId) {
          permission.objectId = row.objectId;
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
        {/* Key Name */}
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

        {/* Permissions */}
        <div className="space-y-4">
          <Label>Permissions</Label>

          <div className="space-y-3">
            {permissionRows.map((row) => {
              const relationOptions = getRelationsForNamespace(row.namespace);
              const objectOptions = getObjectsForNamespace(row.namespace);
              const showObjectSelect = objectOptions !== null;

              return (
                <div key={row.id} className="flex items-start gap-2">
                  {/* Remove Button */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removePermissionRow(row.id)}
                    disabled={isCreating || permissionRows.length === 1}
                    className="shrink-0"
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>

                  {/* Connected Comboboxes */}
                  <div className="flex flex-1 gap-0">
                    {/* Namespace Combobox */}
                    <Combobox
                      options={namespaceOptions}
                      value={row.namespace}
                      onChange={(value) =>
                        updatePermissionRow(row.id, "namespace", value)
                      }
                      placeholder="Namespace"
                      searchPlaceholder="Search namespaces..."
                      disabled={isCreating}
                      className="w-1/3 min-w-[120px] rounded-r-none border-r-0"
                    />

                    {/* Relation Combobox */}
                    <Combobox
                      options={relationOptions}
                      value={row.relation}
                      onChange={(value) =>
                        updatePermissionRow(row.id, "relation", value)
                      }
                      placeholder="Permission"
                      searchPlaceholder="Search permissions..."
                      disabled={isCreating || !row.namespace}
                      className={cn(
                        "min-w-[160px]",
                        showObjectSelect
                          ? "w-1/3 rounded-none border-r-0"
                          : "w-2/3 rounded-l-none"
                      )}
                    />

                    {/* Object ID Combobox (only for non-Tenant namespaces) */}
                    {showObjectSelect && (
                      <Combobox
                        options={objectOptions}
                        value={row.objectId}
                        onChange={(value) =>
                          updatePermissionRow(row.id, "objectId", value)
                        }
                        placeholder="Resource"
                        searchPlaceholder="Search resources..."
                        disabled={isCreating || !row.namespace}
                        className="w-1/3 min-w-[160px] rounded-l-none"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Permissions Preview */}
          {permissionRows.some((row) => row.namespace && row.relation) && (
            <div className="rounded-md bg-muted p-3">
              <p className="text-xs text-muted-foreground mb-2">
                Permissions to be granted:
              </p>
              <ul className="space-y-1 text-xs font-mono">
                {buildPermissions().map((perm, idx) => (
                  <li key={idx} className="text-muted-foreground">
                    {perm.namespace.toLowerCase()}
                    {perm.objectId ? `:${perm.objectId}` : ""}#{perm.relation}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Actions */}
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
