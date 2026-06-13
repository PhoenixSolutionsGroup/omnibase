import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { generateRlsSql } from "./emit";

function parsePolicies(sql: string): Map<string, string> {
  const map = new Map<string, string>();
  const parts = sql.split(/(?=CREATE POLICY ")/);
  for (const part of parts) {
    let t = part.trim();
    if (!t.startsWith('CREATE POLICY "')) continue;
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
  const { perTable: existing, policyOrigins } = fetchExistingPoliciesFromMigrations(
    migrationsDir,
    tables,
    excludeNewerThan,
  );
  const upParts: string[] = [];
  const downParts: string[] = [];
  const downDisables: string[] = [];

  for (const table of tables) {
    const desired = generateRlsSql(table);
    if (!desired.upSQL) continue;

    const existingPolicies = parsePolicies(existing.get(table) ?? "");
    const desiredPolicies = parsePolicies(desired.upSQL);

    const allNames = new Set([
      ...existingPolicies.keys(),
      ...desiredPolicies.keys(),
    ]);
    const tableUp: string[] = [];

    for (const name of allNames) {
      const oldSQL = existingPolicies.get(name) ?? "";
      const newSQL = desiredPolicies.get(name) ?? "";
      if (
        oldSQL.replace(/\s+/g, " ").trim() ===
        newSQL.replace(/\s+/g, " ").trim()
      )
        continue;

      if (newSQL) {
        tableUp.push(`DROP POLICY IF EXISTS "${name}" ON ${table};\n${newSQL}`);
      } else {
        tableUp.push(`DROP POLICY IF EXISTS "${name}" ON ${table};`);
      }

      const downEntry: string[] = [];
      const origin = policyOrigins.get(name);
      if (origin) downEntry.push(`-- RLS policy rollback ${origin}`);
      downEntry.push(`DROP POLICY IF EXISTS "${name}" ON ${table};`);
      if (oldSQL) downEntry.push(oldSQL);
      downParts.push(downEntry.join("\n"));
    }

    if (tableUp.length === 0) continue;

    if (existingPolicies.size === 0) {
      upParts.push(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`);
      downDisables.push(`ALTER TABLE ${table} DISABLE ROW LEVEL SECURITY;`);
    }
    upParts.push(...tableUp);
  }

  const downSQLParts: string[] = [];
  if (downParts.length > 0) downSQLParts.push(downParts.join("\n\n"));
  if (downDisables.length > 0) downSQLParts.push(downDisables.join("\n"));

  return {
    upSQL: upParts.join("\n\n"),
    downSQL: downSQLParts.join("\n\n"),
  };
}

function fetchExistingPoliciesFromMigrations(
  migrationsDir: string,
  tables: string[],
  excludeNewerThan?: string,
): { perTable: Map<string, string>; policyOrigins: Map<string, string> } {
  const dirs = readdirSync(migrationsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  const perTable = new Map<string, Map<string, string>>();
  const policyOrigins = new Map<string, string>();
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
      if (!m.has(name)) {
        m.set(name, block);
        policyOrigins.set(name, dirs[i]);
      }
    }
  }

  const map = new Map<string, string>();
  for (const [table, m] of perTable) {
    if (m.size > 0) map.set(table, [...m.values()].join("\n\n"));
  }
  return { perTable: map, policyOrigins };
}
