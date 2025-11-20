import type { Meta, StoryObj } from "@storybook/react-vite";
import { LoginForm } from "./login";
import { mockLogin } from "./stories/login";

const meta: Meta<typeof LoginForm> = {
  title: "Auth/Login",
  component: LoginForm,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Login form component for Ory Kratos flows with OIDC support.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;

export const Login: StoryObj<typeof meta> = {
  args: {
    flow: mockLogin as any,
    Header: "Sign In",
  },
};
