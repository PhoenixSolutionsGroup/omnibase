<script lang="ts">
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

  export let definitions: RoleCreatorTreeProps["definitions"];
  export let roles: RoleCreatorTreeProps["roles"] = undefined;
  export let namespaceMap: RoleCreatorTreeProps["namespaceMap"] = undefined;
  export let onRoleUpdate: RoleCreatorTreeProps["onRoleUpdate"] = undefined;
  export let onRoleCreate: RoleCreatorTreeProps["onRoleCreate"] = undefined;

  function buildOptions(namespace: string) {
    const ns = namespace.toLowerCase();
    const definition = (definitions || []).find(
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
      openGroups = openGroups.concat([key]);
    } else {
      openGroups = openGroups.filter((item) => item !== key);
    }
  }
  function selectNamespace(namespace: string) {
    selectedNamespace = namespace;
    selectedObjectId = "";
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
    openGroups = keys;
  }
  function selectObject(objectId: string) {
    selectedObjectId = objectId;
  }
  function togglePermission(relation: string, checked: boolean) {
    const key = buildKey(relation);
    const next = selectedPermissions.filter((item) => item !== key);
    if (checked) next.push(key);
    selectedPermissions = next;
  }
  function togglePermissions(relations: string[], checked: boolean) {
    const keys = relations.map((relation) => buildKey(relation));
    if (checked) {
      const next = selectedPermissions.slice();
      keys.forEach((key) => {
        if (next.indexOf(key) === -1) next.push(key);
      });
      selectedPermissions = next;
    } else {
      selectedPermissions = selectedPermissions.filter(
        (item) => keys.indexOf(item) === -1
      );
    }
  }
  function handleRoleName(value: string) {
    roleName = value;
    const match = (roles || []).find(
      (role) => role.roleName.toLowerCase() === value.toLowerCase()
    );
    if (match) {
      isEditMode = true;
      editingRoleId = match.id;
      selectedPermissions = match.permissions ? match.permissions.slice() : [];
    } else {
      isEditMode = false;
      editingRoleId = "";
    }
  }
  function selectSuggestion(suggestion: string) {
    handleRoleName(suggestion);
    showSuggestions = false;
  }
  function hideSuggestionsSoon() {
    setTimeout(() => {
      showSuggestions = false;
    }, 200);
  }
  function showSuggestionList() {
    showSuggestions = true;
  }
  function reset() {
    roleName = "";
    showSuggestions = false;
    isEditMode = false;
    editingRoleId = "";
    selectedNamespace = "";
    selectedObjectId = "";
    selectedPermissions = [];
    openGroups = [];
  }
  function submit() {
    if (!canSubmit()) return;
    const permissionStrings = selectedPermissions.slice();
    if (isEditMode && editingRoleId !== "") {
      if (onRoleUpdate) {
        onRoleUpdate({
          role_id: editingRoleId,
          role_name: roleName,
          permissions: permissionStrings,
        });
      }
    } else if (onRoleCreate) {
      onRoleCreate({
        role_name: roleName,
        permissions: permissionStrings,
      });
    }
  }
  $: roleSuggestions = () => {
    return (roles || []).map((role) => role.roleName);
  };
  $: filteredSuggestions = () => {
    const query = roleName.toLowerCase();
    return roleSuggestions().filter(
      (suggestion) => suggestion.toLowerCase().indexOf(query) !== -1
    );
  };
  $: permissions = () => {
    return buildOptions(selectedNamespace);
  };
  $: grouped = () => {
    return groupPermissions(permissions());
  };
  $: groupList = () => {
    return toGroupList(grouped());
  };
  $: requiresObjectId = () => {
    return (
      selectedNamespace !== "" && selectedNamespace.toLowerCase() !== "tenant"
    );
  };
  $: availableObjects = () => {
    const map: Record<string, NamespaceMapEntry[]> = namespaceMap || {};
    return map[selectedNamespace.toLowerCase()] || [];
  };
  $: showTree = () => {
    return (
      selectedNamespace !== "" &&
      (!requiresObjectId() || selectedObjectId !== "")
    );
  };
  $: canSubmit = () => {
    return roleName.trim().length > 0 && selectedPermissions.length > 0;
  };

  let roleName = "";
  let showSuggestions = false;
  let isEditMode = false;
  let editingRoleId = "";
  let selectedNamespace = "";
  let selectedObjectId = "";
  let selectedPermissions = EMPTY_PERMISSIONS;
  let openGroups = EMPTY_OPEN_GROUPS;
</script>

<div class="card w-full max-w-4xl">
  <header>
    <h2>
      {#if isEditMode}
        {"Edit Role: " + roleName}
      {:else}
        Create New Role
      {/if}
    </h2>
    <p>
      {#if isEditMode}
        Update permissions for this existing role
      {:else}
        Define a new role with specific permissions
      {/if}
    </p>
  </header>
  <section>
    <div class="relative">
      <label class="label" for="role-name"> Role Name </label><input
        id="role-name"
        class="input"
        type="text"
        placeholder="Enter role name (e.g., admin, developer, viewer)"
        value={roleName}
        on:change={(event) => {
          handleRoleName(event.target.value);
        }}
        on:focus={(event) => {
          showSuggestionList();
        }}
        on:blur={(event) => {
          hideSuggestionsSoon();
        }}
      />
      {#if showSuggestions && filteredSuggestions().length > 0}
        <div
          class="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border bg-popover shadow-lg"
        >
          {#each filteredSuggestions() as suggestion (suggestion)}
            <button
              type="button"
              class="w-full px-4 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
              on:mousedown={(event) => {
                selectSuggestion(suggestion);
              }}>{suggestion}</button
            >
          {/each}
        </div>
      {/if}
      {#if isEditMode}
        <p class="mt-1 text-xs text-amber-600 dark:text-amber-400">
          Editing existing role - changes will update all users with this role
        </p>
      {/if}
    </div>
    <hr class="my-6 border-border" />
    <div class="space-y-4">
      <span class="label">Permissions</span>
      <div class="flex flex-col gap-2 sm:flex-row">
        <div class="field flex-1">
          <label class="label" for="permission-namespace">
            Namespace
          </label><select
            id="permission-namespace"
            class="select"
            value={selectedNamespace}
            on:change={(event) => {
              selectNamespace(event.target.value);
            }}
            ><option value="">Select namespace...</option>
            {#each definitions as definition (definition.namespace)}
              <option value={definition.namespace}
                >{definition.namespace}</option
              >
            {/each}
          </select>
        </div>
        {#if requiresObjectId()}
          <div class="field flex-1">
            <label class="label" for="permission-object">
              Resource
            </label><select
              id="permission-object"
              class="select"
              value={selectedObjectId}
              on:change={(event) => {
                selectObject(event.target.value);
              }}
              disabled={availableObjects().length === 0}
              ><option value="">
                {#if availableObjects().length === 0}
                  No resources available
                {:else}
                  Select resource...
                {/if}</option
              >
              {#each availableObjects() as object (object.id)}
                <option value={object.id}>{object.label}</option>
              {/each}
            </select>
          </div>
        {/if}
      </div>
      {#if showTree()}
        <div class="max-h-[400px] overflow-y-auto rounded-md border p-2">
          {#each grouped().ungrouped as permission (permission.name)}
            <label
              class="flex cursor-pointer items-center gap-2.5 rounded px-2 py-1.5 hover:bg-muted/50"
              ><input
                type="checkbox"
                class="input"
                checked={isSelected(permission.name)}
                on:change={(event) => {
                  togglePermission(permission.name, event.target.checked);
                }}
              /><span class="text-sm text-foreground/90"
                >{permission.displayName}</span
              ></label
            >
          {/each}

          {#each groupList() as group (group.name)}
            <div>
              <div
                class="mt-1 flex items-center gap-2 rounded bg-muted/30 px-2 py-2 first:mt-0 hover:bg-muted/50"
              >
                <button
                  type="button"
                  class="group rounded p-0.5 hover:bg-muted"
                  aria-expanded={isGroupOpen(group.name)}
                  on:click={(event) => {
                    toggleGroup(group.name);
                  }}
                  ><span
                    aria-hidden="true"
                    class="inline-block text-base leading-none text-foreground/70 transition-transform duration-200 group-aria-expanded:rotate-90"
                  >
                    ▸
                  </span></button
                ><input
                  type="checkbox"
                  class="input"
                  checked={isGroupChecked(group.allRelations)}
                  on:change={(event) => {
                    togglePermissions(group.allRelations, event.target.checked);
                  }}
                /><button
                  type="button"
                  class={isGroupIndeterminate(group.allRelations)
                    ? "cursor-pointer select-none text-left text-sm font-semibold text-foreground/70"
                    : "cursor-pointer select-none text-left text-sm font-semibold text-foreground"}
                  on:click={(event) => {
                    toggleGroup(group.name);
                  }}>{group.name}</button
                >
              </div>
              {#if isGroupOpen(group.name)}
                {#each group.permissions as permission (permission.name)}
                  <label
                    class="flex cursor-pointer items-center gap-2.5 rounded py-1.5 pl-8 pr-2 hover:bg-muted/50"
                    ><input
                      type="checkbox"
                      class="input"
                      checked={isSelected(permission.name)}
                      on:change={(event) => {
                        togglePermission(permission.name, event.target.checked);
                      }}
                    /><span class="text-sm text-foreground/90"
                      >{permission.displayName}</span
                    ></label
                  >
                {/each}

                {#each group.subGroups as subGroup (subGroup.name)}
                  <div>
                    <div
                      class="flex items-center gap-2 rounded py-1.5 pl-8 pr-2 hover:bg-muted/50"
                    >
                      <button
                        type="button"
                        class="group rounded p-0.5 hover:bg-muted"
                        aria-expanded={isGroupOpen(
                          subGroupKey(group.name, subGroup.name)
                        )}
                        on:click={(event) => {
                          toggleGroup(subGroupKey(group.name, subGroup.name));
                        }}
                        ><span
                          aria-hidden="true"
                          class="inline-block text-xs leading-none text-muted-foreground transition-transform duration-200 group-aria-expanded:rotate-90"
                        >
                          ▸
                        </span></button
                      ><input
                        type="checkbox"
                        class="input"
                        checked={isGroupChecked(
                          subGroup.permissions.map(
                            (permission) => permission.name
                          )
                        )}
                        on:change={(event) => {
                          togglePermissions(
                            subGroup.permissions.map(
                              (permission) => permission.name
                            ),
                            event.target.checked
                          );
                        }}
                      /><button
                        type="button"
                        class="cursor-pointer select-none text-left text-xs font-medium uppercase tracking-wider text-muted-foreground"
                        on:click={(event) => {
                          toggleGroup(subGroupKey(group.name, subGroup.name));
                        }}>{subGroup.name}</button
                      >
                    </div>
                    {#if isGroupOpen(subGroupKey(group.name, subGroup.name))}
                      {#each subGroup.permissions as permission (permission.name)}
                        <label
                          class="flex cursor-pointer items-center gap-2.5 rounded py-1.5 pl-14 pr-2 hover:bg-muted/50"
                          ><input
                            type="checkbox"
                            class="input"
                            checked={isSelected(permission.name)}
                            on:change={(event) => {
                              togglePermission(
                                permission.name,
                                event.target.checked
                              );
                            }}
                          /><span class="text-sm text-foreground/90"
                            >{permission.displayName}</span
                          ></label
                        >
                      {/each}
                    {/if}
                  </div>
                {/each}
              {/if}
            </div>
          {/each}
        </div>
      {/if}
      {#if selectedPermissions.length > 0}
        <div class="rounded-md bg-muted p-3">
          <p class="mb-2 text-xs text-muted-foreground">
            {"Selected permissions (" + selectedPermissions.length + "):"}
          </p>
          <ul class="space-y-1 font-mono text-xs">
            {#each selectedPermissions as permission (permission)}
              <li class="text-muted-foreground">{permission}</li>
            {/each}
          </ul>
        </div>
      {/if}
    </div>
  </section>
  <footer class="flex items-center justify-end gap-3">
    <button
      type="button"
      class="btn"
      data-variant="outline"
      on:click={(event) => {
        reset();
      }}
    >
      Reset
    </button><button
      type="button"
      class="btn"
      disabled={!canSubmit()}
      on:click={(event) => {
        submit();
      }}
    >
      {#if isEditMode}
        Update Role
      {:else}
        Create Role
      {/if}</button
    >
  </footer>
</div>