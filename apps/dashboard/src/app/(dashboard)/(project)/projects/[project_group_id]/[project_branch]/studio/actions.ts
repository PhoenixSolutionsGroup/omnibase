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
    console.log("[fetchSchemaInfo] Using connection string from managed-hosting");
  } else {
    // Fallback: build connection string from project fields
    const host = project.database_host || "127.0.0.1";
    const port = project.database_port || 5432;
    const user = project.database_username || "postgres";
    const password = "postgres"; // default dev password
    const dbName = project.database_name || "db";
    connectionString = `postgresql://${user}:${password}@${host}:${port}/${dbName}`;
    console.log("[fetchSchemaInfo] Using fallback connection string", { host, port, user, dbName });
  }

  // Mask password for logging
  const maskedConnString = connectionString.replace(/:([^@]+)@/, ":***@");
  console.log("[fetchSchemaInfo] Connecting to:", maskedConnString);

  const client = new Client({
    connectionString,
    connectionTimeoutMillis: 10000, // 10 second connection timeout
    query_timeout: 30000, // 30 second query timeout
  });

  try {
    console.log("[fetchSchemaInfo] Attempting to connect...");
    await client.connect();
    console.log("[fetchSchemaInfo] Connected successfully");

    // Get all tables with their schemas using pg_catalog (much faster than information_schema)
    const tablesResult = await client.query(`
      SELECT
        n.nspname AS table_schema,
        c.relname AS table_name,
        a.attname AS column_name,
        pg_catalog.format_type(a.atttypid, a.atttypmod) AS data_type,
        t.typname AS udt_name,
        CASE WHEN a.attnotnull THEN 'NO' ELSE 'YES' END AS is_nullable,
        pg_get_expr(d.adbin, d.adrelid) AS column_default,
        CASE WHEN pk.attname IS NOT NULL THEN true ELSE false END AS is_primary_key,
        a.attnum AS ordinal_position
      FROM pg_catalog.pg_class c
      JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
      JOIN pg_catalog.pg_attribute a ON a.attrelid = c.oid
      JOIN pg_catalog.pg_type t ON t.oid = a.atttypid
      LEFT JOIN pg_catalog.pg_attrdef d ON d.adrelid = c.oid AND d.adnum = a.attnum
      LEFT JOIN (
        SELECT i.indrelid, unnest(i.indkey) AS attnum, a2.attname
        FROM pg_catalog.pg_index i
        JOIN pg_catalog.pg_attribute a2 ON a2.attrelid = i.indrelid AND a2.attnum = ANY(i.indkey)
        WHERE i.indisprimary
      ) pk ON pk.indrelid = c.oid AND pk.attnum = a.attnum
      WHERE c.relkind = 'r'
        AND a.attnum > 0
        AND NOT a.attisdropped
        AND n.nspname NOT IN ('pg_catalog', 'pg_toast', 'information_schema')
      ORDER BY n.nspname, c.relname, a.attnum
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
