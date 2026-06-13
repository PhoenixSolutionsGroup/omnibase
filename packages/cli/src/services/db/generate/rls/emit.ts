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

  const ops: Operation[] = ["insert", "select", "update", "delete"];
  const upParts: string[] = [];
  const downParts: string[] = [];

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

  for (const op of ops) {
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
      }
    }
  }

  if (upParts.length === 0) return { upSQL: "", downSQL: "" };

  return {
    upSQL: `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;\n\n${upParts.join("\n\n")}`,
    downSQL: `${downParts.join("\n")}\nALTER TABLE ${table} DISABLE ROW LEVEL SECURITY;`,
  };
}
