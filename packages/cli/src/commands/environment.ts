import { Command } from "commander";
import { getAvailableEnvironments, getCloudBranches } from "../utils/environment";
import { logger } from "../utils/logger";

export function addEnvironmentCommands(program: Command): void {
  program
    .command("env")
    .description("List available environments")
    .action(async () => {
      try {
        const localEnvs = getAvailableEnvironments();
        const cloudBranches = await getCloudBranches();

        if (localEnvs.length === 0 && cloudBranches.length === 0) {
          logger.warn("No environments found.");
          logger.log("Set up omnibase/.env.local for local development,");
          logger.log("or connect to OmniBase Cloud with 'omnibase cloud login'.");
          return;
        }

        if (localEnvs.length > 0) {
          logger.log("Local:");
          localEnvs.forEach((env) => { logger.log(`  - ${env}`); });
        }

        if (cloudBranches.length > 0) {
          if (localEnvs.length > 0) logger.log("");
          logger.log("Cloud:");
          cloudBranches.forEach((name) => { logger.log(`  - ${name}`); });
        }
      } catch (error) {
        logger.fail(
          `Failed to list environments: ${error instanceof Error ? error.message : error}`
        );
        process.exit(1);
      }
    });
}
