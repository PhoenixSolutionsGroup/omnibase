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
import { Separator } from "@/components/ui/separator";
import type { NamespaceDefinition, Role } from "@omnibase/core-js";
import {
  PermissionsSelector,
  type PermissionRow,
  type NamespaceMapEntry,
  generateId,
  buildPermissionString,
} from "../permissions-selector";

interface RoleCreatorProps {
  definitions: NamespaceDefinition[];
  roles: Role[];
  namespaceMap?: Record<string, NamespaceMapEntry[]>;
  onRoleCreate?: (roleData: {
    role_name: string;
    permissions: string[];
  }) => void;
  onRoleUpdate?: (roleData: {
    role_id: string;
    role_name: string;
    permissions: string[];
  }) => void;
}

export function RoleCreator({
  definitions,
  roles,
  namespaceMap = {},
  onRoleCreate,
  onRoleUpdate,
}: RoleCreatorProps) {
  const [roleName, setRoleName] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [permissionRows, setPermissionRows] = useState<PermissionRow[]>([
    { id: generateId(), namespace: "", relation: "", objectId: "" },
  ]);

  const roleSuggestions = useMemo(() => {
    return roles.map((role) => role.roleName);
  }, [roles]);

  const parsePermissionString = (
    perm: string
  ): { namespace: string; relation: string; objectId: string } => {
    const hashIndex = perm.indexOf("#");
    if (hashIndex === -1) return { namespace: "", relation: "", objectId: "" };

    const relation = perm.substring(hashIndex + 1);
    const leftPart = perm.substring(0, hashIndex);

    const colonIndex = leftPart.indexOf(":");
    if (colonIndex === -1) {
      const namespace =
        definitions.find(
          (d) => d.namespace.toLowerCase() === leftPart.toLowerCase()
        )?.namespace || leftPart;
      return { namespace, relation, objectId: "" };
    }

    const nsLower = leftPart.substring(0, colonIndex);
    const objectId = leftPart.substring(colonIndex + 1);
    const namespace =
      definitions.find(
        (d) => d.namespace.toLowerCase() === nsLower.toLowerCase()
      )?.namespace || nsLower;

    return { namespace, relation, objectId };
  };

  const handleRoleNameChange = (value: string) => {
    setRoleName(value);

    const existingRole = roles.find(
      (role) => role.roleName.toLowerCase() === value.toLowerCase()
    );

    if (existingRole) {
      setIsEditMode(true);
      setEditingRoleId(existingRole.id);

      const rows: PermissionRow[] = existingRole.permissions.map((perm) => {
        const parsed = parsePermissionString(perm);
        return {
          id: generateId(),
          namespace: parsed.namespace,
          relation: parsed.relation,
          objectId: parsed.objectId,
        };
      });

      if (rows.length === 0) {
        rows.push({
          id: generateId(),
          namespace: "",
          relation: "",
          objectId: "",
        });
      }

      setPermissionRows(rows);
    } else {
      setIsEditMode(false);
      setEditingRoleId(null);
    }
  };

  const buildPermissions = (): string[] => {
    return permissionRows
      .filter((row) => row.namespace && row.relation)
      .map((row) => buildPermissionString(row))
      .filter((perm) => perm !== "");
  };

  const handleSubmit = () => {
    if (!roleName.trim()) return;

    const permissionsArray = buildPermissions();

    if (isEditMode && editingRoleId) {
      onRoleUpdate?.({
        role_id: editingRoleId,
        role_name: roleName,
        permissions: permissionsArray,
      });
    } else {
      onRoleCreate?.({
        role_name: roleName,
        permissions: permissionsArray,
      });
    }
  };

  const handleReset = () => {
    setRoleName("");
    setPermissionRows([
      { id: generateId(), namespace: "", relation: "", objectId: "" },
    ]);
    setIsEditMode(false);
    setEditingRoleId(null);
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>
          {isEditMode ? `Edit Role: ${roleName}` : "Create New Role"}
        </CardTitle>
        <CardDescription>
          {isEditMode
            ? "Update permissions for this existing role"
            : "Define a new role with specific permissions"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Role Name Input with Autocomplete */}
        <div className="space-y-2 relative">
          <Label htmlFor="role-name">Role Name</Label>
          <Input
            id="role-name"
            placeholder="Enter role name (e.g., admin, developer, viewer)"
            value={roleName}
            onChange={(e) => handleRoleNameChange(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />

          {showSuggestions && roleSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-y-auto">
              {roleSuggestions
                .filter((suggestion) =>
                  suggestion.toLowerCase().includes(roleName.toLowerCase())
                )
                .map((suggestion) => (
                  <button
                    key={suggestion}
                    className="w-full px-4 py-2 text-left hover:bg-accent hover:text-accent-foreground text-sm"
                    onMouseDown={() => {
                      handleRoleNameChange(suggestion);
                      setShowSuggestions(false);
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
            </div>
          )}

          {isEditMode && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Editing existing role - changes will update all users with this
              role
            </p>
          )}
        </div>

        <Separator />

        {/* Permissions */}
        <div className="space-y-4">
          <Label>Permissions</Label>

          <PermissionsSelector
            definitions={definitions}
            namespaceMap={namespaceMap}
            initialPermissions={permissionRows}
            onPermissionsChange={setPermissionRows}
          />
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!roleName.trim() || buildPermissions().length === 0}
          >
            {isEditMode ? "Update Role" : "Create Role"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
