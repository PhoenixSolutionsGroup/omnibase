export * from "./generated";

import { loadSchema } from "@omnibase/cli/db/rls-policies";
import { Prisma } from "./generated";

loadSchema(Prisma.dmmf);
