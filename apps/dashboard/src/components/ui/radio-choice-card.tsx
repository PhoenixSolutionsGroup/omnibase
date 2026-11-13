import * as React from "react";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  // Value reported to the RadioGroup. Defaults to id.
  value?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  // Free-form slot rendered under the title/description.
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
};

export function RadioChoiceCard({
  id,
  value,
  title,
  description,
  children,
  className,
  disabled,
}: Props) {
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
        <RadioGroupItem value={value ?? id} id={id} disabled={disabled} />
        <FieldContent>
          <FieldTitle className="w-full">{title}</FieldTitle>
          {description && <FieldDescription>{description}</FieldDescription>}
          {children}
        </FieldContent>
      </Field>
    </FieldLabel>
  );
}
