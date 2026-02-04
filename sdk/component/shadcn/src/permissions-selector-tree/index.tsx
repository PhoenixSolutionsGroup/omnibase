"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NamespaceDefinition } from "@omnibase/core-js";

export interface NamespaceMapEntry {
  id: string;
  label: string;
}

export interface PermissionsSelectorTreeProps {
  definitions: NamespaceDefinition[];
  namespaceMap?: Record<string, NamespaceMapEntry[]>;
  value?: string[];
  onChange?: (permissions: string[]) => void;
  disabled?: boolean;
  showPreview?: boolean;
  className?: string;
}

interface PermissionOption {
  name: string;
  displayName: string;
  group: string | null;
  subGroup: string | null;
}

interface GroupedPermissions {
  ungrouped: PermissionOption[];
  groups: Record<
    string,
    {
      permissions: PermissionOption[];
      subGroups: Record<string, PermissionOption[]>;
    }
  >;
}

function groupPermissions(permissions: PermissionOption[]): GroupedPermissions {
  const result: GroupedPermissions = {
    ungrouped: [],
    groups: {},
  };

  for (const perm of permissions) {
    if (!perm.group) {
      result.ungrouped.push(perm);
      continue;
    }

    if (!result.groups[perm.group]) {
      result.groups[perm.group] = { permissions: [], subGroups: {} };
    }

    if (perm.subGroup) {
      if (!result.groups[perm.group].subGroups[perm.subGroup]) {
        result.groups[perm.group].subGroups[perm.subGroup] = [];
      }
      result.groups[perm.group].subGroups[perm.subGroup].push(perm);
    } else {
      result.groups[perm.group].permissions.push(perm);
    }
  }

  return result;
}

function formatRelation(relation: string): string {
  const stripped = relation.replace(/^can_/, "");
  return stripped
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function buildPermissionString(
  namespace: string,
  relation: string,
  objectId?: string
): string {
  const ns = namespace.toLowerCase();
  if (ns === "tenant" || !objectId) {
    return `${ns}#${relation}`;
  }
  return `${ns}:${objectId}#${relation}`;
}

function parsePermissionString(perm: string): {
  namespace: string;
  relation: string;
  objectId: string;
} {
  // Format: namespace#relation or namespace:objectId#relation
  const hashIndex = perm.indexOf("#");
  if (hashIndex === -1) {
    return { namespace: "", relation: "", objectId: "" };
  }

  const beforeHash = perm.substring(0, hashIndex);
  const relation = perm.substring(hashIndex + 1);

  const colonIndex = beforeHash.indexOf(":");
  if (colonIndex === -1) {
    return { namespace: beforeHash, relation, objectId: "" };
  }

  return {
    namespace: beforeHash.substring(0, colonIndex),
    relation,
    objectId: beforeHash.substring(colonIndex + 1),
  };
}

interface PermissionCheckboxProps {
  permission: PermissionOption;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  indent?: number;
}

function PermissionCheckbox({
  permission,
  checked,
  onCheckedChange,
  disabled,
  indent = 0,
}: PermissionCheckboxProps) {
  return (
    <label
      className={cn(
        "flex items-center gap-2.5 py-1.5 px-2 rounded hover:bg-muted/50 cursor-pointer transition-colors",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      style={{ paddingLeft: `${(indent + 1) * 16 + 8}px` }}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
      <span className="text-sm text-foreground/90">{permission.displayName}</span>
    </label>
  );
}

interface GroupHeaderProps {
  name: string;
  checked: boolean | "indeterminate";
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  indent?: number;
  isSubGroup?: boolean;
}

function GroupHeader({
  name,
  checked,
  onCheckedChange,
  disabled,
  isOpen,
  onOpenChange,
  indent = 0,
  isSubGroup = false,
}: GroupHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded transition-colors",
        isSubGroup
          ? "py-1.5 px-2 hover:bg-muted/50"
          : "py-2 px-2 bg-muted/30 hover:bg-muted/50 mt-1 first:mt-0",
        disabled && "opacity-50"
      )}
      style={{ paddingLeft: `${indent * 16}px` }}
    >
      <button
        type="button"
        onClick={() => onOpenChange(!isOpen)}
        className="p-0.5 hover:bg-muted rounded"
        disabled={disabled}
      >
        <ChevronRight
          className={cn(
            "transition-transform duration-200",
            isSubGroup ? "h-3.5 w-3.5 text-muted-foreground" : "h-4 w-4 text-foreground/70",
            isOpen && "rotate-90"
          )}
        />
      </button>
      <Checkbox
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={isSubGroup ? "" : "h-4.5 w-4.5"}
      />
      <span
        className={cn(
          "cursor-pointer select-none",
          isSubGroup
            ? "text-xs font-medium text-muted-foreground uppercase tracking-wider"
            : "text-sm font-semibold text-foreground"
        )}
        onClick={() => onOpenChange(!isOpen)}
      >
        {name}
      </span>
    </div>
  );
}

export function PermissionsSelectorTree({
  definitions,
  namespaceMap = {},
  value = [],
  onChange,
  disabled = false,
  showPreview = true,
  className,
}: PermissionsSelectorTreeProps) {
  const [selectedNamespace, setSelectedNamespace] = useState<string>("");
  const [selectedObjectId, setSelectedObjectId] = useState<string>("");
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());

  // Get permissions for selected namespace
  const permissions = useMemo((): PermissionOption[] => {
    const def = definitions.find(
      (d) => d.namespace.toLowerCase() === selectedNamespace.toLowerCase()
    );
    if (!def) return [];

    if (def.relationsMetadata && def.relationsMetadata.length > 0) {
      return def.relationsMetadata.map((rm) => ({
        name: rm.name,
        displayName: rm.displayName,
        group: rm.group ?? null,
        subGroup: rm.subGroup ?? null,
      }));
    }

    return def.relations
      .filter((rel) => rel.startsWith("can_") || rel.startsWith("is_"))
      .map((rel) => ({
        name: rel,
        displayName: formatRelation(rel),
        group: null,
        subGroup: null,
      }));
  }, [definitions, selectedNamespace]);

  const groupedPermissions = useMemo(
    () => groupPermissions(permissions),
    [permissions]
  );

  const hasGroups = Object.keys(groupedPermissions.groups).length > 0;

  // Check if namespace requires objectId
  const requiresObjectId = useMemo(() => {
    return selectedNamespace.toLowerCase() !== "tenant" && selectedNamespace !== "";
  }, [selectedNamespace]);

  const availableObjects = useMemo(() => {
    if (!requiresObjectId) return [];
    return namespaceMap[selectedNamespace.toLowerCase()] || [];
  }, [namespaceMap, selectedNamespace, requiresObjectId]);

  // Helper to build permission key for current namespace/object
  const buildKey = useCallback(
    (relation: string) => {
      return buildPermissionString(selectedNamespace, relation, selectedObjectId);
    },
    [selectedNamespace, selectedObjectId]
  );

  // Check if a permission is selected
  const isSelected = useCallback(
    (relation: string) => {
      const key = buildKey(relation);
      return value.includes(key);
    },
    [value, buildKey]
  );

  // Toggle a single permission
  const togglePermission = useCallback(
    (relation: string, checked: boolean) => {
      const key = buildKey(relation);
      if (checked) {
        onChange?.([...value, key]);
      } else {
        onChange?.(value.filter((v) => v !== key));
      }
    },
    [value, onChange, buildKey]
  );

  // Toggle multiple permissions (for group selection)
  const togglePermissions = useCallback(
    (relations: string[], checked: boolean) => {
      const keys = relations.map((r) => buildKey(r));
      if (checked) {
        const newValue = [...value];
        for (const key of keys) {
          if (!newValue.includes(key)) {
            newValue.push(key);
          }
        }
        onChange?.(newValue);
      } else {
        onChange?.(value.filter((v) => !keys.includes(v)));
      }
    },
    [value, onChange, buildKey]
  );

  // Get check state for a group (all, some, or none selected)
  const getGroupCheckState = useCallback(
    (permissions: PermissionOption[]): boolean | "indeterminate" => {
      const selected = permissions.filter((p) => isSelected(p.name));
      if (selected.length === 0) return false;
      if (selected.length === permissions.length) return true;
      return "indeterminate";
    },
    [isSelected]
  );

  // Get all permissions in a group (including subgroups)
  const getAllGroupPermissions = useCallback(
    (groupName: string): string[] => {
      const group = groupedPermissions.groups[groupName];
      if (!group) return [];

      const allPerms = [
        ...group.permissions.map((p) => p.name),
        ...Object.values(group.subGroups).flatMap((perms) =>
          perms.map((p) => p.name)
        ),
      ];
      return allPerms;
    },
    [groupedPermissions]
  );

  const toggleGroupOpen = useCallback((groupKey: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupKey)) {
        next.delete(groupKey);
      } else {
        next.add(groupKey);
      }
      return next;
    });
  }, []);

  // Auto-expand all groups when namespace changes
  useEffect(() => {
    const keys: string[] = [];
    for (const groupName of Object.keys(groupedPermissions.groups)) {
      keys.push(groupName);
      for (const subGroupName of Object.keys(
        groupedPermissions.groups[groupName].subGroups
      )) {
        keys.push(`${groupName}:${subGroupName}`);
      }
    }
    setOpenGroups(new Set(keys));
  }, [groupedPermissions]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Namespace and Object Selection */}
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Namespace
          </label>
          <Select
            value={selectedNamespace}
            onValueChange={(ns) => {
              setSelectedNamespace(ns);
              setSelectedObjectId("");
              setOpenGroups(new Set());
            }}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select namespace..." />
            </SelectTrigger>
            <SelectContent>
              {definitions.map((def) => (
                <SelectItem key={def.namespace} value={def.namespace}>
                  {def.namespace}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {requiresObjectId && (
          <div className="flex-1">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Resource
            </label>
            <Select
              value={selectedObjectId}
              onValueChange={setSelectedObjectId}
              disabled={disabled || availableObjects.length === 0}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    availableObjects.length === 0
                      ? "No resources available"
                      : "Select resource..."
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {availableObjects.map((obj) => (
                  <SelectItem key={obj.id} value={obj.id}>
                    {obj.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Permissions Tree */}
      {selectedNamespace && (!requiresObjectId || selectedObjectId) && (
        <div className="border rounded-md p-2 max-h-[400px] overflow-y-auto">
          {/* Ungrouped permissions */}
          {groupedPermissions.ungrouped.map((perm) => (
            <PermissionCheckbox
              key={perm.name}
              permission={perm}
              checked={isSelected(perm.name)}
              onCheckedChange={(checked) =>
                togglePermission(perm.name, checked as boolean)
              }
              disabled={disabled}
            />
          ))}

          {/* Grouped permissions */}
          {hasGroups &&
            Object.entries(groupedPermissions.groups).map(
              ([groupName, group]) => {
                const allGroupPerms = getAllGroupPermissions(groupName);
                const groupCheckState = getGroupCheckState([
                  ...group.permissions,
                  ...Object.values(group.subGroups).flat(),
                ]);
                const isGroupOpen = openGroups.has(groupName);

                return (
                  <Collapsible
                    key={groupName}
                    open={isGroupOpen}
                    onOpenChange={() => toggleGroupOpen(groupName)}
                  >
                    <GroupHeader
                      name={groupName}
                      checked={groupCheckState}
                      onCheckedChange={(checked) =>
                        togglePermissions(allGroupPerms, checked as boolean)
                      }
                      disabled={disabled}
                      isOpen={isGroupOpen}
                      onOpenChange={() => toggleGroupOpen(groupName)}
                    />
                    <CollapsibleContent>
                      {/* Direct group permissions */}
                      {group.permissions.map((perm) => (
                        <PermissionCheckbox
                          key={perm.name}
                          permission={perm}
                          checked={isSelected(perm.name)}
                          onCheckedChange={(checked) =>
                            togglePermission(perm.name, checked as boolean)
                          }
                          disabled={disabled}
                          indent={1}
                        />
                      ))}

                      {/* Subgroups */}
                      {Object.entries(group.subGroups).map(
                        ([subGroupName, subPerms]) => {
                          const subGroupKey = `${groupName}:${subGroupName}`;
                          const subGroupCheckState =
                            getGroupCheckState(subPerms);
                          const isSubGroupOpen = openGroups.has(subGroupKey);

                          return (
                            <Collapsible
                              key={subGroupKey}
                              open={isSubGroupOpen}
                              onOpenChange={() => toggleGroupOpen(subGroupKey)}
                            >
                              <GroupHeader
                                name={subGroupName}
                                checked={subGroupCheckState}
                                onCheckedChange={(checked) =>
                                  togglePermissions(
                                    subPerms.map((p) => p.name),
                                    checked as boolean
                                  )
                                }
                                disabled={disabled}
                                isOpen={isSubGroupOpen}
                                onOpenChange={() =>
                                  toggleGroupOpen(subGroupKey)
                                }
                                indent={1}
                                isSubGroup
                              />
                              <CollapsibleContent>
                                {subPerms.map((perm) => (
                                  <PermissionCheckbox
                                    key={perm.name}
                                    permission={perm}
                                    checked={isSelected(perm.name)}
                                    onCheckedChange={(checked) =>
                                      togglePermission(
                                        perm.name,
                                        checked as boolean
                                      )
                                    }
                                    disabled={disabled}
                                    indent={2}
                                  />
                                ))}
                              </CollapsibleContent>
                            </Collapsible>
                          );
                        }
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                );
              }
            )}

          {/* Legacy flat list when no groups */}
          {!hasGroups &&
            groupedPermissions.ungrouped.length === 0 &&
            permissions.map((perm) => (
              <PermissionCheckbox
                key={perm.name}
                permission={perm}
                checked={isSelected(perm.name)}
                onCheckedChange={(checked) =>
                  togglePermission(perm.name, checked as boolean)
                }
                disabled={disabled}
              />
            ))}
        </div>
      )}

      {/* Preview */}
      {showPreview && value.length > 0 && (
        <div className="rounded-md bg-muted p-3">
          <p className="text-xs text-muted-foreground mb-2">
            Selected permissions ({value.length}):
          </p>
          <ul className="space-y-1 text-xs font-mono">
            {value.map((perm, idx) => (
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

// Re-export types and helpers for convenience
export type { PermissionRow } from "../permissions-selector";
export { generateId } from "../permissions-selector";
export { buildPermissionString, parsePermissionString };
