import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";

type Props = {
  id: string;
  title: string;
  description: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

export const CheckboxCard = ({
  id,
  title,
  description,
  checked,
  defaultChecked,
  onCheckedChange,
}: Props) => {
  return (
    <FieldLabel htmlFor={id} className="cursor-pointer">
      <Field orientation="horizontal">
        <Checkbox
          id={id}
          name={id}
          checked={checked}
          defaultChecked={defaultChecked}
          onCheckedChange={(value) => onCheckedChange?.(value === true)}
        />
        <FieldContent>
          <FieldTitle>{title}</FieldTitle>
          <FieldDescription>{description}</FieldDescription>
        </FieldContent>
      </Field>
    </FieldLabel>
  );
};
