import type {
  LoginFlow,
  RegistrationFlow,
  RecoveryFlow,
  UiNodeInputAttributes,
  VerificationFlow,
} from "@ory/client-fetch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type FlowType =
  | LoginFlow
  | RegistrationFlow
  | RecoveryFlow
  | VerificationFlow;

export type CustomFormProps = {
  flow: FlowType;
  Header?: React.ReactNode;
};

// Helper function to check if node attributes are input attributes
function isUiNodeInputAttributes(
  attributes: any
): attributes is UiNodeInputAttributes {
  return (
    attributes &&
    typeof attributes === "object" &&
    "name" in attributes &&
    "type" in attributes
  );
}

export function CustomFlowForm({ flow, Header }: CustomFormProps) {
  // Check if there are any submit buttons in the flow
  const hasSubmitButton = flow.ui.nodes.some(
    (node) =>
      isUiNodeInputAttributes(node.attributes) &&
      node.attributes.type === "submit"
  );

  return (
    <div>
      <Card className="w-full max-w-md mx-auto">
        <form action={flow.ui.action} method={flow.ui.method}>
          {/* Render Header if provided */}
          {Header && (
            <CardHeader>
              <CardTitle className="text-center pb-4">{Header}</CardTitle>
            </CardHeader>
          )}

          <CardContent className="space-y-4">
            {/* Render all nodes, not just filtered groups to ensure we get submit buttons */}
            {flow.ui.nodes.map((node) => {
              if (isUiNodeInputAttributes(node.attributes)) {
                const isSubmitButton = node.attributes.type === "submit";
                const isHiddenField = node.attributes.type === "hidden";
                const isVisibleField = !isHiddenField && !isSubmitButton;

                // Render hidden fields (including CSRF tokens) - essential for Kratos
                if (isHiddenField) {
                  return (
                    <input
                      key={node.attributes.name}
                      name={node.attributes.name}
                      type="hidden"
                      value={node.attributes.value || ""}
                      readOnly
                    />
                  );
                }

                // Render submit buttons from any group
                if (isSubmitButton) {
                  return (
                    <Button
                      key={node.attributes.name}
                      type="submit"
                      name={node.attributes.name}
                      value={node.attributes.value || ""}
                      className="w-full mt-2"
                    >
                      {node.meta.label?.text ||
                        node.attributes.value ||
                        "Submit"}
                    </Button>
                  );
                }

                // Only render visible fields from common groups (including verification)
                if (
                  isVisibleField &&
                  [
                    "default",
                    "password",
                    "code",
                    "webauthn",
                    "passkey",
                    "totp",
                    "lookup_secret",
                  ].includes(node.group)
                ) {
                  return (
                    <div
                      key={node.meta.label?.id || node.attributes.name}
                      className="space-y-2"
                    >
                      <Label htmlFor={node.attributes.name}>
                        {node.meta.label?.text}
                        {node.attributes.required && (
                          <span className="text-destructive ml-1">*</span>
                        )}
                      </Label>
                      <Input
                        id={node.attributes.name}
                        name={node.attributes.name}
                        type={node.attributes.type}
                        defaultValue={node.attributes.value || ""}
                        required={node.attributes.required}
                        placeholder={`Enter your ${
                          node.meta.label?.text?.toLowerCase() ||
                          node.attributes.name
                        }`}
                      />
                    </div>
                  );
                }
              }
              return null;
            })}

            {/* Fallback submit button if no submit button found in flow */}
            {!hasSubmitButton && (
              <Button type="submit" className="w-full">
                Submit
              </Button>
            )}
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
