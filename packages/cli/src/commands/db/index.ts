import { Command } from "commander";
import { dbMigrateCommands } from "./migrate";
import { selectEnvironment } from "../../utils/environment";
import { GenerateDatabaseTypesLanguageEnum } from "@omnibase/core-js";
import { select } from "@inquirer/prompts";
import { logger } from "../../utils/logger";
import { DatabaseMigrationService } from "../../services/db/migrate";
import { dbPolicyCommands } from "./policy";

export function addDbCommands(program: Command): void {
  const db = program.command("db").description("Database management commands");
  dbMigrateCommands(db);
  dbPolicyCommands(db);

  const service = new DatabaseMigrationService();

  db.command("typegen")
    .description("Generate types from database schema")
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
