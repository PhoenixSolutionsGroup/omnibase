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
import { Trash2, Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NamespaceDefinitionResponse as NamespaceDefinition } from "@omnibase/core-js";

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
  group?: string | null;
  subGroup?: string | null;
}

interface GroupedOptions {
  ungrouped: ComboboxOption[];
  groups: Record<string, {
    options: ComboboxOption[];
    subGroups: Record<string, ComboboxOption[]>;
  }>;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  onSelectMultiple?: (values: string[]) => void;
  placeholder: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
  grouped?: boolean;
}

function groupOptions(options: ComboboxOption[]): GroupedOptions {
  const result: GroupedOptions = {
    ungrouped: [],
    groups: {},
  };

  for (const option of options) {
    if (!option.group) {
      result.ungrouped.push(option);
      continue;
    }

    if (!result.groups[option.group]) {
      result.groups[option.group] = { options: [], subGroups: {} };
    }

    if (option.subGroup) {
      if (!result.groups[option.group].subGroups[option.subGroup]) {
        result.groups[option.group].subGroups[option.subGroup] = [];
      }
      result.groups[option.group].subGroups[option.subGroup].push(option);
    } else {
      result.groups[option.group].options.push(option);
    }
  }

  return result;
}

function renderCommandItem(
  option: ComboboxOption,
  value: string,
  onChange: (value: string) => void,
  setOpen: (open: boolean) => void,
  indent: number = 0
) {
  return (
    <CommandItem
      key={option.value}
      value={option.label}
      onSelect={() => {
        onChange(option.value);
        setOpen(false);
      }}
      className={indent > 0 ? "pl-8" : undefined}
    >
      <Check
        className={cn(
          "mr-2 h-4 w-4",
          value === option.value ? "opacity-100" : "opacity-0"
        )}
      />
      {option.label}
    </CommandItem>
  );
}

function Combobox({
  options,
  value,
  onChange,
  onSelectMultiple,
  placeholder,
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  disabled = false,
  className = "",
  grouped = false,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);
  const isEmpty = options.length === 0;
  const groupedOpts = useMemo(
    () => (grouped ? groupOptions(options) : null),
    [options, grouped]
  );

  const hasGroups =
    groupedOpts && Object.keys(groupedOpts.groups).length > 0;

  const handleSelectGroup = (groupName: string) => {
    if (!groupedOpts || !onSelectMultiple) return;
    const group = groupedOpts.groups[groupName];
    if (!group) return;

    // Collect all options in this group (direct + all subgroups)
    const allValues = [
      ...group.options.map((o) => o.value),
      ...Object.values(group.subGroups).flatMap((opts) =>
        opts.map((o) => o.value)
      ),
    ];
    onSelectMultiple(allValues);
    setOpen(false);
  };

  const handleSelectSubGroup = (groupName: string, subGroupName: string) => {
    if (!groupedOpts || !onSelectMultiple) return;
    const subOpts = groupedOpts.groups[groupName]?.subGroups[subGroupName];
    if (!subOpts) return;

    onSelectMultiple(subOpts.map((o) => o.value));
    setOpen(false);
  };

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
            {grouped && hasGroups ? (
              <>
                {/* Ungrouped options first */}
                {groupedOpts.ungrouped.length > 0 && (
                  <CommandGroup>
                    {groupedOpts.ungrouped.map((opt) =>
                      renderCommandItem(opt, value, onChange, setOpen)
                    )}
                  </CommandGroup>
                )}
                {/* Grouped options */}
                {Object.entries(groupedOpts.groups).map(
                  ([groupName, group]) => (
                    <CommandGroup
                      key={groupName}
                      heading={
                        onSelectMultiple ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleSelectGroup(groupName);
                            }}
                            className="flex items-center gap-1.5 hover:text-foreground transition-colors group w-full text-left"
                          >
                            <Plus className="h-3 w-3 opacity-0 group-hover:opacity-70 transition-opacity" />
                            <span>{groupName}</span>
                          </button>
                        ) : (
                          groupName
                        )
                      }
                    >
                      {/* Direct group options */}
                      {group.options.map((opt) =>
                        renderCommandItem(opt, value, onChange, setOpen)
                      )}
                      {/* SubGroup options */}
                      {Object.entries(group.subGroups).map(
                        ([subGroupName, subOpts]) => (
                          <div key={subGroupName} className="mt-1">
                            {onSelectMultiple ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleSelectSubGroup(groupName, subGroupName);
                                }}
                                className="flex items-center gap-1.5 px-2 py-1 text-[11px] text-muted-foreground/70 uppercase tracking-wider hover:text-muted-foreground transition-colors group w-full text-left"
                              >
                                <span className="text-muted-foreground/40 group-hover:text-muted-foreground/70">—</span>
                                <Plus className="h-2.5 w-2.5 opacity-0 group-hover:opacity-70 transition-opacity" />
                                {subGroupName}
                              </button>
                            ) : (
                              <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] text-muted-foreground/70 uppercase tracking-wider">
                                <span className="text-muted-foreground/40">—</span>
                                {subGroupName}
                              </div>
                            )}
                            {subOpts.map((opt) =>
                              renderCommandItem(opt, value, onChange, setOpen, 1)
                            )}
                          </div>
                        )
                      )}
                    </CommandGroup>
                  )
                )}
              </>
            ) : (
              <CommandGroup>
                {options.map((option) =>
                  renderCommandItem(option, value, onChange, setOpen)
                )}
              </CommandGroup>
            )}
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

    // Use relationsMetadata if available (enriched with JSDoc annotations)
    if (def.relationsMetadata && def.relationsMetadata.length > 0) {
      return def.relationsMetadata.map((rm) => ({
        value: rm.name,
        label: rm.displayName,
        group: rm.group ?? null,
        subGroup: rm.subGroup ?? null,
      }));
    }

    // Fallback to legacy behavior: filter can_/is_ relations with auto-formatted labels
    return (def.relations ?? [])
      .filter((rel) => rel.startsWith("can_") || rel.startsWith("is_"))
      .map((rel) => ({ value: rel, label: formatRelation(rel) }));
  };

  const hasRelationsMetadata = (namespace: string): boolean => {
    const def = definitions.find((d) => d.namespace === namespace);
    return !!(def?.relationsMetadata && def.relationsMetadata.length > 0);
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

  const addMultiplePermissions = (
    rowId: string,
    namespace: string,
    relations: string[]
  ) => {
    if (relations.length === 0) return;

    setPermissionRows((currentRows) => {
      // Find the row being edited
      const rowIndex = currentRows.findIndex((r) => r.id === rowId);
      if (rowIndex === -1) return currentRows;

      // Filter out relations that are already added
      const existingRelations = new Set(
        currentRows
          .filter((r) => r.namespace === namespace && r.relation)
          .map((r) => r.relation)
      );
      const newRelations = relations.filter((r) => !existingRelations.has(r));

      if (newRelations.length === 0) return currentRows;

      // Update the current row with the first relation
      const updatedRows = [...currentRows];
      updatedRows[rowIndex] = {
        ...updatedRows[rowIndex],
        namespace,
        relation: newRelations[0],
      };

      // Add new rows for remaining relations
      const additionalRows = newRelations.slice(1).map((relation) => ({
        id: generateId(),
        namespace,
        relation,
        objectId: "",
      }));

      // Insert additional rows after the current row
      updatedRows.splice(rowIndex + 1, 0, ...additionalRows);

      // Ensure there's always an empty row at the end
      const lastRow = updatedRows[updatedRows.length - 1];
      if (hasAnyValue(lastRow)) {
        updatedRows.push({
          id: generateId(),
          namespace: "",
          relation: "",
          objectId: "",
        });
      }

      onPermissionsChange?.(updatedRows);
      return updatedRows;
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
                  onSelectMultiple={(relations) =>
                    addMultiplePermissions(row.id, row.namespace, relations)
                  }
                  placeholder="Permission"
                  searchPlaceholder="Search permissions..."
                  disabled={disabled || !row.namespace}
                  grouped={hasRelationsMetadata(row.namespace)}
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
