import { Command } from "commander";
import { dbMigrateCommands } from "./migrate";
import { selectEnvironment } from "../../utils/environment";
import { GenerateDatabaseTypesLanguageEnum } from "@omnibase/core-js";
import { select } from "@inquirer/prompts";
import { logger } from "../../utils/logger";
import { DatabaseMigrationService } from "../../services/db/migrate";
import { dbPolicyCommands } from "./policy";

export function addDbCommands(program: Command): void {
  const db = program
    .command("db")
    .summary("Database management commands")
    .description(
      "Manage the database: migrations, RLS policies, and generated types.\n\n" +
      "`migrate` creates, applies, and rolls back migrations; `policy` " +
      "scaffolds row-level security policy files; `typegen` generates typed " +
      "clients from the schema."
    );
  dbMigrateCommands(db);
  dbPolicyCommands(db);

  const service = new DatabaseMigrationService();

  db.command("typegen")
    .summary("Generate types from the database schema")
    .description(
      "Generate a typed client from the database schema for one of " +
      "`typescript`, `go`, or `swift`.\n\n" +
      "The target language is chosen with `-l, --language` or an interactive " +
      "prompt. `-s, --schema` selects the comma-separated schemas to include " +
      "(default `public`).\n\n" +
      "Output is written to `omnibase/db/types/` — `omnibase.ts` for " +
      "TypeScript, `omnibase.go` for Go, and `Omnibase.swift` for Swift.\n\n" +
      "Before: the database must be running and reachable locally.\n\n" +
      "```bash\n" +
      "omnibase db typegen\n" +
      "omnibase db typegen --language typescript\n" +
      "omnibase db typegen -l go --schema public,analytics\n" +
      "```"
    )
    .option("-s, --schema <schemas>", "Comma-separated list of schemas to include", "public")
    .option("-l, --language <language>", "Target language: typescript, go, swift")
    .action(async (options) => {
      const env = await selectEnvironment("local");
      const validLanguages: GenerateDatabaseTypesLanguageEnum[] = [
        "typescript",
        "go",
        "swift",
      ];

      let language: GenerateDatabaseTypesLanguageEnum;
      if (options.language) {
        language = options.language as GenerateDatabaseTypesLanguageEnum;
        if (!validLanguages.includes(language)) {
          throw new Error(
            `Unsupported language: ${language}. Supported: ${validLanguages.join(", ")}`,
          );
        }
      } else {
        language = await select({
          message: "Select target language:",
          choices: validLanguages.map((lang) => ({
            name: lang,
            value: lang,
          })),
        });
      }

      const defaultOutputs: Record<GenerateDatabaseTypesLanguageEnum, string> = {
        typescript: "omnibase/db/types/omnibase.ts",
        go: "omnibase/db/types/omnibase.go",
        swift: "omnibase/db/types/Omnibase.swift",
      };

      logger.start(`Generating ${language} types...`);
      logger.log(`   Schemas: ${options.schemas}`);

      await service.typegen(env, language, options.schemas, defaultOutputs[language]);
    });
}
