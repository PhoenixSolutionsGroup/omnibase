import type { SettingsFlow, UiNodeInputAttributes } from "@ory/client-fetch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Messages } from "../components/ui/messages";

export type SettingsFormProps = {
  flow: SettingsFlow;
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

export function SettingsForm({ flow }: SettingsFormProps) {
  // Group nodes by their group property
  const nodesByGroup = flow.ui.nodes.reduce((groups, node) => {
    const group = node.group || "default";
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(node);
    return groups;
  }, {} as Record<string, typeof flow.ui.nodes>);

  // Get CSRF token (shared across all forms)
  const csrfToken = flow.ui.nodes.find(
    (node) =>
      isUiNodeInputAttributes(node.attributes) &&
      node.attributes.name === "csrf_token"
  );

  // Filter out groups that should be rendered as separate sections
  const settingsGroups = Object.entries(nodesByGroup).filter(
    ([group]) => group !== "default" && group !== "oidc"
  );

  // Group titles mapping
  const groupTitles: Record<string, string> = {
    profile: "Profile",
    password: "Password",
    totp: "Authenticator App",
    webauthn: "Security Keys",
    lookup_secret: "Backup Recovery Codes",
    passkey: "Passkeys",
  };

  return (
    <div className="space-y-6">
      <Messages flow={flow} />

      {/* Render each settings group as its own card with independent form */}
      {settingsGroups.map(([groupName, nodes]) => {
        // Find the submit button for this group
        const submitButton = nodes.find(
          (node) =>
            isUiNodeInputAttributes(node.attributes) &&
            node.attributes.type === "submit"
        );

        // Get all non-submit, non-hidden input nodes for this group
        const inputNodes = nodes.filter(
          (node) =>
            isUiNodeInputAttributes(node.attributes) &&
            node.attributes.type !== "submit" &&
            node.attributes.type !== "hidden"
        );

        // Get special node types (img, text)
        const imageNodes = nodes.filter((node) => node.type === "img");
        const textNodes = nodes.filter((node) => node.type === "text");

        return (
          <Card key={groupName} className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>{groupTitles[groupName] || groupName}</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Each group gets its own form */}
              <form action={flow.ui.action} method={flow.ui.method}>
                <div className="space-y-4">
                  {/* Include CSRF token in each form */}
                  {csrfToken &&
                    isUiNodeInputAttributes(csrfToken.attributes) && (
                      <input
                        name={csrfToken.attributes.name}
                        type="hidden"
                        value={csrfToken.attributes.value || ""}
                        readOnly
                      />
                    )}

                  {/* Render image nodes (e.g., QR codes for TOTP) */}
                  {imageNodes.map((node, index) => {
                    if (node.type === "img" && "src" in node.attributes) {
                      const imgAttrs = node.attributes as any;
                      return (
                        <div
                          key={`img-${index}`}
                          className="flex justify-center"
                        >
                          <img
                            src={imgAttrs.src}
                            alt={node.meta.label?.text || "QR Code"}
                            width={imgAttrs.width}
                            height={imgAttrs.height}
                            className="border rounded-lg"
                          />
                        </div>
                      );
                    }
                    return null;
                  })}

                  {/* Render text nodes (e.g., TOTP secrets) */}
                  {textNodes.map((node, index) => {
                    if (node.type === "text" && "text" in node.attributes) {
                      const textContent =
                        typeof node.attributes.text === "string"
                          ? node.attributes.text
                          : node.attributes.text?.text || "";

                      return (
                        <div key={`text-${index}`} className="space-y-2">
                          {node.meta.label?.text && (
                            <Label className="text-sm text-muted-foreground">
                              {node.meta.label.text}
                            </Label>
                          )}
                          <div className="p-3 bg-muted rounded-md font-mono text-sm break-all">
                            {textContent}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}

                  {/* Render input fields */}
                  {inputNodes.map((node) => {
                    if (isUiNodeInputAttributes(node.attributes)) {
                      return (
                        <div key={node.attributes.name} className="space-y-2">
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
                            disabled={node.attributes.disabled}
                            autoComplete={node.attributes.autocomplete}
                            placeholder={`Enter ${
                              node.meta.label?.text?.toLowerCase() ||
                              node.attributes.name
                            }`}
                          />
                        </div>
                      );
                    }
                    return null;
                  })}

                  {/* Render submit button for this group */}
                  {submitButton &&
                    isUiNodeInputAttributes(submitButton.attributes) && (
                      <Button
                        type="submit"
                        name={submitButton.attributes.name}
                        value={submitButton.attributes.value || ""}
                        className="w-full"
                        disabled={submitButton.attributes.disabled}
                      >
                        {submitButton.meta.label?.text ||
                          submitButton.attributes.value ||
                          "Save"}
                      </Button>
                    )}
                </div>
              </form>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
