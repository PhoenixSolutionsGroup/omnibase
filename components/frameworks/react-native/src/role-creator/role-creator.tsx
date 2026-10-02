import * as React from "react";
import { View, Text, TextInput, Button } from "react-native";
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
    <View>
      <View>
        <View>
          {isEditMode ? (
            <>
              <Text>{"Edit Role: " + roleName}</Text>
            </>
          ) : (
            <>
              <Text>Create New Role</Text>
            </>
          )}
        </View>
        <View>
          {isEditMode ? (
            <>
              <Text>Update permissions for this existing role</Text>
            </>
          ) : (
            <>
              <Text>Define a new role with specific permissions</Text>
            </>
          )}
        </View>
      </View>
      <View>
        <View>
          <View htmlFor="role-name">
            <Text>Role Name</Text>
          </View>
          <TextInput
            id="role-name"
            type="text"
            placeholder="Enter role name (e.g., admin, developer, viewer)"
            value={roleName}
            onChange={(event) => handleRoleName(event.target.value)}
            onFocus={(event) => showSuggestionList()}
            onBlur={(event) => hideSuggestionsSoon()}
          />
          {showSuggestions && filteredSuggestions().length > 0 ? (
            <View>
              {filteredSuggestions()?.map((suggestion) => (
                <Button
                  type="button"
                  key={suggestion}
                  onMouseDown={(event) => selectSuggestion(suggestion)}
                >
                  <Text>{suggestion}</Text>
                </Button>
              ))}
            </View>
          ) : null}
          {isEditMode ? (
            <View>
              <Text>
                Editing existing role - changes will update all users with this
                role
              </Text>
            </View>
          ) : null}
        </View>
        <View />
        <View>
          <View>
            <Text>Permissions</Text>
          </View>
          <View>
            <View>
              <View htmlFor="permission-namespace">
                <Text>Namespace</Text>
              </View>
              <View
                id="permission-namespace"
                value={selectedNamespace}
                onChange={(event) => selectNamespace(event.target.value)}
              >
                <View value="">
                  <Text>Select namespace...</Text>
                </View>
                {props.definitions?.map((definition) => (
                  <View key={definition.namespace} value={definition.namespace}>
                    <Text>{definition.namespace}</Text>
                  </View>
                ))}
              </View>
            </View>
            {requiresObjectId() ? (
              <View>
                <View htmlFor="permission-object">
                  <Text>Resource</Text>
                </View>
                <View
                  id="permission-object"
                  value={selectedObjectId}
                  onChange={(event) => selectObject(event.target.value)}
                  disabled={availableObjects().length === 0}
                >
                  <View value="">
                    {availableObjects().length === 0 ? (
                      <>
                        <Text>No resources available</Text>
                      </>
                    ) : (
                      <>
                        <Text>Select resource...</Text>
                      </>
                    )}
                  </View>
                  {availableObjects()?.map((object) => (
                    <View key={object.id} value={object.id}>
                      <Text>{object.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}
          </View>
          {showTree() ? (
            <View>
              {grouped().ungrouped?.map((permission) => (
                <View key={permission.name}>
                  <TextInput
                    type="checkbox"
                    checked={isSelected(permission.name)}
                    onChange={(event) =>
                      togglePermission(permission.name, event.target.checked)
                    }
                  />
                  <View>
                    <Text>{permission.displayName}</Text>
                  </View>
                </View>
              ))}
              {groupList()?.map((group) => (
                <View key={group.name}>
                  <View>
                    <Button
                      type="button"
                      aria-expanded={isGroupOpen(group.name)}
                      onPress={(event) => toggleGroup(group.name)}
                    >
                      <View aria-hidden="true">
                        <Text>▸</Text>
                      </View>
                    </Button>
                    <TextInput
                      type="checkbox"
                      checked={isGroupChecked(group.allRelations)}
                      onChange={(event) =>
                        togglePermissions(
                          group.allRelations,
                          event.target.checked
                        )
                      }
                    />
                    <Button
                      type="button"
                      onPress={(event) => toggleGroup(group.name)}
                    >
                      <Text>{group.name}</Text>
                    </Button>
                  </View>
                  {isGroupOpen(group.name) ? (
                    <>
                      {group.permissions?.map((permission) => (
                        <View key={permission.name}>
                          <TextInput
                            type="checkbox"
                            checked={isSelected(permission.name)}
                            onChange={(event) =>
                              togglePermission(
                                permission.name,
                                event.target.checked
                              )
                            }
                          />
                          <View>
                            <Text>{permission.displayName}</Text>
                          </View>
                        </View>
                      ))}
                      {group.subGroups?.map((subGroup) => (
                        <View key={subGroup.name}>
                          <View>
                            <Button
                              type="button"
                              aria-expanded={isGroupOpen(
                                subGroupKey(group.name, subGroup.name)
                              )}
                              onPress={(event) =>
                                toggleGroup(
                                  subGroupKey(group.name, subGroup.name)
                                )
                              }
                            >
                              <View aria-hidden="true">
                                <Text>▸</Text>
                              </View>
                            </Button>
                            <TextInput
                              type="checkbox"
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
                            <Button
                              type="button"
                              onPress={(event) =>
                                toggleGroup(
                                  subGroupKey(group.name, subGroup.name)
                                )
                              }
                            >
                              <Text>{subGroup.name}</Text>
                            </Button>
                          </View>
                          {isGroupOpen(
                            subGroupKey(group.name, subGroup.name)
                          ) ? (
                            <>
                              {subGroup.permissions?.map((permission) => (
                                <View key={permission.name}>
                                  <TextInput
                                    type="checkbox"
                                    checked={isSelected(permission.name)}
                                    onChange={(event) =>
                                      togglePermission(
                                        permission.name,
                                        event.target.checked
                                      )
                                    }
                                  />
                                  <View>
                                    <Text>{permission.displayName}</Text>
                                  </View>
                                </View>
                              ))}
                            </>
                          ) : null}
                        </View>
                      ))}
                    </>
                  ) : null}
                </View>
              ))}
            </View>
          ) : null}
          {selectedPermissions.length > 0 ? (
            <View>
              <View>
                <Text>
                  {"Selected permissions (" + selectedPermissions.length + "):"}
                </Text>
              </View>
              <View>
                {selectedPermissions?.map((permission) => (
                  <View key={permission}>
                    <Text>{permission}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </View>
      </View>
      <View>
        <Button
          type="button"
          data-variant="outline"
          onPress={(event) => reset()}
        >
          <Text>Reset</Text>
        </Button>
        <Button
          type="button"
          disabled={!canSubmit()}
          onPress={(event) => submit()}
        >
          {isEditMode ? (
            <>
              <Text>Update Role</Text>
            </>
          ) : (
            <>
              <Text>Create Role</Text>
            </>
          )}
        </Button>
      </View>
    </View>
  );
}

export default RoleCreatorTree;
