---
title: Permissions
description: Fine-grained permissions with JSDoc metadata
---

# How Permissions Work

OmniBase uses Ory Keto for permission management. The system is built around **fine-grained permissions** defined in TypeScript namespace files with **JSDoc annotations** that provide metadata for UI rendering and role suggestions.

## Core Concepts

### Fine-Grained Permissions

Permissions are atomic actions a user can perform. Each permission is a specific capability:

```
can_invite_user
can_delete_tenant
can_view_users
can_view_database_password
can_update_project_env
```

Permissions are defined within namespaces (like `Tenant` or `Project`) using Ory Permission Language (OPL) in TypeScript files.

### JSDoc Metadata

Each permission can have JSDoc annotations that provide metadata:

```typescript
/**
 * @group User Management
 * @subGroup Role Assignment
 * @displayName Update User Roles
 * @role owner
 * @role admin
 */
can_update_user_role: User[];
```

| Annotation | Purpose |
|------------|---------|
| `@group` | Primary grouping for UI tree display |
| `@subGroup` | Secondary grouping within a group |
| `@displayName` | Human-readable name (e.g., "Update User Roles") |
| `@role` | Suggested default role(s) for this permission |
| `@hidden` | Hide from UI (for internal relations like `tenant`, `parent_project`) |

### Roles Group Permissions

Roles are collections of permissions created per-tenant. Each tenant manages their own roles:

```typescript
// Create a role for a tenant
await tenantsApi.createRole({
  createRoleRequest: {
    roleName: 'admin',
    permissions: [
      'tenant#can_invite_user',
      'tenant#can_remove_user',
      'tenant#can_view_users',
    ],
  },
});
```

When you assign a user a role, they receive all permissions in that role's array.

## Defining Permissions

Permissions are defined using Ory Permission Language (OPL) in TypeScript namespace files:

```typescript
// omnibase/permissions/tenants.ts
import { Context, Namespace } from "./types";

export class User implements Namespace {}
export class ApiKey implements Namespace {}

export class Tenant implements Namespace {
  related: {
    /**
     * @group User Management
     * @displayName Invite Users
     * @role owner
     * @role admin
     */
    can_invite_user: User[];

    /**
     * @group User Management
     * @displayName View Users
     * @role owner
     * @role admin
     * @role member
     */
    can_view_users: User[];

    /**
     * @group API Keys
     * @displayName Create API Keys
     * @role owner
     * @role admin
     */
    can_create_api_keys: User[];

    /**
     * @group Database
     * @subGroup Secrets
     * @displayName View Database Password
     * @role owner
     */
    can_view_database_password: (User | ApiKey)[];
  };

  permits = {
    invite_user: (ctx: Context): boolean =>
      this.related.can_invite_user.includes(ctx.subject),

    view_users: (ctx: Context): boolean =>
      this.related.can_view_users.includes(ctx.subject),
  };
}
```

Each `related` field defines a permission. The `permits` object defines how those permissions are checked.

## Permission Inheritance

Permissions can inherit from parent resources. For example, project permissions can fall back to tenant-level permissions:

```typescript
// omnibase/permissions/projects.ts
export class Project implements Namespace {
  related: {
    /** @hidden */
    tenant: Tenant[];

    /**
     * @group Database
     * @subGroup Secrets
     * @displayName View Database Password
     * @role owner
     * @role admin
     */
    can_view_database_password: (User | ApiKey)[];
  };

  permits = {
    view_database_password: (ctx: Context): boolean =>
      // Check project-level permission first
      this.related.can_view_database_password.includes(ctx.subject) ||
      // Fall back to tenant-level permission
      this.related.tenant.traverse((t) =>
        t.related.can_view_database_password.includes(ctx.subject)
      ),
  };
}
```

This allows you to grant permissions at either:
- **Tenant level**: Applies to all projects in that tenant
- **Project level**: Applies to specific projects only

## How Checks Work

When checking if a user can perform an action:

```
Can user:alice invite users to tenant:acme-corp?
│
├─▶ Look up alice's role in acme-corp → "admin"
│
├─▶ Check if "admin" role includes "tenant#can_invite_user"
│   └─▶ Yes → Check relation tuple exists
│       └─▶ (Tenant, acme-corp, can_invite_user, user:alice) exists
│
└─▶ Result: ALLOWED
```

For a user without permission:

```
Can user:bob delete tenant:acme-corp?
│
├─▶ Look up bob's role in acme-corp → "member"
│
├─▶ Check if "member" role includes "tenant#can_delete_tenant"
│   └─▶ No → DENIED
│
└─▶ Result: NOT ALLOWED
```

## Tenant vs Resource Permissions

All permission checks require a namespace, object ID, relation, and subject. The difference is how the object ID is obtained:

### Tenant Permissions

For tenant permissions, the RBAC middleware automatically retrieves the tenant ID from the user's session context:

```go
// Middleware handles getting tenant ID from session
tenantID := ctx.GetString("tenant_id")
checkPermission(ctx, "Tenant", tenantID, relation)
```

### Resource Permissions (e.g., Project)

For resource permissions like `Project`, the object ID must come from the request (e.g., URL parameter):

```go
// Project ID comes from URL param
projectID := ctx.Param("project_id")
checkPermission(ctx, "Project", projectID, relation)
```

Project permissions inherit from tenant-level permissions, so if a user has a permission at the tenant level, they have it for all projects in that tenant.

## API Keys

API keys can be granted the same permissions as users. This requires:

### 1. Define an Empty ApiKey Namespace

The `ApiKey` namespace exists only as a subject identifier:

```typescript
// omnibase/permissions/tenants.ts
export class ApiKey implements Namespace {}
```

### 2. Allow ApiKey in Permission Definitions

Include `ApiKey` in the type union for permissions that API keys should be able to have:

```typescript
related: {
  // User-only permissions
  can_invite_user: User[];
  can_delete_tenant: User[];

  // Permissions for both Users and API keys
  can_view_database_password: (User | ApiKey)[];
  can_rotate_keys: (User | ApiKey)[];
}
```

### Checking API Key Permissions

When checking permissions for an API key, specify the `ApiKey` namespace as the subject:

```go
// Subject for a user
SubjectSet{Namespace: "User", Object: userId}

// Subject for an API key
SubjectSet{Namespace: "ApiKey", Object: apiKeyId}
```

The middleware determines which subject type to use based on the authentication method:

```go
switch authMethod {
case "session":
    namespace = "User"
    object = ctx.GetString("user_id")
case "api_key":
    namespace = "ApiKey"
    object = ctx.GetString("api_key")
}
```

## UI Integration

The JSDoc metadata is returned by the API and used by UI components:

```typescript
const { data } = await tenantsApi.getRoleDefinitions({ subject: 'User' });

// Response includes all metadata
for (const namespace of data.data.namespaces) {
  for (const relation of namespace.relations) {
    console.log(`${relation.name}`);
    console.log(`  Display: ${relation.displayName}`);
    console.log(`  Group: ${relation.group}`);
    console.log(`  SubGroup: ${relation.subGroup}`);
    console.log(`  Roles: ${relation.roles?.join(', ')}`);
  }
}
```

The `PermissionsSelectorTree` component uses this metadata to render a hierarchical tree grouped by `@group` and `@subGroup` annotations.

## Summary

1. **Define fine-grained permissions** in namespace files using OPL with JSDoc annotations
2. **JSDoc provides metadata** for UI grouping (`@group`, `@subGroup`), display names (`@displayName`), and role suggestions (`@role`)
3. **Create roles per-tenant** — each tenant manages their own role structure
4. **Assign users to roles** — they receive all permissions in that role
5. **Check permissions** at runtime:
   - Tenant permissions use the active tenant context automatically
   - Resource permissions (Project, etc.) require explicit object IDs

This approach gives you fine-grained access control with a user-friendly UI powered by JSDoc metadata.
