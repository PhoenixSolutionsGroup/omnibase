# Relation and Permission Naming Convention

## Overview

In Omnibase's permission system, there is a **strict naming convention** that maps relations in namespace definitions to permissions used in roles and permission checks. Understanding this convention is critical for building a working RBAC system.

## The Golden Rule

**All relations in namespace definitions MUST start with the `can_` prefix.**

The permission (used in roles and API calls) is **always** the relation name **without** the `can_` prefix.

## Naming Convention

| Namespace Definition | Role/API Permission | Description |
|---------------------|---------------------|-------------|
| `can_delete_tenant` | `delete_tenant` | Relation → Permission |
| `can_invite_user` | `invite_user` | Relation → Permission |
| `can_deploy` | `deploy` | Relation → Permission |
| `can_view_logs` | `view_logs` | Relation → Permission |

### Formula

```
relation = "can_" + permission
permission = relation.replace(/^can_/, "")
```

## Why This Matters

### 1. Namespace Definitions (TypeScript)

In your namespace files, relations MUST use the `can_` prefix:

```typescript
// omnibase/permissions/tenants.ts
class Tenant implements Namespace {
  related: {
    can_delete_tenant: User[];  // ✅ Correct - starts with can_
    can_invite_user: User[];    // ✅ Correct - starts with can_
    can_remove_user: User[];    // ✅ Correct - starts with can_
  };

  permits = {
    // Permission names WITHOUT can_ prefix
    delete_tenant: (ctx: Context): boolean =>
      this.related.can_delete_tenant.includes(ctx.subject),
    
    invite_user: (ctx: Context): boolean =>
      this.related.can_invite_user.includes(ctx.subject),
    
    remove_user: (ctx: Context): boolean =>
      this.related.can_remove_user.includes(ctx.subject),
  };
}
```

### 2. Roles Configuration (JSON)

In your roles config, permissions use the **permit name** (without `can_`):

```json
{
  "roles": [
    {
      "role": "admin",
      "permissions": [
        "tenant#invite_user",      // ✅ Uses permit name
        "tenant#remove_user",      // ✅ Uses permit name
        "tenant#delete_tenant"     // ✅ Uses permit name
      ]
    }
  ]
}
```

### 3. API Calls

When checking permissions or creating roles via API, use the **permit name**:

```typescript
// Creating a role
await omnibase.permissions.roles.create({
  role_name: 'moderator',
  permissions: [
    'tenant#invite_user',  // ✅ Uses permit name, not can_invite_user
    'project:*#deploy'     // ✅ Uses permit name, not can_deploy
  ]
});

// Checking permission
await omnibase.permissions.permissions.checkPermission(undefined, {
  namespace: 'Tenant',
  object: tenantId,
  relation: 'delete_tenant',  // ✅ Uses permit name
  subjectId: userId
});
```

## Complete Example

### Step 1: Define Namespace

```typescript
// omnibase/permissions/projects.ts
import { Context, Namespace } from "./types";

class User implements Namespace {}

class Project implements Namespace {
  related: {
    can_deploy: User[];           // ✅ Relation with can_ prefix
    can_view_logs: User[];        // ✅ Relation with can_ prefix
    can_rollback: User[];         // ✅ Relation with can_ prefix
    can_delete: User[];           // ✅ Relation with can_ prefix
  };

  permits = {
    // Permit names WITHOUT can_ prefix
    deploy: (ctx: Context): boolean =>
      this.related.can_deploy.includes(ctx.subject),
    
    view_logs: (ctx: Context): boolean =>
      this.related.can_view_logs.includes(ctx.subject),
    
    rollback: (ctx: Context): boolean =>
      this.related.can_rollback.includes(ctx.subject),
    
    delete: (ctx: Context): boolean =>
      this.related.can_delete.includes(ctx.subject),
  };
}
```

### Step 2: Create Role

```json
// omnibase/permissions/roles.config.json
{
  "roles": [
    {
      "role": "developer",
      "permissions": [
        "project:*#deploy",      // ✅ permit name
        "project:*#view_logs",   // ✅ permit name
        "project:*#rollback"     // ✅ permit name
      ]
    }
  ]
}
```

### Step 3: Use in Application

```typescript
// Check if user can deploy
const canDeploy = await omnibase.permissions.permissions.checkPermission(
  undefined,
  {
    namespace: 'Project',
    object: projectId,
    relation: 'deploy',  // ✅ Uses permit name, not can_deploy
    subjectId: userId
  }
);
```

## The RoleCreator Component Integration

The [`RoleCreator`](apps/dashboard/src/app/(dashboard)/(organization)/people/client.tsx:1) shadcn component automatically handles this naming convention for you.

### How It Works

1. **Fetches Definitions**: Gets all relations from the API
   ```typescript
   // Returns: ['can_delete_tenant', 'can_invite_user', 'can_remove_user']
   const definitions = await omnibase.permissions.roles.getDefinitions();
   ```

2. **Strips `can_` Prefix**: Converts relations to permissions
   ```typescript
   const relationToPermission = (relation: string): string => {
     if (relation.startsWith("can_")) {
       return relation.substring(4);  // "can_delete_tenant" → "delete_tenant"
     }
     return relation;
   };
   ```

3. **Builds Permission Strings**: Creates proper format for roles
   ```typescript
   // For tenant namespace
   "tenant#delete_tenant"  // ✅ Uses permission name
   
   // For fine-grained (project) namespace
   "project:project_id#deploy"  // ✅ Uses permission name
   ```

4. **Callback Data**: Passes correctly formatted permissions
   ```typescript
   onRoleCreate({
     role_name: "admin",
     permissions: [
       "tenant#delete_tenant",   // ✅ Not can_delete_tenant
       "tenant#invite_user"      // ✅ Not can_invite_user
     ]
   });
   ```

### Component Usage

```typescript
import { RoleCreator } from "@/app/(dashboard)/(organization)/people/client";

// Get data from API
const definitions = await omnibase.permissions.roles.getDefinitions();
const roles = await omnibase.permissions.roles.list();

// Use component
<RoleCreator
  definitions={definitions}  // Contains relations like "can_delete_tenant"
  roles={roles}
  onRoleCreate={async (roleData) => {
    // roleData.permissions contains: ["tenant#delete_tenant", ...]
    await omnibase.permissions.roles.create(roleData);
  }}
/>
```

The component handles all the naming convention logic automatically, so you don't need to worry about the `can_` prefix conversion.

## Common Mistakes

### ❌ Wrong: Using relation names in permissions

```typescript
// DON'T DO THIS
await omnibase.permissions.roles.create({
  role_name: 'admin',
  permissions: [
    'tenant#can_delete_tenant',  // ❌ Wrong - includes can_ prefix
    'tenant#can_invite_user'     // ❌ Wrong - includes can_ prefix
  ]
});
```

### ✅ Correct: Using permit names in permissions

```typescript
// DO THIS
await omnibase.permissions.roles.create({
  role_name: 'admin',
  permissions: [
    'tenant#delete_tenant',  // ✅ Correct - uses permit name
    'tenant#invite_user'     // ✅ Correct - uses permit name
  ]
});
```

### ❌ Wrong: Missing `can_` in namespace

```typescript
// DON'T DO THIS
class Tenant implements Namespace {
  related: {
    delete_tenant: User[];  // ❌ Wrong - missing can_ prefix
    invite_user: User[];    // ❌ Wrong - missing can_ prefix
  };
}
```

### ✅ Correct: Using `can_` in namespace

```typescript
// DO THIS
class Tenant implements Namespace {
  related: {
    can_delete_tenant: User[];  // ✅ Correct - has can_ prefix
    can_invite_user: User[];    // ✅ Correct - has can_ prefix
  };
}
```

## Behind the Scenes

### API Processing

When you deploy permissions with `omnibase permissions push`:

1. **Namespace Parser** extracts relations from `related` blocks
2. **Relations** (with `can_` prefix) are stored in `permissions.definitions` table
3. **Permits** (without `can_` prefix) are derived from the `permits` object keys

### Database Schema

```sql
-- permissions.definitions table
{
  "id": "uuid",
  "namespace": "Tenant",
  "relations": [
    "can_delete_tenant",   -- Stored with can_ prefix
    "can_invite_user",
    "can_remove_user"
  ]
}

-- permissions.roles table
{
  "id": "uuid",
  "role_name": "admin",
  "permissions": [
    "tenant#delete_tenant",  -- Stored without can_ prefix
    "tenant#invite_user"
  ]
}
```

### Keto Relationships

When a role is assigned, Keto relationships are created using **relations** (with `can_` prefix):

```
Tenant:tenant_id#can_delete_tenant@User:user_id
Tenant:tenant_id#can_invite_user@User:user_id
```

But when checking permissions, you query using **permits** (without `can_` prefix):

```typescript
// Permission check
checkPermission({
  namespace: 'Tenant',
  object: tenantId,
  relation: 'delete_tenant',  // Without can_
  subjectId: userId
})

// Keto internally maps to:
// Tenant:tenant_id#can_delete_tenant@User:user_id
```

## Validation

When validating your permissions setup, ensure:

1. ✅ All `related` keys start with `can_`
2. ✅ All `permits` keys do NOT start with `can_`
3. ✅ For each `related` key, there's a matching `permits` key without `can_`

### Example Validation

```typescript
// Valid namespace
related: {
  can_deploy: User[],        // ✅ Starts with can_
}

permits = {
  deploy: (ctx) => ...       // ✅ Matches without can_
}

// Invalid namespace
related: {
  can_deploy: User[],        // ✅ Starts with can_
}

permits = {
  can_deploy: (ctx) => ...   // ❌ Should be 'deploy', not 'can_deploy'
}
```

## Best Practices

1. **Always use `can_` in relations**: It's not optional—it's required for the system to work

2. **Never use `can_` in permissions**: Strip it when creating roles or checking permissions

3. **Use descriptive names**: Make the action clear
   - ✅ `can_delete_all_projects`
   - ❌ `can_do_stuff`

4. **Be consistent**: Use snake_case for all relation/permission names
   - ✅ `can_view_logs`
   - ❌ `can_viewLogs`

5. **Document your permissions**: Add comments explaining what each relation allows
   ```typescript
   related: {
     // Allows user to permanently delete the entire tenant and all its data
     can_delete_tenant: User[];
     
     // Allows user to send invitations to new team members
     can_invite_user: User[];
   };
   ```

## Summary

- **Relations** (in namespace `related` blocks) = `can_` + **permission**
- **Permissions** (in roles and API) = **relation** - `can_`
- The [`RoleCreator`](apps/dashboard/src/app/(dashboard)/(organization)/people/client.tsx:1) component automatically handles this conversion
- Always validate that your namespace definitions follow this convention
- This is a hard requirement—the system won't work correctly without it

## Related Documentation

- [Permissions Guide](./PERMISSIONS_GUIDE.md) - Overall permissions system
- [Permissions Examples](./PERMISSIONS_EXAMPLES.md) - Real-world examples
- [Roles vs Relationships](./ROLES_VS_RELATIONSHIPS.md) - When to use each