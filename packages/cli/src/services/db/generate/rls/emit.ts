import { getRegistry } from "../policies";
import type { Operation, Clause, CompiledOp } from "../policies";
import { resolveTableName } from "./schema";
import { objToSql, resolveAuth, authGuard } from "./compile";

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

const OP_CLAUSES: Record<Operation, Clause[]> = {
  insert: ["check"],
  select: ["using"],
  update: ["using", "check"],
  delete: ["using"],
};

const OP_ORDER: Operation[] = ["insert", "select", "update", "delete"];

const OP_PRIVILEGE: Record<Operation, string> = {
  select: "SELECT",
  insert: "INSERT",
  update: "UPDATE",
  delete: "DELETE",
};

export const PRIVILEGE_ORDER = ["SELECT", "INSERT", "UPDATE", "DELETE"];

function isAbsent(v: unknown): boolean {
  return v === undefined || v === false;
}

type ClauseResolver = (cl: Clause, opDef: CompiledOp) => string | null;

export function generateRlsSql(modelName: string): {
  upSQL: string;
  downSQL: string;
} {
  const entry = getRegistry().get(modelName);
  if (!entry) return { upSQL: "", downSQL: "" };

  const table = resolveTableName(modelName);

  const upParts: string[] = [];
  const downParts: string[] = [];
  const grantedPrivileges = new Set<string>();

  const resolvers: Record<string, ClauseResolver> = {
    anon: (cl, opDef) => {
      const v = opDef[cl]?.anon;
      if (isAbsent(v)) return null;
      return v === true ? "true" : objToSql(v, table, modelName);
    },
    auth: (cl, opDef) => {
      const v = resolveAuth(opDef[cl]?.auth);
      if (isAbsent(v)) return null;
      return authGuard(v, table, modelName);
    },
  };

  for (const op of OP_ORDER) {
    const opDef = entry[op];
    if (!opDef) continue;
    const clauses = OP_CLAUSES[op];

    for (const [role, resolve] of Object.entries(resolvers)) {
      let usingSQL: string | null = null;
      let checkSQL: string | null = null;
      for (const cl of clauses) {
        const sql = resolve(cl, opDef);
        if (sql === null) continue;
        if (cl === "using") usingSQL = sql;
        else checkSQL = sql;
      }
      if (usingSQL !== null || checkSQL !== null) {
        const name = `${table}_${op}_${role}`;
        upParts.push(buildCreateSQL(table, op, name, usingSQL, checkSQL));
        downParts.push(`DROP POLICY IF EXISTS "${name}" ON ${table};`);
        grantedPrivileges.add(OP_PRIVILEGE[op]);
      }
    }
  }

  if (upParts.length === 0) return { upSQL: "", downSQL: "" };

  const privileges = PRIVILEGE_ORDER.filter((p) => grantedPrivileges.has(p));
  const grantSQL =
    privileges.length > 0
      ? `GRANT ${privileges.join(", ")} ON ${table} TO anon_user;`
      : "";
  const revokeSQL =
    privileges.length > 0
      ? `REVOKE ${privileges.join(", ")} ON ${table} FROM anon_user;`
      : "";

  return {
    upSQL: [
      `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`,
      ...upParts,
      ...(grantSQL ? [grantSQL] : []),
    ].join("\n\n"),
    downSQL: [
      ...downParts,
      ...(revokeSQL ? [revokeSQL] : []),
      `ALTER TABLE ${table} DISABLE ROW LEVEL SECURITY;`,
    ].join("\n"),
  };
}
