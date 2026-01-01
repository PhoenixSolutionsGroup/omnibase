"use client";

import { useState, useMemo, useEffect } from "react";
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
import { Trash2, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NamespaceDefinition } from "@omnibase/core-js";

export interface NamespaceMapEntry {
  id: string;
  label: string;
}

export interface PermissionRow {
  id: string;
  namespace: string;
  relation: string;
  objectId: string;
}

export interface PermissionsSelectorProps {
  definitions: NamespaceDefinition[];
  namespaceMap?: Record<string, NamespaceMapEntry[]>;
  initialPermissions?: PermissionRow[];
  onPermissionsChange?: (rows: PermissionRow[]) => void;
  disabled?: boolean;
  showPreview?: boolean;
  className?: string;
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
            "justify-between font-normal transition-[width] duration-200 ease-in-out",
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

export function formatRelation(relation: string): string {
  const stripped = relation.replace(/^can_/, "");
  return stripped
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function buildPermissionString(row: PermissionRow): string {
  if (!row.namespace || !row.relation) return "";

  if (row.namespace.toLowerCase() === "tenant" || !row.objectId) {
    return `${row.namespace.toLowerCase()}#${row.relation}`;
  }

  return `${row.namespace.toLowerCase()}:${row.objectId}#${row.relation}`;
}

export function PermissionsSelector({
  definitions,
  namespaceMap = {},
  initialPermissions,
  onPermissionsChange,
  disabled = false,
  showPreview = true,
  className,
}: PermissionsSelectorProps) {
  const [permissionRows, setPermissionRows] = useState<PermissionRow[]>(() => {
    if (initialPermissions && initialPermissions.length > 0) {
      return initialPermissions;
    }
    return [{ id: generateId(), namespace: "", relation: "", objectId: "" }];
  });

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
      const newRows = permissionRows.filter((row) => row.id !== id);
      setPermissionRows(newRows);
      onPermissionsChange?.(newRows);
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

      let finalRows = updatedRows;
      if (hasAnyValue(lastRow)) {
        finalRows = [
          ...updatedRows,
          { id: generateId(), namespace: "", relation: "", objectId: "" },
        ];
      }

      onPermissionsChange?.(finalRows);
      return finalRows;
    });
  };

  const buildPermissions = (): string[] => {
    return permissionRows
      .filter((row) => row.namespace && row.relation)
      .map((row) => buildPermissionString(row))
      .filter((perm) => perm !== "");
  };

  useEffect(() => {
    if (initialPermissions && initialPermissions.length > 0) {
      setPermissionRows(initialPermissions);
    }
  }, [initialPermissions]);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-3">
        {permissionRows.map((row) => {
          const relationOptions = getRelationsForNamespace(row.namespace);
          const objectOptions = getObjectsForNamespace(row.namespace);
          const showObjectSelect = objectOptions !== null;

          return (
            <div key={row.id} className="flex items-start gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removePermissionRow(row.id)}
                disabled={disabled || permissionRows.length === 1}
                className="shrink-0"
              >
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>

              <div className="flex flex-1 gap-0">
                <Combobox
                  options={namespaceOptions}
                  value={row.namespace}
                  onChange={(value) =>
                    updatePermissionRow(row.id, "namespace", value)
                  }
                  placeholder="Namespace"
                  searchPlaceholder="Search namespaces..."
                  disabled={disabled}
                  className="w-1/3 min-w-[120px] rounded-r-none border-r-0"
                />

                <Combobox
                  options={relationOptions}
                  value={row.relation}
                  onChange={(value) =>
                    updatePermissionRow(row.id, "relation", value)
                  }
                  placeholder="Permission"
                  searchPlaceholder="Search permissions..."
                  disabled={disabled || !row.namespace}
                  className={cn(
                    "min-w-40 ease-out duration-450",
                    showObjectSelect
                      ? "w-1/3 rounded-none border-r-0"
                      : "w-2/3 rounded-l-none"
                  )}
                />

                <Combobox
                  options={objectOptions ?? []}
                  value={row.objectId}
                  onChange={(value) =>
                    updatePermissionRow(row.id, "objectId", value)
                  }
                  placeholder="Resource"
                  searchPlaceholder="Search resources..."
                  disabled={disabled || !row.namespace || !showObjectSelect}
                  className={cn(
                    "rounded-l-none invisible ease-out duration-450 overflow-hidden",
                    showObjectSelect
                      ? "w-1/3 visible"
                      : "w-0 min-w-0 border-0 p-0"
                  )}
                />
              </div>
            </div>
          );
        })}
      </div>

      {showPreview &&
        permissionRows.some((row) => row.namespace && row.relation) && (
          <div className="rounded-md bg-muted p-3">
            <p className="text-xs text-muted-foreground mb-2">
              Permissions to be granted:
            </p>
            <ul className="space-y-1 text-xs font-mono">
              {buildPermissions().map((perm, idx) => (
                <li key={idx} className="text-muted-foreground">
                  {perm}
                </li>
              ))}
            </ul>
          </div>
        )}
    </div>
  );
}
