import { ApiKey, Tenant, User } from "./tenants";
import { Context, Namespace } from "./types";

export class Project implements Namespace {
  related: {
    /**
     * @hidden
     */
    tenant: Tenant[];

    /**
     * @hidden
     */
    owner: (User | ApiKey)[];

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
     * @displayName Rotate Keys
     * @role owner
     * @role admin
     */
    can_rotate_keys: (User | ApiKey)[];

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
     * @role viewer
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
    view_db_secret_key: (ctx: Context): boolean =>
      this.related.owner.includes(ctx.subject) ||
      this.related.can_view_db_secret_key.includes(ctx.subject) ||
      this.related.tenant.traverse((t) => t.related.owner.includes(ctx.subject)) ||
      this.related.tenant.traverse((t) => t.related.can_view_db_secret_key.includes(ctx.subject)),

    rotate_keys: (ctx: Context): boolean =>
      this.related.owner.includes(ctx.subject) ||
      this.related.can_rotate_keys.includes(ctx.subject) ||
      this.related.tenant.traverse((t) => t.related.owner.includes(ctx.subject)) ||
      this.related.tenant.traverse((t) => t.related.can_rotate_keys.includes(ctx.subject)),

    view_database_password: (ctx: Context): boolean =>
      this.related.owner.includes(ctx.subject) ||
      this.related.can_view_database_password.includes(ctx.subject) ||
      this.related.tenant.traverse((t) => t.related.owner.includes(ctx.subject)) ||
      this.related.tenant.traverse((t) => t.related.can_view_database_password.includes(ctx.subject)),

    view_database_connection_string: (ctx: Context): boolean =>
      this.related.owner.includes(ctx.subject) ||
      this.related.can_view_database_connection_string.includes(ctx.subject) ||
      this.related.tenant.traverse((t) => t.related.owner.includes(ctx.subject)) ||
      this.related.tenant.traverse((t) => t.related.can_view_database_connection_string.includes(ctx.subject)),

    view_api_service_key: (ctx: Context): boolean =>
      this.related.owner.includes(ctx.subject) ||
      this.related.can_view_api_service_key.includes(ctx.subject) ||
      this.related.tenant.traverse((t) => t.related.owner.includes(ctx.subject)) ||
      this.related.tenant.traverse((t) => t.related.can_view_api_service_key.includes(ctx.subject)),

    update_project_env: (ctx: Context): boolean =>
      this.related.owner.includes(ctx.subject) ||
      this.related.can_update_project_env.includes(ctx.subject) ||
      this.related.tenant.traverse((t) => t.related.owner.includes(ctx.subject)) ||
      this.related.tenant.traverse((t) => t.related.can_update_project_env.includes(ctx.subject)),

    view_project_env: (ctx: Context): boolean =>
      this.related.owner.includes(ctx.subject) ||
      this.related.can_view_project_env.includes(ctx.subject) ||
      this.related.tenant.traverse((t) => t.related.owner.includes(ctx.subject)) ||
      this.related.tenant.traverse((t) => t.related.can_view_project_env.includes(ctx.subject)),

    view_storage_credentials: (ctx: Context): boolean =>
      this.related.owner.includes(ctx.subject) ||
      this.related.can_view_storage_credentials.includes(ctx.subject) ||
      this.related.tenant.traverse((t) => t.related.owner.includes(ctx.subject)) ||
      this.related.tenant.traverse((t) => t.related.can_view_storage_credentials.includes(ctx.subject)),

    view_db_secret_key_protected: (ctx: Context): boolean =>
      this.related.owner.includes(ctx.subject) ||
      this.related.can_view_db_secret_key_protected.includes(ctx.subject) ||
      this.related.tenant.traverse((t) => t.related.owner.includes(ctx.subject)) ||
      this.related.tenant.traverse((t) => t.related.can_view_db_secret_key_protected.includes(ctx.subject)),

    rotate_keys_protected: (ctx: Context): boolean =>
      this.related.owner.includes(ctx.subject) ||
      this.related.can_rotate_keys_protected.includes(ctx.subject) ||
      this.related.tenant.traverse((t) => t.related.owner.includes(ctx.subject)) ||
      this.related.tenant.traverse((t) => t.related.can_rotate_keys_protected.includes(ctx.subject)),

    view_database_password_protected: (ctx: Context): boolean =>
      this.related.owner.includes(ctx.subject) ||
      this.related.can_view_database_password_protected.includes(ctx.subject) ||
      this.related.tenant.traverse((t) => t.related.owner.includes(ctx.subject)) ||
      this.related.tenant.traverse((t) => t.related.can_view_database_password_protected.includes(ctx.subject)),

    view_database_connection_string_protected: (ctx: Context): boolean =>
      this.related.owner.includes(ctx.subject) ||
      this.related.can_view_database_connection_string_protected.includes(ctx.subject) ||
      this.related.tenant.traverse((t) => t.related.owner.includes(ctx.subject)) ||
      this.related.tenant.traverse((t) =>
        t.related.can_view_database_connection_string_protected.includes(ctx.subject)
      ),

    view_api_service_key_protected: (ctx: Context): boolean =>
      this.related.owner.includes(ctx.subject) ||
      this.related.can_view_api_service_key_protected.includes(ctx.subject) ||
      this.related.tenant.traverse((t) => t.related.owner.includes(ctx.subject)) ||
      this.related.tenant.traverse((t) => t.related.can_view_api_service_key_protected.includes(ctx.subject)),

    update_project_env_protected: (ctx: Context): boolean =>
      this.related.owner.includes(ctx.subject) ||
      this.related.can_update_project_env_protected.includes(ctx.subject) ||
      this.related.tenant.traverse((t) => t.related.owner.includes(ctx.subject)) ||
      this.related.tenant.traverse((t) => t.related.can_update_project_env_protected.includes(ctx.subject)),

    view_project_env_protected: (ctx: Context): boolean =>
      this.related.owner.includes(ctx.subject) ||
      this.related.can_view_project_env_protected.includes(ctx.subject) ||
      this.related.tenant.traverse((t) => t.related.owner.includes(ctx.subject)) ||
      this.related.tenant.traverse((t) => t.related.can_view_project_env_protected.includes(ctx.subject)),

    view_storage_credentials_protected: (ctx: Context): boolean =>
      this.related.owner.includes(ctx.subject) ||
      this.related.can_view_storage_credentials_protected.includes(ctx.subject) ||
      this.related.tenant.traverse((t) => t.related.owner.includes(ctx.subject)) ||
      this.related.tenant.traverse((t) => t.related.can_view_storage_credentials_protected.includes(ctx.subject))
  };
}
