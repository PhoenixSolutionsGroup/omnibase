import { Context, Namespace } from "./types";

export class User implements Namespace {}

export class ApiKey implements Namespace {}

export class Tenant implements Namespace {
  related: {
    /**
     * @group Tenant Administration
     * @displayName Delete Tenant
     * @role owner
     */
    can_delete_tenant: User[];

    /**
     * @group User Management
     * @displayName Invite Users
     * @role owner
     * @role admin
     */
    can_invite_user: User[];

    /**
     * @group User Management
     * @displayName Update User Roles
     * @role owner
     * @role admin
     */
    can_update_user_role: User[];

    /**
     * @group User Management
     * @displayName Remove Users
     * @role owner
     * @role admin
     */
    can_remove_user: User[];

    /**
     * @group User Management
     * @displayName View Users
     * @role owner
     * @role admin
     * @role member
     */
    can_view_users: User[];

    /**
     * @group Roles & Permissions
     * @displayName Create Roles
     * @role owner
     * @role admin
     */
    can_create_roles: User[];

    /**
     * @group Roles & Permissions
     * @displayName Update Roles
     * @role owner
     * @role admin
     */
    can_update_roles: User[];

    /**
     * @group Roles & Permissions
     * @displayName Delete Roles
     * @role owner
     * @role admin
     */
    can_delete_roles: User[];

    /**
     * @group API Keys
     * @displayName Create API Keys
     * @role owner
     * @role admin
     */
    can_create_api_keys: User[];

    /**
     * @group API Keys
     * @displayName View API Keys
     * @role owner
     * @role admin
     */
    can_view_api_keys: User[];

    /**
     * @group API Keys
     * @displayName Revoke API Keys
     * @role owner
     * @role admin
     */
    can_revoke_api_keys: User[];

    /**
     * @group Database
     * @subGroup Secrets
     * @displayName Rotate Keys
     * @role owner
     */
    can_rotate_keys: (User | ApiKey)[];

    /**
     * @group Database
     * @subGroup Secrets
     * @displayName View DB Secret Key
     * @role owner
     */
    can_view_db_secret_key: (User | ApiKey)[];

    /**
     * @group Database
     * @subGroup Secrets
     * @displayName View Database Password
     * @role owner
     */
    can_view_database_password: (User | ApiKey)[];

    /**
     * @group API
     * @displayName View API Service Key
     * @role owner
     * @role admin
     */
    can_view_api_service_key: (User | ApiKey)[];

    /**
     * @group Configuration
     * @displayName Update Project Environment
     * @role owner
     * @role admin
     */
    can_update_project_env: (User | ApiKey)[];

    /**
     * @group Configuration
     * @displayName View Project Environment
     * @role owner
     * @role admin
     * @role member
     */
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
