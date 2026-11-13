import * as React from "react";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  // Free-form slot rendered under the title/description.
  children?: React.ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
};

export const CheckboxCard = ({
  id,
  title,
  description,
  children,
  checked,
  defaultChecked,
  onCheckedChange,
  className,
  disabled,
}: Props) => {
  return (
    <FieldLabel
      htmlFor={id}
      className={cn(
        "cursor-pointer",
        disabled && "cursor-not-allowed",
        className,
      )}
    >
      <Field orientation="horizontal">
        <Checkbox
          id={id}
          name={id}
          checked={checked}
          defaultChecked={defaultChecked}
          disabled={disabled}
          onCheckedChange={(value) => onCheckedChange?.(value === true)}
        />
        <FieldContent>
          <FieldTitle className="w-full">{title}</FieldTitle>
          {description && <FieldDescription>{description}</FieldDescription>}
          {children}
        </FieldContent>
      </Field>
    </FieldLabel>
  );
};
