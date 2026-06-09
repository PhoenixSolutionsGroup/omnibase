import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { getRegistry, AuthCtx, Operation, Clause } from "./policies";

const MOCK_USER_ID = "00000000-0000-0000-0000-000000000001";
const MOCK_TENANT_ID = "00000000-0000-0000-0000-000000000002";

// Sentinel context fed to `auth` predicate functions. valToSql() maps these
// exact values back to the SQL helpers auth.user_id() / auth.active_tenant_id().
const SENTINEL_AUTH: AuthCtx = { userId: MOCK_USER_ID, tenantId: MOCK_TENANT_ID, role: "member" };

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

// Resolve an `auth` predicate to a concrete value: call functions with the
// sentinel context, pass static filters/booleans through. A throw means "deny".
function resolveAuth(raw: unknown): unknown {
  if (typeof raw === "function") {
    try {
      return (raw as (a: AuthCtx) => unknown)(SENTINEL_AUTH);
    } catch {
      return false;
    }
  }
  return raw;
}

function authGuard(raw: unknown, table?: string): string {
  if (raw === false) return "false";
  if (raw === true) return "auth.user_id() IS NOT NULL";
  const sql = objToSql(raw, table ?? "");
  return `(auth.user_id() IS NOT NULL AND ${sql})`;
}

function buildCreateSQL(
  table: string,
  op: Operation,
  name: string,
  usingSQL: string | null,
  checkSQL: string | null,
): string {
  const parts: string[] = [];
  if (usingSQL !== null) parts.push(`  USING (${usingSQL})`);
  if (checkSQL !== null) parts.push(`  WITH CHECK (${checkSQL})`);
  return `CREATE POLICY "${name}" ON ${table}\n  FOR ${op.toUpperCase()}\n${parts.join("\n")};`;
}

// Clauses each operation emits: select/delete -> USING, insert -> WITH CHECK,
// update -> both. An op with no entry produces no policy at all (denied).
const OP_CLAUSES: Record<Operation, Clause[]> = {
  insert: ["check"],
  select: ["using"],
  update: ["using", "check"],
  delete: ["using"],
};

// A predicate that is undefined or literal false means "no policy for this role".
function isAbsent(v: unknown): boolean {
  return v === undefined || v === false;
}

export function generateRlsSql(table: string): { upSQL: string; downSQL: string } {
  const entry = getRegistry().get(table);
  if (!entry) return { upSQL: "", downSQL: "" };

  const ops: Operation[] = ["insert", "select", "update", "delete"];
  const upParts: string[] = [];
  const downParts: string[] = [];

  for (const op of ops) {
    const opDef = entry[op];
    if (!opDef) continue;
    const clauses = OP_CLAUSES[op];

    // ── anon policy: static predicates, no auth guard ──
    {
      let usingSQL: string | null = null;
      let checkSQL: string | null = null;
      for (const cl of clauses) {
        const v = opDef[cl]?.anon;
        if (isAbsent(v)) continue;
        const sql = v === true ? "true" : objToSql(v, table);
        if (cl === "using") usingSQL = sql;
        else checkSQL = sql;
      }
      if (usingSQL !== null || checkSQL !== null) {
        const name = `${table}_${op}_anon`;
        upParts.push(buildCreateSQL(table, op, name, usingSQL, checkSQL));
        downParts.push(`DROP POLICY IF EXISTS "${name}" ON ${table};`);
      }
    }

    // ── auth policy: guarded with auth.user_id() IS NOT NULL ──
    {
      let usingSQL: string | null = null;
      let checkSQL: string | null = null;
      for (const cl of clauses) {
        const v = resolveAuth(opDef[cl]?.auth);
        if (isAbsent(v)) continue;
        const sql = authGuard(v, table);
        if (cl === "using") usingSQL = sql;
        else checkSQL = sql;
      }
      if (usingSQL !== null || checkSQL !== null) {
        const name = `${table}_${op}_auth`;
        upParts.push(buildCreateSQL(table, op, name, usingSQL, checkSQL));
        downParts.push(`DROP POLICY IF EXISTS "${name}" ON ${table};`);
      }
    }
  }

  if (upParts.length === 0) return { upSQL: "", downSQL: "" };

  return {
    upSQL: `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;\n\n${upParts.join("\n\n")}`,
    downSQL: `${downParts.join("\n")}\nALTER TABLE ${table} DISABLE ROW LEVEL SECURITY;`,
  };
}

function parsePolicies(sql: string): Map<string, string> {
  const map = new Map<string, string>();
  const parts = sql.split(/(?=CREATE POLICY ")/);
  for (const part of parts) {
    let t = part.trim();
    if (!t.startsWith('CREATE POLICY "')) continue;
    // The split only keys on CREATE POLICY, so a chunk trails into the next
    // entry's "DROP POLICY ..." line. Drop everything from there so the stored
    // block is just the CREATE statement and compares cleanly against desired.
    const dropIdx = t.search(/\n\s*DROP POLICY /);
    if (dropIdx !== -1) t = t.slice(0, dropIdx).trim();
    const m = t.match(/^CREATE POLICY "([^"]+)"/);
    if (m) map.set(m[1], t);
  }
  return map;
}

export function generateRlsDiffFromMigrations(
  migrationsDir: string,
  tables: string[],
  excludeNewerThan?: string,
): { upSQL: string; downSQL: string } {
  const existing = fetchExistingPoliciesFromMigrations(migrationsDir, tables, excludeNewerThan);
  const upParts: string[] = [];
  const downDrops: string[] = [];
  const downCreates: string[] = [];
  const downDisables: string[] = [];

  for (const table of tables) {
    const desired = generateRlsSql(table);
    if (!desired.upSQL) continue;

    const existingPolicies = parsePolicies(existing.get(table) ?? "");
    const desiredPolicies = parsePolicies(desired.upSQL);

    const allNames = new Set([...existingPolicies.keys(), ...desiredPolicies.keys()]);
    const tableUp: string[] = [];

    for (const name of allNames) {
      const oldSQL = existingPolicies.get(name) ?? "";
      const newSQL = desiredPolicies.get(name) ?? "";
      if (oldSQL.replace(/\s+/g, " ").trim() === newSQL.replace(/\s+/g, " ").trim()) continue;

      if (newSQL) {
        tableUp.push(`DROP POLICY IF EXISTS "${name}" ON ${table};\n${newSQL}`);
      } else {
        tableUp.push(`DROP POLICY IF EXISTS "${name}" ON ${table};`);
      }

      // Down reverses the up change: drop what up created/changed, then restore
      // the previous definition (if there was one).
      downDrops.push(`DROP POLICY IF EXISTS "${name}" ON ${table};`);
      if (oldSQL) downCreates.push(oldSQL);
    }

    if (tableUp.length === 0) continue;

    // Enable RLS the first time a table gains policies (otherwise the policies
    // exist but are not enforced); disable it again on rollback.
    if (existingPolicies.size === 0) {
      upParts.push(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`);
      downDisables.push(`ALTER TABLE ${table} DISABLE ROW LEVEL SECURITY;`);
    }
    upParts.push(...tableUp);
  }

  const downSQLParts: string[] = [];
  if (downDrops.length > 0) downSQLParts.push(downDrops.join("\n"));
  if (downCreates.length > 0) downSQLParts.push(downCreates.join("\n\n"));
  if (downDisables.length > 0) downSQLParts.push(downDisables.join("\n"));

  return {
    upSQL: upParts.join("\n\n"),
    downSQL: downSQLParts.join("\n\n"),
  };
}

// Reconstructs the current set of RLS policies per table from the migration
// history by replaying every migration's CREATE POLICY blocks newest-first
// (the newest definition of a given policy name wins). Independent of any
// ALTER ... ENABLE ROW LEVEL SECURITY marker, so it stays in sync with what
// generateRlsDiffFromMigrations actually writes.
function fetchExistingPoliciesFromMigrations(
  migrationsDir: string,
  tables: string[],
  excludeNewerThan?: string,
): Map<string, string> {
  const dirs = readdirSync(migrationsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  const perTable = new Map<string, Map<string, string>>();
  for (const t of tables) perTable.set(t, new Map());

  for (let i = dirs.length - 1; i >= 0; i--) {
    if (excludeNewerThan && dirs[i] === excludeNewerThan) continue;
    const file = join(migrationsDir, dirs[i], "migration.sql");
    if (!existsSync(file)) continue;
    const sql = readFileSync(file, "utf-8");
    const policies = parsePolicies(sql);

    for (const [name, block] of policies) {
      const table = tables.find((t) => name.startsWith(`${t}_`));
      if (!table) continue;
      const m = perTable.get(table)!;
      if (!m.has(name)) m.set(name, block); // newest migration wins
    }
  }

  const map = new Map<string, string>();
  for (const [table, m] of perTable) {
    if (m.size > 0) map.set(table, [...m.values()].join("\n\n"));
  }
  return map;
}
