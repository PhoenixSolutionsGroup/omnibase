import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  RoleCreatorTree,
  type RoleCreateData,
  type RoleUpdateData,
} from "../src";
import {
  mockRoleCreatorDefinitions,
  mockEnrichedDefinitions,
  mockRoles,
  mockNamespaceMap,
  mockManyProjects,
} from "@omnibase/mitosis-storybook/mock-data";

const onRoleCreate = (roleData: RoleCreateData) => {
  console.log("Creating role:", roleData);
  alert(
    `Creating role: ${roleData.role_name}\nPermissions: ${roleData.permissions.join(
      ", "
    )}`
  );
};

const onRoleUpdate = (roleData: RoleUpdateData) => {
  console.log("Updating role:", roleData);
  alert(
    `Updating role: ${roleData.role_name}\nPermissions: ${roleData.permissions.join(
      ", "
    )}`
  );
};

const meta: Meta<typeof RoleCreatorTree> = {
  title: "Permissions/RoleCreatorTree",
  component: RoleCreatorTree,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A framework-agnostic form component for creating and editing roles with granular permissions. Authored in Mitosis with Basecoat (shadcn/ui) styling and compiled to React, Vue, and Svelte.",
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

export const WithExistingRoles: Story = {
  args: {
    definitions: mockRoleCreatorDefinitions,
    roles: mockRoles,
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
  parameters: {
    docs: {
      description: {
        story:
          "Enriched definitions with full JSDoc annotations: relationsMetadata drives custom display names and collapsible groups/subgroups. Pick the Tenant or Project namespace to see the tree.",
      },
    },
  },
};
