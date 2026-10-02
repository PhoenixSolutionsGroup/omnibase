import { Show, For, createSignal, createMemo } from "solid-js";

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
  const [roleName, setRoleName] = createSignal("");

  const [showSuggestions, setShowSuggestions] = createSignal(false);

  const [isEditMode, setIsEditMode] = createSignal(false);

  const [editingRoleId, setEditingRoleId] = createSignal("");

  const [selectedNamespace, setSelectedNamespace] = createSignal("");

  const [selectedObjectId, setSelectedObjectId] = createSignal("");

  const [selectedPermissions, setSelectedPermissions] =
    createSignal(EMPTY_PERMISSIONS);

  const [openGroups, setOpenGroups] = createSignal(EMPTY_OPEN_GROUPS);

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
    return buildPermissionString(
      selectedNamespace(),
      relation,
      selectedObjectId()
    );
  }

  function subGroupKey(groupName: string, subGroupName: string) {
    return groupName + ":" + subGroupName;
  }

  const roleSuggestions = createMemo(() => {
    return (props.roles || []).map((role) => role.roleName);
  });

  const filteredSuggestions = createMemo(() => {
    const query = roleName().toLowerCase();
    return roleSuggestions().filter(
      (suggestion) => suggestion.toLowerCase().indexOf(query) !== -1
    );
  });

  const permissions = createMemo(() => {
    return buildOptions(selectedNamespace());
  });

  const grouped = createMemo(() => {
    return groupPermissions(permissions());
  });

  const groupList = createMemo(() => {
    return toGroupList(grouped());
  });

  const requiresObjectId = createMemo(() => {
    return (
      selectedNamespace() !== "" &&
      selectedNamespace().toLowerCase() !== "tenant"
    );
  });

  const availableObjects = createMemo(() => {
    const map: Record<string, NamespaceMapEntry[]> = props.namespaceMap || {};
    return map[selectedNamespace().toLowerCase()] || [];
  });

  const showTree = createMemo(() => {
    return (
      selectedNamespace() !== "" &&
      (!requiresObjectId() || selectedObjectId() !== "")
    );
  });

  const canSubmit = createMemo(() => {
    return roleName().trim().length > 0 && selectedPermissions().length > 0;
  });

  function isSelected(relation: string) {
    return selectedPermissions().indexOf(buildKey(relation)) !== -1;
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
    return openGroups().indexOf(key) !== -1;
  }

  function toggleGroup(key: string) {
    if (openGroups().indexOf(key) === -1) {
      setOpenGroups(openGroups().concat([key]));
    } else {
      setOpenGroups(openGroups().filter((item) => item !== key));
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
    const next = selectedPermissions().filter((item) => item !== key);
    if (checked) next.push(key);
    setSelectedPermissions(next);
  }

  function togglePermissions(relations: string[], checked: boolean) {
    const keys = relations.map((relation) => buildKey(relation));
    if (checked) {
      const next = selectedPermissions().slice();
      keys.forEach((key) => {
        if (next.indexOf(key) === -1) next.push(key);
      });
      setSelectedPermissions(next);
    } else {
      setSelectedPermissions(
        selectedPermissions().filter((item) => keys.indexOf(item) === -1)
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
    const permissionStrings = selectedPermissions().slice();
    if (isEditMode() && editingRoleId() !== "") {
      if (props.onRoleUpdate) {
        props.onRoleUpdate({
          role_id: editingRoleId(),
          role_name: roleName(),
          permissions: permissionStrings,
        });
      }
    } else if (props.onRoleCreate) {
      props.onRoleCreate({
        role_name: roleName(),
        permissions: permissionStrings,
      });
    }
  }

  return (
    <>
      <div class="card w-full max-w-4xl">
        <header>
          <h2>
            <Show fallback={<>Create New Role</>} when={isEditMode()}>
              {"Edit Role: " + roleName()}
            </Show>
          </h2>
          <p>
            <Show
              fallback={<>Define a new role with specific permissions</>}
              when={isEditMode()}
            >
              Update permissions for this existing role
            </Show>
          </p>
        </header>
        <section>
          <div class="relative">
            <label class="label" for="role-name">
              Role Name
            </label>
            <input
              class="input"
              id="role-name"
              type="text"
              placeholder="Enter role name (e.g., admin, developer, viewer)"
              value={roleName()}
              onInput={(event) => handleRoleName(event.target.value)}
              onFocus={(event) => showSuggestionList()}
              onBlur={(event) => hideSuggestionsSoon()}
            />
            <Show when={showSuggestions() && filteredSuggestions().length > 0}>
              <div class="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border bg-popover shadow-lg">
                <For each={filteredSuggestions()}>
                  {(suggestion, _index) => {
                    const index = _index();
                    return (
                      <button
                        class="w-full px-4 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                        type="button"
                        key={suggestion}
                        onMouseDown={(event) => selectSuggestion(suggestion)}
                      >
                        {suggestion}
                      </button>
                    );
                  }}
                </For>
              </div>
            </Show>
            <Show when={isEditMode()}>
              <p class="mt-1 text-xs text-amber-600 dark:text-amber-400">
                Editing existing role - changes will update all users with this
                role
              </p>
            </Show>
          </div>
          <hr class="my-6 border-border" />
          <div class="space-y-4">
            <span class="label">Permissions</span>
            <div class="flex flex-col gap-2 sm:flex-row">
              <div class="field flex-1">
                <label class="label" for="permission-namespace">
                  Namespace
                </label>
                <select
                  class="select"
                  id="permission-namespace"
                  value={selectedNamespace()}
                  onChange={(event) => selectNamespace(event.target.value)}
                >
                  <option value="">Select namespace...</option>
                  <For each={props.definitions}>
                    {(definition, _index) => {
                      const index = _index();
                      return (
                        <option
                          key={definition.namespace}
                          value={definition.namespace}
                        >
                          {definition.namespace}
                        </option>
                      );
                    }}
                  </For>
                </select>
              </div>
              <Show when={requiresObjectId()}>
                <div class="field flex-1">
                  <label class="label" for="permission-object">
                    Resource
                  </label>
                  <select
                    class="select"
                    id="permission-object"
                    value={selectedObjectId()}
                    onChange={(event) => selectObject(event.target.value)}
                    disabled={availableObjects().length === 0}
                  >
                    <option value="">
                      <Show
                        fallback={<>Select resource...</>}
                        when={availableObjects().length === 0}
                      >
                        No resources available
                      </Show>
                    </option>
                    <For each={availableObjects()}>
                      {(object, _index) => {
                        const index = _index();
                        return (
                          <option key={object.id} value={object.id}>
                            {object.label}
                          </option>
                        );
                      }}
                    </For>
                  </select>
                </div>
              </Show>
            </div>
            <Show when={showTree()}>
              <div class="max-h-[400px] overflow-y-auto rounded-md border p-2">
                <For each={grouped().ungrouped}>
                  {(permission, _index) => {
                    const index = _index();
                    return (
                      <label
                        class="flex cursor-pointer items-center gap-2.5 rounded px-2 py-1.5 hover:bg-muted/50"
                        key={permission.name}
                      >
                        <input
                          class="input"
                          type="checkbox"
                          checked={isSelected(permission.name)}
                          onInput={(event) =>
                            togglePermission(
                              permission.name,
                              event.target.checked
                            )
                          }
                        />
                        <span class="text-sm text-foreground/90">
                          {permission.displayName}
                        </span>
                      </label>
                    );
                  }}
                </For>
                <For each={groupList()}>
                  {(group, _index) => {
                    const index = _index();
                    return (
                      <div key={group.name}>
                        <div class="mt-1 flex items-center gap-2 rounded bg-muted/30 px-2 py-2 first:mt-0 hover:bg-muted/50">
                          <button
                            class="group rounded p-0.5 hover:bg-muted"
                            type="button"
                            aria-expanded={isGroupOpen(group.name)}
                            onClick={(event) => toggleGroup(group.name)}
                          >
                            <span
                              class="inline-block text-base leading-none text-foreground/70 transition-transform duration-200 group-aria-expanded:rotate-90"
                              aria-hidden="true"
                            >
                              ▸
                            </span>
                          </button>
                          <input
                            class="input"
                            type="checkbox"
                            checked={isGroupChecked(group.allRelations)}
                            onInput={(event) =>
                              togglePermissions(
                                group.allRelations,
                                event.target.checked
                              )
                            }
                          />
                          <button
                            class={
                              isGroupIndeterminate(group.allRelations)
                                ? "cursor-pointer select-none text-left text-sm font-semibold text-foreground/70"
                                : "cursor-pointer select-none text-left text-sm font-semibold text-foreground"
                            }
                            type="button"
                            onClick={(event) => toggleGroup(group.name)}
                          >
                            {group.name}
                          </button>
                        </div>
                        <Show when={isGroupOpen(group.name)}>
                          <For each={group.permissions}>
                            {(permission, _index) => {
                              const index = _index();
                              return (
                                <label
                                  class="flex cursor-pointer items-center gap-2.5 rounded py-1.5 pl-8 pr-2 hover:bg-muted/50"
                                  key={permission.name}
                                >
                                  <input
                                    class="input"
                                    type="checkbox"
                                    checked={isSelected(permission.name)}
                                    onInput={(event) =>
                                      togglePermission(
                                        permission.name,
                                        event.target.checked
                                      )
                                    }
                                  />
                                  <span class="text-sm text-foreground/90">
                                    {permission.displayName}
                                  </span>
                                </label>
                              );
                            }}
                          </For>
                          <For each={group.subGroups}>
                            {(subGroup, _index) => {
                              const index = _index();
                              return (
                                <div key={subGroup.name}>
                                  <div class="flex items-center gap-2 rounded py-1.5 pl-8 pr-2 hover:bg-muted/50">
                                    <button
                                      class="group rounded p-0.5 hover:bg-muted"
                                      type="button"
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
                                        class="inline-block text-xs leading-none text-muted-foreground transition-transform duration-200 group-aria-expanded:rotate-90"
                                        aria-hidden="true"
                                      >
                                        ▸
                                      </span>
                                    </button>
                                    <input
                                      class="input"
                                      type="checkbox"
                                      checked={isGroupChecked(
                                        subGroup.permissions.map(
                                          (permission) => permission.name
                                        )
                                      )}
                                      onInput={(event) =>
                                        togglePermissions(
                                          subGroup.permissions.map(
                                            (permission) => permission.name
                                          ),
                                          event.target.checked
                                        )
                                      }
                                    />
                                    <button
                                      class="cursor-pointer select-none text-left text-xs font-medium uppercase tracking-wider text-muted-foreground"
                                      type="button"
                                      onClick={(event) =>
                                        toggleGroup(
                                          subGroupKey(group.name, subGroup.name)
                                        )
                                      }
                                    >
                                      {subGroup.name}
                                    </button>
                                  </div>
                                  <Show
                                    when={isGroupOpen(
                                      subGroupKey(group.name, subGroup.name)
                                    )}
                                  >
                                    <For each={subGroup.permissions}>
                                      {(permission, _index) => {
                                        const index = _index();
                                        return (
                                          <label
                                            class="flex cursor-pointer items-center gap-2.5 rounded py-1.5 pl-14 pr-2 hover:bg-muted/50"
                                            key={permission.name}
                                          >
                                            <input
                                              class="input"
                                              type="checkbox"
                                              checked={isSelected(
                                                permission.name
                                              )}
                                              onInput={(event) =>
                                                togglePermission(
                                                  permission.name,
                                                  event.target.checked
                                                )
                                              }
                                            />
                                            <span class="text-sm text-foreground/90">
                                              {permission.displayName}
                                            </span>
                                          </label>
                                        );
                                      }}
                                    </For>
                                  </Show>
                                </div>
                              );
                            }}
                          </For>
                        </Show>
                      </div>
                    );
                  }}
                </For>
              </div>
            </Show>
            <Show when={selectedPermissions().length > 0}>
              <div class="rounded-md bg-muted p-3">
                <p class="mb-2 text-xs text-muted-foreground">
                  {"Selected permissions (" +
                    selectedPermissions().length +
                    "):"}
                </p>
                <ul class="space-y-1 font-mono text-xs">
                  <For each={selectedPermissions()}>
                    {(permission, _index) => {
                      const index = _index();
                      return (
                        <li class="text-muted-foreground" key={permission}>
                          {permission}
                        </li>
                      );
                    }}
                  </For>
                </ul>
              </div>
            </Show>
          </div>
        </section>
        <footer class="flex items-center justify-end gap-3">
          <button
            class="btn"
            type="button"
            data-variant="outline"
            onClick={(event) => reset()}
          >
            Reset
          </button>
          <button
            class="btn"
            type="button"
            disabled={!canSubmit()}
            onClick={(event) => submit()}
          >
            <Show fallback={<>Create Role</>} when={isEditMode()}>
              Update Role
            </Show>
          </button>
        </footer>
      </div>
    </>
  );
}

export default RoleCreatorTree;
