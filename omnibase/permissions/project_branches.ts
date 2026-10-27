import { Project } from "./projects";
import { ApiKey, User } from "./tenants";
import { Context, Namespace } from "./types";

export class Projectbranch implements Namespace {
  related: {
    /**
     * @hidden
     */
    project: Project[];

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
  };

  permits = {
    view_db_secret_key: (ctx: Context): boolean =>
      this.related.owner.includes(ctx.subject) ||
      this.related.can_view_db_secret_key.includes(ctx.subject) ||
      this.related.project.traverse((p) => p.permits.view_db_secret_key(ctx)),

    rotate_keys: (ctx: Context): boolean =>
      this.related.owner.includes(ctx.subject) ||
      this.related.can_rotate_keys.includes(ctx.subject) ||
      this.related.project.traverse((p) => p.permits.rotate_keys(ctx)),

    view_database_password: (ctx: Context): boolean =>
      this.related.owner.includes(ctx.subject) ||
      this.related.can_view_database_password.includes(ctx.subject) ||
      this.related.project.traverse((p) => p.permits.view_database_password(ctx)),

    view_database_connection_string: (ctx: Context): boolean =>
      this.related.owner.includes(ctx.subject) ||
      this.related.can_view_database_connection_string.includes(ctx.subject) ||
      this.related.project.traverse((p) => p.permits.view_database_connection_string(ctx)),

    view_api_service_key: (ctx: Context): boolean =>
      this.related.owner.includes(ctx.subject) ||
      this.related.can_view_api_service_key.includes(ctx.subject) ||
      this.related.project.traverse((p) => p.permits.view_api_service_key(ctx)),

    update_project_env: (ctx: Context): boolean =>
      this.related.owner.includes(ctx.subject) ||
      this.related.can_update_project_env.includes(ctx.subject) ||
      this.related.project.traverse((p) => p.permits.update_project_env(ctx)),

    view_project_env: (ctx: Context): boolean =>
      this.related.owner.includes(ctx.subject) ||
      this.related.can_view_project_env.includes(ctx.subject) ||
      this.related.project.traverse((p) => p.permits.view_project_env(ctx)),

    view_storage_credentials: (ctx: Context): boolean =>
      this.related.owner.includes(ctx.subject) ||
      this.related.can_view_storage_credentials.includes(ctx.subject) ||
      this.related.project.traverse((p) => p.permits.view_storage_credentials(ctx)),

    view_db_secret_key_protected: (ctx: Context): boolean =>
      this.related.owner.includes(ctx.subject) ||
      this.related.can_view_db_secret_key.includes(ctx.subject) ||
      this.related.project.traverse((p) => p.permits.view_db_secret_key_protected(ctx)),

    rotate_keys_protected: (ctx: Context): boolean =>
      this.related.owner.includes(ctx.subject) ||
      this.related.can_rotate_keys.includes(ctx.subject) ||
      this.related.project.traverse((p) => p.permits.rotate_keys_protected(ctx)),

    view_database_password_protected: (ctx: Context): boolean =>
      this.related.owner.includes(ctx.subject) ||
      this.related.can_view_database_password.includes(ctx.subject) ||
      this.related.project.traverse((p) => p.permits.view_database_password_protected(ctx)),

    view_database_connection_string_protected: (ctx: Context): boolean =>
      this.related.owner.includes(ctx.subject) ||
      this.related.can_view_database_connection_string.includes(ctx.subject) ||
      this.related.project.traverse((p) => p.permits.view_database_connection_string_protected(ctx)),

    view_api_service_key_protected: (ctx: Context): boolean =>
      this.related.owner.includes(ctx.subject) ||
      this.related.can_view_api_service_key.includes(ctx.subject) ||
      this.related.project.traverse((p) => p.permits.view_api_service_key_protected(ctx)),

    update_project_env_protected: (ctx: Context): boolean =>
      this.related.owner.includes(ctx.subject) ||
      this.related.can_update_project_env.includes(ctx.subject) ||
      this.related.project.traverse((p) => p.permits.update_project_env_protected(ctx)),

    view_project_env_protected: (ctx: Context): boolean =>
      this.related.owner.includes(ctx.subject) ||
      this.related.can_view_project_env.includes(ctx.subject) ||
      this.related.project.traverse((p) => p.permits.view_project_env_protected(ctx)),

    view_storage_credentials_protected: (ctx: Context): boolean =>
      this.related.owner.includes(ctx.subject) ||
      this.related.can_view_storage_credentials.includes(ctx.subject) ||
      this.related.project.traverse((p) => p.permits.view_storage_credentials_protected(ctx))
  };
}
