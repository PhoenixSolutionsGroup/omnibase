import type { UiNode, UiNodeInputAttributes } from "@ory/client-fetch";
import { isUiNodeInputAttributes } from "./types";

const TYPE_ORDER: Record<string, number> = {
  hidden: 0,
  text: 1,
  email: 1,
  password: 1,
  checkbox: 1,
  submit: 2,
};

export function sortNodes(nodes: UiNode[]): UiNode[] {
  return [...nodes].sort((a, b) => {
    const aIsInput = isUiNodeInputAttributes(a.attributes);
    const bIsInput = isUiNodeInputAttributes(b.attributes);

    // Non-input nodes at the end
    if (!aIsInput && !bIsInput) return 0;
    if (!aIsInput) return 1;
    if (!bIsInput) return -1;

    // Now we know both are input attributes
    const aAttrs = a.attributes as UiNodeInputAttributes;
    const bAttrs = b.attributes as UiNodeInputAttributes;

    const aOrder = TYPE_ORDER[aAttrs.type] ?? 1;
    const bOrder = TYPE_ORDER[bAttrs.type] ?? 1;

    return aOrder - bOrder;
  });
}

export function findSubmitButton(nodes: UiNode[]): UiNode | undefined {
  return nodes.find(
    (node) =>
      isUiNodeInputAttributes(node.attributes) &&
      node.attributes.type === "submit"
  );
}

export function findAnchorNode(nodes: UiNode[]): UiNode | undefined {
  return nodes.find((node) => node.type === "a");
}

export function filterInputNodes(nodes: UiNode[]): UiNode[] {
  return nodes.filter(
    (node) =>
      isUiNodeInputAttributes(node.attributes) &&
      node.attributes.type !== "submit" &&
      node.attributes.type !== "hidden"
  );
}

export function findCsrfToken(nodes: UiNode[]): UiNode | undefined {
  return nodes.find(
    (node) =>
      isUiNodeInputAttributes(node.attributes) &&
      node.attributes.name === "csrf_token"
  );
}

export function groupNodesByGroup(nodes: UiNode[]): Record<string, UiNode[]> {
  return nodes.reduce((groups, node) => {
    const group = node.group || "default";
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(node);
    return groups;
  }, {} as Record<string, UiNode[]>);
}
