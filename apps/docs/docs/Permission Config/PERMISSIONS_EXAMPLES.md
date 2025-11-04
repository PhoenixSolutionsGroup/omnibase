# Omnibase Permissions Examples

This guide provides practical examples for common permission scenarios in Omnibase.

## Table of Contents

- [Basic Tenant Permissions](#basic-tenant-permissions)
- [Project-Based Permissions](#project-based-permissions)
- [Multi-Level Resource Permissions](#multi-level-resource-permissions)
- [Role Hierarchies](#role-hierarchies)
- [Dynamic Permission Checks](#dynamic-permission-checks)
- [Common Patterns](#common-patterns)

---

## Basic Tenant Permissions

### Example 1: Simple Tenant Namespace

```typescript
// omnibase/permissions/tenants.ts
import { Context, Namespace } from "./types";

class User implements Namespace {}

class Tenant implements Namespace {
  related: {
    can_invite_users: User[];
    can_manage_billing: User[];
    can_delete_tenant: User[];
  };

  permits = {
    invite_users: (ctx: Context): boolean =>
      this.related.can_invite_users.includes(ctx.subject),

    manage_billing: (ctx: Context): boolean =>
      this.related.can_manage_billing.includes(ctx.subject),

    delete_tenant: (ctx: Context): boolean =>
      this.related.can_delete_tenant.includes(ctx.subject),
  };
}
```

### Corresponding Roles Config

```json
{
  "roles": [
    {
      "role": "owner",
      "permissions": [
        "tenant#invite_users",
        "tenant#manage_billing",
        "tenant#delete_tenant"
      ],
      "immutable": true
    },
    {
      "role": "admin",
      "permissions": [
        "tenant#invite_users"
      ],
      "immutable": false
    },
    {
      "role": "billing_manager",
      "permissions": [
        "tenant#manage_billing"
      ],
      "immutable": false
    }
  ]
}
```

---

## Project-Based Permissions

### Example 2: Project Resource Namespace

```typescript
// omnibase/permissions/projects.ts
import { Context, Namespace } from "./types";

class User implements Namespace {}

class Project implements Namespace {
  related: {
    can_deploy: User[];
    can_view_logs: User[];
    can_manage_env: User[];
    can_rollback: User[];
    can_delete: User[];
  };

  permits = {
    deploy: (ctx: Context): boolean =>
      this.related.can_deploy.includes(ctx.subject),

    view_logs: (ctx: Context): boolean =>
      this.related.can_view_logs.includes(ctx.subject),

    manage_env: (ctx: Context): boolean =>
      this.related.can_manage_env.includes(ctx.subject),

    rollback: (ctx: Context): boolean =>
      this.related.can_rollback.includes(ctx.subject),

    delete: (ctx: Context): boolean =>
      this.related.can_delete.includes(ctx.subject),
  };
}
```

### Creating Roles for Projects

```bash
# Create a "Developer" role with deployment permissions
curl -X POST http://localhost:8080/api/v1/permissions/roles \
  -H "Cookie: session_cookie" \
  -H "Content-Type: application/json" \
  -d '{
    "role_name": "developer",
    "permissions": [
      "project:*#deploy",
      "project:*#view_logs",
      "project:*#rollback"
    ]
  }'

# Create a "Viewer" role with read-only access
curl -X POST http://localhost:8080/api/v1/permissions/roles \
  -H "Cookie: session_cookie" \
  -H "Content-Type: application/json" \
  -d '{
    "role_name": "viewer",
    "permissions": [
      "project:*#view_logs"
    ]
  }'
```

---

## Multi-Level Resource Permissions

### Example 3: Database Access Control

```typescript
// omnibase/permissions/databases.ts
import { Context, Namespace } from "./types";

class User implements Namespace {}

class Database implements Namespace {
  related: {
    can_read: User[];
    can_write: User[];
    can_delete: User[];
    can_manage_schema: User[];
    can_manage_users: User[];
  };

  permits = {
    read: (ctx: Context): boolean =>
      this.related.can_read.includes(ctx.subject),

    write: (ctx: Context): boolean =>
      this.related.can_write.includes(ctx.subject) ||
      this.related.can_manage_schema.includes(ctx.subject),

    delete: (ctx: Context): boolean =>
      this.related.can_delete.includes(ctx.subject),

    manage_schema: (ctx: Context): boolean =>
      this.related.can_manage_schema.includes(ctx.subject),

    manage_users: (ctx: Context): boolean =>
      this.related.can_manage_users.includes(ctx.subject),
  };
}
```

### Creating Granular Database Roles

```json
{
  "roles": [
    {
      "role": "db_admin",
      "permissions": [
        "database:*#read",
        "database:*#write",
        "database:*#delete",
        "database:*#manage_schema",
        "database:*#manage_users"
      ],
      "immutable": false
    },
    {
      "role": "db_developer",
      "permissions": [
        "database:*#read",
        "database:*#write",
        "database:*#manage_schema"
      ],
      "immutable": false
    },
    {
      "role": "db_read_only",
      "permissions": [
        "database:*#read"
      ],
      "immutable": false
    }
  ]
}
```

---

## Role Hierarchies

### Example 4: Nested Permissions

```typescript
// omnibase/permissions/organizations.ts
import { Context, Namespace } from "./types";

class User implements Namespace {}

class Organization implements Namespace {
  related: {
    // Workspace management
    can_create_workspace: User[];
    can_delete_workspace: User[];
    
    // Team management
    can_invite_members: User[];
    can_remove_members: User[];
    can_manage_roles: User[];
    
    // Billing
    can_view_billing: User[];
    can_manage_billing: User[];
    
    // Settings
    can_view_settings: User[];
    can_manage_settings: User[];
  };

  permits = {
    create_workspace: (ctx: Context): boolean =>
      this.related.can_create_workspace.includes(ctx.subject),

    delete_workspace: (ctx: Context): boolean =>
      this.related.can_delete_workspace.includes(ctx.subject),

    invite_members: (ctx: Context): boolean =>
      this.related.can_invite_members.includes(ctx.subject),

    remove_members: (ctx: Context): boolean =>
      this.related.can_remove_members.includes(ctx.subject),

    manage_roles: (ctx: Context): boolean =>
      this.related.can_manage_roles.includes(ctx.subject),

    view_billing: (ctx: Context): boolean =>
      this.related.can_view_billing.includes(ctx.subject) ||
      this.related.can_manage_billing.includes(ctx.subject),

    manage_billing: (ctx: Context): boolean =>
      this.related.can_manage_billing.includes(ctx.subject),

    view_settings: (ctx: Context): boolean =>
      this.related.can_view_settings.includes(ctx.subject) ||
      this.related.can_manage_settings.includes(ctx.subject),

    manage_settings: (ctx: Context): boolean =>
      this.related.can_manage_settings.includes(ctx.subject),
  };
}
```

### Role Inheritance Pattern

```json
{
  "roles": [
    {
      "role": "org_owner",
      "permissions": [
        "organization#create_workspace",
        "organization#delete_workspace",
        "organization#invite_members",
        "organization#remove_members",
        "organization#manage_roles",
        "organization#manage_billing",
        "organization#manage_settings"
      ],
      "immutable": true
    },
    {
      "role": "org_admin",
      "permissions": [
        "organization#create_workspace",
        "organization#invite_members",
        "organization#remove_members",
        "organization#manage_roles",
        "organization#view_settings"
      ],
      "immutable": false
    },
    {
      "role": "org_billing",
      "permissions": [
        "organization#view_billing",
        "organization#manage_billing"
      ],
      "immutable": false
    },
    {
      "role": "org_member",
      "permissions": [
        "organization#view_settings"
      ],
      "immutable": false
    }
  ]
}
```

---

## Dynamic Permission Checks

### Example 5: Runtime Permission Verification

```typescript
// In your Next.js API route or server action
import { omnibase } from "@/lib/omnibase";

export async function deployProject(projectId: string) {
  const session = await omnibase.auth.getSession();
  const userId = session.identity.id;
  
  // Check if user has deploy permission for this specific project
  const canDeploy = await omnibase.permissions.check({
    namespace: "Project",
    object: projectId,
    relation: "deploy",
    subject: userId,
  });

  if (!canDeploy) {
    throw new Error("Unauthorized: Cannot deploy this project");
  }

  // Proceed with deployment
  // ...
}
```

### Example 6: Bulk Permission Checks

```typescript
// Check multiple permissions at once
async function getUserProjectPermissions(userId: string, projectId: string) {
  const permissions = {
    canDeploy: false,
    canViewLogs: false,
    canRollback: false,
    canDelete: false,
  };

  const checks = [
    { relation: "deploy", key: "canDeploy" },
    { relation: "view_logs", key: "canViewLogs" },
    { relation: "rollback", key: "canRollback" },
    { relation: "delete", key: "canDelete" },
  ];

  await Promise.all(
    checks.map(async ({ relation, key }) => {
      const allowed = await omnibase.permissions.check({
        namespace: "Project",
        object: projectId,
        relation,
        subject: userId,
      });
      permissions[key] = allowed;
    })
  );

  return permissions;
}
```

---

## Common Patterns

### Pattern 1: Feature Flags via Permissions

```typescript
// omnibase/permissions/features.ts
class Feature implements Namespace {
  related: {
    can_use_ai_assistant: User[];
    can_use_advanced_analytics: User[];
    can_use_custom_domains: User[];
  };

  permits = {
    use_ai_assistant: (ctx: Context): boolean =>
      this.related.can_use_ai_assistant.includes(ctx.subject),

    use_advanced_analytics: (ctx: Context): boolean =>
      this.related.can_use_advanced_analytics.includes(ctx.subject),

    use_custom_domains: (ctx: Context): boolean =>
      this.related.can_use_custom_domains.includes(ctx.subject),
  };
}
```

```json
{
  "roles": [
    {
      "role": "pro_user",
      "permissions": [
        "feature#use_ai_assistant",
        "feature#use_advanced_analytics"
      ],
      "immutable": false
    },
    {
      "role": "enterprise_user",
      "permissions": [
        "feature#use_ai_assistant",
        "feature#use_advanced_analytics",
        "feature#use_custom_domains"
      ],
      "immutable": false
    }
  ]
}
```

### Pattern 2: Resource Ownership

```typescript
// Automatically grant creator full permissions
async function createProject(userId: string, projectData: any) {
  const project = await db.projects.create(projectData);

  // Grant creator all permissions
  await omnibase.permissions.createRelationship({
    namespace: "Project",
    object: project.id,
    relation: "can_deploy",
    subject: userId,
  });

  await omnibase.permissions.createRelationship({
    namespace: "Project",
    object: project.id,
    relation: "can_delete",
    subject: userId,
  });

  return project;
}
```

### Pattern 3: Team-Based Permissions

```typescript
// omnibase/permissions/teams.ts
class Team implements Namespace {
  related: {
    members: User[];
    can_manage_team: User[];
  };

  permits = {
    view: (ctx: Context): boolean =>
      this.related.members.includes(ctx.subject),

    manage: (ctx: Context): boolean =>
      this.related.can_manage_team.includes(ctx.subject),
  };
}

// Grant team members access to all team projects
async function addUserToTeam(userId: string, teamId: string) {
  // Add to team
  await omnibase.permissions.createRelationship({
    namespace: "Team",
    object: teamId,
    relation: "members",
    subject: userId,
  });

  // Get all team projects
  const projects = await db.projects.findByTeam(teamId);

  // Grant access to all projects
  await Promise.all(
    projects.map((project) =>
      omnibase.permissions.createRelationship({
        namespace: "Project",
        object: project.id,
        relation: "can_view_logs",
        subject: userId,
      })
    )
  );
}
```

### Pattern 4: Time-Based Permissions

```typescript
// Create a temporary "guest" role with limited access
async function grantTemporaryAccess(userId: string, projectId: string) {
  const guestRole = await omnibase.roles.create({
    role_name: "temp_guest",
    permissions: [
      `project:${projectId}#view_logs`,
    ],
  });

  await omnibase.roles.assign(userId, guestRole.id);

  // Schedule removal (pseudo-code)
  scheduleTask(() => {
    omnibase.roles.delete(guestRole.id);
  }, { delay: "24h" });
}
```

---

## Testing Permissions

### Using the CLI

```bash
# Check if user can perform action
omnibase permissions check user:abc123 project:xyz789 deploy

# Output: ✅ Permission GRANTED or ❌ Permission DENIED

# Manually set a permission for testing
omnibase permissions set user:abc123 project:xyz789 can_deploy

# Output: ✅ Permission set successfully
```

### Integration Tests

```typescript
import { omnibase } from "@/lib/omnibase";

describe("Project Permissions", () => {
  it("should allow owner to deploy", async () => {
    const project = await createTestProject();
    const owner = await createTestUser();

    // Assign owner role
    await omnibase.roles.assign(owner.id, "owner");

    // Check permission
    const canDeploy = await omnibase.permissions.check({
      namespace: "Project",
      object: project.id,
      relation: "deploy",
      subject: owner.id,
    });

    expect(canDeploy).toBe(true);
  });

  it("should deny viewer from deploying", async () => {
    const project = await createTestProject();
    const viewer = await createTestUser();

    // Assign viewer role
    await omnibase.roles.assign(viewer.id, "viewer");

    const canDeploy = await omnibase.permissions.check({
      namespace: "Project",
      object: project.id,
      relation: "deploy",
      subject: viewer.id,
    });

    expect(canDeploy).toBe(false);
  });
});
```

---

## Need More Examples?

- Check out the [Permissions Guide](./PERMISSIONS_GUIDE.md) for core concepts
- Join our [Discord](https://discord.gg/omnibase) to ask questions
- Browse [GitHub Discussions](https://github.com/omni-base/omnibase/discussions) for community examples