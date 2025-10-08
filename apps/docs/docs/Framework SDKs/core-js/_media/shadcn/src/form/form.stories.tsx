import type { Meta, StoryObj } from "@storybook/react-vite";
import { CustomFlowForm } from ".";

// Mock Ory Kratos login flow
const mockLoginFlow = {
  id: "login-123",
  type: "browser",
  expires_at: new Date(Date.now() + 3600000).toISOString() as any,
  issued_at: new Date().toISOString() as any,
  request_url: "http://localhost:3000/auth/login",
  ui: {
    action: "/",
    method: "POST",
    nodes: [
      // CSRF Token (hidden)
      {
        type: "input",
        group: "default",
        attributes: {
          name: "csrf_token",
          type: "hidden",
          value: "mock-csrf-token",
          required: true,
          disabled: false,
        } as any,
        meta: {
          label: {
            id: 1010001,
            text: "csrf_token",
            type: "info",
          },
        },
        messages: [],
      },
      // Email field
      {
        type: "input",
        group: "default",
        attributes: {
          name: "identifier",
          type: "email",
          required: true,
          disabled: false,
          value: "",
        } as any,
        meta: {
          label: {
            id: 1010003,
            text: "Email",
            type: "info",
          },
        },
        messages: [],
      },
      // Password field
      {
        type: "input",
        group: "password",
        attributes: {
          name: "password",
          type: "password",
          required: true,
          disabled: false,
        } as any,
        meta: {
          label: {
            id: 1010001,
            text: "Password",
            type: "info",
          },
        },
        messages: [],
      },
      // Submit button
      {
        type: "input",
        group: "password",
        attributes: {
          name: "method",
          type: "submit",
          value: "password",
          disabled: false,
        } as any,
        meta: {
          label: {
            id: 1010001,
            text: "Sign In",
            type: "info",
          },
        },
        messages: [],
      },
    ],
    messages: [],
  },
  created_at: new Date().toISOString() as any,
  updated_at: new Date().toISOString() as any,
  refresh: false,
  requested_aal: "aal1" as any,
};

// Mock registration flow
const mockRegistrationFlow = {
  id: "registration-123",
  type: "browser",
  expires_at: new Date(Date.now() + 3600000).toISOString() as any,
  issued_at: new Date().toISOString() as any,
  request_url: "http://localhost:3000/auth/registration",
  ui: {
    action: "/",
    method: "POST",
    nodes: [
      // CSRF Token (hidden)
      {
        type: "input",
        group: "default",
        attributes: {
          name: "csrf_token",
          type: "hidden",
          value: "mock-csrf-token",
          required: true,
          disabled: false,
        } as any,
        meta: {
          label: {
            id: 1010001,
            text: "csrf_token",
            type: "info",
          },
        },
        messages: [],
      },
      // Email field
      {
        type: "input",
        group: "default",
        attributes: {
          name: "traits.email",
          type: "email",
          required: true,
          disabled: false,
          value: "",
        } as any,
        meta: {
          label: {
            id: 1010003,
            text: "Email",
            type: "info",
          },
        },
        messages: [],
      },
      // First Name field
      {
        type: "input",
        group: "default",
        attributes: {
          name: "traits.first_name",
          type: "text",
          required: true,
          disabled: false,
          value: "",
        } as any,
        meta: {
          label: {
            id: 1010003,
            text: "First Name",
            type: "info",
          },
        },
        messages: [],
      },
      // Last Name field
      {
        type: "input",
        group: "default",
        attributes: {
          name: "traits.last_name",
          type: "text",
          required: true,
          disabled: false,
          value: "",
        } as any,
        meta: {
          label: {
            id: 1010003,
            text: "Last Name",
            type: "info",
          },
        },
        messages: [],
      },

      // Submit button
      {
        type: "input",
        group: "password",
        attributes: {
          name: "method",
          type: "submit",
          value: "password",
          disabled: false,
        } as any,
        meta: {
          label: {
            id: 1010001,
            text: "Create Account",
            type: "info",
          },
        },
        messages: [],
      },
    ],
    messages: [],
  },
  created_at: new Date().toISOString() as any,
  updated_at: new Date().toISOString() as any,
};

// Mock password recovery flow
const mockRecoveryFlow = {
  id: "recovery-123",
  type: "browser",
  expires_at: new Date(Date.now() + 3600000).toISOString() as any,
  issued_at: new Date().toISOString() as any,
  request_url: "http://localhost:3000/auth/recovery",
  ui: {
    action: "/",
    method: "POST",
    nodes: [
      // CSRF Token (hidden)
      {
        type: "input",
        group: "default",
        attributes: {
          name: "csrf_token",
          type: "hidden",
          value: "mock-csrf-token",
          required: true,
          disabled: false,
        } as any,
        meta: {
          label: {
            id: 1010001,
            text: "csrf_token",
            type: "info",
          },
        },
        messages: [],
      },
      // Email field
      {
        type: "input",
        group: "default",
        attributes: {
          name: "email",
          type: "email",
          required: true,
          disabled: false,
          value: "",
        } as any,
        meta: {
          label: {
            id: 1010003,
            text: "Email",
            type: "info",
          },
        },
        messages: [],
      },
      // Submit button
      {
        type: "input",
        group: "default",
        attributes: {
          name: "method",
          type: "submit",
          value: "link",
          disabled: false,
        } as any,
        meta: {
          label: {
            id: 1010001,
            text: "Send Recovery Link",
            type: "info",
          },
        },
        messages: [],
      },
    ],
    messages: [],
  },
  created_at: new Date().toISOString() as any,
  updated_at: new Date().toISOString() as any,
  state: "choose_method" as any,
};

// Mock verification flow
const mockVerificationFlow = {
  id: "verification-123",
  type: "browser",
  expires_at: new Date(Date.now() + 3600000).toISOString() as any,
  issued_at: new Date().toISOString() as any,
  request_url: "http://localhost:3000/auth/verification",
  ui: {
    action: "/",
    method: "POST",
    nodes: [
      // CSRF Token (hidden)
      {
        type: "input",
        group: "default",
        attributes: {
          name: "csrf_token",
          type: "hidden",
          value: "mock-csrf-token",
          required: true,
          disabled: false,
        } as any,
        meta: {
          label: {
            id: 1010001,
            text: "csrf_token",
            type: "info",
          },
        },
        messages: [],
      },
      // Code field
      {
        type: "input",
        group: "code",
        attributes: {
          name: "code",
          type: "text",
          required: true,
          disabled: false,
          value: "",
        } as any,
        meta: {
          label: {
            id: 1010003,
            text: "Verification Code",
            type: "info",
          },
        },
        messages: [],
      },
      // Submit button
      {
        type: "input",
        group: "code",
        attributes: {
          name: "method",
          type: "submit",
          value: "code",
          disabled: false,
        } as any,
        meta: {
          label: {
            id: 1010001,
            text: "Verify",
            type: "info",
          },
        },
        messages: [],
      },
    ],
    messages: [],
  },
  created_at: new Date().toISOString() as any,
  updated_at: new Date().toISOString() as any,
  state: "sent_email" as any,
};

const meta: Meta<typeof CustomFlowForm> = {
  title: "Auth/CustomFlowForm",
  component: CustomFlowForm,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Authentication form component for Ory Kratos flows. Supports login, registration, recovery, and verification flows.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    flow: {
      description:
        "The Ory Kratos flow object containing UI nodes and configuration",
      control: false,
    },
    Header: {
      description: "Optional header content to display at the top of the form",
      control: { type: "text" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Login: Story = {
  args: {
    flow: mockLoginFlow as any,
    Header: "Sign In to Your Account",
  },
};

export const Registration: Story = {
  args: {
    flow: mockRegistrationFlow as any,
    Header: "Create Your Account",
  },
};

export const PasswordRecovery: Story = {
  args: {
    flow: mockRecoveryFlow as any,
    Header: "Reset Your Password",
  },
};

export const Verification: Story = {
  args: {
    flow: mockVerificationFlow as any,
    Header: "Verify Your Email",
  },
};
