export interface RelationMetadata {
  displayName: string;
  group: string | null;
  name: string;
  subGroup: string | null;
}
export interface NamespaceDefinition {
  id: string;
  namespace: string;
  relations: string[] | null;
  relationsMetadata: RelationMetadata[] | null;
  subjectRelations: Record<string, string[] | null>;
  updatedAt: Date;
}
export interface Role {
  id: string;
  roleName: string;
  permissions: string[] | null;
  tenantId: string;
  templateId: string;
  userIds: string[] | null;
  createdAt: Date;
  updatedAt: Date;
}
export interface NamespaceMapEntry {
  id: string;
  label: string;
}
export interface RoleCreateData {
  role_name: string;
  permissions: string[];
}
export interface RoleUpdateData {
  role_id: string;
  role_name: string;
  permissions: string[];
}
export interface RoleCreatorTreeProps {
  definitions: NamespaceDefinition[];
  roles?: Role[];
  namespaceMap?: Record<string, NamespaceMapEntry[]>;
  onRoleCreate?: (data: RoleCreateData) => void;
  onRoleUpdate?: (data: RoleUpdateData) => void;
}
export interface PermissionOption {
  name: string;
  displayName: string;
  group: string | null;
  subGroup: string | null;
}
export interface PermissionSubGroup {
  name: string;
  permissions: PermissionOption[];
}
export interface PermissionGroup {
  name: string;
  permissions: PermissionOption[];
  subGroups: PermissionSubGroup[];
  allRelations: string[];
}
export interface GroupedPermissions {
  ungrouped: PermissionOption[];
  groups: Record<string, {
    permissions: PermissionOption[];
    subGroups: Record<string, PermissionOption[]>;
  }>;
}