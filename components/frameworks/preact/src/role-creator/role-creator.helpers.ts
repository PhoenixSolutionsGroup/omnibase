import type { GroupedPermissions, PermissionGroup, PermissionOption } from "./role-creator.types";
export const EMPTY_PERMISSIONS: string[] = [];
export const EMPTY_OPEN_GROUPS: string[] = [];
export function formatRelation(relation: string): string {
  const stripped = relation.indexOf("can_") === 0 ? relation.slice(4) : relation;
  return stripped.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}
export function buildPermissionString(namespace: string, relation: string, objectId: string): string {
  const ns = namespace.toLowerCase();
  if (ns === "tenant" || objectId === "") {
    return ns + "#" + relation;
  }
  return ns + ":" + objectId + "#" + relation;
}
export function groupPermissions(permissions: PermissionOption[]): GroupedPermissions {
  const result: GroupedPermissions = {
    ungrouped: [],
    groups: {}
  };
  for (const permission of permissions) {
    if (!permission.group) {
      result.ungrouped.push(permission);
      continue;
    }
    if (!result.groups[permission.group]) {
      result.groups[permission.group] = {
        permissions: [],
        subGroups: {}
      };
    }
    if (permission.subGroup) {
      if (!result.groups[permission.group].subGroups[permission.subGroup]) {
        result.groups[permission.group].subGroups[permission.subGroup] = [];
      }
      result.groups[permission.group].subGroups[permission.subGroup].push(permission);
    } else {
      result.groups[permission.group].permissions.push(permission);
    }
  }
  return result;
}
export function toGroupList(grouped: GroupedPermissions): PermissionGroup[] {
  return Object.keys(grouped.groups).map(name => {
    const group = grouped.groups[name];
    const subGroups = Object.keys(group.subGroups).map(subGroupName => ({
      name: subGroupName,
      permissions: group.subGroups[subGroupName]
    }));
    const allRelations = group.permissions.map(permission => permission.name).concat(subGroups.reduce((accumulator, subGroup) => accumulator.concat(subGroup.permissions.map(permission => permission.name)), [] as string[]));
    return {
      name,
      permissions: group.permissions,
      subGroups,
      allRelations
    };
  });
}