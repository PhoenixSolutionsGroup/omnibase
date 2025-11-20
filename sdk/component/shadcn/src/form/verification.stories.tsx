import type { Meta, StoryObj } from "@storybook/react-vite";
import { VerificationForm } from "./verification";
import { mockVerificationFlow } from "./stories/verification";
import { mockVerificationFlowError } from "./stories/verification_error";

const meta: Meta<typeof VerificationForm> = {
  title: "Auth/Verification",
  component: VerificationForm,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: "Email verification form component for Ory Kratos flows.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;

export const VerificationWithMessages: StoryObj<typeof meta> = {
  args: {
    flow: {
      ui: mockVerificationFlow,
    } as any,
  },
};

export const VerificationError: StoryObj<typeof meta> = {
  args: {
    flow: {
      ui: mockVerificationFlowError,
    } as any,
  },
};
