import { definePolicy } from "@omnibase/cli/db/policies";
import { Prisma } from "./generated";

definePolicy<Prisma.projectsWhereInput>("projects", {
  select: (auth) => {
    if (!auth.userId) return { published: true };
    return { tenant_id: auth.tenantId! };
  },
});
