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

export const mockRoleCreatorDefinitions: NamespaceDefinition[] = [
  {
    id: "76e04dcc-2ab5-45aa-96da-8239f7ca01f2",
    namespace: "Project",
    relations: [
      "can_view_db_secret_key",
      "can_rotate_keys",
      "can_view_database_password",
      "can_view_database_connection_string",
      "can_view_api_service_key",
      "can_update_project_env",
      "can_view_project_env",
      "can_view_storage_credentials",
      "parent_project",
      "tenant",
    ],
    relationsMetadata: null,
    subjectRelations: {
      ApiKey: [
        "can_view_db_secret_key",
        "can_rotate_keys",
        "can_view_database_password",
        "can_view_database_connection_string",
        "can_view_api_service_key",
        "can_update_project_env",
        "can_view_project_env",
        "can_view_storage_credentials",
      ],
      Project: ["parent_project"],
      Tenant: ["tenant"],
      User: [
        "can_view_db_secret_key",
        "can_rotate_keys",
        "can_view_database_password",
        "can_view_database_connection_string",
        "can_view_api_service_key",
        "can_update_project_env",
        "can_view_project_env",
        "can_view_storage_credentials",
      ],
    },
    updatedAt: new Date(),
  },
  {
    id: "165d9786-7666-4b1f-ab7a-96e25238480f",
    namespace: "Tenant",
    relations: [
      "can_rotate_keys",
      "can_view_db_secret_key",
      "can_view_database_password",
      "can_view_database_connection_string",
      "can_view_api_service_key",
      "can_update_project_env",
      "can_view_project_env",
      "can_view_storage_credentials",
      "can_delete_tenant",
      "can_invite_user",
      "can_update_user_role",
      "can_update_user_role_to_owner",
      "can_remove_owner_role",
      "can_remove_user",
      "can_view_users",
      "can_update_roles",
      "can_create_api_keys",
      "can_view_api_keys",
      "can_revoke_api_keys",
    ],
    relationsMetadata: null,
    subjectRelations: {
      ApiKey: [
        "can_rotate_keys",
        "can_view_db_secret_key",
        "can_view_database_password",
        "can_view_database_connection_string",
        "can_view_api_service_key",
        "can_update_project_env",
        "can_view_project_env",
        "can_view_storage_credentials",
      ],
      User: [
        "can_rotate_keys",
        "can_view_db_secret_key",
        "can_view_database_password",
        "can_view_database_connection_string",
        "can_view_api_service_key",
        "can_update_project_env",
        "can_view_project_env",
        "can_view_storage_credentials",
        "can_delete_tenant",
        "can_invite_user",
        "can_update_user_role",
        "can_update_user_role_to_owner",
        "can_remove_owner_role",
        "can_remove_user",
        "can_view_users",
        "can_update_roles",
        "can_create_api_keys",
        "can_view_api_keys",
        "can_revoke_api_keys",
      ],
    },
    updatedAt: new Date(),
  },
];

export const mockEnrichedDefinitions: NamespaceDefinition[] = [
  {
    id: "76e04dcc-2ab5-45aa-96da-8239f7ca01f2",
    namespace: "Project",
    relations: [
      "can_view_db_secret_key",
      "can_rotate_keys",
      "can_view_database_password",
      "can_view_database_connection_string",
      "can_view_api_service_key",
      "can_update_project_env",
      "can_view_project_env",
      "can_view_storage_credentials",
      "parent_project",
      "tenant",
    ],
    relationsMetadata: [
      {
        name: "can_view_db_secret_key",
        displayName: "View DB Secret Key",
        group: "Database",
        subGroup: "Secrets",
        roles: ["owner", "admin"],
        subjects: ["User", "ApiKey"],
      },
      {
        name: "can_rotate_keys",
        displayName: "Rotate Keys",
        group: "Database",
        subGroup: "Secrets",
        roles: ["owner", "admin"],
        subjects: ["User", "ApiKey"],
      },
      {
        name: "can_view_database_password",
        displayName: "View Database Password",
        group: "Database",
        subGroup: "Secrets",
        roles: ["owner", "admin"],
        subjects: ["User", "ApiKey"],
      },
      {
        name: "can_view_database_connection_string",
        displayName: "View Connection String",
        group: "Database",
        subGroup: "Connection",
        roles: ["owner", "admin", "developer"],
        subjects: ["User", "ApiKey"],
      },
      {
        name: "can_view_api_service_key",
        displayName: "View API Service Key",
        group: "API",
        roles: ["owner", "admin"],
        subjects: ["User", "ApiKey"],
      },
      {
        name: "can_update_project_env",
        displayName: "Update Environment",
        group: "Configuration",
        roles: ["owner", "admin", "developer"],
        subjects: ["User", "ApiKey"],
      },
      {
        name: "can_view_project_env",
        displayName: "View Environment",
        group: "Configuration",
        roles: ["owner", "admin", "developer", "viewer"],
        subjects: ["User", "ApiKey"],
      },
      {
        name: "can_view_storage_credentials",
        displayName: "View Storage Credentials",
        group: "Storage",
        roles: ["owner", "admin"],
        subjects: ["User", "ApiKey"],
      },
    ] as unknown as RelationMetadata[],
    subjectRelations: {
      ApiKey: [
        "can_view_db_secret_key",
        "can_rotate_keys",
        "can_view_database_password",
        "can_view_database_connection_string",
        "can_view_api_service_key",
        "can_update_project_env",
        "can_view_project_env",
        "can_view_storage_credentials",
      ],
      Project: ["parent_project"],
      Tenant: ["tenant"],
      User: [
        "can_view_db_secret_key",
        "can_rotate_keys",
        "can_view_database_password",
        "can_view_database_connection_string",
        "can_view_api_service_key",
        "can_update_project_env",
        "can_view_project_env",
        "can_view_storage_credentials",
      ],
    },
    updatedAt: new Date(),
  },
  {
    id: "165d9786-7666-4b1f-ab7a-96e25238480f",
    namespace: "Tenant",
    relations: [
      "can_rotate_keys",
      "can_view_db_secret_key",
      "can_view_database_password",
      "can_view_database_connection_string",
      "can_view_api_service_key",
      "can_update_project_env",
      "can_view_project_env",
      "can_view_storage_credentials",
      "can_delete_tenant",
      "can_invite_user",
      "can_update_user_role",
      "can_update_user_role_to_owner",
      "can_remove_owner_role",
      "can_remove_user",
      "can_view_users",
      "can_update_roles",
      "can_create_api_keys",
      "can_view_api_keys",
      "can_revoke_api_keys",
    ],
    relationsMetadata: [
      {
        name: "can_invite_user",
        displayName: "Invite Users",
        group: "User Management",
        roles: ["owner", "admin"],
        subjects: ["User"],
      },
      {
        name: "can_view_users",
        displayName: "View Users",
        group: "User Management",
        roles: ["owner", "admin", "member"],
        subjects: ["User"],
      },
      {
        name: "can_remove_user",
        displayName: "Remove Users",
        group: "User Management",
        roles: ["owner", "admin"],
        subjects: ["User"],
      },
      {
        name: "can_update_user_role",
        displayName: "Update User Roles",
        group: "User Management",
        subGroup: "Role Assignment",
        roles: ["owner", "admin"],
        subjects: ["User"],
      },
      {
        name: "can_update_user_role_to_owner",
        displayName: "Promote to Owner",
        group: "User Management",
        subGroup: "Role Assignment",
        roles: ["owner"],
        subjects: ["User"],
      },
      {
        name: "can_remove_owner_role",
        displayName: "Demote Owner",
        group: "User Management",
        subGroup: "Role Assignment",
        roles: ["owner"],
        subjects: ["User"],
      },
      {
        name: "can_update_roles",
        displayName: "Manage Roles",
        group: "Roles & Permissions",
        roles: ["owner", "admin"],
        subjects: ["User"],
      },
      {
        name: "can_create_api_keys",
        displayName: "Create API Keys",
        group: "API Keys",
        roles: ["owner", "admin"],
        subjects: ["User"],
      },
      {
        name: "can_view_api_keys",
        displayName: "View API Keys",
        group: "API Keys",
        roles: ["owner", "admin", "developer"],
        subjects: ["User"],
      },
      {
        name: "can_revoke_api_keys",
        displayName: "Revoke API Keys",
        group: "API Keys",
        roles: ["owner", "admin"],
        subjects: ["User"],
      },
      {
        name: "can_delete_tenant",
        displayName: "Delete Tenant",
        group: "Tenant Administration",
        roles: ["owner"],
        subjects: ["User"],
      },
      {
        name: "can_view_db_secret_key",
        displayName: "View DB Secret Key",
        group: "Database",
        subGroup: "Secrets",
        roles: ["owner", "admin"],
        subjects: ["User", "ApiKey"],
      },
      {
        name: "can_rotate_keys",
        displayName: "Rotate Keys",
        group: "Database",
        subGroup: "Secrets",
        roles: ["owner", "admin"],
        subjects: ["User", "ApiKey"],
      },
      {
        name: "can_view_database_password",
        displayName: "View Database Password",
        group: "Database",
        subGroup: "Secrets",
        roles: ["owner", "admin"],
        subjects: ["User", "ApiKey"],
      },
      {
        name: "can_view_database_connection_string",
        displayName: "View Connection String",
        group: "Database",
        subGroup: "Connection",
        roles: ["owner", "admin", "developer"],
        subjects: ["User", "ApiKey"],
      },
      {
        name: "can_view_api_service_key",
        displayName: "View API Service Key",
        group: "API",
        roles: ["owner", "admin"],
        subjects: ["User", "ApiKey"],
      },
      {
        name: "can_update_project_env",
        displayName: "Update Environment",
        group: "Configuration",
        roles: ["owner", "admin", "developer"],
        subjects: ["User", "ApiKey"],
      },
      {
        name: "can_view_project_env",
        displayName: "View Environment",
        group: "Configuration",
        roles: ["owner", "admin", "developer", "viewer"],
        subjects: ["User", "ApiKey"],
      },
      {
        name: "can_view_storage_credentials",
        displayName: "View Storage Credentials",
        group: "Storage",
        roles: ["owner", "admin"],
        subjects: ["User", "ApiKey"],
      },
    ] as unknown as RelationMetadata[],
    subjectRelations: {
      ApiKey: [
        "can_rotate_keys",
        "can_view_db_secret_key",
        "can_view_database_password",
        "can_view_database_connection_string",
        "can_view_api_service_key",
        "can_update_project_env",
        "can_view_project_env",
        "can_view_storage_credentials",
      ],
      User: [
        "can_rotate_keys",
        "can_view_db_secret_key",
        "can_view_database_password",
        "can_view_database_connection_string",
        "can_view_api_service_key",
        "can_update_project_env",
        "can_view_project_env",
        "can_view_storage_credentials",
        "can_delete_tenant",
        "can_invite_user",
        "can_update_user_role",
        "can_update_user_role_to_owner",
        "can_remove_owner_role",
        "can_remove_user",
        "can_view_users",
        "can_update_roles",
        "can_create_api_keys",
        "can_view_api_keys",
        "can_revoke_api_keys",
      ],
    },
    updatedAt: new Date(),
  },
];

export const mockRoles: Role[] = [
  {
    id: "role_1",
    tenantId: "tenant_1",
    roleName: "admin",
    permissions: [
      "tenant#can_delete_tenant",
      "tenant#can_invite_user",
      "tenant#can_update_user_role",
      "tenant#can_view_users",
      "tenant#can_create_api_keys",
      "tenant#can_view_api_keys",
      "tenant#can_revoke_api_keys",
    ],
    userIds: ["user_1", "user_2"],
    templateId: "template_admin",
    createdAt: new Date("2024-01-15T10:30:00Z"),
    updatedAt: new Date("2024-01-15T10:30:00Z"),
  },
  {
    id: "role_2",
    tenantId: "tenant_1",
    roleName: "developer",
    permissions: [
      "tenant#can_view_database_connection_string",
      "tenant#can_view_api_service_key",
      "tenant#can_view_project_env",
      "project:proj_main#can_view_database_connection_string",
    ],
    userIds: ["user_3", "user_4", "user_5"],
    templateId: "template_developer",
    createdAt: new Date("2024-02-20T14:45:00Z"),
    updatedAt: new Date("2024-02-20T14:45:00Z"),
  },
  {
    id: "role_3",
    tenantId: "tenant_1",
    roleName: "viewer",
    permissions: ["tenant#can_view_users", "tenant#can_view_api_keys"],
    userIds: ["user_6"],
    templateId: "template_viewer",
    createdAt: new Date("2024-03-10T09:15:00Z"),
    updatedAt: new Date("2024-03-10T09:15:00Z"),
  },
];

export const mockNamespaceMap: Record<string, NamespaceMapEntry[]> = {
  project: [
    { id: "proj_main", label: "Main Project" },
    { id: "proj_staging", label: "Staging Environment" },
    { id: "proj_dev", label: "Development" },
  ],
};

export const mockManyProjects: Record<string, NamespaceMapEntry[]> = {
  project: [
    { id: "proj_main", label: "Main Project" },
    { id: "proj_staging", label: "Staging Environment" },
    { id: "proj_dev", label: "Development" },
    { id: "proj_qa", label: "QA Environment" },
    { id: "proj_prod", label: "Production" },
    { id: "proj_demo", label: "Demo Environment" },
    { id: "proj_sandbox", label: "Sandbox" },
  ],
};
