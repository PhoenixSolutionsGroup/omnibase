import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type Props = {
  id: string;
  title: string;
  description: string;
};
export function RadioGroupChoiceCard(item: Props) {
  return (
    <FieldLabel htmlFor={item.id}>
      <Field orientation="horizontal">
        <FieldContent>
          <FieldTitle>{item.title}</FieldTitle>
          <FieldDescription>{item.description}</FieldDescription>
        </FieldContent>
        <RadioGroupItem value={item.id} id={item.id} />
      </Field>
    </FieldLabel>
  );
}
