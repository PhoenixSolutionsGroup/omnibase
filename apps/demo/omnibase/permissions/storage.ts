import { Tenant, User } from "./tenants";
import { Context, Namespace } from "./types";

export class StorageObject implements Namespace {
  related: {
    /**
     * @group Storage Objects
     * @displayName Owner
     * @hidden
     */
    owner: User[];

    /**
     * @group Storage Objects
     * @displayName Read Access
     */
    can_read: User[];

    /**
     * @group Storage Objects
     * @displayName Delete Access
     */
    can_delete: User[];

    /**
     * @group Storage Objects
     * @displayName Make Public
     */
    can_make_public: User[];

    /**
     * @hidden — parent link for OPL traversal
     */
    tenant: Tenant[];
  };

  permits = {
    read: (ctx: Context): boolean =>
      this.related.owner.includes(ctx.subject) ||
      this.related.can_read.includes(ctx.subject),

    delete: (ctx: Context): boolean =>
      this.related.owner.includes(ctx.subject) ||
      this.related.can_delete.includes(ctx.subject),

    make_public: (ctx: Context): boolean =>
      this.related.owner.includes(ctx.subject) ||
      this.related.can_make_public.includes(ctx.subject),
  };
}
