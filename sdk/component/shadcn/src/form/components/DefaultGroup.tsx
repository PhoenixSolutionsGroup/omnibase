import type { UiNode } from "@ory/client-fetch";
import { isUiNodeInputAttributes } from "../types";
import { sortNodes } from "../utils";
import { HiddenInput } from "./HiddenInput";
import { FormInput } from "./FormInput";
import { SubmitButton } from "./SubmitButton";

type DefaultGroupProps = {
  nodes: UiNode[];
  flowAction: string;
  flowMethod: string;
};

export function DefaultGroup({
  nodes,
  flowAction,
  flowMethod,
}: DefaultGroupProps) {
  const hasVisibleNodes = nodes.some(
    (node) =>
      isUiNodeInputAttributes(node.attributes) &&
      node.attributes.type !== "hidden"
  );

  if (!hasVisibleNodes) {
    return null;
  }

  const sortedNodes = sortNodes(nodes);

  return (
    <form action={flowAction} method={flowMethod}>
      <div className="space-y-4">
        {sortedNodes.map((node, idx) => {
          if (!isUiNodeInputAttributes(node.attributes)) {
            return null;
          }

          const { type } = node.attributes;

          if (type === "hidden") {
            return <HiddenInput key={idx} node={node} />;
          }

          if (type === "submit") {
            return <SubmitButton key={idx} node={node} />;
          }

          return <FormInput key={idx} node={node} />;
        })}
      </div>
    </form>
  );
}
