import type { RegistrationFlow } from "@ory/client-fetch";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { RegistrationForm } from "./registration";
import { mockRegistrationFirstFlow } from "./stories/registration_first";
import { mockRegistrationOIDCGoogleFlow } from "./stories/registration_oidc_google";
import { mockRegistrationPasswordFlow } from "./stories/registration_password";
import { mockRegistrationPasswordFlowError } from "./stories/registration_password_error";

// Registration Stories
const meta: Meta<typeof RegistrationForm> = {
	title: "Auth/Registration",
	component: RegistrationForm,
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"Registration form component for Ory Kratos flows with OIDC support.",
			},
		},
	},
	tags: ["autodocs"],
};

export default meta;

export const RegistrationNonOIDC: StoryObj<typeof meta> = {
	args: {
		flow: {
			ui: mockRegistrationFirstFlow,
		} as unknown as RegistrationFlow,
		Header: "Create Your Account",
	},
};

export const RegistrationOIDCGoogle: StoryObj<typeof meta> = {
	args: {
		flow: {
			ui: mockRegistrationOIDCGoogleFlow,
		} as unknown as RegistrationFlow,
		Header: "Create Your Account",
	},
};

export const RegistrationPassword: StoryObj<typeof meta> = {
	args: {
		flow: {
			ui: mockRegistrationPasswordFlow,
		} as unknown as RegistrationFlow,
		Header: "Set Your Password",
	},
};

export const RegistrationPasswordError: StoryObj<typeof meta> = {
	args: {
		flow: {
			ui: mockRegistrationPasswordFlowError,
		} as unknown as RegistrationFlow,
		Header: "Set Your Password",
	},
};
