---
title: Row-Level Security
description: Enforce tenant isolation and access control at the database level with PostgreSQL RLS
---

# Row-Level Security

Row-Level Security (RLS) is a PostgreSQL feature that restricts which rows a query can see or modify. Instead of relying on application code to filter data, the database itself enforces access rules on every query.

OmniBase provides helper functions like `auth.active_tenant_id()` that make it easy to write RLS policies for tenant isolation. You enable RLS and write policies per table.

---

## Auth Helper Functions

OmniBase provides helper functions for use in RLS policies:

```sql
auth.active_tenant_id()                    -- current tenant UUID (from JWT)
auth.user_id()                             -- current user UUID (from JWT)
auth.active_user_role()                    -- user's role name (DB lookup from permissions.roles)
auth.has_relation(ns, obj, rel)            -- true if user has this relation (Keto lookup)
auth.has_any_relation(ns, obj, rels[])     -- true if user has ANY of the relations (Keto lookup)
```

`active_tenant_id()` and `user_id()` read from JWT claims. `active_user_role()` queries `permissions.roles` directly and `has_relation()` / `has_any_relation()` query Keto relation tuples, so permission changes take effect immediately without requiring a new JWT.

```sql
-- has_relation: does this user have 'delete_tenant' on this Tenant?
SELECT auth.has_relation('Tenant', 'tenant-uuid', 'delete_tenant');
-- Returns: true (if a matching Keto relation tuple exists)

-- has_any_relation: does this user have 'owner' OR 'can_read' on this StorageObject?
-- More efficient than multiple has_relation() calls (single query)
SELECT auth.has_any_relation('StorageObject', 'object-uuid', ARRAY['owner', 'can_read']);
-- Returns: true (if any matching tuple exists)
```

---

## Writing Custom RLS Policies

### 1. Create Your Table

Include a `tenant_id` column with a foreign key to `auth.tenants`:

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES auth.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Enable RLS and Grant Access

```sql
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON projects TO anon_user;
```

### 3. Add a Policy

```sql
CREATE POLICY tenant_isolation ON projects
  FOR ALL
  USING (tenant_id = auth.active_tenant_id()::uuid)
  WITH CHECK (tenant_id = auth.active_tenant_id()::uuid);
```

| Clause | Applies to | Purpose |
|--------|-----------|---------|
| `USING` | SELECT, UPDATE, DELETE | Filters which rows are visible |
| `WITH CHECK` | INSERT, UPDATE | Validates new/modified rows |

> **Note:**
  Always use `ON DELETE CASCADE` on `tenant_id` foreign keys so data is cleaned up when a tenant is deleted.

---

## Common Patterns

### Tenant Isolation (Default)

Every row belongs to exactly one tenant. This is the most common pattern.

```sql
CREATE POLICY tenant_isolation ON your_table
  FOR ALL
  USING (tenant_id = auth.active_tenant_id()::uuid)
  WITH CHECK (tenant_id = auth.active_tenant_id()::uuid);
```

### User-Owned Rows

Rows belong to a specific user within a tenant. Other tenant members can see public rows.

```sql
-- Users see their own rows + public rows in their tenant
CREATE POLICY user_owned_select ON documents
  FOR SELECT
  USING (
    tenant_id = auth.active_tenant_id()::uuid
    AND (user_id = auth.user_id()::uuid OR is_public = true)
  );

-- Users can only modify their own rows
CREATE POLICY user_owned_modify ON documents
  FOR UPDATE USING (
    tenant_id = auth.active_tenant_id()::uuid
    AND user_id = auth.user_id()::uuid
  );
```

### Relation-Gated Access (ReBAC)

Gate rows on Keto relation tuples using `auth.has_relation()` or `auth.has_any_relation()`. These check the same permission data the API middleware uses:

```sql
-- Only users with 'read' relation on Audit namespace can view logs
CREATE POLICY audit_read ON audit_logs
  FOR SELECT
  USING (
    tenant_id = auth.active_tenant_id()::uuid
    AND auth.has_relation('Audit', tenant_id::text, 'read')
  );
```

Use `has_any_relation()` when checking multiple relations — it runs a single query instead of multiple `has_relation()` calls:

```sql
-- Per-object permissions: owner OR can_read can view storage objects
CREATE POLICY storage_objects_read ON storage.objects
  FOR SELECT TO anon_user
  USING (
    tenant_id::text = auth.active_tenant_id()
    AND auth.has_any_relation('StorageObject', id::text, ARRAY['owner', 'can_read'])
  );

-- Per-object permissions: owner OR can_delete can delete storage objects
CREATE POLICY storage_objects_delete ON storage.objects
  FOR DELETE TO anon_user
  USING (
    tenant_id::text = auth.active_tenant_id()
    AND auth.has_any_relation('StorageObject', id::text, ARRAY['owner', 'can_delete'])
  );
```

The namespace and relation map to how permissions are stored: a role permission `storage#manage_all` creates a Keto tuple with namespace=`Storage`, relation=`manage_all` on the tenant object.

### Shared Reference Data

Tables without `tenant_id` are accessible to everyone. Don't enable RLS — just restrict writes:

```sql
CREATE TABLE plans (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER NOT NULL
);

-- All authenticated users can read, only super_user can write
GRANT SELECT ON plans TO anon_user;
```

---

## Indexing Tips

Always include `tenant_id` as the leading column in indexes. RLS adds a `tenant_id` filter to every query, so this keeps lookups fast:

```sql
-- Composite index with tenant_id first
CREATE INDEX idx_projects_tenant_status ON projects(tenant_id, status);

-- Unique constraints should include tenant_id
CREATE UNIQUE INDEX idx_projects_tenant_name ON projects(tenant_id, name);
```

---

## Related

- [Data Isolation](/guides/multi-tenancy/isolation) — Full deep-dive into JWT structure, database roles, and testing isolation
- [RBAC](/guides/rbac) — Role-based access control
- [Storage](/guides/storage) — File storage with per-object permissions
