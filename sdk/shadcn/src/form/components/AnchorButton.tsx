import type { UiNode } from "@ory/client-fetch";
import { Button } from "@/components/ui/button";

type AnchorButtonProps = {
  node: UiNode;
  variant?: "default" | "outline";
  className?: string;
};

export function AnchorButton({
  node,
  variant = "default",
  className = "w-full",
}: AnchorButtonProps) {
  // Check if this is an anchor node
  if (node.type !== "a" || !("href" in node.attributes)) {
    return null;
  }

  const href = node.attributes.href as string;
  const title = node.attributes.title;
  const label = node.meta?.label;

  // Get the button text from title or label
  const buttonText =
    (typeof title === "object" && title !== null && "text" in title
      ? title.text
      : typeof title === "string"
      ? title
      : null) ||
    (label && typeof label === "object" && "text" in label
      ? label.text
      : null) ||
    "Continue";

  return (
    <Button variant={variant} className={className} asChild>
      <a href={href}>{buttonText}</a>
    </Button>
  );
}
