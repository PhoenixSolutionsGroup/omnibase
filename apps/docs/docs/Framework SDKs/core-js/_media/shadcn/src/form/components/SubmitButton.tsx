import type { UiNode } from "@ory/client-fetch";
import { Button } from "@/components/ui/button";
import { isUiNodeInputAttributes } from "../types";

type SubmitButtonProps = {
  node: UiNode;
  variant?: "default" | "outline";
  className?: string;
};

export function SubmitButton({
  node,
  variant = "default",
  className = "w-full",
}: SubmitButtonProps) {
  if (!isUiNodeInputAttributes(node.attributes)) {
    return null;
  }

  return (
    <Button
      type="submit"
      name={node.attributes.name}
      value={node.attributes.value || ""}
      variant={variant}
      className={className}
      disabled={node.attributes.disabled}
    >
      {node.meta.label?.text || node.attributes.value || "Submit"}
    </Button>
  );
}
