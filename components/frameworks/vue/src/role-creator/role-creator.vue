<template>
  <div class="card w-full max-w-4xl">
    <header>
      <h2>
        <template v-if="isEditMode">
          {{ "Edit Role: " + roleName }}
        </template>

        <template v-else> Create New Role </template>
      </h2>
      <p>
        <template v-if="isEditMode">
          Update permissions for this existing role
        </template>

        <template v-else>
          Define a new role with specific permissions
        </template>
      </p>
    </header>
    <section>
      <div class="relative">
        <label class="label" for="role-name"> Role Name </label
        ><input
          id="role-name"
          class="input"
          type="text"
          placeholder="Enter role name (e.g., admin, developer, viewer)"
          :value="roleName"
          @change="async (event) => handleRoleName(event.target.value)"
          @focus="async (event) => showSuggestionList()"
          @blur="async (event) => hideSuggestionsSoon()"
        />
        <template v-if="showSuggestions && filteredSuggestions.length > 0">
          <div
            class="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border bg-popover shadow-lg"
          >
            <template
              :key="suggestion"
              v-for="(suggestion, index) in filteredSuggestions"
            >
              <button
                type="button"
                class="w-full px-4 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                @mousedown="async (event) => selectSuggestion(suggestion)"
              >
                {{ suggestion }}
              </button>
            </template>
          </div>
        </template>

        <template v-if="isEditMode">
          <p class="mt-1 text-xs text-amber-600 dark:text-amber-400">
            Editing existing role - changes will update all users with this role
          </p>
        </template>
      </div>
      <hr class="my-6 border-border" />
      <div class="space-y-4">
        <span class="label">Permissions</span>
        <div class="flex flex-col gap-2 sm:flex-row">
          <div class="field flex-1">
            <label class="label" for="permission-namespace"> Namespace </label
            ><select
              id="permission-namespace"
              class="select"
              :value="selectedNamespace"
              @change="async (event) => selectNamespace(event.target.value)"
            >
              <option value="">Select namespace...</option>
              <template
                :key="definition.namespace"
                v-for="(definition, index) in definitions"
              >
                <option :value="definition.namespace">
                  {{ definition.namespace }}
                </option>
              </template>
            </select>
          </div>
          <template v-if="requiresObjectId">
            <div class="field flex-1">
              <label class="label" for="permission-object"> Resource </label
              ><select
                id="permission-object"
                class="select"
                :value="selectedObjectId"
                @change="async (event) => selectObject(event.target.value)"
                :disabled="availableObjects.length === 0"
              >
                <option value="">
                  <template v-if="availableObjects.length === 0">
                    No resources available
                  </template>

                  <template v-else> Select resource... </template>
                </option>
                <template
                  :key="object.id"
                  v-for="(object, index) in availableObjects"
                >
                  <option :value="object.id">{{ object.label }}</option>
                </template>
              </select>
            </div>
          </template>
        </div>
        <template v-if="showTree">
          <div class="max-h-[400px] overflow-y-auto rounded-md border p-2">
            <template
              :key="permission.name"
              v-for="(permission, index) in grouped.ungrouped"
            >
              <label
                class="flex cursor-pointer items-center gap-2.5 rounded px-2 py-1.5 hover:bg-muted/50"
                ><input
                  type="checkbox"
                  class="input"
                  :checked="isSelected(permission.name)"
                  @change="
                    async (event) =>
                      togglePermission(permission.name, event.target.checked)
                  "
                /><span class="text-sm text-foreground/90">{{
                  permission.displayName
                }}</span></label
              > </template
            ><template :key="group.name" v-for="(group, index) in groupList">
              <div>
                <div
                  class="mt-1 flex items-center gap-2 rounded bg-muted/30 px-2 py-2 first:mt-0 hover:bg-muted/50"
                >
                  <button
                    type="button"
                    class="group rounded p-0.5 hover:bg-muted"
                    :aria-expanded="isGroupOpen(group.name)"
                    @click="async (event) => toggleGroup(group.name)"
                  >
                    <span
                      aria-hidden="true"
                      class="inline-block text-base leading-none text-foreground/70 transition-transform duration-200 group-aria-expanded:rotate-90"
                    >
                      ▸
                    </span></button
                  ><input
                    type="checkbox"
                    class="input"
                    :checked="isGroupChecked(group.allRelations)"
                    @change="
                      async (event) =>
                        togglePermissions(
                          group.allRelations,
                          event.target.checked
                        )
                    "
                  /><button
                    type="button"
                    :class="
                      isGroupIndeterminate(group.allRelations)
                        ? 'cursor-pointer select-none text-left text-sm font-semibold text-foreground/70'
                        : 'cursor-pointer select-none text-left text-sm font-semibold text-foreground'
                    "
                    @click="async (event) => toggleGroup(group.name)"
                  >
                    {{ group.name }}
                  </button>
                </div>
                <template v-if="isGroupOpen(group.name)">
                  <template
                    :key="permission.name"
                    v-for="(permission, index) in group.permissions"
                  >
                    <label
                      class="flex cursor-pointer items-center gap-2.5 rounded py-1.5 pl-8 pr-2 hover:bg-muted/50"
                      ><input
                        type="checkbox"
                        class="input"
                        :checked="isSelected(permission.name)"
                        @change="
                          async (event) =>
                            togglePermission(
                              permission.name,
                              event.target.checked
                            )
                        "
                      /><span class="text-sm text-foreground/90">{{
                        permission.displayName
                      }}</span></label
                    >
                  </template>
                  <template
                    :key="subGroup.name"
                    v-for="(subGroup, index) in group.subGroups"
                  >
                    <div>
                      <div
                        class="flex items-center gap-2 rounded py-1.5 pl-8 pr-2 hover:bg-muted/50"
                      >
                        <button
                          type="button"
                          class="group rounded p-0.5 hover:bg-muted"
                          :aria-expanded="
                            isGroupOpen(subGroupKey(group.name, subGroup.name))
                          "
                          @click="
                            async (event) =>
                              toggleGroup(
                                subGroupKey(group.name, subGroup.name)
                              )
                          "
                        >
                          <span
                            aria-hidden="true"
                            class="inline-block text-xs leading-none text-muted-foreground transition-transform duration-200 group-aria-expanded:rotate-90"
                          >
                            ▸
                          </span></button
                        ><input
                          type="checkbox"
                          class="input"
                          :checked="
                            isGroupChecked(
                              subGroup.permissions.map(
                                (permission) => permission.name
                              )
                            )
                          "
                          @change="
                            async (event) =>
                              togglePermissions(
                                subGroup.permissions.map(
                                  (permission) => permission.name
                                ),
                                event.target.checked
                              )
                          "
                        /><button
                          type="button"
                          class="cursor-pointer select-none text-left text-xs font-medium uppercase tracking-wider text-muted-foreground"
                          @click="
                            async (event) =>
                              toggleGroup(
                                subGroupKey(group.name, subGroup.name)
                              )
                          "
                        >
                          {{ subGroup.name }}
                        </button>
                      </div>
                      <template
                        v-if="
                          isGroupOpen(subGroupKey(group.name, subGroup.name))
                        "
                      >
                        <template
                          :key="permission.name"
                          v-for="(permission, index) in subGroup.permissions"
                        >
                          <label
                            class="flex cursor-pointer items-center gap-2.5 rounded py-1.5 pl-14 pr-2 hover:bg-muted/50"
                            ><input
                              type="checkbox"
                              class="input"
                              :checked="isSelected(permission.name)"
                              @change="
                                async (event) =>
                                  togglePermission(
                                    permission.name,
                                    event.target.checked
                                  )
                              "
                            /><span class="text-sm text-foreground/90">{{
                              permission.displayName
                            }}</span></label
                          >
                        </template>
                      </template>
                    </div>
                  </template>
                </template>
              </div>
            </template>
          </div>
        </template>

        <template v-if="selectedPermissions.length > 0">
          <div class="rounded-md bg-muted p-3">
            <p class="mb-2 text-xs text-muted-foreground">
              {{ "Selected permissions (" + selectedPermissions.length + "):" }}
            </p>
            <ul class="space-y-1 font-mono text-xs">
              <template
                :key="permission"
                v-for="(permission, index) in selectedPermissions"
              >
                <li class="text-muted-foreground">{{ permission }}</li>
              </template>
            </ul>
          </div>
        </template>
      </div>
    </section>
    <footer class="flex items-center justify-end gap-3">
      <button
        type="button"
        class="btn"
        data-variant="outline"
        @click="async (event) => reset()"
      >
        Reset</button
      ><button
        type="button"
        class="btn"
        :disabled="!canSubmit"
        @click="async (event) => submit()"
      >
        <template v-if="isEditMode"> Update Role </template>

        <template v-else> Create Role </template>
      </button>
    </footer>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

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

export default defineComponent({
  name: "role-creator-tree",

  props: [
    "definitions",
    "roles",
    "namespaceMap",
    "onRoleUpdate",
    "onRoleCreate",
  ],

  data() {
    return {
      roleName: "",
      showSuggestions: false,
      isEditMode: false,
      editingRoleId: "",
      selectedNamespace: "",
      selectedObjectId: "",
      selectedPermissions: EMPTY_PERMISSIONS,
      openGroups: EMPTY_OPEN_GROUPS,
    };
  },

  computed: {
    roleSuggestions() {
      return (this.roles || []).map((role) => role.roleName);
    },
    filteredSuggestions() {
      const query = this.roleName.toLowerCase();
      return this.roleSuggestions.filter(
        (suggestion) => suggestion.toLowerCase().indexOf(query) !== -1
      );
    },
    permissions() {
      return this.buildOptions(this.selectedNamespace);
    },
    grouped() {
      return groupPermissions(this.permissions);
    },
    groupList() {
      return toGroupList(this.grouped);
    },
    requiresObjectId() {
      return (
        this.selectedNamespace !== "" &&
        this.selectedNamespace.toLowerCase() !== "tenant"
      );
    },
    availableObjects() {
      const map: Record<string, NamespaceMapEntry[]> = this.namespaceMap || {};
      return map[this.selectedNamespace.toLowerCase()] || [];
    },
    showTree() {
      return (
        this.selectedNamespace !== "" &&
        (!this.requiresObjectId || this.selectedObjectId !== "")
      );
    },
    canSubmit() {
      return (
        this.roleName.trim().length > 0 && this.selectedPermissions.length > 0
      );
    },
  },

  methods: {
    buildOptions(namespace: string) {
      const ns = namespace.toLowerCase();
      const definition = (this.definitions || []).find(
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
    buildKey(relation: string) {
      return buildPermissionString(
        this.selectedNamespace,
        relation,
        this.selectedObjectId
      );
    },
    subGroupKey(groupName: string, subGroupName: string) {
      return groupName + ":" + subGroupName;
    },
    isSelected(relation: string) {
      return this.selectedPermissions.indexOf(this.buildKey(relation)) !== -1;
    },
    isGroupChecked(relations: string[]) {
      const selected = relations.filter((relation) =>
        this.isSelected(relation)
      );
      return relations.length > 0 && selected.length === relations.length;
    },
    isGroupIndeterminate(relations: string[]) {
      const selected = relations.filter((relation) =>
        this.isSelected(relation)
      );
      return selected.length > 0 && selected.length < relations.length;
    },
    isGroupOpen(key: string) {
      return this.openGroups.indexOf(key) !== -1;
    },
    toggleGroup(key: string) {
      if (this.openGroups.indexOf(key) === -1) {
        this.openGroups = this.openGroups.concat([key]);
      } else {
        this.openGroups = this.openGroups.filter((item) => item !== key);
      }
    },
    selectNamespace(namespace: string) {
      this.selectedNamespace = namespace;
      this.selectedObjectId = "";
      const groupedOptions = groupPermissions(this.buildOptions(namespace));
      const keys: string[] = [];
      Object.keys(groupedOptions.groups).forEach((groupName) => {
        keys.push(groupName);
        Object.keys(groupedOptions.groups[groupName].subGroups).forEach(
          (subName) => {
            keys.push(groupName + ":" + subName);
          }
        );
      });
      this.openGroups = keys;
    },
    selectObject(objectId: string) {
      this.selectedObjectId = objectId;
    },
    togglePermission(relation: string, checked: boolean) {
      const key = this.buildKey(relation);
      const next = this.selectedPermissions.filter((item) => item !== key);
      if (checked) next.push(key);
      this.selectedPermissions = next;
    },
    togglePermissions(relations: string[], checked: boolean) {
      const keys = relations.map((relation) => this.buildKey(relation));
      if (checked) {
        const next = this.selectedPermissions.slice();
        keys.forEach((key) => {
          if (next.indexOf(key) === -1) next.push(key);
        });
        this.selectedPermissions = next;
      } else {
        this.selectedPermissions = this.selectedPermissions.filter(
          (item) => keys.indexOf(item) === -1
        );
      }
    },
    handleRoleName(value: string) {
      this.roleName = value;
      const match = (this.roles || []).find(
        (role) => role.roleName.toLowerCase() === value.toLowerCase()
      );
      if (match) {
        this.isEditMode = true;
        this.editingRoleId = match.id;
        this.selectedPermissions = match.permissions
          ? match.permissions.slice()
          : [];
      } else {
        this.isEditMode = false;
        this.editingRoleId = "";
      }
    },
    selectSuggestion(suggestion: string) {
      this.handleRoleName(suggestion);
      this.showSuggestions = false;
    },
    hideSuggestionsSoon() {
      setTimeout(() => {
        this.showSuggestions = false;
      }, 200);
    },
    showSuggestionList() {
      this.showSuggestions = true;
    },
    reset() {
      this.roleName = "";
      this.showSuggestions = false;
      this.isEditMode = false;
      this.editingRoleId = "";
      this.selectedNamespace = "";
      this.selectedObjectId = "";
      this.selectedPermissions = [];
      this.openGroups = [];
    },
    submit() {
      if (!this.canSubmit) return;
      const permissionStrings = this.selectedPermissions.slice();
      if (this.isEditMode && this.editingRoleId !== "") {
        if (this.onRoleUpdate) {
          this.onRoleUpdate({
            role_id: this.editingRoleId,
            role_name: this.roleName,
            permissions: permissionStrings,
          });
        }
      } else if (this.onRoleCreate) {
        this.onRoleCreate({
          role_name: this.roleName,
          permissions: permissionStrings,
        });
      }
    },
  },
});
</script>