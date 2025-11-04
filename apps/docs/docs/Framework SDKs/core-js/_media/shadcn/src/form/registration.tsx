import type { RegistrationFlow } from "@ory/client-fetch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Messages } from "../components/ui/messages";
import { OidcGroup } from "./components/OidcGroup";
import { FormInput } from "./components/FormInput";
import { SubmitButton } from "./components/SubmitButton";
import { HiddenInput } from "./components/HiddenInput";
import { Divider } from "./components/Divider";
import {
  groupNodesByGroup,
  sortNodes,
  findSubmitButton,
  filterInputNodes,
  findCsrfToken,
} from "./utils";
import { isUiNodeInputAttributes } from "./types";

export type RegistrationFormProps = {
  flow: RegistrationFlow;
  Header?: React.ReactNode;
  login_url?: string;
};

export function RegistrationForm({
  flow,
  Header,
  login_url,
}: RegistrationFormProps) {
  const nodesByGroup = groupNodesByGroup(flow.ui.nodes);
  const csrfToken = findCsrfToken(flow.ui.nodes);

  const oidcNodes = nodesByGroup.oidc || [];
  const defaultNodes = nodesByGroup.default || [];
  const profileNodes = nodesByGroup.profile || [];
  const passwordNodes = nodesByGroup.password || [];

  // Get visible input fields from default and password groups
  const inputNodes = filterInputNodes(
    sortNodes([...defaultNodes, ...passwordNodes])
  );

  // Get hidden fields (excluding CSRF token which is handled separately)
  const hiddenNodes = [...defaultNodes, ...passwordNodes].filter(
    (node) =>
      isUiNodeInputAttributes(node.attributes) &&
      node.attributes.type === "hidden" &&
      node.attributes.name !== "csrf_token"
  );

  // Get submit button from profile or password group (password group takes precedence for password step)
  const submitButton =
    findSubmitButton(sortNodes(passwordNodes)) ||
    findSubmitButton(sortNodes(profileNodes));

  // Build login URL with return_to parameter
  const loginHref =
    login_url && flow.return_to
      ? `${login_url}?return_to=${encodeURIComponent(flow.return_to)}`
      : login_url;

  return (
    <div>
      <Messages flow={flow} />
      <Card className="w-full max-w-md mx-auto">
        {Header && (
          <CardHeader>
            <CardTitle className="text-center pb-1">{Header}</CardTitle>
          </CardHeader>
        )}

        <CardContent className="space-y-6">
          {/* OIDC buttons (if present) */}
          {oidcNodes.length > 0 && (
            <OidcGroup
              nodes={sortNodes(oidcNodes)}
              flowAction={flow.ui.action}
              flowMethod={flow.ui.method}
              csrfToken={csrfToken}
              groupIndex={0}
              groupName="oidc"
            />
          )}

          {/* Main registration form with inputs and submit button */}
          <div>
            {oidcNodes.length > 0 && <Divider withText />}

            <form action={flow.ui.action} method={flow.ui.method}>
              <div className="space-y-4">
                {csrfToken && <HiddenInput node={csrfToken} />}

                {/* Render all hidden fields (traits stored from previous steps) */}
                {hiddenNodes.map((node, idx) => (
                  <HiddenInput key={`hidden-${idx}`} node={node} />
                ))}

                {inputNodes.map((node, idx) => (
                  <FormInput key={idx} node={node} />
                ))}

                {submitButton && <SubmitButton node={submitButton} />}
              </div>
            </form>

            {/* Navigation to Login */}
            {login_url && (
              <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <a
                  href={loginHref}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Go to Login
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
