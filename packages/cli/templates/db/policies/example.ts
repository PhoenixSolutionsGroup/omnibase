import { definePolicy } from "@omnibase/cli/db/policies";
import { Prisma } from "./generated";

definePolicy<Prisma.ProjectsWhereInput>("projects", {
  select: (auth) => ({ tenant_id: auth.tenantId }),
  delete: (auth) => ({ tenant_id: auth.tenantId }),
});
