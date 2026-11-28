import type {
	LoginFlow,
	RecoveryFlow,
	RegistrationFlow,
	SettingsFlow,
	UiNode,
	UiNodeInputAttributes,
	VerificationFlow,
} from "@ory/client-fetch";

export type FlowType =
	| LoginFlow
	| RegistrationFlow
	| RecoveryFlow
	| VerificationFlow
	| SettingsFlow;

export type CustomFormProps = {
	flow: FlowType;
	Header?: React.ReactNode;
};

export type NodesByGroup = Record<string, UiNode[]>;

// Helper function to check if node attributes are input attributes
export function isUiNodeInputAttributes(
	attributes: unknown,
): attributes is UiNodeInputAttributes {
	return (
		typeof attributes === "object" &&
		attributes !== null &&
		"name" in attributes &&
		"type" in attributes
	);
}
