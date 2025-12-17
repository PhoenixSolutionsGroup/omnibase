import { Context, Namespace, SubjectSet } from "./types";

export class User implements Namespace {}

export class ApiKey implements Namespace {}

export class Tenant implements Namespace {
  related: {
    can_delete_tenant: User[];
    can_invite_user: User[];
    can_update_user_role: User[];
    can_update_user_role_to_owner: User[];
    can_remove_owner_role: User[];
    can_remove_user: User[];
    can_view_users: User[];
    can_view_db_secret_key: User[];
    can_rotate_keys: User[];
    can_view_database_password: User[];
    can_view_database_connection_string: User[];
    can_view_postmark_server_token: User[];
    can_update_roles: User[];
    can_view_api_service_key: User[];
    can_create_api_keys: User[];
    can_view_api_keys: User[];
    can_revoke_api_keys: User[];
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

    update_user_role_to_owner: (ctx: Context): boolean =>
      this.related.can_update_user_role_to_owner.includes(ctx.subject),

    remove_owner_role: (ctx: Context): boolean =>
      this.related.can_remove_owner_role.includes(ctx.subject),

    view_users: (ctx: Context): boolean =>
      this.related.can_view_users.includes(ctx.subject),

    view_db_secret_key: (ctx: Context): boolean =>
      this.related.can_view_db_secret_key.includes(ctx.subject),

    update_roles: (ctx: Context): boolean =>
      this.related.can_update_roles.includes(ctx.subject),

    create_api_keys: (ctx: Context): boolean =>
      this.related.can_create_api_keys.includes(ctx.subject),

    view_api_keys: (ctx: Context): boolean =>
      this.related.can_view_api_keys.includes(ctx.subject),

    revoke_api_keys: (ctx: Context): boolean =>
      this.related.can_revoke_api_keys.includes(ctx.subject),
  };
}
