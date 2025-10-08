import { Context, KetoArray, Namespace, SubjectSet } from "./types";

class User implements Namespace {}

class Tenant implements Namespace {
  related: {
    owners: User[];
    admins: User[];
    members: User[];
    can_invite: User[];
    can_delete: User[];
    can_manage_billing: User[];
  };

  permits = {
    invite: (ctx: Context): boolean =>
      this.related.owners.includes(ctx.subject) ||
      this.related.admins.includes(ctx.subject) ||
      this.related.can_invite.includes(ctx.subject),

    delete: (ctx: Context): boolean =>
      this.related.owners.includes(ctx.subject) ||
      this.related.can_delete.includes(ctx.subject),

    view: (ctx: Context): boolean =>
      this.related.owners.includes(ctx.subject) ||
      this.related.admins.includes(ctx.subject) ||
      this.related.members.includes(ctx.subject),

    manage_members: (ctx: Context): boolean =>
      this.related.owners.includes(ctx.subject) ||
      this.related.admins.includes(ctx.subject),

    manage_billing: (ctx: Context): boolean =>
      this.related.owners.includes(ctx.subject) ||
      this.related.admins.includes(ctx.subject) ||
      this.related.can_manage_billing.includes(ctx.subject),
  };
}
