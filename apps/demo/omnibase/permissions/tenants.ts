import { Context, Namespace } from "./types";

export class User implements Namespace {}

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

    create_roles: (ctx: Context): boolean =>
      this.related.can_create_roles.includes(ctx.subject),

    update_roles: (ctx: Context): boolean =>
      this.related.can_update_roles.includes(ctx.subject),

    delete_roles: (ctx: Context): boolean =>
      this.related.can_delete_roles.includes(ctx.subject),
  };
}
