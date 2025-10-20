import { Context, KetoArray, Namespace, SubjectSet } from "./types";

class User implements Namespace {}

class Tenant implements Namespace {
  related: {
    admins: User[];
    owners: User[];
    members: User[];
    can_invite_users: User[];
    can_update_user_role: User[];
    can_remove_user: User[];
  };

  permits = {
    invite_user: (ctx: Context): boolean =>
      this.related.owners.includes(ctx.subject) ||
      this.related.admins.includes(ctx.subject) ||
      this.related.can_invite_users.includes(ctx.subject),

    delete_tenant: (ctx: Context): boolean =>
      this.related.owners.includes(ctx.subject),

    remove_user: (ctx: Context): boolean =>
      this.related.owners.includes(ctx.subject) ||
      this.related.admins.includes(ctx.subject) ||
      this.related.can_remove_user.includes(ctx.subject),

    update_user_role: (ctx: Context): boolean =>
      this.related.owners.includes(ctx.subject) ||
      this.related.admins.includes(ctx.subject) ||
      this.related.can_update_user_role.includes(ctx.subject),
  };
}
