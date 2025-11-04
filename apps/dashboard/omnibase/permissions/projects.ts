import { Tenant, User } from "./tenants";
import { Context, Namespace, SubjectSet } from "./types";

export class Project implements Namespace {
  related: {
    tenant: Tenant[];
    can_view_db_secret_key: User[];
    can_rotate_keys: User[];
  };

  permits = {
    view_db_secret_key: (ctx: Context): boolean =>
      this.related.can_view_db_secret_key.includes(ctx.subject) ||
      this.related.tenant.traverse((t) =>
        t.related.can_view_db_secret_key.includes(ctx.subject)
      ),
    rotate_keys: (ctx: Context): boolean =>
      this.related.can_rotate_keys.includes(ctx.subject) ||
      this.related.tenant.traverse((t) =>
        t.related.can_rotate_keys.includes(ctx.subject)
      ),
  };
}
