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
          "Login form component for Ory Kratos flows with dynamic OIDC provider buttons.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;

export const Login: StoryObj<typeof meta> = {
  args: {
    api_url: "http://127.0.0.1:8080",
    onToken: async () => {},
    Header: "Sign In",
    register_url: "/auth/registration",
  },
  loaders: [
    async () => {
      const original = window.fetch;
      window.fetch = (async () =>
        new Response(JSON.stringify(mockLogin), {
          headers: { "Content-Type": "application/json" },
        })) as typeof fetch;
      return { original };
    },
  ],
  render: (args, { loaded }) => {
    window.fetch = loaded.original;
    return <LoginForm {...args} />;
  },
};