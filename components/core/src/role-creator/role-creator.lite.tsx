import { For, Show, useStore } from "@builder.io/mitosis";
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

export default function RoleCreatorTree(props: RoleCreatorTreeProps) {
  const state = useStore({
    roleName: "",
    showSuggestions: false,
    isEditMode: false,
    editingRoleId: "",
    selectedNamespace: "",
    selectedObjectId: "",
    selectedPermissions: EMPTY_PERMISSIONS,
    openGroups: EMPTY_OPEN_GROUPS,

    buildOptions(namespace: string): PermissionOption[] {
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
    },

    buildKey(relation: string): string {
      return buildPermissionString(
        state.selectedNamespace,
        relation,
        state.selectedObjectId
      );
    },

    subGroupKey(groupName: string, subGroupName: string): string {
      return groupName + ":" + subGroupName;
    },

    get roleSuggestions(): string[] {
      return (props.roles || []).map((role) => role.roleName);
    },

    get filteredSuggestions(): string[] {
      const query = state.roleName.toLowerCase();
      return state.roleSuggestions.filter(
        (suggestion) => suggestion.toLowerCase().indexOf(query) !== -1
      );
    },

    get permissions(): PermissionOption[] {
      return state.buildOptions(state.selectedNamespace);
    },

    get grouped() {
      return groupPermissions(state.permissions);
    },

    get groupList() {
      return toGroupList(state.grouped);
    },

    get requiresObjectId(): boolean {
      return (
        state.selectedNamespace !== "" &&
        state.selectedNamespace.toLowerCase() !== "tenant"
      );
    },

    get availableObjects(): NamespaceMapEntry[] {
      const map: Record<string, NamespaceMapEntry[]> = props.namespaceMap || {};
      return map[state.selectedNamespace.toLowerCase()] || [];
    },

    get showTree(): boolean {
      return (
        state.selectedNamespace !== "" &&
        (!state.requiresObjectId || state.selectedObjectId !== "")
      );
    },

    get canSubmit(): boolean {
      return (
        state.roleName.trim().length > 0 &&
        state.selectedPermissions.length > 0
      );
    },

    isSelected(relation: string): boolean {
      return state.selectedPermissions.indexOf(state.buildKey(relation)) !== -1;
    },

    isGroupChecked(relations: string[]): boolean {
      const selected = relations.filter((relation) =>
        state.isSelected(relation)
      );
      return relations.length > 0 && selected.length === relations.length;
    },

    isGroupIndeterminate(relations: string[]): boolean {
      const selected = relations.filter((relation) =>
        state.isSelected(relation)
      );
      return selected.length > 0 && selected.length < relations.length;
    },

    isGroupOpen(key: string): boolean {
      return state.openGroups.indexOf(key) !== -1;
    },

    toggleGroup(key: string) {
      if (state.openGroups.indexOf(key) === -1) {
        state.openGroups = state.openGroups.concat([key]);
      } else {
        state.openGroups = state.openGroups.filter((item) => item !== key);
      }
    },

    selectNamespace(namespace: string) {
      state.selectedNamespace = namespace;
      state.selectedObjectId = "";
      const groupedOptions = groupPermissions(state.buildOptions(namespace));
      const keys: string[] = [];
      Object.keys(groupedOptions.groups).forEach((groupName) => {
        keys.push(groupName);
        Object.keys(groupedOptions.groups[groupName].subGroups).forEach(
          (subName) => {
            keys.push(groupName + ":" + subName);
          }
        );
      });
      state.openGroups = keys;
    },

    selectObject(objectId: string) {
      state.selectedObjectId = objectId;
    },

    togglePermission(relation: string, checked: boolean) {
      const key = state.buildKey(relation);
      const next = state.selectedPermissions.filter((item) => item !== key);
      if (checked) next.push(key);
      state.selectedPermissions = next;
    },

    togglePermissions(relations: string[], checked: boolean) {
      const keys = relations.map((relation) => state.buildKey(relation));
      if (checked) {
        const next = state.selectedPermissions.slice();
        keys.forEach((key) => {
          if (next.indexOf(key) === -1) next.push(key);
        });
        state.selectedPermissions = next;
      } else {
        state.selectedPermissions = state.selectedPermissions.filter(
          (item) => keys.indexOf(item) === -1
        );
      }
    },

    handleRoleName(value: string) {
      state.roleName = value;
      const match = (props.roles || []).find(
        (role) => role.roleName.toLowerCase() === value.toLowerCase()
      );

      if (match) {
        state.isEditMode = true;
        state.editingRoleId = match.id;
        state.selectedPermissions = match.permissions
          ? match.permissions.slice()
          : [];
      } else {
        state.isEditMode = false;
        state.editingRoleId = "";
      }
    },

    selectSuggestion(suggestion: string) {
      state.handleRoleName(suggestion);
      state.showSuggestions = false;
    },

    hideSuggestionsSoon() {
      setTimeout(() => {
        state.showSuggestions = false;
      }, 200);
    },

    showSuggestionList() {
      state.showSuggestions = true;
    },

    reset() {
      state.roleName = "";
      state.showSuggestions = false;
      state.isEditMode = false;
      state.editingRoleId = "";
      state.selectedNamespace = "";
      state.selectedObjectId = "";
      state.selectedPermissions = [];
      state.openGroups = [];
    },

    submit() {
      if (!state.canSubmit) return;
      const permissionStrings = state.selectedPermissions.slice();

      if (state.isEditMode && state.editingRoleId !== "") {
        if (props.onRoleUpdate) {
          props.onRoleUpdate({
            role_id: state.editingRoleId,
            role_name: state.roleName,
            permissions: permissionStrings,
          });
        }
      } else if (props.onRoleCreate) {
        props.onRoleCreate({
          role_name: state.roleName,
          permissions: permissionStrings,
        });
      }
    },
  });

  return (
    <div class="card w-full max-w-4xl">
      <header>
        <h2>
          {state.isEditMode ? 'Edit Role: ' + state.roleName : 'Create New Role'}
        </h2>
        <p>
          {state.isEditMode
            ? 'Update permissions for this existing role'
            : 'Define a new role with specific permissions'}
        </p>
      </header>

      <section>
        <div class="relative">
          <label class="label" for="role-name">
            Role Name
          </label>
          <input
            id="role-name"
            class="input"
            type="text"
            placeholder="Enter role name (e.g., admin, developer, viewer)"
            value={state.roleName}
            onChange={(event) => state.handleRoleName(event.target.value)}
            onFocus={() => state.showSuggestionList()}
            onBlur={() => state.hideSuggestionsSoon()}
          />

          <Show
            when={state.showSuggestions && state.filteredSuggestions.length > 0}
          >
            <div class="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border bg-popover shadow-lg">
              <For each={state.filteredSuggestions}>
                {(suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    class="w-full px-4 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                    onMouseDown={() => state.selectSuggestion(suggestion)}
                  >
                    {suggestion}
                  </button>
                )}
              </For>
            </div>
          </Show>

          <Show when={state.isEditMode}>
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
                id="permission-namespace"
                class="select"
                value={state.selectedNamespace}
                onChange={(event) => state.selectNamespace(event.target.value)}
              >
                <option value="">Select namespace...</option>
                <For each={props.definitions}>
                  {(definition) => (
                    <option key={definition.namespace} value={definition.namespace}>
                      {definition.namespace}
                    </option>
                  )}
                </For>
              </select>
            </div>

            <Show when={state.requiresObjectId}>
              <div class="field flex-1">
                <label class="label" for="permission-object">
                  Resource
                </label>
                <select
                  id="permission-object"
                  class="select"
                  value={state.selectedObjectId}
                  onChange={(event) => state.selectObject(event.target.value)}
                  disabled={state.availableObjects.length === 0}
                >
                  <option value="">
                    {state.availableObjects.length === 0
                      ? 'No resources available'
                      : 'Select resource...'}
                  </option>
                  <For each={state.availableObjects}>
                    {(object) => (
                      <option key={object.id} value={object.id}>{object.label}</option>
                    )}
                  </For>
                </select>
              </div>
            </Show>
          </div>

          <Show when={state.showTree}>
            <div class="max-h-[400px] overflow-y-auto rounded-md border p-2">
              <For each={state.grouped.ungrouped}>
                {(permission) => (
                  <label key={permission.name} class="flex cursor-pointer items-center gap-2.5 rounded px-2 py-1.5 hover:bg-muted/50">
                    <input
                      type="checkbox"
                      class="input"
                      checked={state.isSelected(permission.name)}
                      onChange={(event) =>
                        state.togglePermission(
                          permission.name,
                          event.target.checked
                        )
                      }
                    />
                    <span class="text-sm text-foreground/90">
                      {permission.displayName}
                    </span>
                  </label>
                )}
              </For>

              <For each={state.groupList}>
                {(group) => (
                  <div key={group.name}>
                    <div class="mt-1 flex items-center gap-2 rounded bg-muted/30 px-2 py-2 first:mt-0 hover:bg-muted/50">
                      <button
                        type="button"
                        class="group rounded p-0.5 hover:bg-muted"
                        aria-expanded={state.isGroupOpen(group.name)}
                        onClick={() => state.toggleGroup(group.name)}
                      >
                        <span
                          aria-hidden="true"
                          class="inline-block text-base leading-none text-foreground/70 transition-transform duration-200 group-aria-expanded:rotate-90"
                        >
                          ▸
                        </span>
                      </button>
                      <input
                        type="checkbox"
                        class="input"
                        checked={state.isGroupChecked(group.allRelations)}
                        onChange={(event) =>
                          state.togglePermissions(
                            group.allRelations,
                            event.target.checked
                          )
                        }
                      />
                      <button
                        type="button"
                        class={
                          state.isGroupIndeterminate(group.allRelations)
                            ? 'cursor-pointer select-none text-left text-sm font-semibold text-foreground/70'
                            : 'cursor-pointer select-none text-left text-sm font-semibold text-foreground'
                        }
                        onClick={() => state.toggleGroup(group.name)}
                      >
                        {group.name}
                      </button>
                    </div>

                    <Show when={state.isGroupOpen(group.name)}>
                      <For each={group.permissions}>
                        {(permission) => (
                          <label key={permission.name} class="flex cursor-pointer items-center gap-2.5 rounded py-1.5 pl-8 pr-2 hover:bg-muted/50">
                            <input
                              type="checkbox"
                              class="input"
                              checked={state.isSelected(permission.name)}
                              onChange={(event) =>
                                state.togglePermission(
                                  permission.name,
                                  event.target.checked
                                )
                              }
                            />
                            <span class="text-sm text-foreground/90">
                              {permission.displayName}
                            </span>
                          </label>
                        )}
                      </For>

                      <For each={group.subGroups}>
                        {(subGroup) => (
                          <div key={subGroup.name}>
                            <div class="flex items-center gap-2 rounded py-1.5 pl-8 pr-2 hover:bg-muted/50">
                              <button
                                type="button"
                                class="group rounded p-0.5 hover:bg-muted"
                                aria-expanded={state.isGroupOpen(
                                  state.subGroupKey(group.name, subGroup.name)
                                )}
                                onClick={() =>
                                  state.toggleGroup(
                                    state.subGroupKey(group.name, subGroup.name)
                                  )
                                }
                              >
                                <span
                                  aria-hidden="true"
                                  class="inline-block text-xs leading-none text-muted-foreground transition-transform duration-200 group-aria-expanded:rotate-90"
                                >
                                  ▸
                                </span>
                              </button>
                              <input
                                type="checkbox"
                                class="input"
                                checked={state.isGroupChecked(
                                  subGroup.permissions.map(
                                    (permission) => permission.name
                                  )
                                )}
                                onChange={(event) =>
                                  state.togglePermissions(
                                    subGroup.permissions.map(
                                      (permission) => permission.name
                                    ),
                                    event.target.checked
                                  )
                                }
                              />
                              <button
                                type="button"
                                class="cursor-pointer select-none text-left text-xs font-medium uppercase tracking-wider text-muted-foreground"
                                onClick={() =>
                                  state.toggleGroup(
                                    state.subGroupKey(group.name, subGroup.name)
                                  )
                                }
                              >
                                {subGroup.name}
                              </button>
                            </div>

                            <Show
                              when={state.isGroupOpen(
                                state.subGroupKey(group.name, subGroup.name)
                              )}
                            >
                              <For each={subGroup.permissions}>
                                {(permission) => (
                                  <label key={permission.name} class="flex cursor-pointer items-center gap-2.5 rounded py-1.5 pl-14 pr-2 hover:bg-muted/50">
                                    <input
                                      type="checkbox"
                                      class="input"
                                      checked={state.isSelected(permission.name)}
                                      onChange={(event) =>
                                        state.togglePermission(
                                          permission.name,
                                          event.target.checked
                                        )
                                      }
                                    />
                                    <span class="text-sm text-foreground/90">
                                      {permission.displayName}
                                    </span>
                                  </label>
                                )}
                              </For>
                            </Show>
                          </div>
                        )}
                      </For>
                    </Show>
                  </div>
                )}
              </For>
            </div>
          </Show>

          <Show when={state.selectedPermissions.length > 0}>
            <div class="rounded-md bg-muted p-3">
              <p class="mb-2 text-xs text-muted-foreground">
                {'Selected permissions (' +
                  state.selectedPermissions.length +
                  '):'}
              </p>
              <ul class="space-y-1 font-mono text-xs">
                <For each={state.selectedPermissions}>
                  {(permission) => (
                    <li key={permission} class="text-muted-foreground">{permission}</li>
                  )}
                </For>
              </ul>
            </div>
          </Show>
        </div>
      </section>

      <footer class="flex items-center justify-end gap-3">
        <button
          type="button"
          class="btn"
          data-variant="outline"
          onClick={() => state.reset()}
        >
          Reset
        </button>
        <button
          type="button"
          class="btn"
          disabled={!state.canSubmit}
          onClick={() => state.submit()}
        >
          {state.isEditMode ? 'Update Role' : 'Create Role'}
        </button>
      </footer>
    </div>
  );
}
