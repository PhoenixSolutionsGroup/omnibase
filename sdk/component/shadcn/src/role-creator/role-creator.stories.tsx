import type { Meta, StoryObj } from "@storybook/react-vite";
import { RoleCreator } from ".";
import { mockRoleCreatorDefinitions } from "./mock-definitions";
import type { Role } from "@omnibase/core-js";

const mockRoles: Role[] = [
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
    createdAt: new Date("2024-02-20T14:45:00Z"),
    updatedAt: new Date("2024-02-20T14:45:00Z"),
  },
  {
    id: "role_3",
    tenantId: "tenant_1",
    roleName: "viewer",
    permissions: ["tenant#can_view_users", "tenant#can_view_api_keys"],
    userIds: ["user_6"],
    createdAt: new Date("2024-03-10T09:15:00Z"),
    updatedAt: new Date("2024-03-10T09:15:00Z"),
  },
];

const mockNamespaceMap = {
  project: [
    { id: "proj_main", label: "Main Project" },
    { id: "proj_staging", label: "Staging Environment" },
    { id: "proj_dev", label: "Development" },
  ],
};

const meta: Meta<typeof RoleCreator> = {
  title: "Permissions/RoleCreator",
  component: RoleCreator,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A form component for creating and editing roles with granular permissions. Supports autocomplete for existing roles and displays a live preview of the permissions being granted.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    definitions: {
      description:
        "Array of namespace definitions that define available permissions",
      control: false,
    },
    roles: {
      description: "Array of existing roles for autocomplete suggestions",
      control: false,
    },
    namespaceMap: {
      description: "Map of namespace to available resources for that namespace",
      control: false,
    },
    onRoleCreate: {
      description: "Callback fired when a new role is created",
      control: false,
    },
    onRoleUpdate: {
      description: "Callback fired when an existing role is updated",
      control: false,
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    definitions: mockRoleCreatorDefinitions,
    roles: mockRoles,
    namespaceMap: mockNamespaceMap,
    onRoleCreate: (roleData) => {
      console.log("Creating role:", roleData);
      alert(
        `Creating role: ${
          roleData.role_name
        }\nPermissions: ${roleData.permissions.join(", ")}`
      );
    },
    onRoleUpdate: (roleData) => {
      console.log("Updating role:", roleData);
      alert(
        `Updating role: ${
          roleData.role_name
        }\nPermissions: ${roleData.permissions.join(", ")}`
      );
    },
  },
};

export const EmptyState: Story = {
  args: {
    definitions: mockRoleCreatorDefinitions,
    roles: [],
    namespaceMap: mockNamespaceMap,
    onRoleCreate: (roleData) => {
      console.log("Creating role:", roleData);
    },
    onRoleUpdate: (roleData) => {
      console.log("Updating role:", roleData);
    },
  },
};

export const WithExistingRoles: Story = {
  args: {
    definitions: mockRoleCreatorDefinitions,
    roles: mockRoles,
    namespaceMap: mockNamespaceMap,
    onRoleCreate: (roleData) => {
      console.log("Creating role:", roleData);
    },
    onRoleUpdate: (roleData) => {
      console.log("Updating role:", roleData);
    },
  },
};

export const TenantOnlyNamespaces: Story = {
  args: {
    definitions: mockRoleCreatorDefinitions.filter(
      (d) => d.namespace === "Tenant"
    ),
    roles: mockRoles,
    namespaceMap: {},
    onRoleCreate: (roleData) => {
      console.log("Creating role:", roleData);
    },
    onRoleUpdate: (roleData) => {
      console.log("Updating role:", roleData);
    },
  },
};

export const WithManyProjects: Story = {
  args: {
    definitions: mockRoleCreatorDefinitions,
    roles: mockRoles,
    namespaceMap: {
      project: [
        { id: "proj_main", label: "Main Project" },
        { id: "proj_staging", label: "Staging Environment" },
        { id: "proj_dev", label: "Development" },
        { id: "proj_qa", label: "QA Environment" },
        { id: "proj_prod", label: "Production" },
        { id: "proj_demo", label: "Demo Environment" },
        { id: "proj_sandbox", label: "Sandbox" },
      ],
    },
    onRoleCreate: (roleData) => {
      console.log("Creating role:", roleData);
    },
    onRoleUpdate: (roleData) => {
      console.log("Updating role:", roleData);
    },
  },
};
