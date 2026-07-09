import { Command } from "commander";
import axios from "axios";
import { selectEnvironment } from "../utils/environment";
import { getLocalServiceName } from "../config/services";
import { logger } from "../utils/logger";
import { handleCommandError } from "../utils/errors";
import { getCommandContext } from "../utils/context";
import { restartDockerService } from "../utils/docker";

/**
 * Reset the auth service (restart)
 */
async function resetAuth(options: {
  env?: string;
  mode?: string;
}): Promise<void> {
  logger.start("Resetting auth service...");

  if (options.env === "local" || !options.env) {
    await resetLocalService(options.mode);
  } else {
    await resetManagedService(options.env);
  }

  logger.succeed("Auth service reset successfully!");
}

/**
 * Reset local Docker Compose service
 */
async function resetLocalService(mode?: string): Promise<void> {
  const dockerService = getLocalServiceName("auth");
  if (!dockerService) {
    throw new Error("Unknown service: auth");
  }

  logger.update(`Restarting Docker service: ${dockerService}...`);

  try {
    const envConfig = await selectEnvironment("local");
    await restartDockerService(dockerService, { mode, envConfig });
    logger.succeed(`Docker service ${dockerService} restarted`);
  } catch (error) {
    logger.fail("Failed to restart Docker service");
    logger.log(
      `   Please run manually: docker compose restart ${dockerService}`
    );
    throw error;
  }
}

/**
 * Reset managed Cloud Run service via API
 */
async function resetManagedService(env?: string): Promise<void> {
  const envConfig = await selectEnvironment(env);

  logger.update(`Restarting Cloud Run service via ${envConfig.name}...`);

  try {
    const response = await axios.post(
      `${envConfig.omnibaseApiUrl}/api/v1/services/restart`,
      {
        service_name: "auth",
      },
      {
        headers: {
          "X-Service-Key": envConfig.omnibaseServiceKey,
        },
      }
    );

    logger.succeed(`Service restarted: ${response.data.message}`);

    if (response.data.restarted_services) {
      logger.log(
        `   Restarted ${response.data.restarted_services.length} service(s)`
      );
      response.data.restarted_services.forEach((svc: string) => {
        logger.log(`   - ${svc}`);
      });
    }

    if (response.data.failed_services?.length > 0) {
      logger.warn(
        `${response.data.failed_services.length} service(s) failed to restart`
      );
      response.data.failed_services.forEach((svc: string) => {
        logger.log(`   - ${svc}`);
      });
    }
  } catch (error) {
    await handleCommandError(error);
  }
}

/**
 * Add auth commands to the CLI program
 */
export function addAuthCommands(program: Command): void {
  const auth = program
    .command("auth")
    .description("Manage authentication service");

  auth
    .command("reset")
    .description("Reset (restart) the authentication service")
    .action(async () => {
      const ctx = getCommandContext(program);
      await resetAuth({ env: ctx.environment, mode: ctx.mode });
    });
}
