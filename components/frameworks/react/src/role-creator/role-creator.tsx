"use client";
import * as React from "react";
import { useState } from "react";
import type {
  NamespaceMapEntry,
  PermissionOption,
  RoleCreatorTreeProps,
} from "./role-creator.types";
import {
  buildPermissionString,
  EMPTY_OPEN_GROUPS,
  EMPTY_PERMISSIONS,
  formatRelation,
  groupPermissions,
  toGroupList,
} from "./role-creator.helpers";

function RoleCreatorTree(props: RoleCreatorTreeProps) {
  const [roleName, setRoleName] = useState(() => "");

  const [showSuggestions, setShowSuggestions] = useState(() => false);

  const [isEditMode, setIsEditMode] = useState(() => false);

  const [editingRoleId, setEditingRoleId] = useState(() => "");

  const [selectedNamespace, setSelectedNamespace] = useState(() => "");

  const [selectedObjectId, setSelectedObjectId] = useState(() => "");

  const [selectedPermissions, setSelectedPermissions] = useState(
    () => EMPTY_PERMISSIONS
  );

  const [openGroups, setOpenGroups] = useState(() => EMPTY_OPEN_GROUPS);

  function buildOptions(namespace: string) {
    const ns = namespace.toLowerCase();
    const definition = (props.definitions || []).find(
      (item) => item.namespace.toLowerCase() === ns
    );
    if (!definition) return [];
    const metadata = definition.relationsMetadata;
    if (metadata && metadata.length > 0) {
      return metadata.map((relation) => ({
        name: relation.name,
        displayName: relation.displayName,
        group: relation.group || null,
        subGroup: relation.subGroup || null,
      }));
    }
    return (definition.relations || [])
      .filter(
        (relation) =>
          relation.indexOf("can_") === 0 || relation.indexOf("is_") === 0
      )
      .map((relation) => ({
        name: relation,
        displayName: formatRelation(relation),
        group: null,
        subGroup: null,
      }));
  }

  function buildKey(relation: string) {
    return buildPermissionString(selectedNamespace, relation, selectedObjectId);
  }

  function subGroupKey(groupName: string, subGroupName: string) {
    return groupName + ":" + subGroupName;
  }

  function roleSuggestions() {
    return (props.roles || []).map((role) => role.roleName);
  }

  function filteredSuggestions() {
    const query = roleName.toLowerCase();
    return roleSuggestions().filter(
      (suggestion) => suggestion.toLowerCase().indexOf(query) !== -1
    );
  }

  function permissions() {
    return buildOptions(selectedNamespace);
  }

  function grouped() {
    return groupPermissions(permissions());
  }

  function groupList() {
    return toGroupList(grouped());
  }

  function requiresObjectId() {
    return (
      selectedNamespace !== "" && selectedNamespace.toLowerCase() !== "tenant"
    );
  }

  function availableObjects() {
    const map: Record<string, NamespaceMapEntry[]> = props.namespaceMap || {};
    return map[selectedNamespace.toLowerCase()] || [];
  }

  function showTree() {
    return (
      selectedNamespace !== "" &&
      (!requiresObjectId() || selectedObjectId !== "")
    );
  }

  function canSubmit() {
    return roleName.trim().length > 0 && selectedPermissions.length > 0;
  }

  function isSelected(relation: string) {
    return selectedPermissions.indexOf(buildKey(relation)) !== -1;
  }

  function isGroupChecked(relations: string[]) {
    const selected = relations.filter((relation) => isSelected(relation));
    return relations.length > 0 && selected.length === relations.length;
  }

  function isGroupIndeterminate(relations: string[]) {
    const selected = relations.filter((relation) => isSelected(relation));
    return selected.length > 0 && selected.length < relations.length;
  }

  function isGroupOpen(key: string) {
    return openGroups.indexOf(key) !== -1;
  }

  function toggleGroup(key: string) {
    if (openGroups.indexOf(key) === -1) {
      setOpenGroups(openGroups.concat([key]));
    } else {
      setOpenGroups(openGroups.filter((item) => item !== key));
    }
  }

  function selectNamespace(namespace: string) {
    setSelectedNamespace(namespace);
    setSelectedObjectId("");
    const groupedOptions = groupPermissions(buildOptions(namespace));
    const keys: string[] = [];
    Object.keys(groupedOptions.groups).forEach((groupName) => {
      keys.push(groupName);
      Object.keys(groupedOptions.groups[groupName].subGroups).forEach(
        (subName) => {
          keys.push(groupName + ":" + subName);
        }
      );
    });
    setOpenGroups(keys);
  }

  function selectObject(objectId: string) {
    setSelectedObjectId(objectId);
  }

  function togglePermission(relation: string, checked: boolean) {
    const key = buildKey(relation);
    const next = selectedPermissions.filter((item) => item !== key);
    if (checked) next.push(key);
    setSelectedPermissions(next);
  }

  function togglePermissions(relations: string[], checked: boolean) {
    const keys = relations.map((relation) => buildKey(relation));
    if (checked) {
      const next = selectedPermissions.slice();
      keys.forEach((key) => {
        if (next.indexOf(key) === -1) next.push(key);
      });
      setSelectedPermissions(next);
    } else {
      setSelectedPermissions(
        selectedPermissions.filter((item) => keys.indexOf(item) === -1)
      );
    }
  }

  function handleRoleName(value: string) {
    setRoleName(value);
    const match = (props.roles || []).find(
      (role) => role.roleName.toLowerCase() === value.toLowerCase()
    );
    if (match) {
      setIsEditMode(true);
      setEditingRoleId(match.id);
      setSelectedPermissions(
        match.permissions ? match.permissions.slice() : []
      );
    } else {
      setIsEditMode(false);
      setEditingRoleId("");
    }
  }

  function selectSuggestion(suggestion: string) {
    handleRoleName(suggestion);
    setShowSuggestions(false);
  }

  function hideSuggestionsSoon() {
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  }

  function showSuggestionList() {
    setShowSuggestions(true);
  }

  function reset() {
    setRoleName("");
    setShowSuggestions(false);
    setIsEditMode(false);
    setEditingRoleId("");
    setSelectedNamespace("");
    setSelectedObjectId("");
    setSelectedPermissions([]);
    setOpenGroups([]);
  }

  function submit() {
    if (!canSubmit()) return;
    const permissionStrings = selectedPermissions.slice();
    if (isEditMode && editingRoleId !== "") {
      if (props.onRoleUpdate) {
        props.onRoleUpdate({
          role_id: editingRoleId,
          role_name: roleName,
          permissions: permissionStrings,
        });
      }
    } else if (props.onRoleCreate) {
      props.onRoleCreate({
        role_name: roleName,
        permissions: permissionStrings,
      });
    }
  }

  return (
    <div className="card w-full max-w-4xl">
      <header>
        <h2>
          {isEditMode ? <>{"Edit Role: " + roleName}</> : <>Create New Role</>}
        </h2>
        <p>
          {isEditMode ? (
            <>Update permissions for this existing role</>
          ) : (
            <>Define a new role with specific permissions</>
          )}
        </p>
      </header>
      <section>
        <div className="relative">
          <label className="label" htmlFor="role-name">
            Role Name
          </label>
          <input
            id="role-name"
            className="input"
            type="text"
            placeholder="Enter role name (e.g., admin, developer, viewer)"
            value={roleName}
            onChange={(event) => handleRoleName(event.target.value)}
            onFocus={(event) => showSuggestionList()}
            onBlur={(event) => hideSuggestionsSoon()}
          />
          {showSuggestions && filteredSuggestions().length > 0 ? (
            <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border bg-popover shadow-lg">
              {filteredSuggestions()?.map((suggestion) => (
                <button
                  type="button"
                  className="w-full px-4 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                  key={suggestion}
                  onMouseDown={(event) => selectSuggestion(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          ) : null}
          {isEditMode ? (
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
              Editing existing role - changes will update all users with this
              role
            </p>
          ) : null}
        </div>
        <hr className="my-6 border-border" />
        <div className="space-y-4">
          <span className="label">Permissions</span>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="field flex-1">
              <label className="label" htmlFor="permission-namespace">
                Namespace
              </label>
              <select
                id="permission-namespace"
                className="select"
                value={selectedNamespace}
                onChange={(event) => selectNamespace(event.target.value)}
              >
                <option value="">Select namespace...</option>
                {props.definitions?.map((definition) => (
                  <option
                    key={definition.namespace}
                    value={definition.namespace}
                  >
                    {definition.namespace}
                  </option>
                ))}
              </select>
            </div>
            {requiresObjectId() ? (
              <div className="field flex-1">
                <label className="label" htmlFor="permission-object">
                  Resource
                </label>
                <select
                  id="permission-object"
                  className="select"
                  value={selectedObjectId}
                  onChange={(event) => selectObject(event.target.value)}
                  disabled={availableObjects().length === 0}
                >
                  <option value="">
                    {availableObjects().length === 0 ? (
                      <>No resources available</>
                    ) : (
                      <>Select resource...</>
                    )}
                  </option>
                  {availableObjects()?.map((object) => (
                    <option key={object.id} value={object.id}>
                      {object.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
          </div>
          {showTree() ? (
            <div className="max-h-[400px] overflow-y-auto rounded-md border p-2">
              {grouped().ungrouped?.map((permission) => (
                <label
                  className="flex cursor-pointer items-center gap-2.5 rounded px-2 py-1.5 hover:bg-muted/50"
                  key={permission.name}
                >
                  <input
                    type="checkbox"
                    className="input"
                    checked={isSelected(permission.name)}
                    onChange={(event) =>
                      togglePermission(permission.name, event.target.checked)
                    }
                  />
                  <span className="text-sm text-foreground/90">
                    {permission.displayName}
                  </span>
                </label>
              ))}
              {groupList()?.map((group) => (
                <div key={group.name}>
                  <div className="mt-1 flex items-center gap-2 rounded bg-muted/30 px-2 py-2 first:mt-0 hover:bg-muted/50">
                    <button
                      type="button"
                      className="group rounded p-0.5 hover:bg-muted"
                      aria-expanded={isGroupOpen(group.name)}
                      onClick={(event) => toggleGroup(group.name)}
                    >
                      <span
                        aria-hidden="true"
                        className="inline-block text-base leading-none text-foreground/70 transition-transform duration-200 group-aria-expanded:rotate-90"
                      >
                        ▸
                      </span>
                    </button>
                    <input
                      type="checkbox"
                      className="input"
                      checked={isGroupChecked(group.allRelations)}
                      onChange={(event) =>
                        togglePermissions(
                          group.allRelations,
                          event.target.checked
                        )
                      }
                    />
                    <button
                      type="button"
                      className={
                        isGroupIndeterminate(group.allRelations)
                          ? "cursor-pointer select-none text-left text-sm font-semibold text-foreground/70"
                          : "cursor-pointer select-none text-left text-sm font-semibold text-foreground"
                      }
                      onClick={(event) => toggleGroup(group.name)}
                    >
                      {group.name}
                    </button>
                  </div>
                  {isGroupOpen(group.name) ? (
                    <>
                      {group.permissions?.map((permission) => (
                        <label
                          className="flex cursor-pointer items-center gap-2.5 rounded py-1.5 pl-8 pr-2 hover:bg-muted/50"
                          key={permission.name}
                        >
                          <input
                            type="checkbox"
                            className="input"
                            checked={isSelected(permission.name)}
                            onChange={(event) =>
                              togglePermission(
                                permission.name,
                                event.target.checked
                              )
                            }
                          />
                          <span className="text-sm text-foreground/90">
                            {permission.displayName}
                          </span>
                        </label>
                      ))}
                      {group.subGroups?.map((subGroup) => (
                        <div key={subGroup.name}>
                          <div className="flex items-center gap-2 rounded py-1.5 pl-8 pr-2 hover:bg-muted/50">
                            <button
                              type="button"
                              className="group rounded p-0.5 hover:bg-muted"
                              aria-expanded={isGroupOpen(
                                subGroupKey(group.name, subGroup.name)
                              )}
                              onClick={(event) =>
                                toggleGroup(
                                  subGroupKey(group.name, subGroup.name)
                                )
                              }
                            >
                              <span
                                aria-hidden="true"
                                className="inline-block text-xs leading-none text-muted-foreground transition-transform duration-200 group-aria-expanded:rotate-90"
                              >
                                ▸
                              </span>
                            </button>
                            <input
                              type="checkbox"
                              className="input"
                              checked={isGroupChecked(
                                subGroup.permissions.map(
                                  (permission) => permission.name
                                )
                              )}
                              onChange={(event) =>
                                togglePermissions(
                                  subGroup.permissions.map(
                                    (permission) => permission.name
                                  ),
                                  event.target.checked
                                )
                              }
                            />
                            <button
                              type="button"
                              className="cursor-pointer select-none text-left text-xs font-medium uppercase tracking-wider text-muted-foreground"
                              onClick={(event) =>
                                toggleGroup(
                                  subGroupKey(group.name, subGroup.name)
                                )
                              }
                            >
                              {subGroup.name}
                            </button>
                          </div>
                          {isGroupOpen(
                            subGroupKey(group.name, subGroup.name)
                          ) ? (
                            <>
                              {subGroup.permissions?.map((permission) => (
                                <label
                                  className="flex cursor-pointer items-center gap-2.5 rounded py-1.5 pl-14 pr-2 hover:bg-muted/50"
                                  key={permission.name}
                                >
                                  <input
                                    type="checkbox"
                                    className="input"
                                    checked={isSelected(permission.name)}
                                    onChange={(event) =>
                                      togglePermission(
                                        permission.name,
                                        event.target.checked
                                      )
                                    }
                                  />
                                  <span className="text-sm text-foreground/90">
                                    {permission.displayName}
                                  </span>
                                </label>
                              ))}
                            </>
                          ) : null}
                        </div>
                      ))}
                    </>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
          {selectedPermissions.length > 0 ? (
            <div className="rounded-md bg-muted p-3">
              <p className="mb-2 text-xs text-muted-foreground">
                {"Selected permissions (" + selectedPermissions.length + "):"}
              </p>
              <ul className="space-y-1 font-mono text-xs">
                {selectedPermissions?.map((permission) => (
                  <li className="text-muted-foreground" key={permission}>
                    {permission}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>
      <footer className="flex items-center justify-end gap-3">
        <button
          type="button"
          className="btn"
          data-variant="outline"
          onClick={(event) => reset()}
        >
          Reset
        </button>
        <button
          type="button"
          className="btn"
          disabled={!canSubmit()}
          onClick={(event) => submit()}
        >
          {isEditMode ? <>Update Role</> : <>Create Role</>}
        </button>
      </footer>
    </div>
  );
}

export default RoleCreatorTree;
