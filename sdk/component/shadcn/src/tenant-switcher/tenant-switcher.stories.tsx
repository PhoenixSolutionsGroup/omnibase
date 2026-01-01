import type { Meta, StoryObj } from "@storybook/react-vite";
import { SwitchActiveTenant } from ".";
import type { Tenant } from "@omnibase/core-js";

// Mock tenants data
const mockTenants: Tenant[] = [
  {
    id: "tenant_1",
    name: "Acme Corporation",
    stripeCustomerId: "cus_acme123",
    type: "business",
    createdAt: new Date("2024-01-15T10:30:00Z"),
    updatedAt: new Date("2024-01-15T10:30:00Z"),
  },
  {
    id: "tenant_2",
    name: "TechStart Inc",
    stripeCustomerId: "cus_tech456",
    type: "startup",
    createdAt: new Date("2024-02-20T14:45:00Z"),
    updatedAt: new Date("2024-02-20T14:45:00Z"),
  },
  {
    id: "tenant_3",
    name: "Global Enterprises",
    stripeCustomerId: "cus_global789",
    type: "enterprise",
    createdAt: new Date("2024-03-10T09:15:00Z"),
    updatedAt: new Date("2024-03-10T09:15:00Z"),
  },
  {
    id: "tenant_4",
    name: "Creative Studio",
    stripeCustomerId: "cus_creative101",
    type: "creative",
    createdAt: new Date("2024-04-05T16:20:00Z"),
    updatedAt: new Date("2024-04-05T16:20:00Z"),
  },
];

const meta: Meta<typeof SwitchActiveTenant> = {
  title: "Tenant/SwitchActiveTenant",
  component: SwitchActiveTenant,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A dropdown component for switching between different tenants. When a tenant is selected, it triggers a form action with the tenant_id in form data.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    tenants: {
      description: "Array of available tenants",
      control: false,
    },
    currentTenantId: {
      description: "Currently active tenant ID",
      control: { type: "select" },
      options: mockTenants.map((t) => t.id),
    },
    formAction: {
      description: "Custom form action handler",
      control: false,
    },
    placeholder: {
      description: "Placeholder text when no tenant is selected",
      control: { type: "text" },
    },
    className: {
      description: "Additional CSS classes",
      control: { type: "text" },
    },
    onTenantChange: {
      description: "Callback fired when tenant selection changes",
      control: false,
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    tenants: mockTenants,
    currentTenantId: "tenant_1",
    placeholder: "Select tenant...",
    onTenantChange: () => {},
    formAction: () => {},
  },
};

export const NoSelection: Story = {
  args: {
    tenants: mockTenants,
    currentTenantId: undefined,
    placeholder: "Choose your tenant...",
    onTenantChange: () => {},
    formAction: () => {},
  },
};

export const SingleTenant: Story = {
  args: {
    tenants: [mockTenants[0]],
    currentTenantId: "tenant_1",
    placeholder: "Select tenant...",
    onTenantChange: () => {},
    formAction: () => {},
  },
};

export const ManyTenants: Story = {
  args: {
    tenants: [
      ...mockTenants,
      {
        id: "tenant_5",
        name: "Another Company Ltd",
        stripeCustomerId: "cus_another202",
        type: "business",
        createdAt: new Date("2024-05-01T12:00:00Z"),
        updatedAt: new Date("2024-05-01T12:00:00Z"),
      },
      {
        id: "tenant_6",
        name: "Small Business Co",
        stripeCustomerId: "cus_small303",
        type: "small_business",
        createdAt: new Date("2024-05-15T08:30:00Z"),
        updatedAt: new Date("2024-05-15T08:30:00Z"),
      },
      {
        id: "tenant_7",
        name: "Consulting Group",
        stripeCustomerId: "cus_consult404",
        type: "consulting",
        createdAt: new Date("2024-06-01T17:45:00Z"),
        updatedAt: new Date("2024-06-01T17:45:00Z"),
      },
    ],
    currentTenantId: "tenant_3",
    placeholder: "Select tenant...",
    onTenantChange: () => {},
    formAction: () => {},
  },
};

export const CustomStyling: Story = {
  args: {
    tenants: mockTenants,
    currentTenantId: "tenant_2",
    placeholder: "Pick a tenant...",
    className: "w-64 border-blue-500",
    onTenantChange: () => {},
    formAction: () => {},
  },
};

export const WithCustomFormAction: Story = {
  args: {
    tenants: mockTenants,
    currentTenantId: "tenant_1",
    placeholder: "Select tenant...",
    onTenantChange: () => {},
    formAction: async (formData: FormData) => {
      const tenantId = formData.get("tenant_id");
      console.log("Custom form action triggered with tenant_id:", tenantId);
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert(`Switched to tenant: ${tenantId}`);
    },
  },
};

export const EmptyTenants: Story = {
  args: {
    tenants: [],
    currentTenantId: undefined,
    placeholder: "No tenants available",
    onTenantChange: () => {},
    formAction: () => {},
  },
};
