import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { getRegistry, Auth, Operation, PolicyDefinition } from "./policies";

const MOCK_USER_ID = "00000000-0000-0000-0000-000000000001";
const MOCK_TENANT_ID = "00000000-0000-0000-0000-000000000002";

const ANON_AUTH: Auth = { userId: null, tenantId: null, role: null };
const AUTH_AUTH: Auth = { userId: MOCK_USER_ID, tenantId: MOCK_TENANT_ID, role: "member" };

function singularize(word: string): string {
  if (word.endsWith("ies")) return word.slice(0, -3) + "y";
  if (word.endsWith("ses")) return word.slice(0, -2);
  if (word.endsWith("s")) return word.slice(0, -1);
  return word;
}

function parentFk(relation: string): string {
  return singularize(relation) + "_id";
}

function childFk(parent: string): string {
  return singularize(parent) + "_id";
}

function valToSql(val: unknown): string {
  if (val === true) return "true";
  if (val === false) return "false";
  if (typeof val === "number") return String(val);
  if (typeof val === "string") {
    if (val === MOCK_USER_ID) return "auth.user_id()";
    if (val === MOCK_TENANT_ID) return "auth.active_tenant_id()";
    if (/^[0-9a-f-]{36}$/i.test(val)) return `'${val}'::uuid`;
    return `'${val.replace(/'/g, "''")}'`;
  }
  return "''";
}

function objToSql(obj: unknown, tableAlias: string, parentModel?: string): string {
  if (obj === false) return "false";
  if (obj === true || obj == null || typeof obj !== "object") return "true";

  const o = obj as Record<string, unknown>;
  const keys = Object.keys(o);
  if (keys.length === 0) return "true";

  if (keys.length === 1 && keys[0] === "OR") {
    const arr = o.OR as unknown[];
    if (!Array.isArray(arr) || arr.length === 0) return "false";
    const parts = arr
      .map((item) => objToSql(item, tableAlias, parentModel))
      .filter((s) => s !== "false" && s !== "");
    if (parts.length === 0) return "false";
    return "( " + parts.join("\n    OR ") + " )";
  }

  if (keys.length === 1 && keys[0] === "AND") {
    const arr = o.AND as unknown[];
    if (!Array.isArray(arr) || arr.length === 0) return "true";
    const parts = arr
      .map((item) => objToSql(item, tableAlias, parentModel))
      .filter((s) => s !== "true" && s !== "");
    if (parts.length === 0) return "true";
    return "( " + parts.join("\n    AND ") + " )";
  }

  if (keys.length === 1) {
    const k = keys[0];
    const v = o[k];

    if (v == null) return `${tableAlias}.${k} IS NULL`;
    if (typeof v === "boolean") return `${tableAlias}.${k} = ${valToSql(v)}`;
    if (typeof v === "number") return `${tableAlias}.${k} = ${valToSql(v)}`;
    if (typeof v === "string") {
      const rhs = valToSql(v);
      if (rhs.startsWith("auth.")) return `${tableAlias}.${k}::text = ${rhs}`;
      return `${tableAlias}.${k} = ${rhs}`;
    }
    if (Array.isArray(v)) {
      if (v.length === 0) return "false";
      const vals = v.map((x) => valToSql(x));
      const needsCast = vals.some((x) => x.startsWith("auth."));
      const col = needsCast ? `${tableAlias}.${k}::text` : `${tableAlias}.${k}`;
      return `${col} = ANY(ARRAY[${vals.join(", ")}])`;
    }
    if (typeof v === "object") {
      const inner = v as Record<string, unknown>;
      const ikeys = Object.keys(inner);

      if (ikeys.length === 1) {
        const ik = ikeys[0];

        if (ik === "in") {
          const arr = inner.in as unknown[];
          if (!Array.isArray(arr) || arr.length === 0) return "false";
          const vals = arr.map((x) => valToSql(x));
          const needsCast = vals.some((x) => x.startsWith("auth."));
          const col = needsCast ? `${tableAlias}.${k}::text` : `${tableAlias}.${k}`;
          return `${col} = ANY(ARRAY[${vals.join(", ")}])`;
        }
        if (ik === "notIn") {
          const arr = inner.notIn as unknown[];
          if (!Array.isArray(arr) || arr.length === 0) return "true";
          const vals = arr.map((x) => valToSql(x));
          const needsCast = vals.some((x) => x.startsWith("auth."));
          const col = needsCast ? `${tableAlias}.${k}::text` : `${tableAlias}.${k}`;
          return `NOT (${col} = ANY(ARRAY[${vals.join(", ")}]))`;
        }
        if (ik === "is") {
          const sub = k;
          return `EXISTS (SELECT 1 FROM ${k} ${sub} WHERE ${sub}.id = ${tableAlias}.${parentFk(k)} AND ${objToSql(inner.is, sub, k)})`;
        }
        if (ik === "some") {
          const sub = k;
          const fk = childFk(parentModel ?? tableAlias);
          return `EXISTS (SELECT 1 FROM ${k} ${sub} WHERE ${sub}.${fk} = ${tableAlias}.id AND ${objToSql(inner.some, sub, k)})`;
        }
      }

      const sub = k;
      return `EXISTS (SELECT 1 FROM ${k} ${sub} WHERE ${sub}.id = ${tableAlias}.${parentFk(k)} AND ${objToSql(v, sub, k)})`;
    }
  }

  const parts: string[] = [];
  for (const k of keys) {
    if (k === "OR" || k === "AND") continue;
    const single = objToSql({ [k]: o[k] }, tableAlias, parentModel);
    if (single !== "true") parts.push(single);
  }
  return parts.length === 0 ? "true" : parts.join("\n    AND ");
}

function evalFor(auth: Auth, policyDef: PolicyDefinition<any>, op: Operation): unknown {
  try {
    if (typeof policyDef === "function") return op === "select" ? policyDef(auth) : policyDef(auth);
    const fn = policyDef[op];
    return fn ? fn(auth) : true;
  } catch {
    return false;
  }
}

const JWT_IS_NULL = "current_setting('request.jwt.claims', true)::json->>'user_id' IS NULL";
const JWT_IS_NOT_NULL = "current_setting('request.jwt.claims', true)::json->>'user_id' IS NOT NULL";

export function generateRlsSql(table: string): { upSQL: string; downSQL: string } {
  const registry = getRegistry();
  const policyDef = registry.get(table);
  if (!policyDef) return { upSQL: "", downSQL: "" };

  const ops: Operation[] = ["insert", "select", "update", "delete"];
  const upParts: string[] = [];
  const downParts: string[] = [];

  for (const op of ops) {
    const anonResult = evalFor(ANON_AUTH, policyDef, op);
    const authResult = evalFor(AUTH_AUTH, policyDef, op);

    if (anonResult === true && authResult === true) continue;
    if (anonResult === false && authResult === false) continue;

    const anonSQL = anonResult === true ? "true" : objToSql(anonResult, table);
    const authSQL = authResult === true ? "true" : objToSql(authResult, table);

    let expr: string;
    if (anonSQL === authSQL) {
      expr = anonSQL;
    } else if (anonResult === true || anonResult === false) {
      const anonCond = anonResult === false ? JWT_IS_NOT_NULL : JWT_IS_NULL;
      const val = anonResult === false ? authSQL : anonSQL;
      expr = `CASE WHEN ${anonCond} THEN ${val} END`;
    } else {
      expr = `CASE WHEN ${JWT_IS_NULL} THEN ${anonSQL} ELSE ${authSQL} END`;
    }

    if (expr === "true") continue;

    const policyName = `${table}_${op}`;
    const drop = `DROP POLICY IF EXISTS "${policyName}" ON ${table};`;

    let create: string;
    switch (op) {
      case "insert":
        create = `CREATE POLICY "${policyName}" ON ${table}\n  FOR INSERT\n  WITH CHECK (${expr});`;
        break;
      case "select":
        create = `CREATE POLICY "${policyName}" ON ${table}\n  FOR SELECT\n  USING (${expr});`;
        break;
      case "update":
        create = `CREATE POLICY "${policyName}" ON ${table}\n  FOR UPDATE\n  USING (${expr})\n  WITH CHECK (${expr});`;
        break;
      case "delete":
        create = `CREATE POLICY "${policyName}" ON ${table}\n  FOR DELETE\n  USING (${expr});`;
        break;
    }

    upParts.push(create);
    downParts.push(drop);
  }

  if (upParts.length === 0) return { upSQL: "", downSQL: "" };

  return {
    upSQL: `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;\n\n${upParts.join("\n\n")}`,
    downSQL: `${downParts.join("\n")}\nALTER TABLE ${table} DISABLE ROW LEVEL SECURITY;`,
  };
}

export function generateRlsDiffFromMigrations(
  migrationsDir: string,
  tables: string[],
  excludeNewerThan?: string,
): { upSQL: string; downSQL: string } {
  const existing = fetchExistingPoliciesFromMigrations(migrationsDir, excludeNewerThan);
  const upParts: string[] = [];
  const downParts: string[] = [];

  for (const table of tables) {
    const desired = generateRlsSql(table);
    if (!desired.upSQL) continue;

    const existingSQL = (existing.get(table) ?? "").replace(/\s+/g, " ").trim();
    const desiredSQL = desired.upSQL.replace(/\s+/g, " ").trim();
    if (existingSQL === desiredSQL) continue;

    upParts.push(desired.upSQL);
    downParts.push(desired.downSQL);
  }

  return {
    upSQL: upParts.join("\n\n"),
    downSQL: downParts.reverse().join("\n\n"),
  };
}

function fetchExistingPoliciesFromMigrations(
  migrationsDir: string,
  excludeNewerThan?: string,
): Map<string, string> {
  const dirs = readdirSync(migrationsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  const map = new Map<string, string>();
  for (let i = dirs.length - 1; i >= 0; i--) {
    if (excludeNewerThan && dirs[i] >= excludeNewerThan) continue;
    const file = join(migrationsDir, dirs[i], "migration.sql");
    if (!existsSync(file)) continue;
    const sql = readFileSync(file, "utf-8");
    if (!sql.includes("RLS policy")) continue;

    const re = /ALTER TABLE (\w+) ENABLE ROW LEVEL SECURITY/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(sql)) !== null) {
      if (!map.has(m[1])) map.set(m[1], "");
    }
  }
  return map;
}
