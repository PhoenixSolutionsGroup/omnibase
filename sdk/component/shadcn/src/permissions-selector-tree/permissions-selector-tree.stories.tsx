import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { PermissionsSelectorTree } from ".";
import {
  mockRoleCreatorDefinitions,
  mockEnrichedDefinitions,
} from "../role-creator/mock-definitions";

const mockNamespaceMap = {
  project: [
    { id: "proj_main", label: "Main Project" },
    { id: "proj_staging", label: "Staging Environment" },
    { id: "proj_dev", label: "Development" },
  ],
};

const meta: Meta<typeof PermissionsSelectorTree> = {
  title: "Permissions/PermissionsSelectorTree",
  component: PermissionsSelectorTree,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A tree-based permissions selector with checkboxes for selecting permissions. Supports hierarchical grouping with groups and subgroups. Group checkboxes select all children with indeterminate state support.",
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
    value: {
      description: "Array of selected permission strings",
      control: false,
    },
    onChange: {
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

// --- Basic Stories ---

function DefaultExample() {
  const [permissions, setPermissions] = useState<string[]>([]);

  return (
    <PermissionsSelectorTree
      definitions={mockEnrichedDefinitions}
      namespaceMap={mockNamespaceMap}
      value={permissions}
      onChange={setPermissions}
    />
  );
}

export const Default: Story = {
  render: () => <DefaultExample />,
  parameters: {
    docs: {
      description: {
        story:
          "Default tree selector with grouped permissions. Select a namespace, then check permissions from the tree.",
      },
    },
  },
};

function WithInitialPermissionsExample() {
  const [permissions, setPermissions] = useState<string[]>([
    "tenant#can_view_users",
    "tenant#can_invite_user",
    "project:proj_main#can_view_database_connection_string",
  ]);

  return (
    <PermissionsSelectorTree
      definitions={mockEnrichedDefinitions}
      namespaceMap={mockNamespaceMap}
      value={permissions}
      onChange={setPermissions}
    />
  );
}

export const WithInitialPermissions: Story = {
  render: () => <WithInitialPermissionsExample />,
  parameters: {
    docs: {
      description: {
        story:
          "Tree selector pre-populated with some permissions. Select 'Tenant' namespace to see which permissions are already checked.",
      },
    },
  },
};

function DisabledExample() {
  const [permissions] = useState<string[]>([
    "tenant#can_view_users",
    "tenant#can_invite_user",
  ]);

  return (
    <PermissionsSelectorTree
      definitions={mockEnrichedDefinitions}
      namespaceMap={mockNamespaceMap}
      value={permissions}
      onChange={() => {}}
      disabled
    />
  );
}

export const Disabled: Story = {
  render: () => <DisabledExample />,
  parameters: {
    docs: {
      description: {
        story: "Disabled tree selector - checkboxes cannot be changed.",
      },
    },
  },
};

function WithoutPreviewExample() {
  const [permissions, setPermissions] = useState<string[]>([]);

  return (
    <PermissionsSelectorTree
      definitions={mockEnrichedDefinitions}
      namespaceMap={mockNamespaceMap}
      value={permissions}
      onChange={setPermissions}
      showPreview={false}
    />
  );
}

export const WithoutPreview: Story = {
  render: () => <WithoutPreviewExample />,
  parameters: {
    docs: {
      description: {
        story: "Tree selector without the selected permissions preview panel.",
      },
    },
  },
};

// --- Namespace-specific Stories ---

function TenantOnlyExample() {
  const [permissions, setPermissions] = useState<string[]>([]);

  return (
    <PermissionsSelectorTree
      definitions={mockEnrichedDefinitions.filter(
        (d) => d.namespace === "Tenant"
      )}
      namespaceMap={{}}
      value={permissions}
      onChange={setPermissions}
    />
  );
}

export const TenantOnly: Story = {
  render: () => <TenantOnlyExample />,
  parameters: {
    docs: {
      description: {
        story:
          "Tree selector with only Tenant namespace available. Notice: no resource selector needed for Tenant.",
      },
    },
  },
};

function ProjectOnlyExample() {
  const [permissions, setPermissions] = useState<string[]>([]);

  return (
    <PermissionsSelectorTree
      definitions={mockEnrichedDefinitions.filter(
        (d) => d.namespace === "Project"
      )}
      namespaceMap={mockNamespaceMap}
      value={permissions}
      onChange={setPermissions}
    />
  );
}

export const ProjectOnly: Story = {
  render: () => <ProjectOnlyExample />,
  parameters: {
    docs: {
      description: {
        story:
          "Tree selector with only Project namespace. Requires selecting a resource before permissions are shown.",
      },
    },
  },
};

// --- Grouping Stories ---

function LegacyFlatListExample() {
  const [permissions, setPermissions] = useState<string[]>([]);

  return (
    <PermissionsSelectorTree
      definitions={mockRoleCreatorDefinitions}
      namespaceMap={mockNamespaceMap}
      value={permissions}
      onChange={setPermissions}
    />
  );
}

export const LegacyFlatList: Story = {
  render: () => <LegacyFlatListExample />,
  parameters: {
    docs: {
      description: {
        story:
          "Tree selector with legacy definitions (no relationsMetadata). Permissions are shown as a flat list with auto-generated labels.",
      },
    },
  },
};

function GroupedPermissionsExample() {
  const [permissions, setPermissions] = useState<string[]>([]);

  return (
    <PermissionsSelectorTree
      definitions={mockEnrichedDefinitions}
      namespaceMap={mockNamespaceMap}
      value={permissions}
      onChange={setPermissions}
    />
  );
}

export const GroupedPermissions: Story = {
  render: () => <GroupedPermissionsExample />,
  parameters: {
    docs: {
      description: {
        story:
          "Tree selector with enriched definitions containing relationsMetadata. Permissions are organized into collapsible groups and subgroups.",
      },
    },
  },
};

// --- Comparison Story ---

function ComparisonExample() {
  const [legacyPerms, setLegacyPerms] = useState<string[]>([]);
  const [enrichedPerms, setEnrichedPerms] = useState<string[]>([]);

  return (
    <div className="grid grid-cols-2 gap-8">
      <div className="space-y-4">
        <h3 className="font-semibold text-sm">Legacy (flat list)</h3>
        <p className="text-xs text-muted-foreground">
          Without relationsMetadata - permissions shown as flat list with
          auto-generated labels
        </p>
        <PermissionsSelectorTree
          definitions={mockRoleCreatorDefinitions}
          namespaceMap={mockNamespaceMap}
          value={legacyPerms}
          onChange={setLegacyPerms}
        />
      </div>
      <div className="space-y-4">
        <h3 className="font-semibold text-sm">Enriched (grouped)</h3>
        <p className="text-xs text-muted-foreground">
          With relationsMetadata - permissions grouped by @group/@subGroup with
          custom displayNames
        </p>
        <PermissionsSelectorTree
          definitions={mockEnrichedDefinitions}
          namespaceMap={mockNamespaceMap}
          value={enrichedPerms}
          onChange={setEnrichedPerms}
        />
      </div>
    </div>
  );
}

export const LegacyVsEnriched: Story = {
  render: () => <ComparisonExample />,
  parameters: {
    docs: {
      description: {
        story:
          "Side-by-side comparison of legacy (flat list) vs enriched (grouped) permissions. Select the Tenant namespace in both to see the difference.",
      },
    },
  },
};

// --- Controlled State Example ---

function ControlledExample() {
  const [permissions, setPermissions] = useState<string[]>([]);

  return (
    <div className="space-y-4">
      <PermissionsSelectorTree
        definitions={mockEnrichedDefinitions}
        namespaceMap={mockNamespaceMap}
        value={permissions}
        onChange={setPermissions}
      />
      <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-md">
        <p className="text-sm font-medium mb-2">
          Parent Component State ({permissions.length} permissions):
        </p>
        <pre className="text-xs overflow-auto">
          {JSON.stringify(permissions, null, 2)}
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
          "Fully controlled example showing how parent component manages the permission state.",
      },
    },
  },
};

// --- Many Resources Story ---

function ManyResourcesExample() {
  const [permissions, setPermissions] = useState<string[]>([]);

  return (
    <PermissionsSelectorTree
      definitions={mockEnrichedDefinitions}
      namespaceMap={{
        project: [
          { id: "proj_main", label: "Main Project" },
          { id: "proj_staging", label: "Staging Environment" },
          { id: "proj_dev", label: "Development" },
          { id: "proj_qa", label: "QA Environment" },
          { id: "proj_prod", label: "Production" },
          { id: "proj_demo", label: "Demo Environment" },
          { id: "proj_sandbox", label: "Sandbox" },
          { id: "proj_test1", label: "Test Environment 1" },
          { id: "proj_test2", label: "Test Environment 2" },
          { id: "proj_feature", label: "Feature Branch" },
        ],
      }}
      value={permissions}
      onChange={setPermissions}
    />
  );
}

export const ManyResources: Story = {
  render: () => <ManyResourcesExample />,
  parameters: {
    docs: {
      description: {
        story:
          "Tree selector with many resources available in the Project namespace.",
      },
    },
  },
};
