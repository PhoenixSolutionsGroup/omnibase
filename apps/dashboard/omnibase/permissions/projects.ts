import { ApiKey, Tenant, User } from "./tenants";
import { Context, Namespace, SubjectSet } from "./types";

export class Project implements Namespace {
  related: {
    parent_project: Project[];
    tenant: Tenant[];
    can_view_db_secret_key: (User | ApiKey)[];
    can_rotate_keys: (User | ApiKey)[];
    can_view_database_password: (User | ApiKey)[];
    can_view_database_connection_string: (User | ApiKey)[];
    can_view_postmark_server_token: (User | ApiKey)[];
    can_view_api_service_key: (User | ApiKey)[];
    can_update_project_env: (User | ApiKey)[];
    can_view_project_env: (User | ApiKey)[];
    can_view_storage_credentials: (User | ApiKey)[];
  };

  permits = {
    view_db_secret_key: (ctx: Context): boolean =>
      this.related.can_view_db_secret_key.includes(ctx.subject) ||
      this.related.parent_project.traverse((p) =>
        p.permits.view_db_secret_key(ctx)
      ) ||
      this.related.tenant.traverse((t) =>
        t.related.can_view_db_secret_key.includes(ctx.subject)
      ),

    rotate_keys: (ctx: Context): boolean =>
      this.related.can_rotate_keys.includes(ctx.subject) ||
      this.related.parent_project.traverse((p) => p.permits.rotate_keys(ctx)) ||
      this.related.tenant.traverse((t) =>
        t.related.can_rotate_keys.includes(ctx.subject)
      ),

    view_database_password: (ctx: Context): boolean =>
      this.related.can_view_database_password.includes(ctx.subject) ||
      this.related.parent_project.traverse((p) =>
        p.permits.view_database_password(ctx)
      ) ||
      this.related.tenant.traverse((t) =>
        t.related.can_view_database_password.includes(ctx.subject)
      ),

    view_database_connection_string: (ctx: Context): boolean =>
      this.related.can_view_database_connection_string.includes(ctx.subject) ||
      this.related.parent_project.traverse((p) =>
        p.permits.view_database_connection_string(ctx)
      ) ||
      this.related.tenant.traverse((t) =>
        t.related.can_view_database_connection_string.includes(ctx.subject)
      ),

    view_postmark_server_token: (ctx: Context): boolean =>
      this.related.can_view_postmark_server_token.includes(ctx.subject) ||
      this.related.parent_project.traverse((p) =>
        p.permits.view_postmark_server_token(ctx)
      ) ||
      this.related.tenant.traverse((t) =>
        t.related.can_view_postmark_server_token.includes(ctx.subject)
      ),

    view_api_service_key: (ctx: Context): boolean =>
      this.related.can_view_api_service_key.includes(ctx.subject) ||
      this.related.parent_project.traverse((p) =>
        p.permits.view_api_service_key(ctx)
      ) ||
      this.related.tenant.traverse((t) =>
        t.related.can_view_api_service_key.includes(ctx.subject)
      ),

    update_project_env: (ctx: Context): boolean =>
      this.related.can_update_project_env.includes(ctx.subject) ||
      this.related.parent_project.traverse((p) =>
        p.permits.update_project_env(ctx)
      ) ||
      this.related.tenant.traverse((t) =>
        t.related.can_update_project_env.includes(ctx.subject)
      ),

    view_project_env: (ctx: Context): boolean =>
      this.related.can_view_project_env.includes(ctx.subject) ||
      this.related.parent_project.traverse((p) =>
        p.permits.view_project_env(ctx)
      ) ||
      this.related.tenant.traverse((t) =>
        t.related.can_view_project_env.includes(ctx.subject)
      ),

    view_storage_credentials: (ctx: Context): boolean =>
      this.related.can_view_storage_credentials.includes(ctx.subject) ||
      this.related.parent_project.traverse((p) =>
        p.permits.view_storage_credentials(ctx)
      ) ||
      this.related.tenant.traverse((t) =>
        t.related.can_view_storage_credentials.includes(ctx.subject)
      ),
  };
}
