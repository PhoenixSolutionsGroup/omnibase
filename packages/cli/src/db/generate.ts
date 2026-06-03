import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { $ } from "bun";
import { clearRegistry, getRegistry } from "./policies";
import { generateRlsDiffFromMigrations } from "./rls-policies";

export interface GenerateOptions {
  projectRoot: string;
  dbUrl?: string;
}

function resolveDir(base: string, candidates: string[]): string | null {
  for (const c of candidates) {
    const p = join(base, c);
    if (existsSync(p)) return p;
  }
  return null;
}

function getMigrationDirs(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
}

function timestamp(): string {
  return String(Math.floor(Date.now() / 1000));
}

export async function generate(options: GenerateOptions): Promise<string[]> {
  const root = options.projectRoot;
  const dbUrl = options.dbUrl ?? process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("DATABASE_URL required");

  const prismaSchema = resolveDir(root, [
    "omnibase/db/schema.prisma",
  ]);
  if (!prismaSchema) {
    throw new Error("No omnibase/db/schema.prisma found. Run `omnibase init` first.");
  }

  let migrationsDir = resolveDir(root, [
    "omnibase/db/migrations",
  ]);
  if (!migrationsDir) {
    migrationsDir = join(root, "omnibase", "db", "migrations");
    mkdirSync(migrationsDir, { recursive: true });
  }

  const outputFiles: string[] = [];

  // ── Step 1: Generate Prisma client types ──────────────────────

  const genResult =
    await $`DATABASE_URL=${dbUrl} bunx prisma@6 generate --schema=${prismaSchema}`
      .env({ ...process.env })
      .nothrow();

  if (genResult.exitCode !== 0) {
    console.warn("Warning: prisma generate failed — types may be out of date");
  }

  // ── Step 2: Prisma schema migration ───────────────────────────

  const before = new Set(getMigrationDirs(migrationsDir));

  const migrateResult =
    await $`DATABASE_URL=${dbUrl} bunx prisma@6 migrate dev --schema=${prismaSchema} --create-only --name ${timestamp()}_auto`
      .env({ ...process.env })
      .nothrow();

  if (migrateResult.exitCode !== 0) {
    throw new Error(
      `Prisma migrate failed:\n${migrateResult.stderr?.toString() || migrateResult.stdout?.toString()}`,
    );
  }

  const newMigrations = getMigrationDirs(migrationsDir).filter(
    (d) => !before.has(d),
  );

  // ── Step 3: Generate down.sql ─────────────────────────────────

  for (const m of newMigrations) {
    const downFile = join(migrationsDir, m, "down.sql");
    if (!existsSync(downFile)) {
      const diff = await $`bunx prisma@6 migrate diff --schema=${prismaSchema} --from-migrations ${migrationsDir} --to-schema-datasource --script`
        .env({ ...process.env, DATABASE_URL: dbUrl })
        .nothrow()
        .text();
      writeFileSync(downFile, diff.trim() || "-- no down.sql generated\n");
    }
  }

  // ── Step 4: Load policies and generate RLS ────────────────────

  clearRegistry();

  const policiesDir = join(root, "omnibase", "db", "policies");
  const policiesIndex = join(policiesDir, "index.ts");
  if (existsSync(policiesIndex)) {
    const files = readdirSync(policiesDir).filter(
      (f) => f.endsWith(".ts") && f !== "index.ts",
    );
    for (const f of files) {
      try {
        await import(join(policiesDir, f));
      } catch {
        // policy module failed to load — skip
      }
    }
  }

  const models = Array.from(getRegistry().keys());
  if (models.length > 0) {
    const target =
      newMigrations.length > 0
        ? newMigrations[0]
        : `${timestamp()}_rls_policies`;

    const { upSQL, downSQL } = generateRlsDiffFromMigrations(
      migrationsDir,
      models,
      target,
    );

    if (upSQL.trim()) {
      const dir = join(migrationsDir, target);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
        writeFileSync(join(dir, "migration.sql"), "");
      }

      const mfile = join(dir, "migration.sql");
      const dfile = join(dir, "down.sql");
      const now = new Date().toISOString();

      writeFileSync(mfile, readFileSync(mfile, "utf-8") + `\n\n-- RLS policies from definePolicy — ${now}\n\n${upSQL}\n`);

      const downHeader = `\n\n-- RLS policy rollback — ${now}\n\n${downSQL}\n\n`;
      if (existsSync(dfile)) {
        writeFileSync(dfile, downHeader + readFileSync(dfile, "utf-8"));
      } else {
        writeFileSync(dfile, downHeader);
      }

      if (!newMigrations.includes(target)) newMigrations.push(target);
    }
  }

  for (const m of newMigrations) {
    outputFiles.push(join(migrationsDir, m, "migration.sql"));
    const df = join(migrationsDir, m, "down.sql");
    if (existsSync(df) && readFileSync(df, "utf-8").trim()) {
      outputFiles.push(df);
    }
  }

  return outputFiles;
}
