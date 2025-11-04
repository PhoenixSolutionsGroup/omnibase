# Roles vs Direct Relationships: A Complete Guide

## Overview

Omnibase provides two complementary permission systems:
1. **Role-Based Access Control (RBAC)** - Managed via the Roles API
2. **Direct Relationships** - Managed via Ory Keto's Relationship API

Understanding when to use each is crucial for building maintainable permission systems.

## Quick Decision Matrix

| Scenario | Use Roles | Use Direct Relationships |
|----------|-----------|-------------------------|
| Adding user to tenant | ✅ Yes | ❌ No |
| Creating resource ownership | ❌ No | ✅ Yes |
| Standard access levels | ✅ Yes | ❌ No |
| Linking tenant to resource | ❌ No | ✅ Yes |
| Temporary/one-off permissions | ✅ Yes (create temporary role) | ❌ No |
| Reusable permission sets | ✅ Yes | ❌ No |

## When to Use Roles

### ✅ Use Cases

**1. Adding Users to Tenants**
```typescript
// User joins organization as admin
await omnibase.permissions.roles.assign('user_123', {
  role_id: 'admin_role' // Has tenant#invite_user, tenant#manage_billing, etc.
});
```

**2. Standard Access Levels**
```typescript
// Create reusable role for billing managers
const billingRole = await omnibase.permissions.roles.create({
  role_name: 'billing_manager',
  permissions: [
    'tenant#manage_billing',
    'tenant#view_invoices',
    'tenant#update_payment_methods'
  ]
});

// Assign to multiple users
await omnibase.permissions.roles.assign('user_123', { role_id: billingRole.id });
await omnibase.permissions.roles.assign('user_456', { role_id: billingRole.id });
```

**3. Tenant-Wide Permissions**
```typescript
// Support agent can view all projects in tenant
const supportRole = await omnibase.permissions.roles.create({
  role_name: 'support_agent',
  permissions: [
    'tenant#view_projects',
    'tenant#view_logs',
    'tenant#create_support_tickets'
  ]
});
```

### Key Characteristics
- **Reusable**: One role, many users
- **Maintainable**: Update role permissions once, affects all assigned users
- **Tenant-scoped**: Permissions apply within tenant context
- **High-level**: Focus on user capabilities, not specific resources

## When to Use Direct Relationships

### ✅ Use Cases

**1. Resource Ownership**
```typescript
// User creates a project → They own it
await omnibase.permissions.relationships.createRelationship(undefined, {
  namespace: 'Project',
  object: 'proj_abc123',
  relation: 'owner',
  subjectId: 'user_456'
});
```

**2. Linking Resources to Tenants** ⚠️ **CRITICAL**

When you create a namespace for a resource (e.g., `Project`), you **MUST** create a relationship between that resource and its tenant to enable tenant-level permission inheritance.

#### Namespace Definition Example
```typescript
// omnibase/permissions/projects.ts
class Tenant implements Namespace {}
class User implements Namespace {}

class Project implements Namespace {
  // ⚠️ IMPORTANT: Single Tenant relationship (not array)
  related: {
    tenant: Tenant;  // Links this project to its owning tenant
    owners: User[];
    contributors: User[];
    viewers: User[];
  };

  permits = {
    // Users with tenant#delete_all_projects can delete ANY project in the tenant
    delete: (ctx: Context): boolean =>
      this.related.owners.includes(ctx.subject) ||
      this.related.tenant.permits.delete_all_projects(ctx),
    
    deploy: (ctx: Context): boolean =>
      this.related.owners.includes(ctx.subject) ||
      this.related.contributors.includes(ctx.subject) ||
      this.related.tenant.permits.deploy_all_projects(ctx),
    
    view: (ctx: Context): boolean =>
      this.related.owners.includes(ctx.subject) ||
      this.related.contributors.includes(ctx.subject) ||
      this.related.viewers.includes(ctx.subject) ||
      this.related.tenant.permits.view_all_projects(ctx),
  };
}
```

#### Creating the Tenant Relationship
```typescript
// When creating a project, link it to its tenant
async function createProject(tenantId: string, userId: string) {
  const projectId = generateUuid();
  
  // 1. Create project in database
  await db.projects.insert({ id: projectId, tenant_id: tenantId });
  
  // 2. ⚠️ CRITICAL: Link project to tenant
  await omnibase.permissions.relationships.createRelationship(undefined, {
    namespace: 'Project',
    object: projectId,
    relation: 'tenant', // Match the 'tenant: Tenant' in related block
    subjectId: tenantId,
    subjectSet: {
      namespace: 'Tenant',
      object: tenantId,
      relation: '' // Empty relation means the tenant object itself
    }
  });
  
  // 3. Assign creator as owner
  await omnibase.permissions.relationships.createRelationship(undefined, {
    namespace: 'Project',
    object: projectId,
    relation: 'owners',
    subjectId: userId
  });
  
  return projectId;
}
```

**Why This Matters:**
- Without the tenant relationship, tenant-level permissions (like `tenant#delete_all_projects`) won't work
- The permission check `this.related.tenant.permits.delete_all_projects(ctx)` requires a tenant relationship to exist
- This enables hierarchical permissions: tenant admins can manage all resources without being added individually

**3. Cross-Tenant Access**
```typescript
// Share project with user from different tenant
await omnibase.permissions.relationships.createRelationship(undefined, {
  namespace: 'Project',
  object: 'proj_abc123',
  relation: 'viewers',
  subjectId: 'user_from_another_tenant'
});
```

**4. Specific Resource Permissions**
```typescript
// Grant deployment access to specific project only
await omnibase.permissions.relationships.createRelationship(undefined, {
  namespace: 'Project',
  object: 'proj_abc123',
  relation: 'contributors',
  subjectId: 'user_789'
});
```

**5. One-Off Permission Grants**
```typescript
// Temporary access to a specific document
await omnibase.permissions.relationships.createRelationship(undefined, {
  namespace: 'Document',
  object: 'doc_xyz789',
  relation: 'editors',
  subjectId: 'user_contractor'
});
```

### Key Characteristics
- **Resource-specific**: Permissions apply to individual resources
- **Flexible**: Can cross tenant boundaries
- **Direct**: Explicit relationships between subjects and objects
- **Low-level**: Focus on specific resource access

## Complete Example: Multi-Tenant Project System

### Scenario
A tenant has admins who can manage all projects, and individual project owners who can only manage their own projects.

### Step 1: Define Namespaces

```typescript
// omnibase/permissions/tenants.ts
class User implements Namespace {}

class Tenant implements Namespace {
  related: {
    can_delete_all_projects: User[];
    can_deploy_all_projects: User[];
    can_view_all_projects: User[];
  };

  permits = {
    delete_all_projects: (ctx: Context): boolean =>
      this.related.can_delete_all_projects.includes(ctx.subject),
    
    deploy_all_projects: (ctx: Context): boolean =>
      this.related.can_deploy_all_projects.includes(ctx.subject),
    
    view_all_projects: (ctx: Context): boolean =>
      this.related.can_view_all_projects.includes(ctx.subject),
  };
}
```

```typescript
// omnibase/permissions/projects.ts
class Tenant implements Namespace {}
class User implements Namespace {}

class Project implements Namespace {
  related: {
    tenant: Tenant; // ⚠️ Links project to tenant for inheritance
    owners: User[];
    contributors: User[];
  };

  permits = {
    delete: (ctx: Context): boolean =>
      this.related.owners.includes(ctx.subject) ||
      this.related.tenant.permits.delete_all_projects(ctx),
    
    deploy: (ctx: Context): boolean =>
      this.related.owners.includes(ctx.subject) ||
      this.related.contributors.includes(ctx.subject) ||
      this.related.tenant.permits.deploy_all_projects(ctx),
  };
}
```

### Step 2: Define Roles

```json
// omnibase/permissions/roles.config.json
[
  {
    "role": "admin",
    "permissions": [
      "tenant#delete_all_projects",
      "tenant#deploy_all_projects",
      "tenant#view_all_projects"
    ]
  },
  {
    "role": "developer",
    "permissions": [
      "tenant#view_all_projects"
    ]
  }
]
```

### Step 3: Application Logic

```typescript
// Adding user to tenant as admin
async function addTenantAdmin(userId: string) {
  const adminRole = await omnibase.permissions.roles.list()
    .then(roles => roles.find(r => r.role_name === 'admin'));
  
  await omnibase.permissions.roles.assign(userId, {
    role_id: adminRole.id
  });
}

// Creating a project
async function createProject(tenantId: string, ownerId: string, name: string) {
  const projectId = generateUuid();
  
  // 1. Database insert
  await db.projects.insert({
    id: projectId,
    tenant_id: tenantId,
    name: name,
    owner_id: ownerId
  });
  
  // 2. Link project to tenant (enables tenant-level permissions)
  await omnibase.permissions.relationships.createRelationship(undefined, {
    namespace: 'Project',
    object: projectId,
    relation: 'tenant',
    subjectId: tenantId,
    subjectSet: {
      namespace: 'Tenant',
      object: tenantId,
      relation: ''
    }
  });
  
  // 3. Assign owner (resource-level permission)
  await omnibase.permissions.relationships.createRelationship(undefined, {
    namespace: 'Project',
    object: projectId,
    relation: 'owners',
    subjectId: ownerId
  });
  
  return projectId;
}

// Adding collaborator to specific project
async function addProjectCollaborator(projectId: string, userId: string) {
  await omnibase.permissions.relationships.createRelationship(undefined, {
    namespace: 'Project',
    object: projectId,
    relation: 'contributors',
    subjectId: userId
  });
}

// Permission checks
async function canDeleteProject(projectId: string, userId: string): Promise<boolean> {
  const result = await omnibase.permissions.permissions.checkPermission(
    undefined,
    {
      namespace: 'Project',
      object: projectId,
      relation: 'delete',
      subjectId: userId
    }
  );
  
  return result.data.allowed;
}
```

### Step 4: Permission Flow

**Scenario A: Admin deletes any project**
1. User `admin_123` has role `admin`
2. Admin role has permission `tenant#delete_all_projects`
3. Check: `Project:proj_abc#delete@User:admin_123`
4. Keto evaluates: `this.related.tenant.permits.delete_all_projects(ctx)`
5. Follows tenant relationship: `Project:proj_abc#tenant@Tenant:tenant_456`
6. Checks: `Tenant:tenant_456#delete_all_projects@User:admin_123`
7. ✅ **Allowed** (via role assignment)

**Scenario B: Owner deletes their project**
1. User `owner_789` created `proj_xyz`
2. Direct relationship: `Project:proj_xyz#owners@User:owner_789`
3. Check: `Project:proj_xyz#delete@User:owner_789`
4. Keto evaluates: `this.related.owners.includes(ctx.subject)`
5. ✅ **Allowed** (via direct ownership)

**Scenario C: Regular developer tries to delete**
1. User `dev_999` has role `developer`
2. Developer role only has `tenant#view_all_projects`
3. No direct ownership relationship exists
4. Check: `Project:proj_abc#delete@User:dev_999`
5. Keto evaluates both conditions:
   - `this.related.owners.includes(ctx.subject)` → ❌ No
   - `this.related.tenant.permits.delete_all_projects(ctx)` → ❌ No
6. ❌ **Denied**

## Common Patterns

### Pattern 1: Tenant Members + Resource Owners
```typescript
// Role for tenant membership
await omnibase.permissions.roles.assign(userId, { role_id: 'member_role' });

// Direct ownership of created resources
await omnibase.permissions.relationships.createRelationship(undefined, {
  namespace: 'Project',
  object: projectId,
  relation: 'owners',
  subjectId: userId
});
```

### Pattern 2: Admin Override
```typescript
// Admin role can manage all resources
{
  "role": "admin",
  "permissions": [
    "tenant#delete_all_projects",
    "tenant#deploy_all_projects",
    "tenant#manage_all_databases"
  ]
}

// Namespace permits check both direct ownership AND tenant permissions
permits = {
  delete: (ctx: Context): boolean =>
    this.related.owners.includes(ctx.subject) ||
    this.related.tenant.permits.delete_all_projects(ctx)
}
```

### Pattern 3: Resource Hierarchies
```typescript
// Database belongs to project, project belongs to tenant
class Database implements Namespace {
  related: {
    project: Project; // ⚠️ Link to parent resource
    admins: User[];
  };

  permits = {
    delete: (ctx: Context): boolean =>
      this.related.admins.includes(ctx.subject) ||
      this.related.project.permits.manage_databases(ctx)
  };
}

// Create relationships
await omnibase.permissions.relationships.createRelationship(undefined, {
  namespace: 'Database',
  object: dbId,
  relation: 'project',
  subjectId: projectId,
  subjectSet: {
    namespace: 'Project',
    object: projectId,
    relation: ''
  }
});
```

## Best Practices

### ✅ Do's

1. **Use roles for tenant membership**
   - Define standard roles in `roles.config.json`
   - Assign users to roles when they join tenants

2. **Use direct relationships for resource creation**
   - Always assign creator as owner
   - Always link resource to tenant

3. **Create tenant relationships for all resources**
   - Enables admin override capabilities
   - Maintains permission hierarchy

4. **Document your namespace permits**
   - Explain permission logic in comments
   - Show which roles grant which permissions

### ❌ Don'ts

1. **Don't use roles for resource ownership**
   - Roles are tenant-scoped, not resource-scoped
   - Use direct relationships instead

2. **Don't forget the tenant relationship**
   - Without it, tenant-level permissions won't work
   - Always create when instantiating resources

3. **Don't mix permission levels**
   - Keep tenant-wide permissions in roles
   - Keep resource-specific permissions as direct relationships

4. **Use roles even for temporary single-user access**
   - Create temporary roles with unique names (e.g., `contractor_123_2024`)
   - Delete role when access should be revoked
   - This ensures clean permission removal and auditability

## Troubleshooting

### Issue: Admin can't delete user's project

**Problem**: Tenant admin role has `tenant#delete_all_projects` but permission check fails.

**Solution**: Verify tenant relationship exists:
```typescript
// Check if project is linked to tenant
const relationships = await omnibase.permissions.relationships.getRelationships(
  undefined,
  {
    namespace: 'Project',
    object: projectId,
    relation: 'tenant'
  }
);

// If missing, create it
if (relationships.data.relation_tuples.length === 0) {
  await omnibase.permissions.relationships.createRelationship(undefined, {
    namespace: 'Project',
    object: projectId,
    relation: 'tenant',
    subjectId: tenantId,
    subjectSet: {
      namespace: 'Tenant',
      object: tenantId,
      relation: ''
    }
  });
}
```

### Issue: Role permissions not working

**Problem**: Assigned role to user but permission checks fail.

**Solution**: Verify role has correct permissions:
```typescript
const roles = await omnibase.permissions.roles.list();
const userRole = roles.find(r => r.user_ids.includes(userId));
console.log('User role permissions:', userRole.permissions);

// Check if permission is in role
const hasPermission = userRole.permissions.includes('tenant#delete_all_projects');
```

## Summary

**Use Roles When:**
- Managing tenant membership
- Creating reusable permission sets
- Defining standard access levels
- Permissions apply tenant-wide

**Use Direct Relationships When:**
- Creating resource ownership (permanent)
- Linking resources to tenants (CRITICAL)
- Granting permanent access to specific resources
- Cross-tenant resource sharing needed

**Do NOT Use Direct Relationships For:**
- Temporary access (use roles instead)
- One-off permission grants (use roles instead)
- Any access that should be easily revocable (use roles instead)

**Always Remember:**
- Link every resource to its tenant via direct relationship
- Use `related: { tenant: Tenant }` (singular) in namespace definitions
- This enables tenant-level permissions to cascade to resources
- Without the tenant link, admin overrides won't work