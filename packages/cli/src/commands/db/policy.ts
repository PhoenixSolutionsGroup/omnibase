import { execSync } from "child_process";
import { Command } from "commander";
import { findOmnibaseRoot } from "../../utils/environment";
import path from "path";
import { readdirSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { logger } from "../../utils/logger";

const SCAFFOLD_TEMPLATE = (table: string) => `import { definePolicy } from "@omnibase/cli/db/policies";
import { Prisma } from "./generated";

definePolicy<Prisma.${table}WhereInput>("${table}", {
  select: {
    anon: { using: false },
    auth: { using: (a) => ({ tenant_id: a.tenantId }) },
  },
  insert: {
    anon: { check: false },
    auth: { check: (a) => ({ tenant_id: a.tenantId }) },
  },
  update: {
    anon: { check: false, using: false },
    auth: {
      check: (a) => ({ tenant_id: a.tenantId }),
      using: (a) => ({ tenant_id: a.tenantId }),
    },
  },
  delete: { anon: { using: false }, auth: { using: true } },
});
`;

async function writePolicyFile(policiesDir: string, tableName: string): Promise<void> {
  if (!existsSync(policiesDir)) {
    mkdirSync(policiesDir, { recursive: true });
  }
  const filePath = path.join(policiesDir, `${tableName}.ts`);
  if (existsSync(filePath)) {
    logger.warn(`Policy file already exists: ${tableName}.ts`);
    return;
  }
  writeFileSync(filePath, SCAFFOLD_TEMPLATE(tableName));

  logger.succeed(`Created policy file: ${tableName}.ts`);
  logger.info(`  Location: ${filePath}`);
}

async function interactivePolicyCreate(policiesDir: string, root: string): Promise<void> {
  const schemaPath = path.join(root, "omnibase", "db", "schema.prisma");
  const generatedDir = path.join(policiesDir, "generated");

  if (!existsSync(schemaPath)) {
    throw new Error("No omnibase/db/schema.prisma found. Run `omnibase init` first.");
  }

  if (!existsSync(path.join(generatedDir, "index.js"))) {
    logger.start("Generating Prisma client...");
    execSync(`npx prisma generate --schema="${schemaPath}"`, { stdio: "inherit" });
    logger.succeed("Prisma client generated");
  }

  const { Prisma } = await import(
    path.join(generatedDir, "index.js")
  );

  const models: string[] = (
    Prisma.dmmf.datamodel.models as { name: string }[]
  ).map((m) => m.name);

  const existingPolicies: string[] = existsSync(policiesDir)
    ? readdirSync(policiesDir)
        .filter((f) => f.endsWith(".ts") && f !== "index.ts")
        .map((f) => f.replace(/\.ts$/, ""))
    : [];

  const available = models
    .filter((name) => !existingPolicies.includes(name))
    .sort();

  if (available.length === 0) {
    logger.info("All tables in the schema already have policy files.");
    return;
  }

  const { default: search } = await import("@inquirer/search");
  const selected = await search({
    message: "Choose a table to create a policy for:",
    source: (term) =>
      available
        .filter(
          (name) =>
            !term || name.toLowerCase().includes(term.toLowerCase()),
        )
        .map((name) => ({ name, value: name })),
  });

  await writePolicyFile(policiesDir, selected);
}

export function dbPolicyCommands(program: Command): void {
  const policy = program
    .command("policy")
    .summary("Database policy management")
    .description(
      "Create and manage RLS policy files for database tables.\n\n" +
      "Policy files define row-level security rules for each table. Use `new` " +
      "to scaffold a new policy, or `typegen` to regenerate the Prisma client.",
    );

  policy
    .command("typegen")
    .summary("Generate Prisma client for definePolicy types")
    .description(
      "Generate the Prisma client used by policy files for type-safe " +
      "`definePolicy<Prisma.XWhereInput>(...)` calls.\n\n" +
      "Run this after modifying the Prisma schema so the generated types " +
      "stay in sync.\n\n" +
      "Before: ensure omnibase/db/schema.prisma exists.\n" +
      "After: types are available at omnibase/db/policies/generated/.",
    )
    .action(async () => {
      const schemaPath = path.join(
        findOmnibaseRoot(),
        "omnibase",
        "db",
        "schema.prisma",
      );
      logger.start("Generating Prisma Client");
      try {
        execSync(`npx prisma generate --schema="${schemaPath}"`, {
          stdio: "inherit",
        });
        logger.succeed("Prisma client generated");
      } catch {
        logger.fail("Prisma client generation failed");
      }
    });

  policy
    .command("new")
    .summary("Create a new RLS policy file for a database table")
    .description(
      "Create a new RLS policy file for a database table.\n\n" +
      "If `--table` is provided, creates a scaffold policy file for that table " +
      "verbatim (no validation).\n\n" +
      "If `--table` is omitted, shows an interactive search prompt listing " +
      "tables from the Prisma schema that don't already have a policy file.\n\n" +
      "Before: ensure the Prisma schema exists (run `omnibase init` first).\n" +
      "After: edit the generated policy file to define the RLS rules.",
    )
    .option(
      "-t, --table <table>",
      "Table name (creates scaffold verbatim, skips interactive prompt)",
    )
    .option(
      "-d, --policies-dir <directory>",
      "Policies directory",
      "omnibase/db/policies",
    )
    .action(async (options) => {
      const root = findOmnibaseRoot();
      const policiesDir = path.join(root, options.policiesDir);
      const tableName = options.table;

      if (tableName) {
        await writePolicyFile(policiesDir, tableName);
        return;
      }

      await interactivePolicyCreate(policiesDir, root);
    });
}
