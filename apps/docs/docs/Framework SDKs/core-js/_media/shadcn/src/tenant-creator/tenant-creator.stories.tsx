import type { Meta, StoryObj } from "@storybook/react";
import { TenantCreator } from "./index";

const meta: Meta<typeof TenantCreator> = {
  title: "Components/TenantCreator",
  component: TenantCreator,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story with basic configuration
export const Default: Story = {
  args: {
    formActions: {
      createOrganizationAction: async (formData: FormData) => {
        const data = {
          organizationName: formData.get("organizationName"),
          billingEmail: formData.get("billingEmail"),
        };
        console.log("Create organization:", data);
        // Simulate async operation
        await new Promise((resolve) => setTimeout(resolve, 1000));
        alert(
          `Organization "${data.organizationName}" created with billing email: ${data.billingEmail}`
        );
      },
      joinOrganizationAction: async (formData: FormData) => {
        const data = {
          token: formData.get("token"),
        };
        console.log("Join organization:", data);
        // Simulate async operation
        await new Promise((resolve) => setTimeout(resolve, 1000));
        alert(`Joined organization with token: ${data.token}`);
      },
    },
  },
};

// Story with custom configuration
export const CustomConfiguration: Story = {
  args: {
    config: {
      createOrganizationText: "Start New Company",
      joinOrganizationText: "Join Existing Team",
      defaultMode: "join",
      createForm: {
        organizationName: {
          label: "Company Name",
          placeholder: "e.g., Acme Corp",
          defaultValue: "My Startup",
        },
        billingEmail: {
          label: "Finance Contact Email",
          placeholder: "finance@company.com",
          defaultValue: "billing@example.com",
        },
      },
      joinForm: {
        token: {
          label: "Team Invitation Code",
          placeholder: "Enter your invitation code",
        },
      },
    },
    formActions: {
      createOrganizationAction: async (formData: FormData) => {
        const data = {
          organizationName: formData.get("organizationName"),
          billingEmail: formData.get("billingEmail"),
        };
        console.log("Custom create organization:", data);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        alert(`Company "${data.organizationName}" created successfully!`);
      },
      joinOrganizationAction: async (formData: FormData) => {
        const data = {
          token: formData.get("token"),
        };
        console.log("Custom join organization:", data);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        alert(`Successfully joined team with code: ${data.token}`);
      },
    },
  },
};

// Story with pre-filled data (simulating URL query params)
export const WithPrefilledToken: Story = {
  args: {
    config: {
      defaultMode: "join",
      joinForm: {
        token: {
          placeholder: "Token will be auto-filled from URL",
        },
      },
    },
    formActions: {
      createOrganizationAction: async (formData: FormData) => {
        const data = {
          organizationName: formData.get("organizationName"),
          billingEmail: formData.get("billingEmail"),
        };
        console.log("Create organization:", data);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        alert(`Organization created: ${data.organizationName}`);
      },
      joinOrganizationAction: async (formData: FormData) => {
        const data = {
          token: formData.get("token"),
        };
        console.log("Join organization:", data);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        alert(`Joined with token: ${data.token}`);
      },
    },
  },
};

// Story without form actions (shows component without functionality)
export const WithoutActions: Story = {
  args: {
    config: {
      createForm: {
        organizationName: {
          defaultValue: "Demo Organization",
        },
        billingEmail: {
          defaultValue: "demo@example.com",
        },
      },
    },
  },
};
