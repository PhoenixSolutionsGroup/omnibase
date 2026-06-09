import { definePolicy } from "@omnibase/cli/db/policies";
import { Prisma } from "./generated";

definePolicy<Prisma.Projects>("projects", {
  select: {
    anon: { published: true },
    auth: (a) => ({ tenant_id: a.tenantId }),
  },
  insert: { anon: false, auth: (a) => ({ tenant_id: a.tenantId }) },
  update: { anon: false, auth: (a) => ({ tenant_id: a.tenantId }) },
  delete: { anon: false, auth: true },
});
