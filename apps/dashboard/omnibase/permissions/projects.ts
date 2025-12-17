import { Tenant, User } from "./tenants";
import { Context, Namespace, SubjectSet } from "./types";

export class Project implements Namespace {
  related: {
    tenant: Tenant[];
    can_view_db_secret_key: User[];
    can_rotate_keys: User[];
    can_view_database_password: User[];
    can_view_database_connection_string: User[];
    can_view_postmark_server_token: User[];
    can_view_api_service_key: User[];
  };

  permits = {
    view_db_secret_key: (ctx: Context): boolean =>
      this.related.can_view_db_secret_key.includes(ctx.subject) ||
      this.related.tenant.traverse((t) =>
        t.related.can_view_db_secret_key.includes(ctx.subject)
      ),
    rotate_keys: (ctx: Context): boolean =>
      this.related.can_rotate_keys.includes(ctx.subject) ||
      this.related.tenant.traverse((t) =>
        t.related.can_rotate_keys.includes(ctx.subject)
      ),
    view_database_password: (ctx: Context): boolean =>
      this.related.can_view_database_password.includes(ctx.subject) ||
      this.related.tenant.traverse((t) =>
        t.related.can_view_database_password.includes(ctx.subject)
      ),
    view_database_connection_string: (ctx: Context): boolean =>
      this.related.can_view_database_connection_string.includes(ctx.subject) ||
      this.related.tenant.traverse((t) =>
        t.related.can_view_database_connection_string.includes(ctx.subject)
      ),
    view_postmark_server_token: (ctx: Context): boolean =>
      this.related.can_view_postmark_server_token.includes(ctx.subject) ||
      this.related.tenant.traverse((t) =>
        t.related.can_view_postmark_server_token.includes(ctx.subject)
      ),

    view_api_service_key: (ctx: Context): boolean =>
      this.related.can_view_api_service_key.includes(ctx.subject) ||
      this.related.tenant.traverse((t) =>
        t.related.can_view_api_service_key.includes(ctx.subject)
      ),
  };
}
