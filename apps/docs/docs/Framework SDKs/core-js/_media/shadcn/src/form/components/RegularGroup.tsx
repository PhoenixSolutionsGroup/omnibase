import type { UiNode } from "@ory/client-fetch";
import { HiddenInput } from "./HiddenInput";
import { FormInput } from "./FormInput";
import { SubmitButton } from "./SubmitButton";
import { Divider } from "./Divider";

type RegularGroupProps = {
  inputNodes: UiNode[];
  submitButton: UiNode | undefined;
  flowAction: string;
  flowMethod: string;
  csrfToken: UiNode | undefined;
  groupIndex: number;
};

export function RegularGroup({
  inputNodes,
  submitButton,
  flowAction,
  flowMethod,
  csrfToken,
  groupIndex,
}: RegularGroupProps) {
  return (
    <div>
      {groupIndex > 0 && <Divider />}

      <form action={flowAction} method={flowMethod}>
        <div className="space-y-4">
          {csrfToken && <HiddenInput node={csrfToken} />}

          {inputNodes.map((node, idx) => (
            <FormInput key={idx} node={node} />
          ))}

          {submitButton && <SubmitButton node={submitButton} />}
        </div>
      </form>
    </div>
  );
}
