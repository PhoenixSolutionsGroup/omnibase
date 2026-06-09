import { definePolicy } from "@omnibase/cli/db/policies";
import { Prisma } from "./generated";

definePolicy<Prisma.Projects>("projects", {
  // `anon` is required on every op (security-sensitive). Use `anon: false` to
  // deny anonymous access, or a static filter (e.g. `{ published: true }`) to
  // allow it. `auth` is a filter scoped to the request's tenant.
  select: {
    anon: { published: true },
    auth: (a) => ({ tenant_id: a.tenantId }),
  },
  insert: { anon: false, auth: (a) => ({ tenant_id: a.tenantId }) },
  update: { anon: false, auth: (a) => ({ tenant_id: a.tenantId }) },
  delete: { anon: false, auth: true },
});
