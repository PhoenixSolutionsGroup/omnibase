import type { UiNode } from "@ory/client-fetch";
import { isUiNodeInputAttributes } from "../types";
import { HiddenInput } from "./HiddenInput";
import { SubmitButton } from "./SubmitButton";
import { Divider } from "./Divider";

type OidcGroupProps = {
  nodes: UiNode[];
  flowAction: string;
  flowMethod: string;
  csrfToken: UiNode | undefined;
  groupIndex: number;
  groupName: string;
};

export function OidcGroup({
  nodes,
  flowAction,
  flowMethod,
  csrfToken,
  groupIndex,
  groupName,
}: OidcGroupProps) {
  const submitButtons = nodes.filter(
    (node) =>
      isUiNodeInputAttributes(node.attributes) &&
      node.attributes.type === "submit"
  );

  return (
    <div>
      {groupIndex > 0 && <Divider withText />}

      <div className="space-y-3">
        {submitButtons.map((node, btnIndex) => (
          <form
            key={`${groupName}-${btnIndex}`}
            action={flowAction}
            method={flowMethod}
            className="w-full"
          >
            {csrfToken && <HiddenInput node={csrfToken} />}
            <SubmitButton node={node} variant="outline" />
          </form>
        ))}
      </div>
    </div>
  );
}
