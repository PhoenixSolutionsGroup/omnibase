import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const months = [
  { label: "MM", value: null },
  { label: "01", value: "01" },
  { label: "02", value: "02" },
  { label: "03", value: "03" },
  { label: "04", value: "04" },
  { label: "05", value: "05" },
  { label: "06", value: "06" },
  { label: "07", value: "07" },
  { label: "08", value: "08" },
  { label: "09", value: "09" },
  { label: "10", value: "10" },
  { label: "11", value: "11" },
  { label: "12", value: "12" },
];

const years = [
  { label: "YYYY", value: null },
  { label: "2024", value: "2024" },
  { label: "2025", value: "2025" },
  { label: "2026", value: "2026" },
  { label: "2027", value: "2027" },
  { label: "2028", value: "2028" },
  { label: "2029", value: "2029" },
];

export default function Basic() {
  return (
    <div className="w-full">
      <form>
        <FieldGroup>
          <FieldSet>
            {/* <FieldLegend>Basic Information</FieldLegend>
            <FieldDescription>
              Add the basic information for this workplace
            </FieldDescription> */}
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Name of the workplace</FieldLabel>
                <Input id="name" placeholder="Evil Rabbit" required />
              </Field>

              <div className="flex flex-col gap-2">
                <Field>
                  <FieldLabel htmlFor="address">Address</FieldLabel>
                  <Input id="address" placeholder="Evil Rabbit" required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="address-2">Adress Line 2</FieldLabel>
                  <Input id="address-2" placeholder="Evil Rabbit" required />
                </Field>
                <div className="grid grid-cols-2 gap-2">
                  <Field>
                    <FieldLabel htmlFor="city">City</FieldLabel>
                    <Input id="city" placeholder="Evil Rabbit" required />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="postcode">Postcode</FieldLabel>
                    <Input id="postcode" placeholder="Evil Rabbit" required />
                  </Field>
                </div>
                <Field>
                  <FieldLabel htmlFor="country">Country</FieldLabel>
                  <Input id="country" placeholder="Evil Rabbit" required />
                </Field>
              </div>
            </FieldGroup>
          </FieldSet>
          <FieldSeparator />
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="checkout-7j9-optional-comments">
                  Comments
                </FieldLabel>
                <Textarea
                  id="checkout-7j9-optional-comments"
                  placeholder="Add any additional comments"
                  className="resize-none"
                />
              </Field>
            </FieldGroup>
          </FieldSet>
        </FieldGroup>
      </form>
    </div>
  );
}
