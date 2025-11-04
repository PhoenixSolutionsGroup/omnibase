import type { Meta, StoryObj } from "@storybook/react-vite";
import { SettingsForm } from "./settings";
import { mockSettingsFlow } from "./stories/settings";

const meta: Meta<typeof SettingsForm> = {
  title: "Auth/Settings",
  component: SettingsForm,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: "Account settings form component for Ory Kratos flows.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;

export const Settings: StoryObj<typeof meta> = {
  args: {
    flow: {
      ui: mockSettingsFlow,
    } as any,
    Header: "Account Settings",
  },
};
