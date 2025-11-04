import { Context, KetoArray, Namespace, SubjectSet } from "./types";

class User implements Namespace {}

class Tenant implements Namespace {
  related: {
    can_delete_tenant: User[];
    can_invite_user: User[];
    can_update_user_role: User[];
    can_remove_user: User[];
  };

  permits = {
    invite_user: (ctx: Context): boolean =>
      this.related.can_invite_user.includes(ctx.subject),

    delete_tenant: (ctx: Context): boolean =>
      this.related.can_delete_tenant.includes(ctx.subject),

    remove_user: (ctx: Context): boolean =>
      this.related.can_remove_user.includes(ctx.subject),

    update_user_role: (ctx: Context): boolean =>
      this.related.can_update_user_role.includes(ctx.subject),
  };
}
