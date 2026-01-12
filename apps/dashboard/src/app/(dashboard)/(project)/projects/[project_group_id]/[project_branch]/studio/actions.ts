"use server";

import { Client } from "pg";
import { getProject } from "@/utils/get-project";
import { fetchDatabaseConnectionString } from "../settings/actions";
import { getOmnibaseProjectConfiguration } from "@/lib/server";
import { V1TenantsApi } from "@omnibase/core-js";

export interface TableColumn {
  name: string;
  type: string;
  isNullable: boolean;
  isPrimaryKey: boolean;
  defaultValue: string | null;
}

export interface TableInfo {
  name: string;
  schemaName: string;
  columns: TableColumn[];
  hasRlsPolicies: boolean;
}

export interface SchemaInfo {
  [schemaName: string]: TableInfo[];
}

export async function fetchSchemaInfo(
  projectGroupId: string,
  projectBranch: string
): Promise<{ success: boolean; schemas?: SchemaInfo; error?: string }> {
  const project = await getProject(projectGroupId, projectBranch);
  if (!project) {
    return { success: false, error: "Project not found" };
  }

  // Try to get connection string from managed-hosting, fall back to building from project fields
  let connectionString: string;
  const connResult = await fetchDatabaseConnectionString(project.id);
  if (connResult.success && connResult.connectionString) {
    connectionString = connResult.connectionString;
  } else {
    // Fallback: build connection string from project fields
    const host = project.database_host || "127.0.0.1";
    const port = project.database_port || 5432;
    const user = project.database_username || "postgres";
    const password = "postgres"; // default dev password
    const dbName = project.database_name || "db";
    connectionString = `postgresql://${user}:${password}@${host}:${port}/${dbName}`;
  }

  const client = new Client({ connectionString });

  try {
    await client.connect();

    // Get all tables with their schemas
    const tablesResult = await client.query(`
      SELECT
        t.table_schema,
        t.table_name,
        c.column_name,
        c.data_type,
        c.udt_name,
        c.is_nullable,
        c.column_default,
        CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END as is_primary_key
      FROM information_schema.tables t
      JOIN information_schema.columns c
        ON t.table_schema = c.table_schema
        AND t.table_name = c.table_name
      LEFT JOIN (
        SELECT ku.table_schema, ku.table_name, ku.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage ku
          ON tc.constraint_name = ku.constraint_name
          AND tc.table_schema = ku.table_schema
        WHERE tc.constraint_type = 'PRIMARY KEY'
      ) pk ON c.table_schema = pk.table_schema
          AND c.table_name = pk.table_name
          AND c.column_name = pk.column_name
      WHERE t.table_type = 'BASE TABLE'
        AND t.table_schema NOT IN ('pg_catalog', 'pg_toast', 'information_schema')
      ORDER BY t.table_schema, t.table_name, c.ordinal_position
    `);

    // Get RLS policy counts per table
    const rlsResult = await client.query(`
      SELECT schemaname, tablename, COUNT(*) as policy_count
      FROM pg_policies
      GROUP BY schemaname, tablename
    `);

    const rlsPolicies = new Map<string, number>();
    for (const row of rlsResult.rows) {
      rlsPolicies.set(`${row.schemaname}.${row.tablename}`, parseInt(row.policy_count));
    }

    // Group by schema and table
    const schemas: SchemaInfo = {};

    for (const row of tablesResult.rows) {
      const schemaName = row.table_schema;
      const tableName = row.table_name;

      if (!schemas[schemaName]) {
        schemas[schemaName] = [];
      }

      let table = schemas[schemaName].find((t) => t.name === tableName);
      if (!table) {
        const policyCount = rlsPolicies.get(`${schemaName}.${tableName}`) || 0;
        table = { name: tableName, schemaName, columns: [], hasRlsPolicies: policyCount > 0 };
        schemas[schemaName].push(table);
      }

      table!.columns.push({
        name: row.column_name,
        type: row.udt_name || row.data_type,
        isNullable: row.is_nullable === "YES",
        isPrimaryKey: row.is_primary_key,
        defaultValue: row.column_default,
      });
    }

    // Notify PostgREST to reload its schema cache
    await client.query("NOTIFY pgrst, 'reload schema';");

    return { success: true, schemas };
  } catch (error: any) {
    console.error("Error fetching schema info:", error.message);
    return { success: false, error: error.message };
  } finally {
    await client.end();
  }
}

export interface RLSPolicy {
  policyname: string;
  schemaname: string;
  tablename: string;
  cmd: string;
  roles: string[];
  qual: string | null;
  with_check: string | null;
}

export async function fetchRLSPolicies(
  projectGroupId: string,
  projectBranch: string,
  tableName: string,
  schemaName: string = "public"
): Promise<{ success: boolean; policies?: RLSPolicy[]; error?: string }> {
  const project = await getProject(projectGroupId, projectBranch);
  if (!project) {
    return { success: false, error: "Project not found" };
  }

  let connectionString: string;
  const connResult = await fetchDatabaseConnectionString(project.id);
  if (connResult.success && connResult.connectionString) {
    connectionString = connResult.connectionString;
  } else {
    const host = project.database_host || "127.0.0.1";
    const port = project.database_port || 5432;
    const user = project.database_username || "postgres";
    const password = "postgres";
    const dbName = project.database_name || "db";
    connectionString = `postgresql://${user}:${password}@${host}:${port}/${dbName}`;
  }

  const client = new Client({ connectionString });

  try {
    await client.connect();

    const result = await client.query(
      `
      SELECT
        policyname,
        schemaname,
        tablename,
        cmd,
        roles,
        qual,
        with_check
      FROM pg_policies
      WHERE tablename = $1 AND schemaname = $2
      ORDER BY policyname
    `,
      [tableName, schemaName]
    );

    const policies: RLSPolicy[] = result.rows.map((row) => {
      // Parse roles - PostgreSQL returns as {role1,role2} string or actual array
      let roles: string[] = [];
      if (Array.isArray(row.roles)) {
        roles = row.roles;
      } else if (typeof row.roles === "string") {
        // Parse PostgreSQL array string format: {role1,role2}
        roles = row.roles.replace(/^\{|\}$/g, "").split(",").filter(Boolean);
      }
      return {
        policyname: row.policyname,
        schemaname: row.schemaname,
        tablename: row.tablename,
        cmd: row.cmd,
        roles,
        qual: row.qual,
        with_check: row.with_check,
      };
    });

    return { success: true, policies };
  } catch (error: any) {
    console.error("Error fetching RLS policies:", error.message);
    return { success: false, error: error.message };
  } finally {
    await client.end();
  }
}

export interface Tenant {
  id: string;
  name: string;
}

export async function fetchTenants(
  projectGroupId: string,
  projectBranch: string
): Promise<{ success: boolean; tenants?: Tenant[]; error?: string }> {
  const project = await getProject(projectGroupId, projectBranch);
  if (!project) {
    return { success: false, error: "Project not found" };
  }

  let connectionString: string;
  const connResult = await fetchDatabaseConnectionString(project.id);
  if (connResult.success && connResult.connectionString) {
    connectionString = connResult.connectionString;
  } else {
    const host = project.database_host || "127.0.0.1";
    const port = project.database_port || 5432;
    const user = project.database_username || "postgres";
    const password = "postgres";
    const dbName = project.database_name || "db";
    connectionString = `postgresql://${user}:${password}@${host}:${port}/${dbName}`;
  }

  const client = new Client({ connectionString });

  try {
    await client.connect();

    const result = await client.query(`
      SELECT id, name FROM auth.tenants ORDER BY name
    `);

    const tenants: Tenant[] = result.rows.map((row) => ({
      id: row.id,
      name: row.name || row.id,
    }));

    return { success: true, tenants };
  } catch (error: any) {
    console.error("Error fetching tenants:", error.message);
    return { success: false, error: error.message };
  } finally {
    await client.end();
  }
}

export interface TenantUser {
  id: string;
  email: string;
}

export async function fetchTenantUsers(
  projectGroupId: string,
  projectBranch: string,
  tenantId: string
): Promise<{ success: boolean; users?: TenantUser[]; error?: string }> {
  const project = await getProject(projectGroupId, projectBranch);
  if (!project) {
    return { success: false, error: "Project not found" };
  }

  let connectionString: string;
  const connResult = await fetchDatabaseConnectionString(project.id);
  if (connResult.success && connResult.connectionString) {
    connectionString = connResult.connectionString;
  } else {
    const host = project.database_host || "127.0.0.1";
    const port = project.database_port || 5432;
    const user = project.database_username || "postgres";
    const password = "postgres";
    const dbName = project.database_name || "db";
    connectionString = `postgresql://${user}:${password}@${host}:${port}/${dbName}`;
  }

  const client = new Client({ connectionString });

  try {
    await client.connect();

    const result = await client.query(
      `
      SELECT tu.user_id as id, i.traits->>'email' as email
      FROM auth.tenant_users tu
      JOIN auth.identities i ON tu.user_id::uuid = i.id
      WHERE tu.tenant_id = $1 AND tu.is_active = true
      ORDER BY i.traits->>'email'
    `,
      [tenantId]
    );

    const users: TenantUser[] = result.rows.map((row) => ({
      id: row.id,
      email: row.email || row.id,
    }));

    return { success: true, users };
  } catch (error: any) {
    console.error("Error fetching tenant users:", error.message);
    return { success: false, error: error.message };
  } finally {
    await client.end();
  }
}

export async function getTenantJWT(
  projectGroupId: string,
  projectBranch: string,
  tenantId: string,
  userId: string
): Promise<{ success: boolean; token?: string; error?: string }> {
  const project = await getProject(projectGroupId, projectBranch);
  if (!project) {
    return { success: false, error: "Project not found" };
  }

  try {
    const config = await getOmnibaseProjectConfiguration(project);
    const tenantsApi = new V1TenantsApi(config);

    const response = await tenantsApi.getTenantJWT({
      xTenantId: tenantId,
      xUserId: userId,
    });

    if (response.data?.token) {
      return { success: true, token: response.data.token };
    }

    return { success: false, error: "No token returned" };
  } catch (error: any) {
    console.error("Error getting tenant JWT:", error.message);
    return { success: false, error: error.message };
  }
}
