import type { Meta, StoryObj } from "@storybook/react-vite";
import { RecoveryForm } from "./recovery";
import { mockRecoveryFlow } from "./stories/recovery";

const meta: Meta<typeof RecoveryForm> = {
  title: "Auth/Recovery",
  component: RecoveryForm,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: "Account recovery form component for Ory Kratos flows.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;

export const Recovery: StoryObj<typeof meta> = {
  args: {
    flow: mockRecoveryFlow as any,
    Header: "Recover Your Account",
  },
};
