import { Context, KetoArray, Namespace, SubjectSet } from "./types";

class User implements Namespace {}

class ApiKey implements Namespace {}

class Tenant implements Namespace {
  related: {
    // User-only permissions
    can_delete_tenant: User[];
    can_invite_user: User[];
    can_update_user_role: User[];
    can_remove_user: User[];
    can_view_users: User[];
    can_create_roles: User[];
    can_update_roles: User[];
    can_delete_roles: User[];
    can_create_api_keys: User[];
    can_view_api_keys: User[];
    can_revoke_api_keys: User[];
    // Permissions that can be granted to both User and ApiKey
    can_rotate_keys: (User | ApiKey)[];
    can_view_db_secret_key: (User | ApiKey)[];
    can_view_database_password: (User | ApiKey)[];
    can_view_api_service_key: (User | ApiKey)[];
    can_update_project_env: (User | ApiKey)[];
    can_view_project_env: (User | ApiKey)[];
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

    rotate_keys: (ctx: Context): boolean =>
      this.related.can_rotate_keys.includes(ctx.subject),

    view_db_secret_key: (ctx: Context): boolean =>
      this.related.can_view_db_secret_key.includes(ctx.subject),
  };
}
