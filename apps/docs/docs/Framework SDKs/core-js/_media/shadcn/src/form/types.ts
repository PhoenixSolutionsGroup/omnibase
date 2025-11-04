import type {
  LoginFlow,
  RegistrationFlow,
  RecoveryFlow,
  UiNodeInputAttributes,
  VerificationFlow,
  SettingsFlow,
  UiNode,
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
  attributes: any
): attributes is UiNodeInputAttributes {
  return (
    attributes &&
    typeof attributes === "object" &&
    "name" in attributes &&
    "type" in attributes
  );
}
