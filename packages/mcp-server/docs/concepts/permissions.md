---
title: Permissions
description: Fine-grained permissions with JSDoc metadata
---

# How Permissions Work

OmniBase uses Ory Keto for permission management. The system is built around **fine-grained permissions** defined in TypeScript namespace files with **JSDoc annotations** that provide metadata for UI rendering and role suggestions.

## The Object-Relationship Model

The OmniBase permission system is an **object-relationship graph**. Every namespace defines an **object type** — a distinct kind of thing that can own, be acted upon, or be the subject of a permission check. Objects relate to each other through named **relations**.

### Objects

Each namespace in your permission files is an object type:

| Object | Purpose |
|--------|---------|
| `User` | Human user — acts as a subject in permission checks |
| `Tenant` | Organizational container — has members, owners, and permissions |
| `StorageObject` | A file in object storage |

You define your own objects by creating namespace classes (e.g., `Agent`, `Codebase`, `Document`).

### Relations

A **relation** is a directed edge from one object to another. For example:

```
(User, user_abc, can_invite_user, Tenant, tenant_xyz)
```

Reads as: "User `user_abc` has relation `can_invite_user` on Tenant `tenant_xyz`."

Relations form a graph:

```
User ──can_invite_user──▶ Tenant
User ──can_edit─────────▶ Codebase
Agent──can_push─────────▶ Codebase
Codebase ──tenant──────▶ Tenant
```

The **subject** is the object at the start — the "who" that wants to do something. `User` is the primary built-in subject type. Every permission check asks: *"Does subject S have relation R on object O?"*

## Simple Relations: Direct Permission

The simplest case: a subject has a direct relation on an object.

```
User ──can_invite_user──▶ Tenant
Agent──can_push─────────▶ Codebase
```

```go
checkPermission(ctx, "Tenant", tenantId, "can_invite_user")
checkPermission(ctx, "Codebase", codebaseId, "push")
```

No indirection — the subject acts directly on the object. This works the same way for any object type.

## Chained Relations: Traversal

Objects can relate to **other** objects, creating a chain. You check permissions by *traversing* from one object to another along these relations.

### The `traverse()` Method

When you define an object, you can specify relations to other objects (like `tenant: Tenant[]`). In the `permits` block, `traverse()` follows those relations to cascade permission checks:

```typescript
export class Project implements Namespace {
  related: {
    /** @hidden */
    tenant: Tenant[];

    can_view_database_password: (User | ApiKey)[];
  };

  permits = {
    view_database_password: (ctx: Context): boolean =>
      this.related.can_view_database_password.includes(ctx.subject) ||
      this.related.tenant.traverse((t) =>
        t.related.can_view_database_password.includes(ctx.subject)
      ),
  };
}
```

The `traverse()` method follows the `tenant` relation and checks the same permission on the `Tenant` object. This creates a chain:

```
Subject ──view_database_password──▶ Project
                                     └──tenant──▶ Tenant
                                                    └──view_database_password──▶ (checked here too)
```

### Common Traversal Patterns

**Tenant → Resource** — Resources belong to a tenant; permissions cascade down:
```
User ──can_edit──▶ Codebase
                    └──tenant──▶ Tenant → can_edit (fallback)
```

**Owner → Resource** — The owner of a resource implicitly has permissions on it:
```
User ──can_delete──▶ Document
                      └──owner──▶ User → can_delete (resolved through creator)
```

**Parent → Child** — Nested resources inherit from parents:
```
User ──can_write──▶ SubProject
                     └──parent_project──▶ Project → can_write (fallback)
```

### How Traversal Works

1. First, check if the subject has the permission **directly** on the resource (e.g., Project)
2. If not, follow each related object (e.g., `tenant`) and check there
3. The `||` operator means any match returns `true`

This lets you grant a permission at the tenant level, and it applies to all projects, codebases, campaigns, etc. under that tenant — without granting it on each resource individually.

## Fine-Grained Permissions

Permissions are atomic actions a user can perform. Each permission is a specific capability:

```
can_invite_user
can_delete_tenant
can_view_users
can_view_database_password
can_edit
can_push
```

Permissions are defined within object namespaces using Ory Permission Language (OPL) in TypeScript files.

## JSDoc Metadata

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

## Roles Group Permissions

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

## Example: Agent + Codebase

This example shows how the object-relationship model works with custom objects. You build a platform where both human users and LLM agents interact with codebases.

### Objects

- **`User`** — human subject (built-in)
- **`Agent`** — LLM agent subject (custom)
- **`Tenant`** — owning organization (built-in)
- **`Codebase`** — git repository (custom resource)

### Relations Graph

```
        ┌──────────┐
        │  User    │
        └────┬─────┘
             │ can_edit
             ▼
       ┌──────────┐      tenant       ┌──────────┐
       │ Codebase │──────────────────▶│  Tenant  │
       └──────────┘                   └──────────┘
             ▲                             ▲
             │ can_push                    │ can_edit
        ┌────┴─────┐              ┌───────┴──────┐
        │  Agent   │              │    User      │
        └──────────┘              └──────────────┘
```

### Permission Definitions

```typescript
// omnibase/permissions/agents.ts
export class Agent implements Namespace {}

// omnibase/permissions/codebases.ts
export class Codebase implements Namespace {
  related: {
    /** @hidden */
    tenant: Tenant[];

    /** @hidden */
    owner: User[];

    /**
     * @group Codebase Access
     * @displayName Edit Code
     * @role owner
     * @role developer
     */
    can_edit: (User | Agent)[];

    /**
     * @group Codebase Access
     * @displayName Push Changes
     * @role owner
     * @role developer
     */
    can_push: (User | Agent)[];

    /**
     * @group Codebase Access
     * @displayName View Code
     * @role owner
     * @role developer
     * @role viewer
     */
    can_view: (User | Agent)[];
  };

  permits = {
    edit: (ctx: Context): boolean =>
      this.related.can_edit.includes(ctx.subject) ||
      this.related.owner.includes(ctx.subject) ||
      this.related.tenant.traverse((t) =>
        t.related.can_edit.includes(ctx.subject)
      ),

    push: (ctx: Context): boolean =>
      this.related.can_push.includes(ctx.subject) ||
      this.related.owner.includes(ctx.subject) ||
      this.related.tenant.traverse((t) =>
        t.related.can_push.includes(ctx.subject)
      ),

    view: (ctx: Context): boolean =>
      this.related.can_view.includes(ctx.subject) ||
      this.related.owner.includes(ctx.subject) ||
      this.related.tenant.traverse((t) =>
        t.related.can_view.includes(ctx.subject)
      ),
  };
}
```

### Granting Access

**Direct grant** — give an agent push access to a specific codebase:
```typescript
await permissionsApi.createRelationship({
  createRelationshipRequest: {
    namespace: 'Codebase',
    object: 'cb-123',
    relation: 'can_push',
    subjectId: 'agent-456',
    subjectNamespace: 'Agent',
  },
});
```

**Tenant-level grant** — give a user push access to all codebases in a tenant (traversal handles the rest):
```typescript
await permissionsApi.createRelationship({
  createRelationshipRequest: {
    namespace: 'Tenant',
    object: 'tenant-789',
    relation: 'can_push',
    subjectId: 'user-abc',
    subjectNamespace: 'User',
  },
});
```

### Checking Access

Check if an agent can push to a codebase:
```typescript
const { data } = await permissionsApi.checkPermission({
  checkPermissionRequest: {
    namespace: 'Codebase',
    object: 'cb-123',
    relation: 'push',
    subjectId: 'agent-456',
    subjectNamespace: 'Agent',
  },
});
// data.allowed → true
```

The engine evaluates `permits.push`:
1. Is `agent-456` in `can_push` of `Codebase#cb-123`? → **Yes** (direct grant) → ALLOWED

If only the tenant-level grant exists:
1. Is `user-abc` in `can_push` of `Codebase#cb-123`? → No
2. Follow `owner` relation → no match
3. Follow `tenant` relation → is `user-abc` in `can_push` of `Tenant#tenant-789`? → **Yes** → ALLOWED

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

Permission checks go through **Ory Keto** which evaluates the OPL `permits` logic, including any `traverse()` calls.

## Object vs Resource Scope

All permission checks require a namespace, object ID, relation, and subject. The difference is how the object ID is obtained:

### Tenant Scope (Auto-Scoped via Session)

For tenant-level permissions, the RBAC middleware automatically retrieves the tenant ID from the user's session context:

```go
tenantID := ctx.GetString("tenant_id")
checkPermission(ctx, "Tenant", tenantID, relation)
```

### Resource Scope (Explicit Object ID)

For resource permissions like `Project` or `Codebase`, the object ID must come from the request:

```go
projectID := ctx.Param("project_id")
checkPermission(ctx, "Project", projectID, relation)
```

## API Keys

API keys can be granted the same permissions as users. This requires:

### 1. Define the ApiKey Namespace

```typescript
export class ApiKey implements Namespace {}
```

### 2. Allow ApiKey in Permission Definitions

Include `ApiKey` in the type union for permissions that API keys should be able to have:

```typescript
related: {
  // User-only permissions
  can_invite_user: User[];

  // Permissions for both Users and API keys
  can_view_database_password: (User | ApiKey)[];
}
```

### 3. Check API Key Permissions

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

## Summary

1. **Object-Relationship Model** — Each namespace is an object type; objects relate to each other via named relations, forming a graph
2. **Simple Relations** — A subject has a direct permission on an object (User → Tenant)
3. **Chained Relations** — Permissions traverse through intermediate objects via `traverse()` (User → Tenant → Codebase)
4. **JSDoc Metadata** — Provides UI grouping (`@group`, `@subGroup`), display names (`@displayName`), and role suggestions (`@role`)
5. **Roles** — Per-tenant collections of permissions; assign users to roles to grant multiple permissions at once
6. **Subject Types** — Both User and ApiKey can have permissions, controlled by type unions in permission definitions
