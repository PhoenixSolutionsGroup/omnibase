# Omnibase Permissions & RBAC Guide

Omnibase provides a powerful, flexible Role-Based Access Control (RBAC) system built on [Ory Keto](https://www.ory.sh/keto/). This guide will help you understand how to define permissions, manage roles, and implement fine-grained access control in your application.

## Table of Contents

- [Overview](#overview)
- [Directory Structure](#directory-structure)
- [Namespace Files](#namespace-files)
- [System Roles Configuration](#system-roles-configuration)
- [Deploying Permissions](#deploying-permissions)
- [Custom Roles](#custom-roles)
- [Permission Format](#permission-format)
- [API Reference](#api-reference)
- [Best Practices](#best-practices)

---

## Overview

Omnibase's permissions system consists of:

1. **Namespace Files** (`.ts`) - Define what permissions exist in your application
2. **System Roles** (`roles.config.json`) - Define default roles that apply to all tenants
3. **Custom Roles** (via API) - Tenant-specific roles created through the dashboard or API
4. **Keto Integration** - All permissions are enforced via Ory Keto at runtime

## Directory Structure

Your permissions configuration lives in `omnibase/permissions/`:

```
your-project/
└── omnibase/
    └── permissions/
        ├── types.ts              # Type definitions (auto-generated)
        ├── tenants.ts            # Tenant namespace
        ├── roles.config.json     # System roles
        └── [your-namespace].ts   # Your custom namespaces
```

---

## Namespace Files

Namespace files define the **permissions** that exist in your application. They're written in TypeScript and follow Ory Keto's namespace syntax.

### Example: Tenant Namespace

```typescript
// omnibase/permissions/tenants.ts
import { Context, KetoArray, Namespace, SubjectSet } from "./types";

class User implements Namespace {}

class Tenant implements Namespace {
  related: {
    can_delete_tenant: User[];
    can_invite_user: User[];
    can_update_user_role: User[];
    can_remove_user: User[];
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
  };
}
```

### Key Concepts

- **`related`** - Defines **relations** (who can do what)
- **`permits`** - Defines **permissions** (actions that can be performed)
- Relations are extracted from the `related` block and stored in your database
- Permissions are derived from the keys in the `permits` object

### Creating Custom Namespaces

You can create additional namespaces for your application resources:

```typescript
// omnibase/permissions/projects.ts
import { Context, Namespace } from "./types";

class User implements Namespace {}

class Project implements Namespace {
  related: {
    can_deploy: User[];
    can_view_logs: User[];
    can_manage_settings: User[];
  };

  permits = {
    deploy: (ctx: Context): boolean =>
      this.related.can_deploy.includes(ctx.subject),

    view_logs: (ctx: Context): boolean =>
      this.related.can_view_logs.includes(ctx.subject),

    manage_settings: (ctx: Context): boolean =>
      this.related.can_manage_settings.includes(ctx.subject),
  };
}
```

---

## System Roles Configuration

System roles are default roles that apply to **all tenants**. They're defined in `roles.config.json`.

### Example Configuration

```json
{
  "roles": [
    {
      "role": "owner",
      "permissions": [
        "tenant#delete_tenant",
        "tenant#invite_user",
        "tenant#remove_user",
        "tenant#update_user_role"
      ],
      "immutable": true
    },
    {
      "role": "admin",
      "permissions": [
        "tenant#invite_user",
        "tenant#remove_user",
        "tenant#update_user_role"
      ],
      "immutable": false
    },
    {
      "role": "member",
      "permissions": [],
      "immutable": false
    }
  ]
}
```

### Permission Format

Permissions use the format: `namespace#relation` or `namespace:id#relation`

- `tenant#invite_user` - Tenant-wide permission
- `project:uuid#deploy` - Resource-specific permission

### Role Properties

- **`role`** - The role name (e.g., "owner", "admin", "member")
- **`permissions`** - Array of permissions this role grants
- **`immutable`** - If `true`, prevents modification via UI (recommended for critical roles)

---

## Deploying Permissions

Use the Omnibase CLI to deploy your permissions configuration:

```bash
# Deploy all namespace files and roles
omnibase permissions push

# Validate syntax before deploying
omnibase permissions validate
```

### What Happens During Deploy

1. **Namespace Files** (`.ts`) are uploaded and parsed
2. **Relations** are extracted and stored in `permissions.definitions` table
3. **System Roles** from `roles.config.json` are synced to `permissions.roles` table
4. **Keto** is notified to reload namespace configurations

### CLI Output

```bash
🚀 Pushing permissions...
📁 Found 1 namespace file(s):
   • tenants.ts
📋 Found roles.config.json
📤 Uploading to https://api.omnibase.tech...
✅ Namespaces deployed successfully!
📋 Synced 3 system role(s) to database

🎉 Permissions pushed successfully!
💡 Use the dashboard to create custom roles
```

---

## Custom Roles

While system roles apply to all tenants, you can create **custom roles** specific to each tenant.

### Creating Custom Roles (API)

```bash
POST /api/v1/permissions/roles
Content-Type: application/json
Cookie: session_cookie

{
  "role_name": "viewer",
  "permissions": [
    "tenant#invite_user",
    "project:*#view_logs"
  ]
}
```

### Listing Roles

```bash
GET /api/v1/permissions/roles
Cookie: session_cookie

# Returns both system and tenant-specific roles
{
  "roles": [
    {
      "id": "...",
      "tenant_id": null,
      "role_name": "owner",
      "permissions": ["tenant#delete_tenant", ...],
      "user_ids": []
    },
    {
      "id": "...",
      "tenant_id": "tenant-uuid",
      "role_name": "viewer",
      "permissions": ["project:*#view_logs"],
      "user_ids": ["user-uuid-1"]
    }
  ]
}
```

### Assigning Roles to Users

```bash
POST /api/v1/permissions/users/{user_id}/roles
Content-Type: application/json
Cookie: session_cookie

{
  "role_id": "role-uuid"
}
```

When you assign a role, Omnibase automatically:
1. Creates Keto relationships for each permission
2. Adds the user to the role's `user_ids` array
3. Enforces permissions immediately (no caching)

### Updating Role Permissions

```bash
PUT /api/v1/permissions/roles/{role_id}
Content-Type: application/json
Cookie: session_cookie

{
  "permissions": [
    "tenant#invite_user",
    "tenant#remove_user"
  ]
}
```

This will:
1. Delete old Keto relationships for all assigned users
2. Update the role in the database
3. Create new Keto relationships for all assigned users

---

## Permission Format

Permissions follow Keto's relationship tuple format.

### Format: `namespace:id#relation`

| Part | Description | Example |
|------|-------------|---------|
| `namespace` | Resource type | `tenant`, `project`, `user` |
| `id` (optional) | Specific resource | `uuid`, `*` (wildcard) |
| `relation` | Permission/action | `delete_tenant`, `deploy` |

### Examples

```
tenant#invite_user              → Can invite users to the tenant
tenant#delete_tenant            → Can delete the tenant
project:abc-123#deploy          → Can deploy specific project
project:*#view_logs             → Can view logs for all projects
```

### Tenant-Wide vs Resource-Specific

- **Tenant-Wide**: `tenant#invite_user`
  - Applies to the entire tenant
  - Omnibase resolves this to `Tenant:{tenant_id}#invite_user@User:{user_id}`

- **Resource-Specific**: `project:abc-123#deploy`
  - Applies to a specific resource
  - Resolves to `Project:abc-123#deploy@User:{user_id}`

---

## API Reference

### Get Available Permissions

```http
GET /api/v1/permissions/definitions
```

Returns all parsed namespace definitions (available relations).

**Response:**
```json
{
  "definitions": [
    {
      "id": "...",
      "namespace": "Tenant",
      "relations": [
        "can_delete_tenant",
        "can_invite_user",
        "can_remove_user",
        "can_update_user_role"
      ],
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### List Roles

```http
GET /api/v1/permissions/roles
```

Returns system roles + tenant-specific roles.

### Create Role

```http
POST /api/v1/permissions/roles
Content-Type: application/json

{
  "role_name": "string",
  "permissions": ["string"]
}
```

### Update Role

```http
PUT /api/v1/permissions/roles/:role_id
Content-Type: application/json

{
  "permissions": ["string"]
}
```

### Delete Role

```http
DELETE /api/v1/permissions/roles/:role_id
```

### Assign Role to User

```http
POST /api/v1/permissions/users/:user_id/roles
Content-Type: application/json

{
  "role_id": "string"
}
```

---

## Best Practices

### 1. Keep System Roles Minimal

Define only essential roles in `roles.config.json`:
- `owner` - Full access
- `admin` - Management access
- `member` - Basic access

Let users create custom roles for specific needs.

### 2. Use Descriptive Relation Names

```typescript
// ❌ Bad
can_do_stuff: User[];

// ✅ Good
can_deploy_application: User[];
can_view_analytics: User[];
```

### 3. Group Related Permissions

```json
{
  "role": "developer",
  "permissions": [
    "project:*#deploy",
    "project:*#view_logs",
    "project:*#rollback"
  ]
}
```

### 4. Deploy Often

Run `omnibase permissions push` whenever you update namespaces or roles. The system uses upsert logic, so it's safe to deploy multiple times.

### 5. Test Permissions Locally

```bash
# Check if a user has permission
omnibase permissions check user:123 tenant:456 invite_user

# Set a test permission
omnibase permissions set user:123 tenant:456 can_invite_user
```

### 6. Version Your Permissions

Since permissions are code, they're version controlled. This makes it easy to:
- Review permission changes in pull requests
- Rollback permission changes if needed
- Track who changed what and when

---

## Need Help?

- **Documentation**: https://omnibase.tech/docs
- **Discord**: https://discord.gg/omnibase
- **GitHub Issues**: https://github.com/omni-base/omnibase/issues

---

**Next Steps:**
- Learn about [Tenant Management](./TENANTS_GUIDE.md)
- Explore the [API Reference](./API_REFERENCE.md)
- See [Permission Examples](./PERMISSIONS_EXAMPLES.md)