import { definePolicy } from "@omnibase/cli/db/policies";
import { Prisma } from "./generated";

definePolicy<Prisma.project_branchesWhereInput>("project_branches", {
  select: {
    anon: { using: false },
    auth: { using: (a) => ({ project: { tenant_id: a.tenantId } }) },
  },
  insert: {
    anon: { check: false },
    auth: { check: (a) => ({ project: { tenant_id: a.tenantId } }) },
  },
  update: {
    anon: { check: false, using: false },
    auth: {
      check: (a) => ({ project: { tenant_id: a.tenantId } }),
      using: (a) => ({ project: { tenant_id: a.tenantId } })
    },
  },
  delete: { anon: { using: false }, auth: { using: (a) => ({ project: { tenant_id: a.tenantId } }) } },
});
