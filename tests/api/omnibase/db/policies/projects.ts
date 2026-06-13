import { definePolicy } from "@omnibase/cli/db/policies";
import { Prisma } from "./generated";

definePolicy<Prisma.projectsWhereInput>("projects", {
  select: {
    anon: { using: { published: true } },
    auth: { using: (a) => ({ tenant_id: a.tenantId }) },
  },
  insert: {
    anon: { check: false },
    auth: { check: (a) => ({ tenant_id: a.tenantId }) },
  },
  update: {
    anon: { check: false, using: false },
    auth: {
      check: (a) => ({ tenant_id: a.tenantId }),
      using: (a) => ({ tenant_id: a.tenantId }),
    },
  },
  delete: { anon: { using: false }, auth: { using: true } },
});
