import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

export default function Shift() {
  return (
    <Card>
      <CardContent>
        <div className="w-full">
          <form>
            <FieldGroup>
              <FieldSet>
                {/* <FieldLegend>Basic Information</FieldLegend>
            <FieldDescription>
              Add the basic information for this workplace
            </FieldDescription> */}
                <FieldGroup>
                  <div className="flex gap-2">
                    <Field className="w-32">
                      <FieldLabel htmlFor="start-time-picker">
                        Start time
                      </FieldLabel>
                      <Input
                        type="time"
                        id="start-time-picker"
                        step="1"
                        defaultValue="10:30:00"
                        className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                        required
                      />
                    </Field>
                    <Field className="w-32">
                      <FieldLabel htmlFor="end-time-picker">
                        End time
                      </FieldLabel>
                      <Input
                        type="time"
                        id="end-time-picker"
                        step="1"
                        defaultValue="10:30:00"
                        className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                        required
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="worker-count">
                        Workers needed
                      </FieldLabel>
                      <Input id="worker-count" required type="number" />
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
              <Field orientation="horizontal" className="flex justify-end">
                <Button type="submit">Add</Button>
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
