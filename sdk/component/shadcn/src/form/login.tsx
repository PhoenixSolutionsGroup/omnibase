import type { LoginFlow } from "@ory/client-fetch";
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

export type LoginFormProps = {
  flow: LoginFlow;
  Header?: React.ReactNode;
  register_url?: string;
};

export function LoginForm({ flow, Header, register_url }: LoginFormProps) {
  const nodesByGroup = groupNodesByGroup(flow.ui.nodes);
  const csrfToken = findCsrfToken(flow.ui.nodes);

  const oidcNodes = nodesByGroup.oidc || [];
  const defaultNodes = nodesByGroup.default || [];
  const passwordNodes = nodesByGroup.password || [];

  // Get identifier from default group
  const identifierNodes = filterInputNodes(sortNodes(defaultNodes));

  // Get password field and submit button from password group
  const passwordInputNodes = filterInputNodes(sortNodes(passwordNodes));
  const submitButton = findSubmitButton(sortNodes(passwordNodes));

  // Build register URL with return_to parameter
  const registerHref =
    register_url && flow.return_to
      ? `${register_url}?return_to=${encodeURIComponent(flow.return_to)}`
      : register_url;

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

          {/* Main login form */}
          <div>
            {oidcNodes.length > 0 && <Divider withText />}

            <form action={flow.ui.action} method={flow.ui.method}>
              <div className="space-y-4">
                {csrfToken && <HiddenInput node={csrfToken} />}

                {/* Identifier (email) */}
                {identifierNodes.map((node, idx) => (
                  <FormInput key={idx} node={node} />
                ))}

                {/* Password field */}
                {passwordInputNodes.map((node, idx) => (
                  <FormInput key={idx} node={node} />
                ))}

                {/* Submit button */}
                {submitButton && <SubmitButton node={submitButton} />}
              </div>
            </form>

            {/* Navigation to Register */}
            {register_url && (
              <div className="mt-4 text-center text-sm">
                Don't have an account?{" "}
                <a
                  href={registerHref}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Go to Register
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
