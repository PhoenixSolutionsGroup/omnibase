import type { UiNode } from "@ory/client-fetch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isUiNodeInputAttributes } from "../types";

type FormInputProps = {
  node: UiNode;
};

export function FormInput({ node }: FormInputProps) {
  if (!isUiNodeInputAttributes(node.attributes)) {
    return null;
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={node.attributes.name}>
        {node.meta.label?.text}
        {node.attributes.required && (
          <span className="text-destructive ml-1">*</span>
        )}
      </Label>
      <Input
        id={node.attributes.name}
        name={node.attributes.name}
        type={node.attributes.type}
        defaultValue={node.attributes.value || ""}
        required={node.attributes.required}
        disabled={node.attributes.disabled}
        autoComplete={node.attributes.autocomplete}
        placeholder={`Enter your ${
          node.meta.label?.text?.toLowerCase() || node.attributes.name
        }`}
      />
    </div>
  );
}
