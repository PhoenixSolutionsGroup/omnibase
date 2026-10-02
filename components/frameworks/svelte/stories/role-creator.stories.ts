import type { Meta, StoryObj } from "@storybook/svelte-vite";
import { RoleCreatorTree } from "../src";
import {
  mockEnrichedDefinitions,
  mockManyProjects,
  mockNamespaceMap,
  mockRoleCreatorDefinitions,
  mockRoles,
} from "@omnibase/mitosis-storybook/mock-data";

const onRoleCreate = (roleData: {
  role_name: string;
  permissions: string[];
}) => {
  console.log("Creating role:", roleData);
};

const onRoleUpdate = (roleData: {
  role_id: string;
  role_name: string;
  permissions: string[];
}) => {
  console.log("Updating role:", roleData);
};

const meta: Meta<typeof RoleCreatorTree> = {
  title: "Permissions/RoleCreatorTree",
  component: RoleCreatorTree,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    definitions: { control: false },
    roles: { control: false },
    namespaceMap: { control: false },
    onRoleCreate: { control: false },
    onRoleUpdate: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    definitions: mockRoleCreatorDefinitions,
    roles: mockRoles,
    namespaceMap: mockNamespaceMap,
    onRoleCreate,
    onRoleUpdate,
  },
};

export const EmptyState: Story = {
  args: {
    definitions: mockRoleCreatorDefinitions,
    roles: [],
    namespaceMap: mockNamespaceMap,
    onRoleCreate,
    onRoleUpdate,
  },
};

export const TenantOnlyNamespaces: Story = {
  args: {
    definitions: mockRoleCreatorDefinitions.filter(
      (definition) => definition.namespace === "Tenant"
    ),
    roles: mockRoles,
    namespaceMap: {},
    onRoleCreate,
    onRoleUpdate,
  },
};

export const WithManyProjects: Story = {
  args: {
    definitions: mockRoleCreatorDefinitions,
    roles: mockRoles,
    namespaceMap: mockManyProjects,
    onRoleCreate,
    onRoleUpdate,
  },
};

export const FullJSDocAnnotations: Story = {
  args: {
    definitions: mockEnrichedDefinitions,
    roles: mockRoles,
    namespaceMap: mockNamespaceMap,
    onRoleCreate,
    onRoleUpdate,
  },
};
