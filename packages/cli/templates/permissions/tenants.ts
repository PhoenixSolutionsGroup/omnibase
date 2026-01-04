import { Context, KetoArray, Namespace, SubjectSet } from "./types";

class User implements Namespace {}

class Tenant implements Namespace {
  related: {
    can_delete_tenant: User[];
    can_invite_user: User[];
    can_update_user_role: User[];
    can_remove_user: User[];
    can_view_users: User[];
    can_create_roles: User[];
    can_update_roles: User[];
    can_delete_roles: User[];
    can_remove_owner_role: User[];
    can_update_user_role_to_owner: User[];
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

    view_users: (ctx: Context): boolean =>
      this.related.can_view_users.includes(ctx.subject),

    create_roles: (ctx: Context): boolean =>
      this.related.can_create_roles.includes(ctx.subject),

    update_roles: (ctx: Context): boolean =>
      this.related.can_update_roles.includes(ctx.subject),

    delete_roles: (ctx: Context): boolean =>
      this.related.can_delete_roles.includes(ctx.subject),

    remove_owner_role: (ctx: Context): boolean =>
      this.related.can_remove_owner_role.includes(ctx.subject),

    update_user_role_to_owner: (ctx: Context): boolean =>
      this.related.can_update_user_role_to_owner.includes(ctx.subject),
  };
}
