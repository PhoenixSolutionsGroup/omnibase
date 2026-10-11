import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function Basic() {
  return (
    <div className="w-full">
      <form>
        <FieldGroup>
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input id="name" placeholder="Sam Smith" required />
              </Field>
              <Field>
                <FieldLabel htmlFor="address">E-Mail</FieldLabel>
                <Input
                  id="address"
                  placeholder="sam.smith@gmail.com"
                  required
                />
              </Field>
            </FieldGroup>
          </FieldSet>
        </FieldGroup>
      </form>
    </div>
  );
}
