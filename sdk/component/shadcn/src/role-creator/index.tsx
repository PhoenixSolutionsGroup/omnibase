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
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import type { ModelsNamespaceDefinition, ModelsRole } from "@omnibase/core-js";

interface NamespaceMapEntry {
  id: string;
  label: string;
}

interface RoleCreatorProps {
  definitions: ModelsNamespaceDefinition[];
  roles: ModelsRole[];
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
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set()
  );
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);

  // Separate tenant and fine-grained namespaces
  const { tenantNamespace, fineGrainedNamespaces } = useMemo(() => {
    const tenant = definitions.find(
      (def) => def.namespace.toLowerCase() === "tenant"
    );
    const fineGrained = definitions.filter(
      (def) => def.namespace.toLowerCase() !== "tenant"
    );

    return {
      tenantNamespace: tenant,
      fineGrainedNamespaces: fineGrained,
    };
  }, [definitions]);

  // Get role suggestions
  const roleSuggestions = useMemo(() => {
    return roles.map((role) => role.roleName);
  }, [roles]);

  // Handle role name input
  const handleRoleNameChange = (value: string) => {
    setRoleName(value);

    // Check if this is an existing role
    const existingRole = roles.find(
      (role) => role.roleName.toLowerCase() === value.toLowerCase()
    );

    if (existingRole) {
      setIsEditMode(true);
      setEditingRoleId(existingRole.id);

      // Pre-fill permissions
      const permissions = new Set<string>();
      existingRole.permissions.forEach((perm) => {
        permissions.add(perm);
      });
      setSelectedPermissions(permissions);
    } else {
      setIsEditMode(false);
      setEditingRoleId(null);
    }
  };

  // Build permission string
  const buildPermissionString = (
    namespace: string,
    relation: string,
    resourceId?: string
  ): string => {
    if (resourceId) {
      return `${namespace.toLowerCase()}:${resourceId}#${relation}`;
    }

    return `${namespace.toLowerCase()}#${relation}`;
  };

  // Toggle permission
  const togglePermission = (permissionString: string) => {
    const newPermissions = new Set(selectedPermissions);

    if (newPermissions.has(permissionString)) {
      newPermissions.delete(permissionString);
    } else {
      newPermissions.add(permissionString);
    }

    setSelectedPermissions(newPermissions);
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!roleName.trim()) return;

    const permissionsArray = Array.from(selectedPermissions);

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

  // Reset form
  const handleReset = () => {
    setRoleName("");
    setSelectedPermissions(new Set());
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

          {/* Role Suggestions Dropdown */}
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
              ⚠ Editing existing role - changes will update all users with this
              role
            </p>
          )}
        </div>

        <Separator />

        {/* Tenant Permissions Section */}
        {tenantNamespace && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">
                Organization Permissions
              </h3>
              <p className="text-sm text-muted-foreground">
                Tenant-wide permissions that apply across the entire
                organization
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4">
              {tenantNamespace.relations.map((relation) => {
                const permissionString = buildPermissionString(
                  tenantNamespace.namespace,
                  relation
                );
                const isChecked = selectedPermissions.has(permissionString);

                return (
                  <div
                    key={permissionString}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={permissionString}
                      checked={isChecked}
                      onCheckedChange={() => togglePermission(permissionString)}
                    />
                    <Label
                      htmlFor={permissionString}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {relation.replace(/_/g, " ")}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Fine-Grained Permissions Section */}
        {fineGrainedNamespaces.length > 0 && (
          <>
            <Separator />
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold">
                  Fine-Grained Permissions
                </h3>
                <p className="text-sm text-muted-foreground">
                  Resource-specific permissions that require an object ID
                </p>
              </div>

              {fineGrainedNamespaces.map((namespace) => {
                const namespaceLower = namespace.namespace.toLowerCase();
                const resourceMap = namespaceMap[namespaceLower] || [];

                return (
                  <div key={namespace.id} className="space-y-4">
                    <div className="pl-4">
                      <h4 className="text-md font-medium capitalize">
                        {namespace.namespace}
                      </h4>

                      {resourceMap.length > 0 ? (
                        <div className="mt-4 space-y-6">
                          {resourceMap.map((resource) => (
                            <div
                              key={resource.id}
                              className="border rounded-lg p-4 space-y-3 bg-muted/30"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-sm">
                                  {resource.label}
                                </span>
                                <span className="text-xs text-muted-foreground font-mono">
                                  {resource.id}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {namespace.relations.map((relation) => {
                                  const permissionString =
                                    buildPermissionString(
                                      namespace.namespace,
                                      relation,
                                      resource.id
                                    );
                                  const isChecked =
                                    selectedPermissions.has(permissionString);

                                  return (
                                    <div
                                      key={permissionString}
                                      className="flex items-center space-x-2"
                                    >
                                      <Checkbox
                                        id={permissionString}
                                        checked={isChecked}
                                        onCheckedChange={() =>
                                          togglePermission(permissionString)
                                        }
                                      />
                                      <Label
                                        htmlFor={permissionString}
                                        className="text-sm font-normal cursor-pointer"
                                      >
                                        {relation.replace(/_/g, " ")}
                                      </Label>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-3 p-4 border-2 border-dashed rounded-lg text-center">
                          <p className="text-sm text-muted-foreground">
                            No {namespace.namespace.toLowerCase()} resources
                            available
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Use wildcard permissions (e.g., {namespaceLower}
                            :*#permission) for all resources
                          </p>
                        </div>
                      )}

                      {/* Wildcard Permissions Option */}
                      <div className="mt-4 space-y-2">
                        <Label className="text-sm font-medium">
                          Wildcard Permissions (All {namespace.namespace}s)
                        </Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {namespace.relations.map((relation) => {
                            const permissionString = buildPermissionString(
                              namespace.namespace,
                              relation,
                              "*"
                            );
                            const isChecked =
                              selectedPermissions.has(permissionString);

                            return (
                              <div
                                key={permissionString}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={permissionString}
                                  checked={isChecked}
                                  onCheckedChange={() =>
                                    togglePermission(permissionString)
                                  }
                                />
                                <Label
                                  htmlFor={permissionString}
                                  className="text-sm font-normal cursor-pointer"
                                >
                                  {relation.replace(/_/g, " ")} (all)
                                </Label>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <Separator />

        {/* Selected Permissions Preview */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Selected Permissions ({selectedPermissions.size})
          </Label>
          {selectedPermissions.size > 0 ? (
            <div className="p-4 bg-muted rounded-md max-h-40 overflow-y-auto">
              <ul className="space-y-1 text-xs font-mono">
                {Array.from(selectedPermissions).map((perm) => (
                  <li key={perm} className="text-muted-foreground">
                    {perm}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No permissions selected
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!roleName.trim() || selectedPermissions.size === 0}
          >
            {isEditMode ? "Update Role" : "Create Role"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
