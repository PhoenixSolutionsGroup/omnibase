import {
  Component,
  output,
  input,
  effect,
  VERSION,
  signal,
  computed,
  InputSignal,
} from "@angular/core";
import { CommonModule } from "@angular/common";

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

@Component({
  selector: "role-creator-tree",
  standalone: true,
  imports: [CommonModule],
  template: `<div class="card w-full max-w-4xl">
    <header>
      <h2>
        @if(isEditMode()){ {{'Edit Role: ' + roleName()}} }@else{ Create New
        Role }
      </h2>
      <p>
        @if(isEditMode()){ Update permissions for this existing role }@else{
        Define a new role with specific permissions }
      </p>
    </header>
    <section>
      <div class="relative">
        <label class="label" for="role-name"> Role Name </label>
        <input
          id="role-name"
          class="input"
          type="text"
          placeholder="Enter role name (e.g., admin, developer, viewer)"
          [attr.value]="roleName()"
          (change)="handleRoleName($event.target.value)"
          (focus)="showSuggestionList()"
          (blur)="hideSuggestionsSoon()"
        />
        @if(showSuggestions() && filteredSuggestions().length > 0){
        <div
          class="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border bg-popover shadow-lg"
        >
          @for (suggestion of filteredSuggestions();track trackBySuggestion0(i,
          suggestion);let i = $index) {
          <button
            type="button"
            class="w-full px-4 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
            (mousedown)="selectSuggestion(suggestion)"
          >
            {{suggestion}}
          </button>
          }
        </div>
        } @if(isEditMode()){
        <p class="mt-1 text-xs text-amber-600 dark:text-amber-400">
          Editing existing role - changes will update all users with this role
        </p>
        }
      </div>
      <hr class="my-6 border-border" />
      <div class="space-y-4">
        <span class="label">Permissions</span>
        <div class="flex flex-col gap-2 sm:flex-row">
          <div class="field flex-1">
            <label class="label" for="permission-namespace"> Namespace </label>
            <select
              id="permission-namespace"
              class="select"
              [attr.value]="selectedNamespace()"
              (change)="selectNamespace($event.target.value)"
            >
              <option value="">Select namespace...</option>

              @for (definition of definitions();track trackByDefinition1(i,
              definition);let i = $index) {
              <option [attr.value]="definition.namespace">
                {{definition.namespace}}
              </option>
              }
            </select>
          </div>
          @if(requiresObjectId()){
          <div class="field flex-1">
            <label class="label" for="permission-object"> Resource </label>
            <select
              id="permission-object"
              class="select"
              [attr.value]="selectedObjectId()"
              (change)="selectObject($event.target.value)"
              [attr.disabled]="availableObjects().length === 0"
            >
              <option value="">
                @if(availableObjects().length === 0){ No resources available
                }@else{ Select resource... }
              </option>

              @for (object of availableObjects();track trackByObject2(i,
              object);let i = $index) {
              <option [attr.value]="object.id">{{object.label}}</option>
              }
            </select>
          </div>
          }
        </div>
        @if(showTree()){
        <div class="max-h-[400px] overflow-y-auto rounded-md border p-2">
          @for (permission of grouped().ungrouped;track trackByPermission3(i,
          permission);let i = $index) {
          <label
            class="flex cursor-pointer items-center gap-2.5 rounded px-2 py-1.5 hover:bg-muted/50"
            ><input
              type="checkbox"
              class="input"
              [attr.checked]="isSelected(permission.name)"
              (change)="togglePermission(permission.name, $event.target.checked)"
            />
            <span
              class="text-sm text-foreground/90"
              >{{permission.displayName}}</span
            ></label
          >
          } @for (group of groupList();track trackByGroup4(i, group);let i =
          $index) {
          <div>
            <div
              class="mt-1 flex items-center gap-2 rounded bg-muted/30 px-2 py-2 first:mt-0 hover:bg-muted/50"
            >
              <button
                type="button"
                class="group rounded p-0.5 hover:bg-muted"
                [attr.aria-expanded]="isGroupOpen(group.name)"
                (click)="toggleGroup(group.name)"
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
                [attr.checked]="isGroupChecked(group.allRelations)"
                (change)="togglePermissions(group.allRelations, $event.target.checked)"
              />
              <button
                type="button"
                [class]="isGroupIndeterminate(group.allRelations) ? 'cursor-pointer select-none text-left text-sm font-semibold text-foreground/70' : 'cursor-pointer select-none text-left text-sm font-semibold text-foreground'"
                (click)="toggleGroup(group.name)"
              >
                {{group.name}}
              </button>
            </div>
            @if(isGroupOpen(group.name)){ @for (permission of
            group.permissions;track trackByPermission5(i, permission);let i =
            $index) {
            <label
              class="flex cursor-pointer items-center gap-2.5 rounded py-1.5 pl-8 pr-2 hover:bg-muted/50"
              ><input
                type="checkbox"
                class="input"
                [attr.checked]="isSelected(permission.name)"
                (change)="togglePermission(permission.name, $event.target.checked)"
              />
              <span
                class="text-sm text-foreground/90"
                >{{permission.displayName}}</span
              ></label
            >
            } @for (subGroup of group.subGroups;track trackBySubGroup6(i,
            subGroup);let i = $index) {
            <div>
              <div
                class="flex items-center gap-2 rounded py-1.5 pl-8 pr-2 hover:bg-muted/50"
              >
                <button
                  type="button"
                  class="group rounded p-0.5 hover:bg-muted"
                  [attr.aria-expanded]="isGroupOpen(subGroupKey(group.name, subGroup.name))"
                  (click)="toggleGroup(subGroupKey(group.name, subGroup.name))"
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
                  [attr.checked]="isGroupChecked(subGroup.permissions.map(permission => permission.name))"
                  (change)="togglePermissions(subGroup.permissions.map(permission => permission.name), $event.target.checked)"
                />
                <button
                  type="button"
                  class="cursor-pointer select-none text-left text-xs font-medium uppercase tracking-wider text-muted-foreground"
                  (click)="toggleGroup(subGroupKey(group.name, subGroup.name))"
                >
                  {{subGroup.name}}
                </button>
              </div>
              @if(isGroupOpen(subGroupKey(group.name, subGroup.name))){ @for
              (permission of subGroup.permissions;track trackByPermission7(i,
              permission);let i = $index) {
              <label
                class="flex cursor-pointer items-center gap-2.5 rounded py-1.5 pl-14 pr-2 hover:bg-muted/50"
                ><input
                  type="checkbox"
                  class="input"
                  [attr.checked]="isSelected(permission.name)"
                  (change)="togglePermission(permission.name, $event.target.checked)"
                />
                <span
                  class="text-sm text-foreground/90"
                  >{{permission.displayName}}</span
                ></label
              >
              } }
            </div>
            } }
          </div>
          }
        </div>
        } @if(selectedPermissions().length > 0){
        <div class="rounded-md bg-muted p-3">
          <p class="mb-2 text-xs text-muted-foreground">
            {{'Selected permissions (' + selectedPermissions().length + '):'}}
          </p>
          <ul class="space-y-1 font-mono text-xs">
            @for (permission of selectedPermissions();track
            trackByPermission8(i, permission);let i = $index) {
            <li class="text-muted-foreground">{{permission}}</li>
            }
          </ul>
        </div>
        }
      </div>
    </section>
    <footer class="flex items-center justify-end gap-3">
      <button
        type="button"
        class="btn"
        data-variant="outline"
        (click)="reset()"
      >
        Reset
      </button>
      <button
        type="button"
        class="btn"
        [attr.disabled]="!canSubmit()"
        (click)="submit()"
      >
        @if(isEditMode()){ Update Role }@else{ Create Role }
      </button>
    </footer>
  </div> `,
  styles: `:host { display: contents; }`,
})
export default class RoleCreatorTree {
  definitions: InputSignal<RoleCreatorTreeProps["definitions"]> =
    input<RoleCreatorTreeProps["definitions"]>();
  roles: InputSignal<RoleCreatorTreeProps["roles"]> =
    input<RoleCreatorTreeProps["roles"]>();
  namespaceMap: InputSignal<RoleCreatorTreeProps["namespaceMap"]> =
    input<RoleCreatorTreeProps["namespaceMap"]>();
  roleUpdate = output<
    Parameters<Required<RoleCreatorTreeProps>["onRoleUpdate"]>[number] | void
  >();
  roleCreate = output<
    Parameters<Required<RoleCreatorTreeProps>["onRoleCreate"]>[number] | void
  >();

  roleName = signal("");
  showSuggestions = signal(false);
  isEditMode = signal(false);
  editingRoleId = signal("");
  selectedNamespace = signal("");
  selectedObjectId = signal("");
  selectedPermissions = signal(EMPTY_PERMISSIONS);
  openGroups = signal(EMPTY_OPEN_GROUPS);

  roleSuggestions = computed(() => {
    return (this.roles() || []).map((role) => role.roleName);
  });
  filteredSuggestions = computed(() => {
    const query = this.roleName().toLowerCase();
    return this.roleSuggestions().filter(
      (suggestion) => suggestion.toLowerCase().indexOf(query) !== -1
    );
  });
  permissions = computed(() => {
    return this.buildOptions(this.selectedNamespace());
  });
  grouped = computed(() => {
    return groupPermissions(this.permissions());
  });
  groupList = computed(() => {
    return toGroupList(this.grouped());
  });
  requiresObjectId = computed(() => {
    return (
      this.selectedNamespace() !== "" &&
      this.selectedNamespace().toLowerCase() !== "tenant"
    );
  });
  availableObjects = computed(() => {
    const map: Record<string, NamespaceMapEntry[]> = this.namespaceMap() || {};
    return map[this.selectedNamespace().toLowerCase()] || [];
  });
  showTree = computed(() => {
    return (
      this.selectedNamespace() !== "" &&
      (!this.requiresObjectId() || this.selectedObjectId() !== "")
    );
  });
  canSubmit = computed(() => {
    return (
      this.roleName().trim().length > 0 && this.selectedPermissions().length > 0
    );
  });
  buildOptions(namespace: string) {
    const ns = namespace.toLowerCase();
    const definition = (this.definitions() || []).find(
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
  buildKey(relation: string) {
    return buildPermissionString(
      this.selectedNamespace(),
      relation,
      this.selectedObjectId()
    );
  }
  subGroupKey(groupName: string, subGroupName: string) {
    return groupName + ":" + subGroupName;
  }
  isSelected(relation: string) {
    return this.selectedPermissions().indexOf(this.buildKey(relation)) !== -1;
  }
  isGroupChecked(relations: string[]) {
    const selected = relations.filter((relation) => this.isSelected(relation));
    return relations.length > 0 && selected.length === relations.length;
  }
  isGroupIndeterminate(relations: string[]) {
    const selected = relations.filter((relation) => this.isSelected(relation));
    return selected.length > 0 && selected.length < relations.length;
  }
  isGroupOpen(key: string) {
    return this.openGroups().indexOf(key) !== -1;
  }
  toggleGroup(key: string) {
    if (this.openGroups().indexOf(key) === -1) {
      this.openGroups.set(this.openGroups().concat([key]));
    } else {
      this.openGroups.set(this.openGroups().filter((item) => item !== key));
    }
  }
  selectNamespace(namespace: string) {
    this.selectedNamespace.set(namespace);
    this.selectedObjectId.set("");
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
    this.openGroups.set(keys);
  }
  selectObject(objectId: string) {
    this.selectedObjectId.set(objectId);
  }
  togglePermission(relation: string, checked: boolean) {
    const key = this.buildKey(relation);
    const next = this.selectedPermissions().filter((item) => item !== key);
    if (checked) next.push(key);
    this.selectedPermissions.set(next);
  }
  togglePermissions(relations: string[], checked: boolean) {
    const keys = relations.map((relation) => this.buildKey(relation));
    if (checked) {
      const next = this.selectedPermissions().slice();
      keys.forEach((key) => {
        if (next.indexOf(key) === -1) next.push(key);
      });
      this.selectedPermissions.set(next);
    } else {
      this.selectedPermissions.set(
        this.selectedPermissions().filter((item) => keys.indexOf(item) === -1)
      );
    }
  }
  handleRoleName(value: string) {
    this.roleName.set(value);
    const match = (this.roles() || []).find(
      (role) => role.roleName.toLowerCase() === value.toLowerCase()
    );
    if (match) {
      this.isEditMode.set(true);
      this.editingRoleId.set(match.id);
      this.selectedPermissions.set(
        match.permissions ? match.permissions.slice() : []
      );
    } else {
      this.isEditMode.set(false);
      this.editingRoleId.set("");
    }
  }
  selectSuggestion(suggestion: string) {
    this.handleRoleName(suggestion);
    this.showSuggestions.set(false);
  }
  hideSuggestionsSoon() {
    setTimeout(() => {
      this.showSuggestions.set(false);
    }, 200);
  }
  showSuggestionList() {
    this.showSuggestions.set(true);
  }
  reset() {
    this.roleName.set("");
    this.showSuggestions.set(false);
    this.isEditMode.set(false);
    this.editingRoleId.set("");
    this.selectedNamespace.set("");
    this.selectedObjectId.set("");
    this.selectedPermissions.set([]);
    this.openGroups.set([]);
  }
  submit() {
    if (!this.canSubmit()) return;
    const permissionStrings = this.selectedPermissions().slice();
    if (this.isEditMode() && this.editingRoleId() !== "") {
      if (this.roleUpdate) {
        this.roleUpdate.emit({
          role_id: this.editingRoleId(),
          role_name: this.roleName(),
          permissions: permissionStrings,
        });
      }
    } else if (this.roleCreate) {
      this.roleCreate.emit({
        role_name: this.roleName(),
        permissions: permissionStrings,
      });
    }
  }
  trackBySuggestion0(_: number, suggestion: any) {
    return suggestion;
  }
  trackByDefinition1(_: number, definition: any) {
    return definition.namespace;
  }
  trackByObject2(_: number, object: any) {
    return object.id;
  }
  trackByPermission3(_: number, permission: any) {
    return permission.name;
  }
  trackByGroup4(_: number, group: any) {
    return group.name;
  }
  trackByPermission5(_: number, permission: any) {
    return permission.name;
  }
  trackBySubGroup6(_: number, subGroup: any) {
    return subGroup.name;
  }
  trackByPermission7(_: number, permission: any) {
    return permission.name;
  }
  trackByPermission8(_: number, permission: any) {
    return permission;
  }

  constructor() {}
}
