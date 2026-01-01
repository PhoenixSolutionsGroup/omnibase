import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { PermissionsSelector, type PermissionRow, generateId } from ".";
import { mockRoleCreatorDefinitions } from "../role-creator/mock-definitions";

const mockNamespaceMap = {
  project: [
    { id: "proj_main", label: "Main Project" },
    { id: "proj_staging", label: "Staging Environment" },
    { id: "proj_dev", label: "Development" },
  ],
};

const meta: Meta<typeof PermissionsSelector> = {
  title: "Permissions/PermissionsSelector",
  component: PermissionsSelector,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A reusable permissions selector component with searchable comboboxes for namespace, permission, and resource selection. Automatically adds new rows as you fill them in.",
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
    namespaceMap: {
      description:
        "Map of namespace to available resources for that namespace",
      control: false,
    },
    initialPermissions: {
      description: "Initial permission rows to populate the selector with",
      control: false,
    },
    onPermissionsChange: {
      description: "Callback fired when permissions change",
      control: false,
    },
    disabled: {
      description: "Whether the selector is disabled",
      control: "boolean",
    },
    showPreview: {
      description: "Whether to show the permissions preview section",
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    definitions: mockRoleCreatorDefinitions,
    namespaceMap: mockNamespaceMap,
    onPermissionsChange: (rows) => {
      console.log("Permissions changed:", rows);
    },
  },
};

export const WithInitialPermissions: Story = {
  args: {
    definitions: mockRoleCreatorDefinitions,
    namespaceMap: mockNamespaceMap,
    initialPermissions: [
      {
        id: generateId(),
        namespace: "Tenant",
        relation: "can_view_users",
        objectId: "",
      },
      {
        id: generateId(),
        namespace: "Project",
        relation: "can_view_database_connection_string",
        objectId: "proj_main",
      },
      { id: generateId(), namespace: "", relation: "", objectId: "" },
    ],
    onPermissionsChange: (rows) => {
      console.log("Permissions changed:", rows);
    },
  },
};

export const Disabled: Story = {
  args: {
    definitions: mockRoleCreatorDefinitions,
    namespaceMap: mockNamespaceMap,
    initialPermissions: [
      {
        id: generateId(),
        namespace: "Tenant",
        relation: "can_invite_user",
        objectId: "",
      },
      { id: generateId(), namespace: "", relation: "", objectId: "" },
    ],
    disabled: true,
    onPermissionsChange: (rows) => {
      console.log("Permissions changed:", rows);
    },
  },
};

export const WithoutPreview: Story = {
  args: {
    definitions: mockRoleCreatorDefinitions,
    namespaceMap: mockNamespaceMap,
    showPreview: false,
    onPermissionsChange: (rows) => {
      console.log("Permissions changed:", rows);
    },
  },
};

export const TenantOnlyNamespaces: Story = {
  args: {
    definitions: mockRoleCreatorDefinitions.filter(
      (d) => d.namespace === "Tenant"
    ),
    namespaceMap: {},
    onPermissionsChange: (rows) => {
      console.log("Permissions changed:", rows);
    },
  },
};

export const WithManyProjects: Story = {
  args: {
    definitions: mockRoleCreatorDefinitions,
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
    onPermissionsChange: (rows) => {
      console.log("Permissions changed:", rows);
    },
  },
};

function ControlledExample() {
  const [rows, setRows] = useState<PermissionRow[]>([
    { id: generateId(), namespace: "", relation: "", objectId: "" },
  ]);

  const validPermissions = rows.filter((r) => r.namespace && r.relation);

  return (
    <div className="space-y-4">
      <PermissionsSelector
        definitions={mockRoleCreatorDefinitions}
        namespaceMap={mockNamespaceMap}
        initialPermissions={rows}
        onPermissionsChange={setRows}
      />
      <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-md">
        <p className="text-sm font-medium mb-2">
          Parent Component State ({validPermissions.length} valid permissions):
        </p>
        <pre className="text-xs overflow-auto">
          {JSON.stringify(validPermissions, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export const Controlled: Story = {
  render: () => <ControlledExample />,
  parameters: {
    docs: {
      description: {
        story:
          "Example showing how to use the PermissionsSelector in a controlled manner with parent state management.",
      },
    },
  },
};
