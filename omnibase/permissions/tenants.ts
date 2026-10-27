import { Context, Namespace } from "./types";

export class User implements Namespace {}

export class ApiKey implements Namespace {}

export class Tenant implements Namespace {
  related: {
    /**
     * @hidden
     */
    owner: User[];

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
     * @subGroup Role Assignment
     * @displayName Update User Roles
     * @role owner
     * @role admin
     */
    can_update_user_role: User[];

    /**
     * @group User Management
     * @subGroup Role Assignment
     * @displayName Promote to Owner
     * @role owner
     */
    can_update_user_role_to_owner: User[];

    /**
     * @group User Management
     * @subGroup Role Assignment
     * @displayName Demote Owner
     * @role owner
     */
    can_remove_owner_role: User[];

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
     * @role dev
     * @role member
     */
    can_view_users: User[];

    /**
     * @group Roles & Permissions
     * @displayName Manage Roles
     * @role owner
     * @role admin
     */
    can_update_roles: User[];

    /**
     * @group API Keys
     * @displayName Create API Keys
     * @role owner
     * @role admin
     * @role dev
     */
    can_create_api_keys: User[];

    /**
     * @group API Keys
     * @displayName View API Keys
     * @role owner
     * @role admin
     * @role dev
     */
    can_view_api_keys: User[];

    /**
     * @group API Keys
     * @displayName Revoke API Keys
     * @role owner
     * @role admin
     * @role dev
     */
    can_revoke_api_keys: User[];

    /**
     * @group Projects
     * @displayName Create Projects
     * @role owner
     * @role admin
     * @role dev
     */
    can_create_projects: User[];

    /**
     * @group Database
     * @subGroup Secrets
     * @displayName Rotate Keys
     * @role owner
     * @role dev
     */
    can_rotate_keys: (User | ApiKey)[];

    /**
     * @group Database
     * @subGroup Secrets
     * @displayName View DB Secret Key
     * @role owner
     * @role admin
     */
    can_view_db_secret_key: (User | ApiKey)[];

    /**
     * @group Database
     * @subGroup Secrets
     * @displayName View Database Password
     * @role owner
     * @role admin
     */
    can_view_database_password: (User | ApiKey)[];

    /**
     * @group Database
     * @subGroup Connection
     * @displayName View Connection String
     * @role owner
     * @role admin
     * @role dev
     */
    can_view_database_connection_string: (User | ApiKey)[];

    /**
     * @group API
     * @displayName View API Service Key
     * @role owner
     * @role admin
     */
    can_view_api_service_key: (User | ApiKey)[];

    /**
     * @group Configuration
     * @displayName Update Environment
     * @role owner
     * @role admin
     * @role dev
     */
    can_update_project_env: (User | ApiKey)[];

    /**
     * @group Configuration
     * @displayName View Environment
     * @role owner
     * @role admin
     * @role dev
     */
    can_view_project_env: (User | ApiKey)[];

    /**
     * @group Storage
     * @displayName View Storage Credentials
     * @role owner
     * @role admin
     */
    can_view_storage_credentials: (User | ApiKey)[];

    /**
     * @group Database
     * @subGroup Secrets
     * @displayName View DB Secret Key (Protected)
     * @role owner
     * @role admin
     */
    can_view_db_secret_key_protected: (User | ApiKey)[];

    /**
     * @group Database
     * @subGroup Secrets
     * @displayName Rotate Keys (Protected)
     * @role owner
     * @role admin
     */
    can_rotate_keys_protected: (User | ApiKey)[];

    /**
     * @group Database
     * @subGroup Secrets
     * @displayName View Database Password (Protected)
     * @role owner
     * @role admin
     */
    can_view_database_password_protected: (User | ApiKey)[];

    /**
     * @group Database
     * @subGroup Connection
     * @displayName View Connection String (Protected)
     * @role owner
     * @role admin
     */
    can_view_database_connection_string_protected: (User | ApiKey)[];

    /**
     * @group API
     * @displayName View API Service Key (Protected)
     * @role owner
     * @role admin
     */
    can_view_api_service_key_protected: (User | ApiKey)[];

    /**
     * @group Configuration
     * @displayName Update Environment (Protected)
     * @role owner
     * @role admin
     */
    can_update_project_env_protected: (User | ApiKey)[];

    /**
     * @group Configuration
     * @displayName View Environment (Protected)
     * @role owner
     * @role admin
     */
    can_view_project_env_protected: (User | ApiKey)[];

    /**
     * @group Storage
     * @displayName View Storage Credentials (Protected)
     * @role owner
     * @role admin
     */
    can_view_storage_credentials_protected: (User | ApiKey)[];
  };

  permits = {
    invite_user: (ctx: Context): boolean => this.related.can_invite_user.includes(ctx.subject),

    delete_tenant: (ctx: Context): boolean => this.related.can_delete_tenant.includes(ctx.subject),

    remove_user: (ctx: Context): boolean => this.related.can_remove_user.includes(ctx.subject),

    update_user_role: (ctx: Context): boolean => this.related.can_update_user_role.includes(ctx.subject),

    update_user_role_to_owner: (ctx: Context): boolean =>
      this.related.can_update_user_role_to_owner.includes(ctx.subject),

    remove_owner_role: (ctx: Context): boolean => this.related.can_remove_owner_role.includes(ctx.subject),

    view_users: (ctx: Context): boolean => this.related.can_view_users.includes(ctx.subject),

    update_roles: (ctx: Context): boolean => this.related.can_update_roles.includes(ctx.subject),

    create_api_keys: (ctx: Context): boolean => this.related.can_create_api_keys.includes(ctx.subject),

    view_api_keys: (ctx: Context): boolean => this.related.can_view_api_keys.includes(ctx.subject),

    revoke_api_keys: (ctx: Context): boolean => this.related.can_revoke_api_keys.includes(ctx.subject),

    create_projects: (ctx: Context): boolean =>
      this.related.can_create_projects.includes(ctx.subject) || this.related.owner.includes(ctx.subject)
  };
}
