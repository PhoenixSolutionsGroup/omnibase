import { InfoIcon, Search } from "lucide-react";

import { Field } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";

export default function SearchBar() {
  return (
    <Field>
      <InputGroup className="max-w-100">
        <InputGroupInput id="input-search" placeholder="Search ..." />
        <InputGroupAddon align="inline-start">
          <Search />
        </InputGroupAddon>
      </InputGroup>
    </Field>
  );
}
