import type { UiNode } from "@ory/client-fetch";
import { isUiNodeInputAttributes } from "../types";

type HiddenInputProps = {
  node: UiNode;
};

export function HiddenInput({ node }: HiddenInputProps) {
  if (!isUiNodeInputAttributes(node.attributes)) {
    return null;
  }

  return (
    <input
      name={node.attributes.name}
      type="hidden"
      value={node.attributes.value || ""}
      readOnly
    />
  );
}
