import type { RecoveryFlow } from "@ory/client-fetch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Messages } from "../components/ui/messages";
import { FormInput } from "./components/FormInput";
import { SubmitButton } from "./components/SubmitButton";
import { HiddenInput } from "./components/HiddenInput";
import {
  groupNodesByGroup,
  sortNodes,
  findSubmitButton,
  filterInputNodes,
  findCsrfToken,
} from "./utils";

export type RecoveryFormProps = {
  flow: RecoveryFlow;
  Header?: React.ReactNode;
};

export function RecoveryForm({ flow, Header }: RecoveryFormProps) {
  const nodesByGroup = groupNodesByGroup(flow.ui.nodes);
  const csrfToken = findCsrfToken(flow.ui.nodes);

  const codeNodes = nodesByGroup.code || [];
  const linkNodes = nodesByGroup.link || [];

  // Recovery typically uses either code or link method
  const activeNodes = codeNodes.length > 0 ? codeNodes : linkNodes;

  // Get input fields and submit button
  const inputNodes = filterInputNodes(sortNodes(activeNodes));
  const submitButton = findSubmitButton(sortNodes(activeNodes));

  return (
    <div>
      <Messages flow={flow} />
      <Card className="w-full max-w-md mx-auto">
        {Header && (
          <CardHeader>
            <CardTitle className="text-center pb-1">{Header}</CardTitle>
          </CardHeader>
        )}

        <CardContent>
          <form action={flow.ui.action} method={flow.ui.method}>
            <div className="space-y-4">
              {csrfToken && <HiddenInput node={csrfToken} />}

              {inputNodes.map((node, idx) => (
                <FormInput key={idx} node={node} />
              ))}

              {submitButton && <SubmitButton node={submitButton} />}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
