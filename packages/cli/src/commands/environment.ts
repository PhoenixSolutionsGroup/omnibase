import { Command } from "commander";
import { getAvailableEnvironments } from "../utils/environment";
import { logger } from "../utils/logger";

export function addEnvironmentCommands(program: Command): void {
  program
    .command("env")
    .description("List available environments")
    .action(() => {
      try {
        const available = getAvailableEnvironments();

        if (available.length === 0) {
          logger.warn("No environment files found in omnibase/");
          return;
        }

        logger.log("Available environments:");
        available.forEach((env) => {
          logger.log(`  - ${env}`);
        });
      } catch (error) {
        logger.fail(
          `Failed to list environments: ${error instanceof Error ? error.message : error}`
        );
        process.exit(1);
      }
    });
}
