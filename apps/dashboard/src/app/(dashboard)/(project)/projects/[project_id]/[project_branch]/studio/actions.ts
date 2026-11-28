"use server";

import { Pool, type PoolClient } from "pg";
import { getProjectBranch } from "@/utils/get-project";
import { fetchDatabasePassword } from "../settings/actions";

function errorMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

type BranchDatabase = {
	id: string;
	database_host: string | null;
	database_name: string | null;
	database_username: string | null;
};

async function branchConnectionString(branch: BranchDatabase) {
	if (
		!branch.database_host ||
		!branch.database_name ||
		!branch.database_username
	) {
		throw new Error("Branch database is not provisioned");
	}

	const passwordResult = await fetchDatabasePassword(branch.id);
	if (!passwordResult.success || !passwordResult.password) {
		throw new Error(
			passwordResult.error || "Failed to fetch database password",
		);
	}

	const password = encodeURIComponent(passwordResult.password);
	return `postgresql://${branch.database_username}:${password}@${branch.database_host}:6432/${branch.database_name}?sslmode=verify-full`;
}

const pools = new Map<string, Pool>();
const MAX_POOLS = 50;

async function branchPool(projectId: string, projectBranch: string) {
	const key = `${projectId}:${projectBranch}`;
	const existing = pools.get(key);
	if (existing) {
		return existing;
	}

	const project = await getProjectBranch(projectId, projectBranch);
	if (!project) {
		throw new Error("Project not found");
	}

	const pool = new Pool({
		connectionString: await branchConnectionString(project),
		max: 2,
		idleTimeoutMillis: 30000,
		connectionTimeoutMillis: 10000,
		query_timeout: 30000,
	});
	pool.on("error", (error) => console.error("Branch pool error:", error));

	if (pools.size >= MAX_POOLS) {
		const oldest = pools.entries().next().value;
		if (oldest) {
			const [oldestKey, oldestPool] = oldest;
			pools.delete(oldestKey);
			void oldestPool.end();
		}
	}

	pools.set(key, pool);
	return pool;
}

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
	projectId: string,
	projectBranch: string,
): Promise<{ success: boolean; schemas?: SchemaInfo; error?: string }> {
	let client: PoolClient;
	try {
		const pool = await branchPool(projectId, projectBranch);
		client = await pool.connect();
	} catch (error: unknown) {
		return { success: false, error: errorMessage(error) };
	}

	try {
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
			rlsPolicies.set(
				`${row.schemaname}.${row.tablename}`,
				parseInt(row.policy_count, 10),
			);
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
				table = {
					name: tableName,
					schemaName,
					columns: [],
					hasRlsPolicies: policyCount > 0,
				};
				schemas[schemaName].push(table);
			}

			table?.columns.push({
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
	} catch (error: unknown) {
		console.error("Error fetching schema info:", errorMessage(error));
		return { success: false, error: errorMessage(error) };
	} finally {
		client.release();
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
	projectId: string,
	projectBranch: string,
	tableName: string,
	schemaName: string = "public",
): Promise<{ success: boolean; policies?: RLSPolicy[]; error?: string }> {
	let client: PoolClient;
	try {
		const pool = await branchPool(projectId, projectBranch);

		client = await pool.connect();
	} catch (error: unknown) {
		return { success: false, error: errorMessage(error) };
	}

	try {
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
			[tableName, schemaName],
		);

		const policies: RLSPolicy[] = result.rows.map((row) => {
			// Parse roles - PostgreSQL returns as {role1,role2} string or actual array
			let roles: string[] = [];
			if (Array.isArray(row.roles)) {
				roles = row.roles;
			} else if (typeof row.roles === "string") {
				// Parse PostgreSQL array string format: {role1,role2}
				roles = row.roles
					.replace(/^\{|\}$/g, "")
					.split(",")
					.filter(Boolean);
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
	} catch (error: unknown) {
		console.error("Error fetching RLS policies:", errorMessage(error));
		return { success: false, error: errorMessage(error) };
	} finally {
		client.release();
	}
}

const FILTER_OPERATORS: Record<string, string> = {
	eq: "=",
	neq: "<>",
	gt: ">",
	lt: "<",
	gte: ">=",
	lte: "<=",
	ilike: "ILIKE",
	like: "LIKE",
};

const IS_LITERALS = new Set(["null", "true", "false"]);

function quoteIdentifier(name: string) {
	return `"${name.replace(/"/g, '""')}"`;
}

async function withBranchConnection<T>(
	projectId: string,
	projectBranch: string,
	run: (client: PoolClient) => Promise<T>,
): Promise<{ success: true; result: T } | { success: false; error: string }> {
	try {
		const pool = await branchPool(projectId, projectBranch);
		const client = await pool.connect();
		try {
			return { success: true, result: await run(client) };
		} finally {
			client.release();
		}
	} catch (error: unknown) {
		return { success: false, error: errorMessage(error) };
	}
}

export interface TableRowFilter {
	column: string;
	operator: string;
	value: string;
}

export interface TableRowOptions {
	page: number;
	pageSize: number;
	sort: { column: string; order: "asc" | "desc" } | null;
	filters: TableRowFilter[];
}

export async function fetchTableRows(
	projectId: string,
	projectBranch: string,
	schemaName: string,
	tableName: string,
	options: TableRowOptions,
): Promise<{
	success: boolean;
	rows?: Record<string, unknown>[];
	total?: number;
	error?: string;
}> {
	const params: unknown[] = [];
	const where: string[] = [];

	for (const filter of options.filters) {
		if (filter.operator === "is") {
			const literal = filter.value.trim().toLowerCase();
			if (!IS_LITERALS.has(literal)) continue;
			where.push(
				`${quoteIdentifier(filter.column)} IS ${literal.toUpperCase()}`,
			);
			continue;
		}

		const operator = FILTER_OPERATORS[filter.operator];
		if (!operator) continue;

		let value = filter.value;
		if (!value && filter.operator !== "ilike" && filter.operator !== "like") {
			continue;
		}
		if (
			(filter.operator === "ilike" || filter.operator === "like") &&
			!value.includes("%")
		) {
			value = `%${value}%`;
		}

		params.push(value);
		where.push(
			`${quoteIdentifier(filter.column)} ${operator} $${params.length}`,
		);
	}

	const orderBy = options.sort
		? ` ORDER BY ${quoteIdentifier(options.sort.column)} ${
				options.sort.order === "asc" ? "ASC" : "DESC"
			}`
		: "";

	params.push(options.pageSize, options.page * options.pageSize);
	const sql = `SELECT *, ctid::text AS __studio_ctid, count(*) OVER() AS __studio_total FROM ${quoteIdentifier(
		schemaName,
	)}.${quoteIdentifier(tableName)}${
		where.length > 0 ? ` WHERE ${where.join(" AND ")}` : ""
	}${orderBy} LIMIT $${params.length - 1} OFFSET $${params.length}`;

	return withBranchConnection(projectId, projectBranch, async (client) => {
		const result = await client.query(sql, params);
		const rows = result.rows.map((row) => {
			const { __studio_total, ...rest } = row;
			return rest;
		});
		const total = rows.length > 0 ? Number(result.rows[0].__studio_total) : 0;
		return { rows, total };
	}).then((outcome) =>
		outcome.success
			? { success: true, ...outcome.result }
			: { success: false, error: outcome.error },
	);
}

export async function insertTableRow(
	projectId: string,
	projectBranch: string,
	schemaName: string,
	tableName: string,
	values: Record<string, unknown>,
): Promise<{
	success: boolean;
	row?: Record<string, unknown>;
	error?: string;
}> {
	const columns = Object.keys(values);
	const params = columns.map((column) => values[column]);
	const sql =
		columns.length > 0
			? `INSERT INTO ${quoteIdentifier(schemaName)}.${quoteIdentifier(
					tableName,
				)} (${columns.map(quoteIdentifier).join(", ")}) VALUES (${columns
					.map((_, index) => `$${index + 1}`)
					.join(", ")}) RETURNING *`
			: `INSERT INTO ${quoteIdentifier(schemaName)}.${quoteIdentifier(
					tableName,
				)} DEFAULT VALUES RETURNING *`;

	return withBranchConnection(projectId, projectBranch, async (client) => {
		const result = await client.query(sql, params);
		return { row: result.rows[0] };
	}).then((outcome) =>
		outcome.success
			? { success: true, ...outcome.result }
			: { success: false, error: outcome.error },
	);
}

export async function deleteTableRows(
	projectId: string,
	projectBranch: string,
	schemaName: string,
	tableName: string,
	primaryKeys: string[],
	rows: Record<string, unknown>[],
): Promise<{ success: boolean; deleted?: number; error?: string }> {
	if (rows.length === 0) {
		return { success: true, deleted: 0 };
	}

	const qualified = `${quoteIdentifier(schemaName)}.${quoteIdentifier(
		tableName,
	)}`;

	let sql: string;
	let params: unknown[];

	if (primaryKeys.length > 0) {
		const values: unknown[] = [];
		const placeholders = rows.map((row) => {
			const keys = primaryKeys.map((key) => {
				values.push(row[key]);
				return `$${values.length}`;
			});
			return `(${keys.join(", ")})`;
		});
		sql = `DELETE FROM ${qualified} WHERE (${primaryKeys
			.map(quoteIdentifier)
			.join(", ")}) IN (${placeholders.join(", ")})`;
		params = values;
	} else {
		sql = `DELETE FROM ${qualified} WHERE ctid = ANY($1::tid[])`;
		params = [rows.map((row) => row.__studio_ctid)];
	}

	return withBranchConnection(projectId, projectBranch, async (client) => {
		const result = await client.query(sql, params);
		return { deleted: result.rowCount ?? 0 };
	}).then((outcome) =>
		outcome.success
			? { success: true, ...outcome.result }
			: { success: false, error: outcome.error },
	);
}
