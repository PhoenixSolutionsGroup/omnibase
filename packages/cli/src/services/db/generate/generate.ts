import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { execSync, spawn } from "node:child_process";
import { clearRegistry, getRegistry } from "./policies";
import { generateRlsDiffFromMigrations } from "./rls-policies";
import { logger } from "../../../utils/logger";
import {
  deriveShadowUrls,
  dropShadowDbAsync,
  ensureMigrationLock,
  prismaDbExecute,
  recreateShadowDbAsync,
  runCmdAsync,
} from "./utils";

export interface GenerateOptions {
  migrationsDir: string;
  dbUrl?: string;
  migrationName: string;
  schemaDir: string;
  policiesDir: string;
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

function isEmptyPrismaDiff(sql: string): boolean {
  return sql.replace(/^\s*--.*$/gm, "").trim() === "";
}


async function applyInfraSql(shadowUrl: string): Promise<void> {
  const infraDir = join(__dirname, "..", "..", "..", "..", "docker", "db");
  if (!existsSync(infraDir)) return;
  const infraFiles = readdirSync(infraDir)
    .filter((f) => f.endsWith(".up.sql"))
    .sort();

  const combined = infraFiles
    .filter((f) => f !== "000000_users.up.sql")
    .map((f) => {
      const sql = readFileSync(join(infraDir, f), "utf-8").trimEnd();
      return sql.endsWith(";") ? sql + "\n" : sql + ";\n";
    })
    .join("\n");

  if (!combined.trim()) return;

  const r = await prismaDbExecute(shadowUrl, combined);
  if (r.exitCode !== 0) {
    throw new Error(`Failed to apply infra SQL to shadow DB: ${r.stderr}`);
  }
}

async function diffMigrationsToDatamodel(
  direction: "up" | "down",
  migrationsDir: string,
  prismaSchema: string,
  dbUrl: string,
  shadowUrl: string,
  maintUrl: string,
  suffix: string = "",
): Promise<{ exitCode: number; stdout: string; stderr: string }> {
  logger.info(`  ${direction}: setting up shadow DB...`);
  await recreateShadowDbAsync(maintUrl, suffix);
  await applyInfraSql(shadowUrl);
  logger.info(`  ${direction}: computing diff...`);
  const fromTo =
    direction === "up"
      ? `--from-migrations "${migrationsDir}" --to-schema-datamodel "${prismaSchema}"`
      : `--from-schema-datamodel "${prismaSchema}" --to-migrations "${migrationsDir}"`;
  const result = await runCmdAsync(
    `npx --yes prisma@6 migrate diff ${fromTo} --shadow-database-url "${shadowUrl}" --script`,
    { env: { DATABASE_URL: dbUrl }, quiet: true },
  );
  logger.info(`  ${direction}: done`);
  return result;
}

export async function generate(options: GenerateOptions): Promise<string[]> {
  const migrationsDir = options.migrationsDir;
  ensureMigrationLock(migrationsDir);

  const dbUrl =
    options.dbUrl ??
    process.env.DATABASE_URL ??
    "postgresql://postgres:postgres@localhost:5432";

  const prismaSchema = options.schemaDir;
  if (!prismaSchema) {
    throw new Error(
      "No omnibase/db/schema.prisma found. Run `omnibase init` first.",
    );
  }

  const outputFiles: string[] = [];

  // ── Step 2: Generate Prisma client types ────────────────────
  const genResult = await runCmdAsync(
    `npx --yes prisma@6 generate --schema="${prismaSchema}"`,
    { env: { DATABASE_URL: dbUrl }, quiet: true },
  );

  if (genResult.exitCode !== 0) {
    console.warn("Warning: prisma generate failed — types may be out of date");
  }

  // ── Step 3: Generate migration SQL by diffing the datamodel ──
  const before = new Set(getMigrationDirs(migrationsDir));

  let newMigrations: string[] = [];

  const upUrls = deriveShadowUrls(dbUrl, "_up");
  const downUrls = deriveShadowUrls(dbUrl, "_down");

  try {
    const [upDiff, downDiff] = await Promise.all([
      diffMigrationsToDatamodel(
        "up",
        migrationsDir,
        prismaSchema,
        dbUrl,
        upUrls.shadowUrl,
        upUrls.maintUrl,
        "_up",
      ),
      diffMigrationsToDatamodel(
        "down",
        migrationsDir,
        prismaSchema,
        dbUrl,
        downUrls.shadowUrl,
        downUrls.maintUrl,
        "_down",
      ),
    ]);

    if (upDiff.exitCode !== 0) {
      throw new Error(`Prisma diff failed:\n${upDiff.stderr || upDiff.stdout}`);
    }

    const upSQL = upDiff.stdout.trim();
    if (upSQL && !isEmptyPrismaDiff(upSQL)) {
      const rawDown = downDiff.exitCode === 0 ? downDiff.stdout.trim() : "";
      const downSQL = isEmptyPrismaDiff(rawDown) ? "" : rawDown;

      const dirName = `${timestamp()}_${options.migrationName}`;
      const dir = join(migrationsDir, dirName);
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, "migration.sql"), upSQL + "\n");
      writeFileSync(
        join(dir, "down.sql"),
        downSQL ? downSQL + "\n" : "-- no down.sql generated\n",
      );
    }
  } finally {
    await Promise.all([
      dropShadowDbAsync(upUrls.maintUrl, "_up"),
      dropShadowDbAsync(downUrls.maintUrl, "_down"),
    ]);
  }

  newMigrations = getMigrationDirs(migrationsDir).filter((d) => !before.has(d));

  // ── Step 4: Load policies and generate RLS ──────────────────

  // Register tsx so we can import .ts policy files in Node.js
  require("tsx");

  clearRegistry();

  const policiesDir = resolve(options.policiesDir);
  const policiesIndex = join(policiesDir, "index.ts");
  if (existsSync(policiesIndex)) {
    // Import index.ts first — it calls loadSchema(Prisma.dmmf) which is
    // required for resolving relation FK columns in policy predicates.
    try {
      await import(pathToFileURL(policiesIndex).href);
    } catch (e) {
      throw new Error(
        `Failed to load index.ts: ${e instanceof Error ? e.message : String(e)}`,
      );
    }

    const files = readdirSync(policiesDir).filter(
      (f) => f.endsWith(".ts") && f !== "index.ts",
    );
    for (const f of files) {
      try {
        await import(pathToFileURL(join(policiesDir, f)).href);
      } catch (e) {
        throw new Error(
          `Failed to load policy file ${f}: ${e instanceof Error ? e.message : String(e)}`,
        );
      }
    }
  }

  const models = Array.from(getRegistry().keys());
  if (models.length > 0) {
    const target =
      newMigrations.length > 0
        ? newMigrations[0]
        : `${timestamp()}_${options.migrationName}`;

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

      writeFileSync(
        mfile,
        readFileSync(mfile, "utf-8") + `\n-- RLS policies\n${upSQL}\n`,
      );

      if (downSQL.trim()) {
        const content = `\n${downSQL}\n`;
        if (existsSync(dfile)) {
          writeFileSync(dfile, content + readFileSync(dfile, "utf-8"));
        } else {
          writeFileSync(dfile, content);
        }
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
