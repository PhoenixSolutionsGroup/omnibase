import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { generateRlsSql, PRIVILEGE_ORDER } from "./emit";

function parsePolicies(sql: string): Map<string, string> {
  const map = new Map<string, string>();
  const parts = sql.split(/(?=CREATE POLICY ")/);
  for (const part of parts) {
    let t = part.trim();
    if (!t.startsWith('CREATE POLICY "')) continue;
    const endIdx = t.search(/\n\s*(?:DROP POLICY|GRANT|REVOKE)\s/);
    if (endIdx !== -1) t = t.slice(0, endIdx).trim();
    const m = t.match(/^CREATE POLICY "([^"]+)"/);
    if (m) map.set(m[1], t);
  }
  return map;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function privilegeTokens(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
}

function parseGrantedPrivileges(sql: string, table: string): string[] {
  const re = new RegExp(
    `GRANT\\s+([A-Z, ]+?)\\s+ON\\s+${escapeRegExp(table)}\\s+TO\\s+anon_user`,
    "gi",
  );
  return [...sql.matchAll(re)].flatMap((m) => privilegeTokens(m[1]));
}

function parseRevokedPrivileges(sql: string, table: string): string[] {
  const re = new RegExp(
    `REVOKE\\s+([A-Z, ]+?)\\s+ON\\s+${escapeRegExp(table)}\\s+FROM\\s+anon_user`,
    "gi",
  );
  return [...sql.matchAll(re)].flatMap((m) => privilegeTokens(m[1]));
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
  const existingGrants = fetchExistingGrantsFromMigrations(
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
    const currentPrivileges = existingGrants.get(table) ?? new Set<string>();
    const desiredPrivileges = new Set(parseGrantedPrivileges(desired.upSQL, table));

    const newPrivileges = PRIVILEGE_ORDER.filter(
      (p) => desiredPrivileges.has(p) && !currentPrivileges.has(p),
    );
    const stalePrivileges = PRIVILEGE_ORDER.filter(
      (p) => currentPrivileges.has(p) && !desiredPrivileges.has(p),
    );

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

    const grantChanged =
      newPrivileges.length > 0 || stalePrivileges.length > 0;
    if (tableUp.length === 0 && !grantChanged) continue;

    if (existingPolicies.size === 0) {
      upParts.push(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`);
      downDisables.push(`ALTER TABLE ${table} DISABLE ROW LEVEL SECURITY;`);
    }
    upParts.push(...tableUp);

    if (newPrivileges.length > 0) {
      upParts.push(`GRANT ${newPrivileges.join(", ")} ON ${table} TO anon_user;`);
      downParts.push(
        `REVOKE ${newPrivileges.join(", ")} ON ${table} FROM anon_user;`,
      );
    }
    if (stalePrivileges.length > 0) {
      upParts.push(
        `REVOKE ${stalePrivileges.join(", ")} ON ${table} FROM anon_user;`,
      );
      downParts.push(
        `GRANT ${stalePrivileges.join(", ")} ON ${table} TO anon_user;`,
      );
    }
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

function fetchExistingGrantsFromMigrations(
  migrationsDir: string,
  tables: string[],
  excludeNewerThan?: string,
): Map<string, Set<string>> {
  const dirs = readdirSync(migrationsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  const perTable = new Map<string, Set<string>>();
  for (const t of tables) perTable.set(t, new Set());

  for (const dir of dirs) {
    if (excludeNewerThan && dir === excludeNewerThan) continue;
    const file = join(migrationsDir, dir, "migration.sql");
    if (!existsSync(file)) continue;
    const sql = readFileSync(file, "utf-8");

    for (const table of tables) {
      const set = perTable.get(table)!;
      for (const p of parseGrantedPrivileges(sql, table)) set.add(p);
      for (const p of parseRevokedPrivileges(sql, table)) set.delete(p);
    }
  }

  return perTable;
}
